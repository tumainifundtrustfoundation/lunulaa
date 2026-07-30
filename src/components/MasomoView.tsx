import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  FileText, 
  Play, 
  Sparkles, 
  Award,
  BookMarked,
  Printer,
  Compass,
  CheckCircle,
  HelpCircle,
  User,
  ExternalLink,
  ShieldAlert,
  Star,
  Search,
  Volume2,
  VolumeX,
  Timer,
  CheckSquare,
  Square,
  Save,
  Trash2,
  BookOpenCheck,
  History,
  Flame,
  Check,
  RotateCcw,
  Info,
  PenTool,
  Bookmark,
  Share2,
  Heart,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSenseWidget from './AdSenseWidget';
import { jsPDF } from 'jspdf';
import { toggleTopicFavorite, awardStudyPoints, updateUserProfile, db } from '../firebase';
import { getQuizQuestions, QuizQuestion } from './MasomoQuizData';
import { getExamTips } from './MasomoNectaTips';
import { getFlashcardsForTopic, Flashcard as MasomoFlashcard } from './MasomoFlashcardData';
import { 
  Brain, 
  Shuffle, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2 
} from 'lucide-react';

interface MasomoViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

interface Topic {
  title: string;
  subtopics: string[];
  content: string;
  notesSample: string;
  isDownloadable?: boolean;
}

interface ClassLevel {
  id: string;
  name: string;
  subjects: {
    name: string;
    topics: Topic[];
  }[];
}

export default function MasomoView({ onNavigate, userProfile }: MasomoViewProps) {
  // Navigation & Categorization states
  const [activeLevelTab, setActiveLevelTab] = useState<'all' | 'msingi' | 'olevel' | 'alevel' | 'favorites'>('all');
  const [activeStreamTab, setActiveStreamTab] = useState<'all' | 'PCB' | 'HGE' | 'EGM'>('all');
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // PDF state
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  
  // Custom Workspace states
  const [activeReaderTab, setActiveReaderTab] = useState<'notes' | 'quiz' | 'tips' | 'notepad' | 'flashcards'>('notes');
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Interactive Flashcards state variables
  const [flashcardsList, setFlashcardsList] = useState<MasomoFlashcard[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [learnedCardIndices, setLearnedCardIndices] = useState<number[]>([]);
  const [isFlashcardSpeaking, setIsFlashcardSpeaking] = useState(false);

  // Text to Speech (Soma kwa Sauti) state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Active Study stopwatch state
  const [studySeconds, setStudySeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [studySessionXp, setStudySessionXp] = useState(0);
  const timerIntervalRef = useRef<any>(null);

  // Completed subtopics tracker
  const [completedSubtopics, setCompletedSubtopics] = useState<Record<string, string[]>>({});
  
  // Offline Sync and Service Worker state variables
  const [offlineSyncStatus, setOfflineSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'failed'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for Service Worker Complete synchronization message
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        setOfflineSyncStatus('synced');
        setLastSyncedTime(new Date(event.data.timestamp).toLocaleTimeString('sw-TZ', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }));
        showToast('success', 'Masomo yote unayoyapenda yamesawazishwa offline! 🚀');
      }
    };
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Sync favorites when they change or when the component mounts
  useEffect(() => {
    if (!userProfile?.favorites || userProfile.favorites.length === 0) return;

    const triggerOfflineSync = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        setOfflineSyncStatus('syncing');
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_FAVORITES',
          favorites: userProfile.favorites
        });
      }
    };

    triggerOfflineSync();
  }, [userProfile?.favorites]);
  
  // Quiz active revision state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const streams = {
    PCB: ['Physics', 'Chemistry', 'Biology', 'General Studies (GS)'],
    HGE: ['History', 'Geography', 'Economics', 'General Studies (GS)'],
    EGM: ['Economics', 'Geography', 'Advanced Mathematics', 'General Studies (GS)']
  };

  // Tanzanian Academic Structure
  const academicData: ClassLevel[] = [
    {
      id: 'msingi',
      name: 'Elimu ya Msingi (TIE Curriculum - Darasa 5-7)',
      subjects: [
        {
          name: 'Hisabati (Mathematics)',
          topics: [
            {
              title: 'Chapter 1: Namba Nzima na Sehemu',
              isDownloadable: true,
              subtopics: [
                'Ufafanuzi wa sehemu (proper, improper and mixed fractions)',
                'Kubadili sehemu kuwa desimali na kinyume chake',
                'Kujumlisha na kutoa sehemu zenye asili tofauti',
                'Kuzidisha na kugawanya sehemu za hisabati'
              ],
              content: 'Sehemu inawakilisha sehemu ya kitu kizima. Ina namba ya juu (Kiasi) na namba ya chini (Asili). Desimali ni njia nyingine ya kuandika sehemu yenye asili ya 10, 100, 1000 n.k. Mfano, 1/2 inasomeka nusu, na kwa desimali ni 0.5.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Hisabati\nDarasa: Msingi\nMada: Sehemu na Desimali\n\n1. UTANGULIZI WA SEHEMU\nSehemu ni namba inayotaja sehemu ya kitu kizima ambacho kimegawanywa katika sehemu zilizo sawa. Sehemu huandikwa kwa kutumia namba mbili zilizotengwa kwa mstari mshazari au mlalo.\nNamba ya juu inaitwa kiasi (numerator) na namba ya chini inaitwa asili (denominator).\n\n2. AINA ZA SEHEMU\na) Sehemu Kawaida (Proper Fraction): Kiasi ni kidogo kuliko asili. Mfano: 2/3, 4/5.\nb) Sehemu Shazari (Improper Fraction): Kiasi ni kikubwa au sawa na asili. Mfano: 5/3, 7/4.\nc) Sehemu Mseto (Mixed Fraction): Inajumuisha namba nzima na sehemu ya kawaida. Mfano: 1 1/2, 2 3/4.\n\n3. KUBADILI SEHEMU KUWA DESIMALI\nIli kubadili sehemu kuwa desimali, gawa kiasi kwa asili. Mfano: 3/4 = 3 ÷ 4 = 0.75.'
            },
            {
              title: 'Maumbo ya Jometri (Geometric Shapes)',
              subtopics: [
                'Kutambua mstatili, mraba na duara',
                'Kutafuta eneo la mstatili na mraba',
                'Kutafuta mzingo wa maumbo mbalimbali'
              ],
              content: 'Jometri ni tawi la hisabati linalohusika na vipimo na sifa za mistari, pembe, na maumbo. Mstatili una pande nne, na pande zinazotazamana ziko sawa. Mraba una pande zote nne sawa na pembe zote ni nyuzi 90.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Hisabati\nMada: Maumbo ya Jometri\n\n1. MSTATILI (RECTANGLE)\nMstatili ni umbo lenye pande nne ambapo pande zinazotazamana zina urefu sawa na pembe zote nne ni pembe mraba (nyuzi 90).\nFormular za Mstatili:\n- Eneo (Area) = Urefu (L) x Upana (W)\n- Mzingo (Perimeter) = 2(Urefu + Upana) = 2(L + W)\n\n2. MRABA (SQUARE)\nMraba ni umbo lenye pande nne zinazolingana urefu na pembe zote nne ni pembe mraba (nyuzi 90).\nFormular za Mraba:\n- Eneo (Area) = Upande x Upande = S x S = S²\n- Mzingo (Perimeter) = Upande + Upande + Upande + Upande = 4S'
            }
          ]
        },
        {
          name: 'Sayansi na Teknolojia (Science & Tech)',
          topics: [
            {
              title: 'Mifumo ya Mwili wa Binadamu (Human Body Systems)',
              subtopics: [
                'Mfumo wa mmeng`enyo wa chakula (Digestive System)',
                'Mfumo wa upumuaji na viungo vyake',
                'Usafi na afya ya viungo vya mwili'
              ],
              content: 'Mwili wa binadamu umeundwa na mifumo mbalimbali inayofanya kazi kwa ushirikiano. Mfumo wa mmeng`enyo wa chakula huanzia kinywani na kuishia sehemu ya haja kubwa. Unahusika na kuvunja chakula kuwa virutubisho rahisi vinavyoweza kufyonzwa na mwili.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Sayansi na Teknolojia\nMada: Mfumo wa Mmeng`enyo wa Chakula\n\n1. UTANGULIZI\nMmeng`enyo wa chakula ni mchakato wa kuvunja chakula katika chembechembe ndogo zinazoweza kufyonzwa na mwili kwa matumizi ya nishati, ukuaji na ukarabati wa seli.\n\n2. SEHEMU KUU ZA MFUMO WA MMENG`ENYO\na) Kinywa (Mouth): Mmeng`enyo wa kimitambo huanza hapa kwa meno kutafuna chakula, na mmeng`enyo wa kemikali huanza kwa vimeng`enya (enzymes) vya mate.\nb) Umio (Esophagus): Njia ya kupitisha chakula kuelekea tumboni kwa mtindo wa msukumo wa peristalsis.\nc) Tumbo (Stomach): Chakula huchanganywa na asidi ya Hydrochloric (HCl) na vimeng`enya vya Pepsin kumeng`enya protini.\nd) Utumbo Mwembamba (Small Intestine): Sehemu kuu ya mmeng`enyo kukamilika na ufyonzaji wa virutubisho kufanyika.\ne) Utumbo Mkubwa (Large Intestine): Kufyonza maji na chumvichumvi na kutoa uchafu kama kinyesi.'
            }
          ]
        },
        {
          name: 'Kiswahili',
          topics: [
            {
              title: 'Aina za Maneno (Parts of Speech)',
              subtopics: [
                'Nomino (N) na aina zake',
                'Viwakilishi vya Nomino (W)',
                'Vitenzi (T) na uainishaji wake',
                'Vivumishi (V) na uainishaji wake'
              ],
              content: 'Katika lugha ya Kiswahili, kuna makundi manane ya aina za maneno yanayounda miundo ya sentensi. Kuelewa aina hizi za maneno kunamsaidia mwanafunzi kuandika na kuzungumza Kiswahili fasaha kitaaluma.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Kiswahili\nDarasa: Msingi (Darasa la 5-7)\nMada: Aina za Maneno\n\n1. NOMINO (N)\nNomino ni neno linalotaja jina la mtu, kitu, mahali, hali au dhana.\nAina za Nomino:\na) Nomino za Pekee (mfano: Ali, Tanzania, Kilimanjaro)\nb) Nomino za Kawaida (mfano: kitabu, mti, mji)\nc) Nomino za Kundi (mfano: kundi la askari, msitu)\nd) Nomino za Dhahania (mfano: upendo, amani, werevu)\n\n2. VITENZI (T)\nVitenzi ni maneno yanayotaja tendo au hali inayofanywa au inayotokea. Mfano: soma, kimbia, lala, cheka.'
            }
          ]
        },
        {
          name: 'English Language (Kiingereza)',
          topics: [
            {
              title: 'Tenses (Nyakati)',
              subtopics: [
                'Present Simple Tense',
                'Past Simple Tense',
                'Future Simple Tense',
                'Present Continuous Tense'
              ],
              content: 'Tenses in English tell us when an action takes place: in the past, present, or future. Verbs change their form depending on the tense and the subject of the sentence.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: English Language\nLevel: Primary School\nTopic: English Tenses\n\n1. PRESENT SIMPLE TENSE\nUsed to express habits, general truths, and regular actions.\nStructure:\n- Subject + Verb (s/es for third person singular) + Object.\n- Example: "He walks to school every day."\n- Example: "The sun rises in the east."\n\n2. PAST SIMPLE TENSE\nUsed for actions that were completed in the past.\n- Example: "They visited the Serengeti National Park last month."\n- Example: "She wrote an English essay yesterday."'
            }
          ]
        },
        {
          name: 'Maarifa ya Jamii (Social Studies)',
          topics: [
            {
              title: 'Mashujaa wa Tanzania (Tanzanian Heroes)',
              subtopics: [
                'Chifu Mkwawa wa Wahehe',
                'Kinjekitile Ngwale na Vita vya Maji Maji',
                'Mtemi Mirambo wa Wanyamwezi',
                'Mtemi Isike wa Wanyamwezi'
              ],
              content: 'Historia ya Tanzania imepambwa na viongozi jasiri waliosimama kupambana dhidi ya uvamizi wa kikoloni (Kijerumani na Kiingereza) na kulinda mamlaka na ardhi ya jamii zao nchini Tanganyika.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Maarifa ya Jamii\nMada: Mashujaa wa Tanzania\n\n1. CHIFU MKWAWA WA WAHEHE\nChifu Mkwawa (Mkwavinyika Munyigumba Mwamuyinga) alikuwa kiongozi wa Wahehe kuanzia mwaka 1879 hadi 1898. Alijulikana sana kwa kuongoza upinzani mkali dhidi ya utawala wa Kijerumani huko Iringa.\n\n2. VITA VYA MAJI MAJI (1905-1907)\nVita hivi viliongozwa na Kinjekitile Ngwale nchini Tanganyika kupinga unyanyasaji na kodi za Kijerumani. Alitumia imani ya "Maji" ya miujiza kuwaunganisha makabila mbalimbali kupigania haki zao.'
            }
          ]
        },
        {
          name: 'Uraia na Maadili (Civics & Moral)',
          topics: [
            {
              title: 'Alama za Taifa (National Symbols)',
              subtopics: [
                'Mwenge wa Uhuru (The Freedom Torch)',
                'Wimbo wa Taifa na Bendera ya Taifa',
                'Nembo ya Taifa - Bibi na Bwana (Coat of Arms)',
                'Hati ya Muungano'
              ],
              content: 'Alama za kitaifa ni kielelezo cha uhuru, umoja, uzalendo, amani na utambulisho wa nchi ya Tanzania kote duniani.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Uraia na Maadili\nMada: Alama za Taifa la Tanzania\n\n1. BENDERA YA TAIFA\nIna rangi nne zenye maana mahususi:\n- Kijani: Maliasili na uoto wa asili wa Tanzania.\n- Dilalo la Dhahabu (Njano): Utajiri wa madini nchini wetu.\n- Nyeusi: Watu weusi wa asili ya Kitanzania.\n- Bluu: Bahari, maziwa na vyanzo vya maji vya nchi yetu.\n\n2. MWENGE WA UHURU\nUliwashwa kwa mara ya kwanza juu ya kilele cha Mlima Kilimanjaro tarehe gani?\nTarehe 9 Desemba 1961 kama alama ya kumulika matumaini, upendo na amani kote nchini.'
            }
          ]
        }
      ]
    },
    {
      id: 'olevel',
      name: 'Sekondari - Kidato cha 1-4 (TIE O-Level)',
      subjects: [
        {
          name: 'Basic Mathematics',
          topics: [
            {
              title: 'Topic 1: Numbers (Form I)',
              isDownloadable: true,
              subtopics: [
                'Base Ten Numeration',
                'Natural Numbers and Whole Numbers',
                'Operations with Whole Numbers',
                'Factors and Multiples',
                'Integers'
              ],
              content: 'Numbers are the foundation of mathematics. In this topic, we cover the basic number systems, including natural numbers, whole numbers, and integers, along with their fundamental operations.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Basic Mathematics\nForm: Form One\nTopic: Numbers\n\n1. BASE TEN NUMERATION\nThe system of numeration we use is called the base ten system because it uses ten digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.\n\n2. TYPES OF NUMBERS\na) Natural Numbers (N): Counting numbers starting from 1. {1, 2, 3, ...}\nb) Whole Numbers (W): Natural numbers including 0. {0, 1, 2, 3, ...}\nc) Integers (Z): Whole numbers and their negatives. {..., -2, -1, 0, 1, 2, ...}'
            },
            {
              title: 'Structure of the Atom (Muundo wa Atomu)',
              subtopics: [
                'Protons, Neutrons and Electrons',
                'Atomic Number and Mass Number',
                'Isotopes and Chemical Bonding foundations'
              ],
              content: 'An atom is the smallest particle of an element that can take part in a chemical reaction. It consists of a dense nucleus containing protons and neutrons, surrounded by electrons revolving in circular orbits called energy levels.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Physics / Chemistry\nKidato: Kidato cha Kwanza (Form I)\nMada: Structure of the Atom\n\n1. ATOMIC STRUCTURE BASICS\nEvery substance is made of tiny particles called atoms. An atom contains three main subatomic particles:\n- Proton: Positively charged (+1), mass = 1 amu, located in the nucleus.\n- Neutron: Neutral/No charge (0), mass = 1 amu, located in the nucleus.\n- Electron: Negatively charged (-1), mass = 1/1840 amu, revolving in electron shells.\n\n2. ATOMIC NUMBER (Z) & MASS NUMBER (A)\n- Atomic Number (Z): The number of protons in the nucleus of an atom.\n- Mass Number (A): The total number of protons and neutrons in the nucleus. (A = Z + N)\n- Representation: Mass Number is written at the top-left of the chemical symbol, and Atomic Number at the bottom-left.'
            }
          ]
        },
        {
          name: 'Chemistry (Kemia)',
          topics: [
            {
              title: 'Chemical Equations (Milinganyo ya Kikemia)',
              isDownloadable: true,
              subtopics: [
                'Writing word and chemical equations',
                'Balancing simple chemical equations',
                'Types of chemical reactions (Synthesis, Decomposition, Combustion)'
              ],
              content: 'A chemical equation represents a chemical reaction using chemical formulas of reactants and products. It must be balanced to satisfy the law of conservation of mass.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Chemistry (Kemia)\nLevel: Ordinary Level (O-Level)\nTopic: Balancing Chemical Equations\n\n1. THE LAW OF CONSERVATION OF MASS\nMass can neither be created nor destroyed in a chemical reaction. Therefore, the number of atoms of each element on the reactant side must equal the number of atoms on the product side.\n\n2. STEPS TO BALANCE EQUATIONS:\nExample: Formation of water\nH₂ + O₂ -> H₂O\nBalanced equation: 2H₂ + O₂ -> 2H₂O\n\nReactants: Hydrogen and Oxygen molecules.\nProducts: Water molecules.'
            }
          ]
        },
        {
          name: 'Biology (Biolojia)',
          topics: [
            {
              title: 'Classification of Living Things (Uainishaji wa Viumbe)',
              isDownloadable: true,
              subtopics: [
                'Five Kingdoms of classification',
                'Kingdom Monera and Protista',
                'Kingdom Fungi, Plantae and Animalia'
              ],
              content: 'Classification is the systematic grouping of living organisms based on shared characteristics. The modern five-kingdom system organizes all life from single-celled bacteria to complex mammals.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Biology (Biolojia)\nLevel: O-Level (Forms I-IV)\nTopic: Kingdom Classification\n\n1. TAXONOMIC HIERARCHY\nKingdom -> Phylum -> Class -> Order -> Family -> Genus -> Species\n\n2. THE FIVE KINGDOMS\na) Monera: Prokaryotic organisms like bacteria.\nb) Protista: Eukaryotic single-celled organisms like Amoeba.\nc) Fungi: Heterotrophic, non-photosynthetic organisms like yeast and mushrooms.\nd) Plantae: Autotrophic photosynthetic plants.\ne) Animalia: Multicellular heterotrophic animals.'
            }
          ]
        },
        {
          name: 'Mathematics (Hisabati)',
          topics: [
            {
              title: 'Quadratic Equations (Milinganyo ya Kipeuo cha Pili)',
              isDownloadable: true,
              subtopics: [
                'Solving by Factoring',
                'Solving by Completing the Square',
                'The Quadratic Formula'
              ],
              content: 'A quadratic equation is a second-degree polynomial equation in a single variable, with the general form ax² + bx + c = 0, where a is not equal to 0.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Mathematics\nLevel: O-Level\nTopic: Quadratic Equations\n\n1. THE GENERAL FORM\nax² + bx + c = 0\n\n2. THE QUADRATIC FORMULA\nx = [-b ± √(b² - 4ac)] / 2a\n\nThe term (b² - 4ac) is called the discriminant. It determines the nature of the roots (real or complex).'
            }
          ]
        },
        {
          name: 'History (Historia)',
          topics: [
            {
              title: 'Colonial Economy in East Africa',
              subtopics: [
                'Objectives of colonial economy (Raw materials, Markets)',
                'Methods of establishing colonial agriculture and settler farms',
                'Colonial labor systems (Migrant, Forced and Contract labor)',
                'Colonial trade and infrastructure development'
              ],
              content: 'The establishment of colonial economy in East Africa was designed to satisfy the needs of industrial capitalists in Europe. Settler agriculture was heavily promoted in Kenya, while peasant agriculture was emphasized in Uganda. In Tanganyika, both plantation (sisal) and peasant (coffee/cotton) agriculture existed.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: History (Historia)\nKidato: Kidato cha Tatu (Form III)\nMada: Colonial Economy in East Africa\n\n1. MOTIVES OF COLONIAL ECONOMY\nThe economic structures established by British, German, and French colonizers in East Africa had specific aims:\na) To extract raw materials for European home industries (cotton, sisal, coffee, rubber).\nb) To find investment areas for surplus European capital.\nc) To create markets for manufactured goods from Europe.\nd) To secure cheap source of manual labor.\n\n2. SECTORS OF THE COLONIAL ECONOMY\n- Agriculture: Settler farming (e.g. White Highlands in Kenya), Plantation economy (e.g. Sisal in Tanganyika), Peasant agriculture (Uganda cotton).\n- Mining: Extraction of gold, diamonds, and mica using cheap manual labor.\n- Infrastructure: Construction of railways (e.g., Uganda Railway, Central Line) and roads connecting resource areas to the ports (Dar es Salaam, Mombasa).'
            }
          ]
        },
        {
          name: 'Geography (Jiografia)',
          topics: [
            {
              title: 'Map Reading & Interpretation (Kusoma Ramani)',
              subtopics: [
                'Types of maps and their scales',
                'Grid references and coordinates',
                'Representation of physical and cultural features on topographic maps'
              ],
              content: 'Map reading is the act of interpreting geographical information represented on a map. Scales show the ratio of map distance to actual ground distance on the Earth.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Geography (Jiografia)\nLevel: Form II - Form IV\nTopic: Map Reading and Scales\n\n1. TYPES OF SCALES\na) Statement Scale: e.g., "One centimeter represents one kilometer".\nb) Representative Fraction (RF): e.g., 1:50,000.\nc) Linear/Graphic Scale: A bar divided into visual units.\n\n2. CONVERTING SCALES\nTo convert 1:50,000 to statement scale:\n1 cm on map = 50,000 cm on ground = 500 meters = 0.5 kilometers.'
            }
          ]
        },
        {
          name: 'Civics (Uraia)',
          topics: [
            {
              title: 'The Constitution of Tanzania (Katiba ya Nchi)',
              subtopics: [
                'Meaning and importance of a Constitution',
                'The 1977 Constitution of the United Republic of Tanzania',
                'Branches of Government (Executive, Judiciary, Legislature)'
              ],
              content: 'The constitution is the supreme law of the United Republic of Tanzania. It provides the legal framework for governance and outlines the rights, responsibilities and duties of citizens.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Civics (Uraia)\nKidato: Kidato cha Pili (Form II)\nMada: The Constitution of Tanzania\n\n1. WHAT IS A CONSTITUTION?\nA constitution is a body of fundamental principles or established precedents according to which a state is governed.\n\n2. THE THREE BRANCHES OF STATE\na) Executive (Serikali Kuu): Leads the administration, headed by the President of Tanzania.\nb) Legislature (Bunge): Makes and amends laws for the country.\nc) Judiciary (Mahakama): Interprets laws and administers justice in accordance with the law.'
            }
          ]
        }
      ]
    },
    {
      id: 'alevel',
      name: 'Elimu ya Sekondari ya Juu - Kidato cha 5-6 (Advanced Level - A-Level)',
      subjects: [
        {
          name: 'Advanced Mathematics',
          topics: [
            {
              title: 'Calculus: Differentiation & Integration',
              subtopics: [
                'Limits and Continuity of functions',
                'Differentiation from first principles',
                'Techniques of integration (Substitution, Parts, Partial fractions)',
                'Applications of calculus to physics and economics'
              ],
              content: 'Calculus is the mathematical study of continuous change. Differentiation is the process of finding the rate of change (derivative) of a function, while integration is the inverse process of accumulation (finding the area under a curve).',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Advanced Mathematics\nKidato: Kidato cha Tano na Sita (Form V & VI)\nMada: Calculus (Mnyambuliko)\n\n1. LIMITS AND CONTINUITY\nA limit is the value that a function approaches as the input approaches some value. \n\n2. DIFFERENTIATION FROM FIRST PRINCIPLES\nThe derivative of f(x) with respect to x is defined as:\nf`(x) = lim(h -> 0) [f(x+h) - f(x)] / h\n\n3. CORE DIFFERENTIATION RULES\n- Power Rule: d/dx(x^n) = n*x^(n-1)\n- Product Rule: d/dx(u*v) = u*dv/dx + v*du/dx\n- Quotient Rule: d/dx(u/v) = (v*du/dx - u*dv/dx) / v²\n- Chain Rule: dy/dx = dy/du * du/dx'
            }
          ]
        },
        {
          name: 'Physics',
          topics: [
            {
              title: 'Classical Mechanics & Gravity (Makanika)',
              subtopics: [
                'Newton`s Laws of Motion in 2D',
                'Projectiles and Circular Motion',
                'Kepler`s Laws of Planetary Motion'
              ],
              content: 'Mechanics deals with the behavior of physical bodies when subjected to forces. At advanced level, we study rotational dynamics, projectile kinematics, and gravitational field interactions.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Advanced Physics\nLevel: Form V & VI (A-Level)\nTopic: Projectile Motion\n\n1. BASICS OF PROJECTILE MOTION\nAn object launched into space influenced only by gravity. The path is a parabola.\n\n2. KEY FORMULAS (No air resistance):\n- Time of Flight (T) = 2*u*sin(θ) / g\n- Maximum Height (H) = u²*sin²(θ) / 2g\n- Horizontal Range (R) = u²*sin(2θ) / g'
            }
          ]
        },
        {
          name: 'Chemistry',
          topics: [
            {
              title: 'Organic Chemistry (Kemia Hai)',
              subtopics: [
                'Alkanes, Alkenes and Alkynes',
                'Functional groups and isomerism',
                'Reaction mechanisms in organic compounds'
              ],
              content: 'Organic chemistry is the study of the structure, properties, composition, reactions, and preparation of carbon-containing compounds.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Advanced Chemistry\nLevel: A-Level\nTopic: Organic Chemistry Intro\n\n1. CLASSIFICATION OF ORGANIC COMPOUNDS\nBased on functional groups like Hydroxyl (-OH), Carboxyl (-COOH), etc.'
            }
          ]
        },
        {
          name: 'Biology',
          topics: [
            {
              title: 'Cytology and Genetics (Seliba na Jenetiki)',
              subtopics: [
                'Structure and function of cell organelles',
                'Mendelian inheritance and gene mutations',
                'DNA replication and protein synthesis'
              ],
              content: 'Cytology is the study of cells, and genetics is the study of genes, genetic variation, and heredity in organisms.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Advanced Biology\nLevel: A-Level\nTopic: Cell Theory\n\n1. THE CELL THEORY\n- All living organisms are composed of one or more cells.\n- The cell is the basic unit of structure and organization in organisms.\n- Cells arise from pre-existing cells.'
            }
          ]
        },
        {
          name: 'History',
          topics: [
            {
              title: 'World History (Historia ya Dunia)',
              subtopics: [
                'The First World War and Second World War',
                'The League of Nations and United Nations',
                'Cold War and Decolonization'
              ],
              content: 'World history at advanced level focuses on global political and economic changes from the late 19th century to the modern era.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Advanced History\nLevel: A-Level\nTopic: World War I'
            }
          ]
        },
        {
          name: 'Economics',
          topics: [
            {
              title: 'Microeconomics (Uchumi Mdogo)',
              subtopics: [
                'Theory of Demand and Supply',
                'Market structures and pricing',
                'Consumer behavior and utility'
              ],
              content: 'Microeconomics studies the behavior of individuals and firms in making decisions regarding the allocation of scarce resources.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Advanced Economics\nLevel: A-Level\nTopic: Demand & Supply'
            }
          ]
        },
        {
          name: 'Geography',
          topics: [
            {
              title: 'Geomorphology & Soil Science (Sura ya Nchi na Udongo)',
              subtopics: [
                'Plate Tectonics and Volcanism',
                'Weathering, mass wasting and river systems',
                'Soil profile, classification and conservation'
              ],
              content: 'Geomorphology studies the origin and evolution of topographic and bathymetric features created by physical or chemical processes on Earth`s surface.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: Advanced Geography\nLevel: Form V & VI\nTopic: Plate Tectonics\n\n1. THE THEORY OF PLATE TECTONICS\nEarth`s outer shell is divided into several plates that glide over the asthenosphere.\n\n2. TYPES OF PLATE BOUNDARIES\na) Divergent (e.g. East African Rift Valley where plates move apart).\nb) Convergent (e.g. Himalayas where plates crash together).\nc) Transform (e.g. San Andreas Fault where plates slide past each other).'
            }
          ]
        },
        {
          name: 'General Studies (GS)',
          topics: [
            {
              title: 'Democratic Process & Human Rights (Demokrasia)',
              subtopics: [
                'Principles of democracy and rule of law',
                'The electoral system and voting process in Tanzania',
                'Civil society, governance and human rights watch'
              ],
              content: 'General Studies is a compulsory multi-disciplinary subject in A-level that provides students with general knowledge of social, political, economic, and scientific issues.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSubject: General Studies (GS)\nLevel: Form V & VI (A-Level)\nTopic: Democratic Process in Tanzania\n\n1. PRINCIPLES OF DEMOCRACY\n- Rule of Law (Utawala wa Sheria)\n- Free and Fair Elections\n- Separation of Powers\n- Freedom of Speech and Assembly\n\n2. ELECTORAL SYSTEM IN TANZANIA\nThe National Electoral Commission (NEC) is the independent body that supervises and conducts presidential, parliamentary, and local government elections in Tanzania.'
            }
          ]
        }
      ]
    }
  ];

  // Load persistence states on startup or when selectedTopic/userProfile changes
  useEffect(() => {
    // 1. Load completed subtopics from localStorage
    try {
      const stored = localStorage.getItem('lupa_completed_subtopics');
      if (stored) {
        setCompletedSubtopics(JSON.parse(stored));
      } else if (userProfile?.completedSubtopics) {
        setCompletedSubtopics(userProfile.completedSubtopics);
      }
    } catch (e) {
      console.warn('Could not read completed subtopics', e);
    }
  }, [userProfile?.uid]);

  // Load personal draft for this topic when selectedTopic or userProfile's notes change
  useEffect(() => {
    if (!selectedTopic) return;
    try {
      const savedNotes = userProfile?.personalNotes?.[selectedTopic.title] || 
                         localStorage.getItem(`lupa_notes_draft_${selectedTopic.title}`) || '';
      setNotesDraft(savedNotes);
    } catch (e) {
      setNotesDraft('');
    }
  }, [selectedTopic?.title, userProfile?.uid]);

  // Reset quiz & flashcard state ONLY when the selected topic's title actually changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setQuizChecked(false);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizCorrectCount(0);

    // Flashcard state resetting & data seeding
    setFlashcardIndex(0);
    setIsCardFlipped(false);
    setLearnedCardIndices([]);
    if (selectedTopic) {
      setFlashcardsList(getFlashcardsForTopic(selectedTopic.title));
    } else {
      setFlashcardsList([]);
    }
  }, [selectedTopic?.title]);

  // Cancel speech synthesis when switching tabs or topics
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsFlashcardSpeaking(false);
  }, [activeReaderTab, selectedTopic?.title]);

  // Focus stopwatch timer ticking effect
  useEffect(() => {
    if (isTimerActive) {
      timerIntervalRef.current = setInterval(() => {
        setStudySeconds(prev => {
          const next = prev + 1;
          // Award +5 XP for every 60 seconds (1 minute) of study
          if (next % 60 === 0) {
            setStudySessionXp(xp => xp + 5);
            // Award study points to Firebase if logged in
            if (userProfile?.uid) {
              awardStudyPoints(userProfile.uid, 5, 1).catch(console.error);
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive, userProfile?.uid]);

  // Handle Text-To-Speech (Speech Synthesis) play/pause/cancel
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!selectedTopic) return;
      window.speechSynthesis.cancel(); // Stop anything else first
      
      const textToRead = `${selectedTopic.title}. ${selectedTopic.content}. Mada ndogo ni pamoja na: ${selectedTopic.subtopics.join(', ')}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      // Attempt Swahili speech if Kiswahili keywords detected, else English
      const isSwahili = selectedTopic.title.includes('Mada') || 
                          selectedTopic.title.includes('Mwili') || 
                          selectedTopic.title.includes('Aina') || 
                          selectedTopic.title.includes('Alama') || 
                          selectedTopic.title.includes('Namba');
      utterance.lang = isSwahili ? 'sw-TZ' : 'en-US';
      utterance.rate = speechRate;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      
      showToast('success', `Inasoma kwa Sauti (${isSwahili ? 'Swahili' : 'English'})...`);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const changeSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    if (isSpeaking && selectedTopic) {
      // Restart speech with new rate
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setTimeout(() => {
        handleToggleSpeech();
      }, 100);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  // Format stopwatch seconds into human MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Claim study session timer XP
  const handleClaimTimerProgress = async () => {
    if (studySeconds < 30) {
      showToast('info', 'Tafadhali jisomee kwa sekunde 30 au zaidi ili kuhifadhi maendeleo yako!');
      return;
    }
    
    const minutes = Math.ceil(studySeconds / 60);
    const xpEarned = Math.max(5, minutes * 5);

    if (userProfile?.uid) {
      try {
        await awardStudyPoints(userProfile.uid, xpEarned, minutes);
        showToast('success', `Hongera sana! Umejizolea +${xpEarned} XP kwa kusoma mfululizo kwa dakika ${minutes}!`);
        window.dispatchEvent(new CustomEvent('refresh-user-profile'));
      } catch (err) {
        showToast('error', 'Kuna tatizo la kuunganisha na seva, maendeleo yamehifadhiwa kwenye kivinjari chako.');
      }
    } else {
      showToast('success', `Hongera! (Kama Mgeni) Umejizolea +${xpEarned} XP kwa kujisomea kwa dakika ${minutes}!`);
    }

    // Reset timer
    setStudySeconds(0);
    setStudySessionXp(0);
    setIsTimerActive(false);
  };

  // Toggle Subtopic Completion TIE syllabus checklist
  const handleToggleSubtopicComplete = async (subtopic: string) => {
    if (!selectedTopic) return;
    
    const topicId = selectedTopic.title;
    const currentCompleted = completedSubtopics[topicId] || [];
    
    let updated: string[];
    const isNowComplete = !currentCompleted.includes(subtopic);
    
    if (isNowComplete) {
      updated = [...currentCompleted, subtopic];
    } else {
      updated = currentCompleted.filter(s => s !== subtopic);
    }

    const newCompletedMap = {
      ...completedSubtopics,
      [topicId]: updated
    };

    setCompletedSubtopics(newCompletedMap);
    localStorage.setItem('lupa_completed_subtopics', JSON.stringify(newCompletedMap));

    if (isNowComplete) {
      // Award +5 XP for completing a subtopic
      if (userProfile?.uid) {
        try {
          await awardStudyPoints(userProfile.uid, 5, 0);
          await updateUserProfile(userProfile.uid, { completedSubtopics: newCompletedMap });
          window.dispatchEvent(new CustomEvent('refresh-user-profile'));
        } catch (e) {
          console.warn('Offline progress saved locally');
        }
      }
      showToast('success', `Hongera! Umejifunza mada ndogo: "${subtopic}" (+5 XP)`);
    } else {
      if (userProfile?.uid) {
        updateUserProfile(userProfile.uid, { completedSubtopics: newCompletedMap }).catch(console.error);
      }
    }
  };

  // Save notepad draft
  const handleSaveNotepadDraft = async () => {
    if (!selectedTopic) return;
    setIsSavingDraft(true);
    
    try {
      localStorage.setItem(`lupa_notes_draft_${selectedTopic.title}`, notesDraft);
      
      if (userProfile?.uid) {
        const existingNotes = userProfile.personalNotes || {};
        const updatedNotes = {
          ...existingNotes,
          [selectedTopic.title]: notesDraft
        };
        await updateUserProfile(userProfile.uid, { personalNotes: updatedNotes });
        window.dispatchEvent(new CustomEvent('refresh-user-profile'));
      }
      
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 3000);
    } catch (e) {
      showToast('error', 'Imefeli kuhifadhi. Tafadhali jaribu tena.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Interactive Quiz Answers submission
  const handleSelectQuizOption = (optionIdx: number) => {
    if (quizChecked) return; // Cannot change answer after checking
    setSelectedOptionIndex(optionIdx);
  };

  const handleCheckQuizAnswer = () => {
    if (selectedOptionIndex === null || !selectedTopic) return;
    
    const questions = getQuizQuestions(selectedTopic.title);
    const activeQuestion = questions[currentQuestionIndex];
    
    const isCorrect = selectedOptionIndex === activeQuestion.correctAnswerIndex;
    if (isCorrect) {
      setQuizCorrectCount(prev => prev + 1);
    }

    setQuizChecked(true);
    setShowExplanation(true);
  };

  const handleNextQuizQuestion = async () => {
    if (!selectedTopic) return;
    
    const questions = getQuizQuestions(selectedTopic.title);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setQuizChecked(false);
      setShowExplanation(false);
    } else {
      // Finished the Quiz!
      setQuizFinished(true);
      
      const totalQuestions = questions.length;
      const finalScore = quizCorrectCount;
      const isPerfect = finalScore === totalQuestions;
      
      const pointsToAward = isPerfect ? 20 : finalScore * 5;

      if (userProfile?.uid && pointsToAward > 0) {
        try {
          await awardStudyPoints(userProfile.uid, pointsToAward, 0);
          window.dispatchEvent(new CustomEvent('refresh-user-profile'));
          showToast('success', `Hongera sana! Umekamilisha zoezi la mada hii na kujizolea +${pointsToAward} XP!`);
        } catch (err) {
          console.error(err);
        }
      } else {
        showToast('success', `Umekamilisha zoezi! Alama zako ni ${finalScore}/${totalQuestions}.`);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setQuizChecked(false);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizCorrectCount(0);
  };

  // Client-side PDF Notes generation using standard jsPDF from CDN loaded in index.html
  const handleGeneratePdf = (topic: Topic, subjectName: string) => {
    setPdfGenerating(true);
    setPdfSuccess(false);

    setTimeout(() => {
      try {
        const doc = new jsPDF();

        // Elegant border & decorative banners
        doc.setFillColor(8, 145, 178); // Cyan-600 banner color
        doc.rect(0, 0, 210, 35, 'F');

        // Tanzania Flag subtle corner decoration
        doc.setFillColor(34, 139, 34); // Green
        doc.rect(190, 5, 15, 3, 'F');
        doc.setFillColor(255, 215, 0); // Gold
        doc.rect(190, 8, 15, 1, 'F');
        doc.setFillColor(0, 0, 0); // Black
        doc.rect(190, 9, 15, 3, 'F');
        doc.setFillColor(255, 215, 0); // Gold
        doc.rect(190, 12, 15, 1, 'F');
        doc.setFillColor(30, 144, 255); // Blue
        doc.rect(190, 13, 15, 3, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('LUPANULLA ELIMU HUB', 15, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Kitovu cha Elimu ya Sekondari na Msingi Tanzania', 15, 26);

        // Content Frame Header
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Somo: ${subjectName}`, 15, 48);
        doc.text(`Mada: ${topic.title}`, 15, 55);

        // Divider Line
        doc.setDrawColor(203, 213, 225); // Slate-300
        doc.setLineWidth(0.5);
        doc.line(15, 60, 195, 60);

        // Render Notisi Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // Slate-700

        const splitText = doc.splitTextToSize(topic.notesSample, 180);
        doc.text(splitText, 15, 70);

        // Elegant Footer
        doc.setFillColor(15, 23, 42); // Slate-900
        doc.rect(0, 282, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('© 2026 Lupanulla Foundation. Notisi hizi hutolewa bure kwa wanafunzi wa Kitanzania.', 15, 291);
        doc.text('Kurasa: 1 ya 1', 175, 291);

        // Save file
        doc.save(`Lupanulla_Notisi_${subjectName.replace(/\s+/g, '_')}_${topic.title.replace(/\s+/g, '_')}.pdf`);
        setPdfSuccess(true);
        showToast('success', 'Faili la Notisi ya PDF limepakuliwa kikamilifu!');
      } catch (err) {
        console.error('PDF Generation Failed:', err);
        showToast('error', 'Pakua PDF imeshindikana. Tafadhali jaribu tena.');
      } finally {
        setPdfGenerating(false);
      }
    }, 1200);
  };

  const handleSubjectToggle = (subjName: string) => {
    setOpenSubject(prev => (prev === subjName ? null : subjName));
    setSelectedTopic(null);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, topic: Topic) => {
    e.stopPropagation();
    if (!userProfile?.uid) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    
    const topicId = topic.title; 
    const isFav = userProfile.favorites?.includes(topicId);
    
    try {
      await toggleTopicFavorite(userProfile.uid, topicId, !isFav);
      window.dispatchEvent(new CustomEvent('refresh-user-profile'));
      showToast('success', isFav ? 'Mada imeondolewa kwenye Zilizopendwa' : 'Mada imeongezwa kwenye Zilizopendwa ★');
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  // Search filter across ALL levels and subjects
  const searchResults: { level: ClassLevel; subject: string; topic: Topic }[] = [];
  if (searchQuery.trim().length > 1) {
    const q = searchQuery.toLowerCase();
    academicData.forEach(level => {
      level.subjects.forEach(subj => {
        subj.topics.forEach(topic => {
          if (
            topic.title.toLowerCase().includes(q) || 
            topic.content.toLowerCase().includes(q) || 
            subj.name.toLowerCase().includes(q)
          ) {
            searchResults.push({ level, subject: subj.name, topic });
          }
        });
      });
    });
  }

  const selectSearchResult = (res: { level: ClassLevel; subject: string; topic: Topic }) => {
    setActiveLevelTab(res.level.id as any);
    setOpenSubject(res.subject);
    setSelectedTopic(res.topic);
    setSearchQuery(''); // clear search after selecting
  };

  const favorites = academicData.flatMap(level => 
    level.subjects.flatMap(subj => 
      subj.topics.filter(topic => userProfile?.favorites?.includes(topic.title))
    )
  );

  const filteredLevels = activeLevelTab === 'favorites' 
    ? [] 
    : academicData.filter(level => 
        activeLevelTab === 'all' || level.id === activeLevelTab
      );

  return (
    <div id="masomo-view" className="space-y-6 animate-fade-in text-slate-800 bg-slate-50 min-h-screen pb-12">
      
      {/* Dynamic Feedback Notification Bar */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
              feedbackMessage.type === 'success' 
                ? 'bg-emerald-900/95 text-emerald-100 border-emerald-500/20' 
                : feedbackMessage.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/20'
                : 'bg-indigo-950/95 text-indigo-100 border-indigo-500/20'
            }`}
          >
            <div className="p-2 bg-white/10 rounded-xl">
              {feedbackMessage.type === 'success' ? <CheckCircle size={18} /> : feedbackMessage.type === 'error' ? <ShieldAlert size={18} /> : <Info size={18} />}
            </div>
            <p className="text-xs font-bold leading-normal flex-1">{feedbackMessage.text}</p>
            <button onClick={() => setFeedbackMessage(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with Tanzanian colors */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden border border-cyan-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Tanzanian flag corner ribbons */}
        <div className="absolute top-0 right-0 w-40 h-2.5 flex">
          <div className="flex-1 bg-[#1e7c1e]"></div>
          <div className="w-2.5 bg-[#fcd116]"></div>
          <div className="w-8 bg-[#000000]"></div>
          <div className="w-2.5 bg-[#fcd116]"></div>
          <div className="flex-1 bg-[#00a3dd]"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-cyan-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
              <BookMarked size={12} className="text-amber-400" />
              Mtaala Kamili wa TIE &amp; Baraza la Mitihani (NECTA)
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-black uppercase leading-tight tracking-tight">Kituo cha Masomo</h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
              Soma notisi zilizoboreshwa mada kwa mada, sikiliza kwa sauti, fanya mazoezi ya mitihani ya papo hapo ya kujipima, na andika dondoo zako za siri ili kufaulu vizuri zaidi!
            </p>
          </div>

          {/* Quick Active Stats Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 text-white min-w-[200px] space-y-3 shrink-0 shadow-inner">
            <div className="flex items-center gap-2 text-cyan-200">
              <Award size={18} className="text-amber-400 shrink-0" />
              <span className="text-[10px] uppercase font-black tracking-widest">Maendeleo Yako</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <span className="block text-lg font-black text-amber-300">{userProfile?.xp || 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-300">Jumla XP</span>
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <span className="block text-lg font-black text-cyan-300">{userProfile?.studyTime || 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-300">Dakika</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Omnipresent Advanced Search Bar & Filter Options ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2 relative bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="Tafuta mada yoyote... (Msh. 'Atomu', 'Calculus', 'Mkwawa', 'Hisabati')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full">
              <X size={16} className="text-slate-500" />
            </button>
          )}

          {/* Search Results Dropdown List */}
          <AnimatePresence>
            {searchQuery.trim().length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-[300px] overflow-y-auto p-2 space-y-1.5"
              >
                <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Matokeo ya Utafutaji ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <button 
                      key={i}
                      onClick={() => selectSearchResult(res)}
                      className="w-full text-left px-3 py-2 hover:bg-cyan-50/50 rounded-xl transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="overflow-hidden">
                        <span className="font-extrabold text-cyan-700 block truncate">{res.topic.title}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{res.subject} &bull; {res.level.name.split(' (')[0]}</span>
                      </div>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-500 shrink-0 uppercase">Fungua</span>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs font-semibold text-slate-400">
                    Hakuna mada inayolingana na ulichoandika.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stopwatch & Study Focus Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl ${isTimerActive ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
              <Timer size={18} />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Muda wa Kusoma</span>
              <span className="font-mono text-base font-extrabold text-slate-800 block leading-tight">
                {formatTime(studySeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${
                isTimerActive 
                  ? 'bg-amber-400 hover:bg-amber-500 text-amber-950' 
                  : 'bg-slate-950 hover:bg-slate-800 text-white'
              }`}
            >
              {isTimerActive ? 'Pause' : 'Anza'}
            </button>
            {studySeconds > 0 && (
              <button 
                onClick={handleClaimTimerProgress}
                className="p-1.5 hover:bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 transition-all shadow-sm"
                title="Hifadhi Muda na Pata XP"
              >
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Level Filter Navigation Tabs ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ngazi ya Shule</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', name: 'Zote' },
                { id: 'msingi', name: 'Shule ya Msingi' },
                { id: 'olevel', name: 'Kidato 1-4' },
                { id: 'alevel', name: 'Kidato 5-6' },
                { id: 'favorites', name: 'Zilizopendwa ★' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveLevelTab(tab.id as any);
                    setOpenSubject(null);
                    setSelectedTopic(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    activeLevelTab === tab.id 
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {tab.name}
                </motion.button>
              ))}
            </div>
          </div>

          {activeLevelTab === 'alevel' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Mchepuo (Stream)</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', name: 'Zote' },
                  { id: 'PCB', name: 'PCB' },
                  { id: 'HGE', name: 'HGE' },
                  { id: 'EGM', name: 'EGM' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveStreamTab(tab.id as any);
                      setOpenSubject(null);
                      setSelectedTopic(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      activeStreamTab === tab.id 
                        ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {tab.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Google AdSense Responsive Ad Unit (Masomo-top) ── */}
      <AdSenseWidget slotId="3000300303" className="my-2" />

      {/* Accordion List + Document Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Levels and Subjects Accordion */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-display font-black text-base text-slate-900 uppercase tracking-wide">
            {activeLevelTab === 'all' ? 'Mada zote za Kusoma' : 
             activeLevelTab === 'favorites' ? 'Mada Unazozipenda' :
             activeLevelTab === 'alevel' && activeStreamTab !== 'all' ? `Masomo ya ${activeStreamTab}` : 'Mada Yilizochujwa'}
          </h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {activeLevelTab === 'favorites' ? (
              <div className="space-y-3 animate-fade-in">
                {/* Offline Study Sync Panel */}
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isOffline ? 'bg-amber-500' :
                        offlineSyncStatus === 'syncing' ? 'bg-cyan-500 animate-ping' :
                        offlineSyncStatus === 'synced' ? 'bg-green-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-xs font-black text-slate-800">
                        {isOffline ? 'Uko Nje ya Mtandao' :
                         offlineSyncStatus === 'syncing' ? 'Inasawazisha Masomo...' :
                         offlineSyncStatus === 'synced' ? 'Masomo Yote Yako Offline' : 'Usawazishaji wa Offline'}
                      </span>
                    </div>
                    {!isOffline && (
                      <button
                        onClick={() => {
                          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                            setOfflineSyncStatus('syncing');
                            navigator.serviceWorker.controller.postMessage({
                              type: 'SYNC_FAVORITES',
                              favorites: userProfile?.favorites || []
                            });
                          }
                        }}
                        disabled={offlineSyncStatus === 'syncing'}
                        className="text-[10px] font-black uppercase text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1.5 rounded-xl transition-all"
                      >
                        {offlineSyncStatus === 'syncing' ? 'Inasawazisha...' : 'Sawazisha Sasa'}
                      </button>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                    Lupanulla inasawazisha mada zako unazozipenda moja kwa moja ili uweze kuendelea kusoma, kujibu maswali ya mazoezi, na kutumia flashcards ukiwa mahali popote bila mtandao.
                  </p>
                  
                  {lastSyncedTime && (
                    <div className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                      <span>✓ Mwisho kusawazishwa:</span>
                      <span className="text-slate-600">{lastSyncedTime}</span>
                    </div>
                  )}
                </div>

                {favorites.length > 0 ? (
                  favorites.map((topic) => {
                    const isTopicSelected = selectedTopic?.title === topic.title;
                    return (
                      <motion.button 
                        key={topic.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedTopic(topic)}
                        className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center justify-between gap-2 border ${
                          isTopicSelected 
                            ? 'bg-cyan-600 border-cyan-600 text-white shadow-cyan-600/20' 
                            : 'bg-white border-slate-100 text-slate-700 hover:border-cyan-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <BookMarked size={16} className={isTopicSelected ? 'text-white' : 'text-cyan-500'} />
                          <span className="truncate">{topic.title}</span>
                        </div>
                        <motion.div 
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => handleToggleFavorite(e, topic)}
                          className={`p-1.5 rounded-xl transition-colors ${
                            isTopicSelected ? 'bg-white/20 text-white' : 'bg-slate-50 text-amber-400 hover:bg-amber-100'
                          }`}
                        >
                          <Star size={14} fill="currentColor" />
                        </motion.div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Star size={24} className="text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-xs">Hakuna Mada Zilizopendwa</h3>
                      <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                        Bonyeza alama ya nyota kwenye mada yoyote ili kuihifadhi hapa kwa haraka.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              filteredLevels.map((level) => {
                // Filter subjects if level is alevel and a stream is selected
                const displaySubjects = level.id === 'alevel' && activeStreamTab !== 'all'
                  ? level.subjects.filter(s => (streams as any)[activeStreamTab].includes(s.name))
                  : level.subjects;

                if (displaySubjects.length === 0) return null;

                return (
                  <motion.div 
                    key={level.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                  >
                    <div className="w-full flex justify-between items-center p-3.5 text-left font-extrabold text-xs uppercase bg-slate-50 border-b border-slate-100 text-slate-500">
                      <span className="flex items-center gap-2">
                        <BookOpen size={15} className="text-cyan-600" />
                        {level.name.split(' (')[0]}
                      </span>
                    </div>

                    <div className="p-2 space-y-1">
                      {displaySubjects.map((subj) => {
                        const isSubjOpen = openSubject === subj.name;
                        return (
                          <div key={subj.name} className="rounded-xl overflow-hidden">
                            <motion.button 
                              whileHover={{ scale: 1.01, x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSubjectToggle(subj.name)}
                              className={`w-full flex justify-between items-center px-3.5 py-2.5 text-xs text-left font-bold transition-all rounded-xl ${
                                isSubjOpen 
                                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/15' 
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate">{subj.name}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                                isSubjOpen ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {subj.topics.length} Mada
                              </span>
                            </motion.button>

                            <AnimatePresence>
                              {isSubjOpen && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="bg-white p-2 border border-slate-100 rounded-b-xl space-y-1 mt-1 overflow-hidden"
                                >
                                  {subj.topics.map((topic) => {
                                    const isTopicSelected = selectedTopic?.title === topic.title;
                                    const isFav = userProfile?.favorites?.includes(topic.title);
                                    const completedCount = completedSubtopics[topic.title]?.length || 0;
                                    const totalCount = topic.subtopics.length;
                                    const isFullyRead = completedCount === totalCount && totalCount > 0;
                                    
                                    return (
                                      <motion.button 
                                        key={topic.title}
                                        whileHover={{ backgroundColor: '#f8fafc', x: 4 }}
                                        onClick={() => setSelectedTopic(topic)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between gap-2 border border-transparent ${
                                          isTopicSelected 
                                            ? 'bg-cyan-50 border-cyan-200 text-cyan-800' 
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <div className="flex items-center gap-1 shrink-0">
                                            {isFullyRead ? (
                                              <CheckCircle size={12} className="text-emerald-500" />
                                            ) : (
                                              <FileText size={12} className={isTopicSelected ? 'text-cyan-600' : 'text-slate-400'} />
                                            )}
                                          </div>
                                          <span className="truncate leading-normal">{topic.title}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {completedCount > 0 && (
                                            <span className="text-[8px] bg-slate-100 px-1 rounded font-black text-slate-500">
                                              {completedCount}/{totalCount}
                                            </span>
                                          )}
                                          <motion.div
                                            whileTap={{ scale: 0.8 }}
                                            onClick={(e) => handleToggleFavorite(e, topic)}
                                            className={`p-0.5 rounded transition-colors ${
                                              isFav ? 'text-amber-400 hover:bg-amber-50' : 'text-slate-300 hover:text-slate-500'
                                            }`}
                                          >
                                            <Star size={11} fill={isFav ? 'currentColor' : 'none'} />
                                          </motion.div>
                                        </div>
                                      </motion.button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* ── Google AdSense Responsive Ad Unit (Masomo-sidebar) ── */}
          <AdSenseWidget slotId="4000400404" className="mt-4" />
        </div>

        {/* Right Side: Topic Reader Workspace */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <div id="masomo-reader-top" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
              
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] text-cyan-600 font-extrabold uppercase tracking-widest block">
                    {academicData.find(l => l.subjects.some(s => s.topics.some(t => t.title === selectedTopic.title)))?.name.split(' (')[0]}
                  </span>
                  <h3 className="font-display font-black text-slate-950 text-lg sm:text-xl uppercase leading-tight">
                    {selectedTopic.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-bold">
                    <span>Mtaala Rasmi wa TIE</span>
                    <span>&bull;</span>
                    <span>Lupanulla Elimu Hub</span>
                  </div>
                </div>
                
                {/* PDF and Audio Playback Bar */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={handleToggleSpeech}
                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm ${
                      isSpeaking 
                        ? 'bg-rose-500 text-white shadow-rose-500/10 animate-pulse' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    <span>{isSpeaking ? 'Acha Sauti' : 'Soma Sauti'}</span>
                  </button>

                  <button 
                    onClick={() => handleGeneratePdf(selectedTopic, openSubject || 'Somo')}
                    disabled={pdfGenerating}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1.5 uppercase tracking-wide"
                  >
                    {pdfGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Inapakua...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Notisi (PDF)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Speech rate controller if speaking */}
              {isSpeaking && (
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
                    <span>Inasoma kwa Kasi: {speechRate}x</span>
                  </div>
                  <div className="flex gap-1">
                    {[0.8, 1.0, 1.2].map((rate) => (
                      <button 
                        key={rate} 
                        onClick={() => changeSpeechRate(rate)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          speechRate === rate ? 'bg-cyan-600 text-white' : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion Progress Gauge */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <BookOpenCheck size={14} className="text-cyan-600" />
                    Maendeleo ya Usomaji:
                  </span>
                  <span>
                    {completedSubtopics[selectedTopic.title]?.length || 0} kati ya {selectedTopic.subtopics.length} mada ndogo zimekamilika
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ 
                      width: `${((completedSubtopics[selectedTopic.title]?.length || 0) / selectedTopic.subtopics.length) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* ── Active Reader Tabs (Official, Quiz, Flashcards, Tips, Notebook) ── */}
              <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px">
                {[
                  { id: 'notes', name: 'Notisi Rasmi', icon: BookOpen },
                  { id: 'quiz', name: 'Zoezi / Quizzes', icon: Award },
                  { id: 'flashcards', name: 'Kadi za Masomo', icon: Brain },
                  { id: 'tips', name: 'Mbinu za NECTA', icon: Compass },
                  { id: 'notepad', name: 'Notepad Yangu', icon: PenTool }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeReaderTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReaderTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black transition-all shrink-0 border-b-2 uppercase tracking-wider rounded-t-xl ${
                        isActive 
                          ? 'border-cyan-600 text-cyan-600 bg-cyan-50/20' 
                          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                      }`}
                    >
                      <IconComp size={14} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Rendering */}
              <div className="mt-4 min-h-[250px]">
                
                {/* ── Tab 1: Official Notes Summary ── */}
                {activeReaderTab === 'notes' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Summary Card */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-cyan-700">
                        <Award size={15} />
                        Muhtasari wa Mada (Topic Summary)
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed bg-cyan-50/15 border border-cyan-500/10 p-4 rounded-2xl font-medium">
                        {selectedTopic.content}
                      </p>
                    </div>

                    {/* Interactive Subtopics Checklist */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare size={15} className="text-emerald-500" />
                        Syllabus Subtopics (Weka Alama ya Nimesoma)
                      </h4>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {selectedTopic.subtopics.map((sub, i) => {
                          const isCompleted = completedSubtopics[selectedTopic.title]?.includes(sub);
                          return (
                            <button 
                              key={i} 
                              onClick={() => handleToggleSubtopicComplete(sub)}
                              className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                                isCompleted 
                                  ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800 shadow-sm' 
                                  : 'bg-white border-slate-200/60 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <div className={`p-0.5 rounded-md mt-0.5 shrink-0 transition-colors ${
                                isCompleted ? 'text-emerald-600' : 'text-slate-300'
                              }`}>
                                {isCompleted ? <CheckCircle size={15} /> : <Square size={15} />}
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-widest mb-0.5">Sehemu {i + 1}</span>
                                <span className="text-xs font-bold leading-snug">{sub}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Syllabus Raw Code preview block */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={15} className="text-slate-400" />
                        Kijitabu cha Notisi (Study Document Preview)
                      </h4>
                      <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl p-4 sm:p-5 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed shadow-inner max-h-[300px] overflow-y-auto">
                        {selectedTopic.notesSample}
                    </div>
                  </div>

                </div>
              )}

              {/* ── Tab: Flashcards ── */}
              {activeReaderTab === 'flashcards' && (() => {
                const totalCards = flashcardsList.length;
                if (totalCards === 0) {
                  return (
                    <div className="text-center p-8 text-slate-500 text-xs font-bold bg-slate-50 border border-slate-100 rounded-3xl animate-fade-in">
                      <Brain className="mx-auto text-slate-300 mb-2 animate-pulse" size={32} />
                      Hakuna kadi za kumbukumbu zilizotayarishwa kwa mada hii bado.
                    </div>
                  );
                }

                const currentCard = flashcardsList[flashcardIndex];
                const isLearned = learnedCardIndices.includes(flashcardIndex);
                const learnedPercent = Math.round((learnedCardIndices.length / totalCards) * 100);

                const handleToggleFlashcardSpeech = (card: MasomoFlashcard, part: 'term' | 'definition') => {
                  if (isFlashcardSpeaking) {
                    window.speechSynthesis.cancel();
                    setIsFlashcardSpeaking(false);
                  } else {
                    window.speechSynthesis.cancel();
                    const textToRead = part === 'term' ? card.term : card.definition;
                    const utterance = new SpeechSynthesisUtterance(textToRead);
                    
                    // Simple Swahili detection
                    const hasSwahiliWords = /[aeiou]za\b|[aeiou]ya\b|ni\b|kwa\b|la\b|katika\b|na\b|ya\b|wa\b|kuhusu\b|ni\s|mbinu|kadi|maana|ndogo|mbele|nyuma|shujaa|taifa|mifumo|aina|maneno|sehemu|kawaida|shazari/i.test(textToRead);
                    utterance.lang = hasSwahiliWords ? 'sw-TZ' : 'en-US';
                    utterance.rate = speechRate;
                    
                    utterance.onend = () => setIsFlashcardSpeaking(false);
                    utterance.onerror = () => setIsFlashcardSpeaking(false);
                    
                    window.speechSynthesis.speak(utterance);
                    setIsFlashcardSpeaking(true);
                    showToast('success', `Inasoma: "${textToRead.slice(0, 25)}..."`);
                  }
                };

                const handleNextCard = () => {
                  setIsCardFlipped(false);
                  window.speechSynthesis.cancel();
                  setIsFlashcardSpeaking(false);
                  setTimeout(() => {
                    setFlashcardIndex((prev) => (prev + 1) % totalCards);
                  }, 150);
                };

                const handlePrevCard = () => {
                  setIsCardFlipped(false);
                  window.speechSynthesis.cancel();
                  setIsFlashcardSpeaking(false);
                  setTimeout(() => {
                    setFlashcardIndex((prev) => (prev - 1 + totalCards) % totalCards);
                  }, 150);
                };

                const handleToggleLearned = () => {
                  if (isLearned) {
                    setLearnedCardIndices(prev => prev.filter(idx => idx !== flashcardIndex));
                  } else {
                    setLearnedCardIndices(prev => [...prev, flashcardIndex]);
                    // Award 2 XP for marking a card as learned
                    if (userProfile?.uid) {
                      awardStudyPoints(userProfile.uid, 2, 0).then(() => {
                        window.dispatchEvent(new CustomEvent('refresh-user-profile'));
                      }).catch(console.error);
                    }
                    showToast('success', 'Hongera! Umeelewa dhana hii (+2 XP)');
                  }
                };

                const handleShuffleCards = () => {
                  setIsCardFlipped(false);
                  window.speechSynthesis.cancel();
                  setIsFlashcardSpeaking(false);
                  const shuffled = [...flashcardsList].sort(() => Math.random() - 0.5);
                  setFlashcardsList(shuffled);
                  setFlashcardIndex(0);
                  showToast('info', 'Kadi zimechanganywa!');
                };

                const handleResetCards = () => {
                  setIsCardFlipped(false);
                  window.speechSynthesis.cancel();
                  setIsFlashcardSpeaking(false);
                  setFlashcardIndex(0);
                  setLearnedCardIndices([]);
                  if (selectedTopic) {
                    setFlashcardsList(getFlashcardsForTopic(selectedTopic.title));
                  }
                  showToast('info', 'Umeanzisha upya kadi zote!');
                };

                return (
                  <div className="space-y-6 animate-fade-in max-w-xl mx-auto pb-6">
                    {/* Header and Progress stats */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-cyan-600 tracking-widest block">Kadi za Kumbukumbu (Flashcards)</span>
                        <h4 className="text-sm font-black text-slate-800">Kadi {flashcardIndex + 1} ya {totalCards}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <div className="text-right">
                          <span className="block text-emerald-600 font-extrabold">Uelewa: {learnedCardIndices.length}/{totalCards} ({learnedPercent}%)</span>
                          <span className="text-[9.5px] text-slate-400">Pata +2 XP kwa kila kadi unayoielewa</span>
                        </div>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${learnedPercent}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* 3D-Like Flipping Card Container */}
                    <div className="perspective-1000 h-64 cursor-pointer" onClick={() => {
                      setIsCardFlipped(!isCardFlipped);
                      window.speechSynthesis.cancel();
                      setIsFlashcardSpeaking(false);
                    }}>
                      <div 
                        className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isCardFlipped ? 'rotate-y-180' : ''}`}
                      >
                        {/* Card Front Side */}
                        <div className="absolute w-full h-full backface-hidden bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-cyan-300 transition-all">
                          <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase tracking-wider">Mbele (Front)</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFlashcardSpeech(currentCard, 'term');
                                }}
                                className={`p-1 rounded-md border transition-all ${
                                  isFlashcardSpeaking 
                                    ? 'bg-cyan-100 border-cyan-200 text-cyan-600 animate-pulse' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                                }`}
                                title="Soma kwa Sauti"
                              >
                                {isFlashcardSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              </button>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLearned();
                              }}
                              className={`p-1.5 rounded-xl border transition-all ${
                                isLearned 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                              }`}
                              title={isLearned ? 'Ondoa alama' : 'Weka alama kuwa umeelewa'}
                            >
                              <CheckCircle2 size={15} className={isLearned ? 'fill-current' : ''} />
                            </button>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-2">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                              {currentCard?.term}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold w-full border-t border-slate-100 pt-3">
                            <span className="flex items-center gap-1">
                              <RotateCw size={11} className="text-cyan-500 animate-spin-slow" /> Bofya kadi kuona maana
                            </span>
                            <span>{isLearned ? 'Umeelewa ✓' : 'Bado kusoma'}</span>
                          </div>
                        </div>

                        {/* Card Back Side (Flipped) */}
                        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-cyan-900 to-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg rotate-y-180 border border-cyan-500/10">
                          <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-white/10 text-cyan-200 font-black px-2 py-0.5 rounded uppercase tracking-wider">Nyuma (Back)</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFlashcardSpeech(currentCard, 'definition');
                                }}
                                className={`p-1 rounded-md border transition-all ${
                                  isFlashcardSpeaking 
                                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 animate-pulse' 
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                                }`}
                                title="Soma kwa Sauti"
                              >
                                {isFlashcardSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              </button>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLearned();
                              }}
                              className={`p-1.5 rounded-xl border border-white/10 transition-all ${
                                isLearned 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <CheckCircle2 size={15} className={isLearned ? 'fill-current' : ''} />
                            </button>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-2 overflow-y-auto max-h-[120px]">
                            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-100">
                              {currentCard?.definition}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold w-full border-t border-white/10 pt-3">
                            <span className="flex items-center gap-1 text-cyan-300">
                              <RotateCw size={11} /> Bofya kurudi mbele
                            </span>
                            <span className={isLearned ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}>
                              {isLearned ? 'Umeelewa ✓' : 'Bofya alama ya tiki kama umeelewa'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card controls & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      {/* Navigation Arrows */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handlePrevCard}
                          className="p-2.5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                          title="Kadi Iliyopita"
                        >
                          <ChevronLeft size={16} className="text-slate-700" />
                        </button>
                        <span className="text-xs font-extrabold text-slate-500 px-3 py-1 bg-slate-100 rounded-lg">
                          {flashcardIndex + 1} / {totalCards}
                        </span>
                        <button 
                          onClick={handleNextCard}
                          className="p-2.5 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                          title="Kadi Inayofuata"
                        >
                          <ChevronRight size={16} className="text-slate-700" />
                        </button>
                      </div>

                      {/* Shuffle and reset actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleShuffleCards}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Shuffle size={13} /> Changanya
                        </button>
                        <button 
                          onClick={handleResetCards}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <RotateCcw size={13} /> Anza Upya
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Tab 2: Revision Quizzes ── */}
                {activeReaderTab === 'quiz' && (() => {
                  const questions = getQuizQuestions(selectedTopic.title);
                  const totalQuestions = questions.length;
                  const currentQuestion = questions[currentQuestionIndex] || questions[0] || {
                    question: 'Mada haina maswali kwa sasa.',
                    options: [],
                    correctAnswerIndex: 0,
                    explanation: 'Tafadhali jaribu mada nyingine.'
                  };

                  return (
                    <div className="space-y-4 animate-fade-in">
                      {quizFinished ? (
                        // Quiz Finished Report Screen
                        <div className="bg-gradient-to-br from-cyan-900 to-slate-900 text-white rounded-3xl p-6 text-center space-y-4 shadow-xl border border-cyan-500/15">
                          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-amber-400">
                            <Award size={32} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-display font-black text-lg uppercase">Zoezi Limekamilika!</h4>
                            <p className="text-slate-300 text-xs font-bold">
                              Alama Zako: <span className="text-amber-300 text-base font-black">{quizCorrectCount} / {totalQuestions}</span>
                            </p>
                          </div>
                          <div className="bg-white/5 p-3.5 rounded-2xl max-w-sm mx-auto text-[11px] font-semibold leading-relaxed text-slate-300 border border-white/5">
                            {quizCorrectCount === totalQuestions 
                              ? 'Bora kabisa! Umepata alama zote na kujizolea ziada ya +20 XP! Wewe ni Bingwa wa mada hii.' 
                              : 'Kazi nzuri sana! Rudia zoezi hili ili kupata alama 100% na kuboresha uelewa wako.'}
                          </div>
                          <div className="flex justify-center gap-2 pt-2">
                            <button 
                              onClick={handleRestartQuiz}
                              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-98"
                            >
                              Anza Upya
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Active Quiz Playing Screen
                        <div className="space-y-4">
                          {/* Quiz Progress header */}
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span className="uppercase tracking-widest text-[9px] bg-slate-100 px-2 py-0.5 rounded font-black">
                              Swali {Math.min(currentQuestionIndex + 1, totalQuestions)} la {totalQuestions}
                            </span>
                            <span className="text-emerald-600 font-extrabold">Ufaulu: {quizCorrectCount} sahihi</span>
                          </div>

                          {/* Question container */}
                          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 sm:p-5">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-relaxed">
                              {currentQuestion.question}
                            </p>
                          </div>

                          {/* Multiple choice Options list */}
                          <div className="space-y-2">
                            {currentQuestion.options.map((opt, idx) => {
                              const isSelected = selectedOptionIndex === idx;
                              const isCorrectAnswer = idx === currentQuestion.correctAnswerIndex;
                              
                              let optionStyle = 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700';
                              if (quizChecked) {
                                if (isCorrectAnswer) {
                                  optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold';
                                } else if (isSelected) {
                                  optionStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                                } else {
                                  optionStyle = 'bg-white border-slate-100 text-slate-400 opacity-60';
                                }
                              } else if (isSelected) {
                                optionStyle = 'bg-cyan-50 border-cyan-400 text-cyan-800 font-extrabold ring-1 ring-cyan-200';
                              }

                              return (
                                <button 
                                  key={idx}
                                  disabled={quizChecked}
                                  onClick={() => handleSelectQuizOption(idx)}
                                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizChecked && isCorrectAnswer && (
                                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                                  )}
                                  {quizChecked && isSelected && !isCorrectAnswer && (
                                    <X size={15} className="text-rose-500 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation box */}
                          {showExplanation && (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-[11px] leading-relaxed text-indigo-900 font-medium animate-fade-in">
                              <span className="font-black uppercase tracking-wider block text-indigo-950 mb-1">Dondoo na Sababu ya Jibu:</span>
                              {currentQuestion.explanation}
                            </div>
                          )}

                          {/* Controller buttons */}
                          <div className="flex justify-end gap-2 pt-2">
                            {!quizChecked ? (
                              <button 
                                disabled={selectedOptionIndex === null}
                                onClick={handleCheckQuizAnswer}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                              >
                                Kagua Jibu
                              </button>
                            ) : (
                              <button 
                                onClick={handleNextQuizQuestion}
                                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
                              >
                                <span>{currentQuestionIndex < totalQuestions - 1 ? 'Swali Linalofuata' : 'Kamilisha Zoezi'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Tab 3: NECTA Exam Survival Guide ── */}
                {activeReaderTab === 'tips' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-1 md:col-span-1">
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">Uzito katika Mtihani</span>
                        <span className="text-sm font-black text-emerald-950 block">
                          {getExamTips(selectedTopic.title).weight}
                        </span>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-1 md:col-span-2">
                        <span className="text-[9px] text-amber-600 font-black uppercase tracking-wider block">Siri ya Kufaulu (Examiners Secret)</span>
                        <p className="text-xs text-amber-950 font-bold leading-normal">
                          {getExamTips(selectedTopic.title).tricks}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Compass size={16} />
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Muongozo wa Mitihani ya Taifa (NECTA Prep)</h4>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                        {getExamTips(selectedTopic.title).tips}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Tab 4: Notepad Revision Editor ── */}
                {activeReaderTab === 'notepad' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <PenTool size={14} className="text-cyan-600 animate-pulse" />
                        Dondoo za Kujisomea (Private Study Notes)
                      </span>
                      <span>Imehifadhiwa kiotomatiki kieneo</span>
                    </div>

                    <div className="relative">
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder={`Siri za kusoma: Andika dondoo zako hapa kuhusu "${selectedTopic.title}" (Mf. kanuni, vitu vya kukumbuka, n.k.) ili uweze kurudia kwa urahisi zaidi kabla ya mtihani...`}
                        className="w-full h-44 p-4 text-xs sm:text-sm font-mono bg-amber-50/20 border border-amber-200 rounded-2xl outline-none placeholder-slate-400 text-slate-800 leading-relaxed shadow-inner"
                      />
                      
                      {/* Lined Paper visual indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 opacity-20 ml-3 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div>
                        {draftSavedToast && (
                          <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1 animate-fade-in">
                            <CheckCircle size={14} /> Dondoo zimehifadhiwa salama!
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={handleSaveNotepadDraft}
                        disabled={isSavingDraft}
                        className="bg-slate-950 hover:bg-slate-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-98 flex items-center gap-1.5 uppercase tracking-wide disabled:opacity-40"
                      >
                        <Save size={14} />
                        <span>{isSavingDraft ? 'Inahifadhi...' : 'Hifadhi Dondoo'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Related Topics (Related Posts) Section ── */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">Mada Zinazohusiana (Related Topics)</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    const currentLevelData = academicData.find(l => l.id === activeLevelTab);
                    const currentSubjectData = currentLevelData?.subjects.find(s => s.name === openSubject);
                    const currentSubjectTopics = currentSubjectData?.topics || [];
                    const related = currentSubjectTopics
                      .filter(t => t.title !== selectedTopic.title)
                      .slice(0, 2);

                    if (related.length === 0) {
                      return (
                        <p className="text-xs text-slate-400 font-semibold italic col-span-2">Hakuna mada nyingine ya somo hili kwa sasa.</p>
                      );
                    }

                    return related.map((topic, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setActiveReaderTab('notes');
                          document.getElementById('masomo-reader-top')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group bg-slate-50 hover:bg-cyan-50/40 border border-slate-200/60 hover:border-cyan-300 rounded-2xl p-4 cursor-pointer transition-all duration-300 flex items-start gap-3.5"
                      >
                        <div className="w-9 h-9 bg-white group-hover:bg-cyan-100 text-slate-500 group-hover:text-cyan-700 rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-cyan-200 shadow-sm transition-colors shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h5 className="text-xs font-black text-slate-800 group-hover:text-cyan-900 leading-snug truncate">
                            {topic.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-bold group-hover:text-cyan-600 uppercase tracking-wider">
                            Soma Mada Hii →
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Reader Footer Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-5 text-[10px] text-slate-400 font-black uppercase tracking-wider gap-2">
                <span>Kitovu cha Elimu Tanzania • Notisi Bure</span>
                <span>ID: NOTI-{(openSubject || 'S').substring(0, 3).toUpperCase()}-{(selectedTopic.title).substring(0, 3).toUpperCase()}</span>
              </div>

            </div>
          ) : (
            // No Topic Selected Fallback Screen
            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[450px]">
              <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mb-2">
                <BookOpen size={30} className="stroke-[1.5]" />
              </div>
              <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-tight">Kituo cha Masomo ya Msingi na Sekondari</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-semibold">
                Tafadhali chagua ngazi ya shule, kisha chagua somo lako na mada mpendwa katika orodha ya upande wa kushoto ili kufungua vitabu vya masomo na dondoo za mitihani ya Taifa.
              </p>
              <button 
                onClick={() => setActiveLevelTab('olevel')}
                className="mt-2 py-2 px-5 text-xs font-black bg-slate-950 text-white hover:bg-slate-800 transition-all rounded-xl uppercase tracking-wider"
              >
                Fungua O-Level (Kidato 1-4)
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Footer Copyright ── */}
      <footer className="pt-10 pb-6 border-t border-slate-200 text-center space-y-2 mt-6">
        <p className="text-[10px] text-slate-400 font-bold tracking-wide">
          © 2026 Lupanulla Foundation. Notisi, Mazoezi na Dondoo za NECTA hutolewa bure kwa wanafunzi wote nchini Tanzania.
        </p>
        <p className="text-[9px] text-slate-300 italic max-w-md mx-auto font-medium">
          Maudhui haya yameandaliwa kulingana na miongozo na mihutasari rasmi ya Taasisi ya Elimu Tanzania (TIE) na Baraza la Mitihani la Tanzania (NECTA).
        </p>
      </footer>
    </div>
  );
}
