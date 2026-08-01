import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Eye, 
  Bookmark, 
  Share2, 
  Crown, 
  AlertCircle,
  HelpCircle,
  Lock,
  Compass,
  Brain,
  Sparkles,
  Highlighter,
  Trash2,
  Plus,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  ShieldAlert,
  Link2,
  StickyNote,
  Edit3,
  BookOpen,
  BookMarked,
  Search,
  Volume2,
  RefreshCw,
  X,
  Filter,
  EyeOff
} from 'lucide-react';
import { fetchDocuments, saveHighlight, fetchHighlights, deleteHighlight, toggleBookmark, fetchUserBookmarks, submitFeedback, updateDocument, savePDFPageNote, fetchPDFPageNotes, deletePDFPageNote, saveVocabularyItem, fetchVocabularyItems, deleteVocabularyItem } from '../firebase';
import { DocumentMetadata, HighlightAnnotation, UserBookmark, PDFPageNote, VocabularyItem } from '../types';
import FlashcardsModal from './FlashcardsModal';
import PDFPreviewer from './PDFPreviewer';
import { jsPDF } from 'jspdf';
import { formatGoogleDriveUrls } from '../utils/linkAutoDetector';

interface ReaderViewProps {
  documentId: string;
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function ReaderView({ documentId, onNavigate, userProfile }: ReaderViewProps) {
  const [doc, setDoc] = useState<DocumentMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  // Copyright Reporting States
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // States for text selection and highlight annotations
  const [readerMode, setReaderMode] = useState<'pdf' | 'notes'>('pdf');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!readerRef.current) return;
    try {
      if (!isFullscreen) {
        if (readerRef.current.requestFullscreen) {
          readerRef.current.requestFullscreen();
        } else if ((readerRef.current as any).webkitRequestFullscreen) {
          (readerRef.current as any).webkitRequestFullscreen();
        } else if ((readerRef.current as any).msRequestFullscreen) {
          (readerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Native fullscreen not fully supported, falling back to CSS-only fullscreen:', e);
      setIsFullscreen(!isFullscreen);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement = document.fullscreenElement || 
                            (document as any).webkitFullscreenElement || 
                            (document as any).msFullscreenElement;
      setIsFullscreen(!!activeElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const [highlights, setHighlights] = useState<HighlightAnnotation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [highlightColor, setHighlightColor] = useState('bg-yellow-100 text-yellow-900 border-yellow-300');
  const [highlightNote, setHighlightNote] = useState('');
  const [savingHighlight, setSavingHighlight] = useState(false);
  const [smartNotes, setSmartNotes] = useState('');
  const [loadingSmartNotes, setLoadingSmartNotes] = useState(false);

  // PDF Page Notes state
  const [pageNotes, setPageNotes] = useState<PDFPageNote[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNotePage, setSelectedNotePage] = useState<number>(1);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // My Vocabulary state
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [vocabSearchQuery, setVocabSearchQuery] = useState('');
  const [filterDocOption, setFilterDocOption] = useState<'current' | 'all'>('current');
  const [vocabWordInput, setVocabWordInput] = useState('');
  const [vocabDefInput, setVocabDefInput] = useState('');
  const [vocabContextInput, setVocabContextInput] = useState('');
  const [editingVocabId, setEditingVocabId] = useState<string | null>(null);
  const [isSavingVocab, setIsSavingVocab] = useState(false);
  const [isGeneratingDef, setIsGeneratingDef] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);
  const [revealedVocabIds, setRevealedVocabIds] = useState<Record<string, boolean>>({});

  const loadHighlights = async () => {
    if (!userProfile?.uid) return;
    try {
      const fetched = await fetchHighlights(userProfile.uid, documentId);
      setHighlights(fetched);
    } catch (e) {
      console.error('Error loading highlights:', e);
    }
  };

  const loadPageNotes = async () => {
    if (!userProfile?.uid) return;
    try {
      const fetched = await fetchPDFPageNotes(userProfile.uid, documentId);
      setPageNotes(fetched);
    } catch (e) {
      console.error('Error loading page notes:', e);
    }
  };

  const handleOpenNoteModal = (pageNumber?: number, existingNote?: PDFPageNote) => {
    if (!userProfile?.uid) {
      alert('🔒 TAFADHALI INGIA KWENYE AKAUNTI:\nKuhifadhi notisi za ukurasa ni huduma inayohitaji uwe umeingia kwenye akaunti yako ya Lupanulla.');
      return;
    }
    if (existingNote) {
      setEditingNoteId(existingNote.id);
      setSelectedNotePage(existingNote.pageNumber);
      setNoteText(existingNote.content);
    } else {
      setEditingNoteId(null);
      setSelectedNotePage(pageNumber || 1);
      setNoteText('');
    }
    setIsNoteModalOpen(true);
  };

  const handleSavePageNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userProfile?.uid) {
      alert('🔒 TAFADHALI INGIA KWENYE AKAUNTI:\nKuhifadhi notisi za ukurasa ni huduma inayohitaji uwe umeingia kwenye akaunti yako ya Lupanulla.');
      return;
    }
    if (!noteText.trim()) {
      alert('Tafadhali andika maelezo au notisi yako.');
      return;
    }

    try {
      setIsSavingNote(true);
      await savePDFPageNote({
        id: editingNoteId || undefined,
        userId: userProfile.uid,
        documentId: documentId,
        documentTitle: doc?.title || 'PDF Document',
        pageNumber: Number(selectedNotePage) || 1,
        content: noteText.trim(),
      });
      setNoteText('');
      setEditingNoteId(null);
      await loadPageNotes();
    } catch (err: any) {
      console.error('Error saving PDF page note:', err);
      alert('Kuna tatizo wakati wa kuhifadhi notisi: ' + (err.message || err));
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeletePageNote = async (id: string) => {
    if (!confirm('Je, una uhakika unataka kufuta notisi hii?')) return;
    try {
      await deletePDFPageNote(id);
      await loadPageNotes();
    } catch (err) {
      console.error('Error deleting PDF page note:', err);
    }
  };

  const loadVocabulary = async () => {
    if (!userProfile?.uid) return;
    try {
      const fetched = await fetchVocabularyItems(userProfile.uid);
      setVocabularyItems(fetched);
    } catch (e) {
      console.error('Error loading vocabulary items:', e);
    }
  };

  const handleOpenVocabModal = (prefillWord?: string, existingItem?: VocabularyItem) => {
    if (!userProfile?.uid) {
      alert('🔒 TAFADHALI INGIA KWENYE AKAUNTI:\nKuhifadhi msamiati ni huduma inayohitaji uwe umeingia kwenye akaunti yako ya Lupanulla.');
      return;
    }
    if (existingItem) {
      setEditingVocabId(existingItem.id);
      setVocabWordInput(existingItem.word);
      setVocabDefInput(existingItem.definition || '');
      setVocabContextInput(existingItem.contextSentence || '');
    } else {
      setEditingVocabId(null);
      setVocabWordInput(prefillWord || selectedText || '');
      setVocabDefInput('');
      setVocabContextInput(prefillWord ? `Amesomwa kutoka kitabu cha ${doc?.title || 'PDF'}` : '');
    }
    setIsVocabOpen(true);
  };

  const handleSaveVocabulary = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userProfile?.uid) {
      alert('🔒 TAFADHALI INGIA KWENYE AKAUNTI:\nKuhifadhi msamiati ni huduma inayohitaji uwe umeingia kwenye akaunti yako ya Lupanulla.');
      return;
    }
    const word = vocabWordInput.trim();
    if (!word) {
      alert('Tafadhali ingiza neno au kishazi cha msamiati.');
      return;
    }

    try {
      setIsSavingVocab(true);
      await saveVocabularyItem({
        id: editingVocabId || undefined,
        userId: userProfile.uid,
        word,
        definition: vocabDefInput.trim(),
        contextSentence: vocabContextInput.trim(),
        documentId: documentId,
        documentTitle: doc?.title || 'PDF Document',
      });
      setVocabWordInput('');
      setVocabDefInput('');
      setVocabContextInput('');
      setEditingVocabId(null);
      await loadVocabulary();
    } catch (err: any) {
      console.error('Error saving vocabulary item:', err);
      alert('Kuna tatizo wakati wa kuhifadhi msamiati: ' + (err.message || err));
    } finally {
      setIsSavingVocab(false);
    }
  };

  const handleQuickAddSelectionToVocab = async () => {
    if (!selectedText.trim()) {
      alert('Tafadhali chagua neno kwenye maelezo kwanza.');
      return;
    }
    handleOpenVocabModal(selectedText.trim());
  };

  const handleDeleteVocabulary = async (id: string) => {
    if (!confirm('Je, una uhakika unataka kufuta neno hili kutoka kwenye msamiati wako?')) return;
    try {
      await deleteVocabularyItem(id);
      await loadVocabulary();
    } catch (err) {
      console.error('Error deleting vocabulary item:', err);
    }
  };

  const handleAutoDefineWord = async () => {
    const wordToDefine = vocabWordInput.trim();
    if (!wordToDefine) {
      alert('Ingiza neno hapo juu kwanza ili kupata maana ya AI!');
      return;
    }

    try {
      setIsGeneratingDef(true);
      const response = await fetch('/api/claude.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "Wewe ni Mtaalamu wa Kamusi ya Kitaaluma nchini Tanzania (Lupanulla Elimuhu). Toa fasili fupi na maelezo mepesi kwa Kiswahili kwa ajili ya neno hili la msamiati la kitaaluma.",
          messages: [
            {
              role: 'user',
              content: `Toa maana au fasili fupi ya kitaaluma kwa Kiswahili kwa ajili ya neno/kishazi hichi: "${wordToDefine}". Somo: "${doc?.category || 'Masomo'}".`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setVocabDefInput(data.reply.trim());
        }
      }
    } catch (err) {
      console.error('Error fetching AI definition:', err);
    } finally {
      setIsGeneratingDef(false);
    }
  };

  const handleSpeakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sw-TZ';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveHighlight = async () => {
    if (!selectedText.trim()) {
      alert('Tafadhali chagua maandishi kwenye upande wa "Smart Notes" kwanza!');
      return;
    }
    if (!userProfile?.uid) {
      alert('🔒 TAFADHALI INGIA KWENYE AKAUNTI:\nKuhifadhi highlights na maelezo (annotations) ni huduma inayohitaji uwe umeingia kwenye akaunti yako ya Lupanulla.');
      return;
    }

    try {
      setSavingHighlight(true);
      await saveHighlight({
        userId: userProfile.uid,
        documentId: documentId,
        documentTitle: doc?.title || 'Nyaraka',
        text: selectedText.trim(),
        note: highlightNote.trim() || undefined,
        color: highlightColor,
      });

      setSelectedText('');
      setHighlightNote('');
      await loadHighlights();
    } catch (e) {
      console.error('Error saving highlight:', e);
    } finally {
      setSavingHighlight(false);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      if (confirm('Je, una uhakika unataka kufuta highlight hii?')) {
        await deleteHighlight(id);
        await loadHighlights();
      }
    } catch (e) {
      console.error('Error deleting highlight:', e);
    }
  };

  const fetchSmartNotesContent = async () => {
    if (smartNotes) return;

    const preAuthored: Record<string, string> = {
      'necta-phy-f4-2023': `SURA YA KWANZA: MECHANICS AND FORCE IN EQUILIBRIUM\n\nMechanics ni tawi la fizikia linalohusika na mwendo wa vitu na nguvu zinazasababisha mwendo huo. Kanuni muhimu ya Archimedes (Archimedes' Principle) inasema kwamba: "Wakati kitu kinapozamishwa kabisa au nusu katika maji, kinakabiliwa na nguvu ya juu (upthrust) inayolingana na uzito wa maji yaliyohamishwa na kitu hicho."\n\nMfumo wa Upthrust unakokotolewa kama:\nUpthrust = V * ρ * g (ambapo V ni ujazo, ρ ni density ya maji, na g ni acceleration ya gravity).\n\nSURA YA PILI: NEWTON'S LAWS OF MOTION\n\n- Sheria ya Kwanza ya Newton (Inertia): Kila kitu kitaendelea kuwa katika hali yake ya utulivu au mwendo wa kasi mfululizo katika mtaro ulionyooka isipokuwa kilazimishwe kubadilisha hali hiyo na nguvu ya nje.\n- Sheria ya Pili ya Newton: Kiwango cha mabadiliko ya momentum ya kitu kinalingana moja kwa moja na nguvu inayotumika na hutokea katika mwelekeo wa nguvu hiyo (F = m * a).\n- Sheria ya Tatu ya Newton: Kwa kila nguvu ya utendaji (action), kuna nguvu sawa na ya kinyume ya upinzani (reaction).\n\nSURA YA TATU: HEAT AND THERMODYNAMICS\n\nKiwango cha joto kinachohitajika kubadilisha hali ya dutu bila kubadilisha joto lake kinaitwa Latent Heat.\nMfumo wa joto la jumla: Q = m * c * ΔT (ambapo c ni specific heat capacity).\n\nSURA YA NNE: ELECTRICITY AND ELECTROMAGNETISM\n\nSheria ya Ohm (Ohm's Law) inasema kwamba sasa ya umeme (I) inayopita kwenye kondakta inalingana moja kwa moja na voltage (V) katika ncha zake, mradi joto na hali nyingine za kimaumbile zibaki thabiti.\nV = I * R (ambapo R ni upinzani/resistance).`,
      
      'necta-math-f4-2022': `SURA YA KWANZA: SETS AND VENN DIAGRAMS\n\nSeti ni mkusanyiko wa vitu vilivyoelezewa vizuri. Venn Diagram hutumiwa kuonyesha uhusiano kati ya seti tofauti.\nKumbuka: n(A ∪ B) = n(A) + n(B) - n(A ∩ B).\nAlama ya kofia (∩) inamaanisha intersection (vitu vya pamoja), na alama ya kikombe (∪) inamaanisha union (vitu vyote vilivyomo).\n\nSURA YA PILI: QUADRATIC EQUATIONS\n\nMlinganyo wa quadratic uko katika muundo wa ax² + bx + c = 0.\nTunaweza kutatua mlinganyo huu kwa kutumia njia ya Quadratic Formula:\nx = [-b ± √(b² - 4ac)] / (2a)\nSehemu ya chini ya kipeo cha pili (b² - 4ac) inaitwa Discriminant (D). Kama D > 0, mlinganyo una majibu mawili tofauti ya kweli. Kama D = 0, kuna jibu moja linalojirudia.\n\nSURA YA TATU: TRIGONOMETRY\n\nKatika pembetatu ya pembe mraba (Right-angled triangle):\n- Sin(θ) = Opposite / Hypotenuse (Mkabala / Kiegema)\n- Cos(θ) = Adjacent / Hypotenuse (Mshazari / Kiegema)\n- Tan(θ) = Opposite / Adjacent (Mkabala / Mshazari)\nKumbuka kanuni maarufu ya Pythagoras: a² + b² = c².`,
      
      'mock-hist-f4-2024': `SURA YA KWANZA: COLONIAL ECONOMY IN EAST AFRICA\n\nUchumi wa kikoloni ulijengwa ili kunufaisha mataifa ya Ulaya (Metropolitan countries). Njia kuu zilizotumiwa ni pamoja na kuanzishwa kwa kilimo cha mashamba makubwa (plantation agriculture), kuanzishwa kwa kodi ya kichwa (head tax) ili kulazimisha Waafrika kufanya kazi, na ujenzi wa miundombinu kama reli ya kati (Central Line) kusafirisha malighafi.\n\nSURA YA PILI: BERLIN CONFERENCE (1884 - 1885)\n\nMkutano wa Berlin uliitishwa na Chancellor wa Ujerumani, Otto von Bismarck. Lengo kuu lilikuwa kugawana bara la Afrika kwa amani kati ya mataifa ya Ulaya bila vita. Sheria ya "Effective Occupation" ilipitishwa, inayotaka taifa lolote linalodai eneo fulani kuanzisha utawala thabiti wa kijeshi na kiutawala.\n\nSURA YA TATU: MAJIMAJI REBELLION (1905 - 1907)\n\nHuu ulikuwa uasi mkubwa dhidi ya utawala wa Kijerumani huko Tanganyika Kusini. Uliongozwa na Kinjekitile Ngwale, ambaye alitumia maji yaliyochanganywa na mtama kama silaha ya kiroho kuwaaminisha wapiganaji kuwa risasi za Wajerumani zingebadilika kuwa maji. Sababu kuu ya uasi ilikuwa kulazimishwa kulima pamba na kuteswa kwa wananchi na akida.`,
      
      'mock-bio-f4-2026': `SURA YA KWANZA: NADHARIA ZA EVOLUTION NA USHAHIDI WA KIBIOLOJIA\n\nEvolution ni mabadiliko ya taratibu ya viumbe hai kutoka kizazi kimoja hadi kingine kwa muda mrefu wa miaka. Nadharia kuu mbili ni:\n- Nadharia ya Jean-Baptiste Lamarck (Lamarckism): Inasema sifa zote ambazo kiumbe anajipatia katika maisha yake (acquired characteristics) kwa kutumia sana au kutotumia kiungo fulani cha mwili hupitishwa kwa watoto wake.\n- Nadharia ya Charles Darwin (Darwinism / Natural Selection): Inasisitiza mazingira yanachagua viumbe wenye uwezo mkubwa wa kuishi (survival of the fittest) na wale wasio na sifa zinazofaa hufa.\n\nUshahidi wa kusaidia nadharia ya Evolution unajumuisha:\n1. Palaeontology (Mabaki ya kale / Fossils).\n2. Comparative Anatomy (Ulinganifu wa viungo vya miili kama Homologous na Analogous organs).\n3. Comparative Embryology (Ulinganifu wa maendeleo ya kijusi wakati wa ujauzito).\n\nSURA YA PILI: ICOLOGY NA UCHAFUZI WA MAZINGIRA (PLASTIC POLLUTION)\n\nMifuko ya plastiki inajumuisha takataka zisizooza (non-biodegradable waste) ambazo huleta madhara makubwa nchini Tanzania:\n- Kuharibu udongo kwa kuzuia maji kupenya chini na kuathiri mizizi ya mimea.\n- Kifo cha mifugo na wanyamapori wanapokula plastiki wakidhania kuwa ni chakula.\n- Kuziba kwa mifereji na miundombinu ya maji taka, kusababisha mafuriko na milipuko ya magonjwa ya kipindupindu.\n\nNjia za kuzuia uchafuzi wa plastiki:\n- Marufuku kamili ya matumizi ya mifuko ya plastiki isiyooza (plastic bag ban).\n- Kuhamasisha matumizi ya mifuko mbadala (Kikapu, bahasha za karatasi, nk).\n- Kuanzisha viwanda vya kurejeleza plastiki (Recycling plants).\n\nSURA YA TATU: MAFANIKIO YA EVOLUTION NA SIFA ZA CLASS INSECTA\n\nInsects (Wadudu) ni kundi lililofanikiwa zaidi duniani kwa sababu ya:\n1. Kuwa na Exoskeleton ngumu ya chitin inayozuia kupoteza maji mwilini.\n2. Uwezo mkubwa wa kuruka (Wings) kuwakimbia maadui na kutafuta chakula.\n3. Uzazi mkubwa na wa haraka sana (High reproduction rate).\n4. Mfumo wa upumuaji wa Tracheole unaofanya kazi bila kutegemea mfumo wa damu.\n\nSURA YA NNE: KAZI YA INI KATIKA METABOLISI NA USIMAMIZI WA GLUKOSI\n\nIni (Liver) hufanya kazi zifuatazo kusaidia kusimamia sukari mwilini:\n- Glycogenesis: Hubadilisha glukosi ya ziada kuwa glycogen kwa msaada wa insulin wakati kiwango cha sukari mwilini kiko juu.\n- Glycogenolysis: Hubadilisha glycogen iliyohifadhiwa kuwa glukosi wakati sukari ya damu iko chini kwa msaada wa glucagon.`,
      'chem-practical-handout': `SURA YA KWANZA: UCHAMBUZI WA KIASI (VOLUMETRIC ANALYSIS)\n\nVolumetric analysis au Titration inahusisha upimaji wa ujazo wa miundo miwili ya kemikali (asidi na besi) inayomanyuka ili kupata ukolezi (concentration) na masi ya molar (molar mass) ya dutu isiyojulikana.\n\nMamnyuko Muhimu katika Titration:\n- Acid + Base → Salt + Water (Mmenyuko wa Neutralization).\n- Mifano ya viashiria (indicators) ni Methyl Orange (MO - hubadilika kutoka njano kwenda nyekundu kwenye asidi) na Phenolphthalein (POP - hubadilika kutoka pinki kwenda kutokuwa na rangi kwenye asidi).\n\nSURA YA PILI: KASI YA MMENYUKO (KINETICS)\n\nKasi ya mmenyuko inategemea mambo makuu manne:\n1. Ukolezi wa vitendanishi (Concentration of reactants).\n2. Joto (Temperature).\n3. Kichocheo (Catalyst).\n4. Eneo la mguso (Surface area of solids).\n\nMmenyuko wa thiosulphate na asidi huzalisha precipitate ya njano ya sulfur: Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + S(s) + SO₂(g).\nHerufi 'X' iliyochorwa chini ya karatasi hupotea jinsi sulfur inavyoongezeka.\n\nSURA YA TATU: QUALITATIVE ANALYSIS (UTAMBUZI WA CHUMVI)\n\nKupitia mfululizo wa vipimo vya maabara, tunatambua Cation (chaji chanya kama NH₄⁺, Pb²⁺, Cu²⁺) na Anion (chaji hasi kama Cl⁻, SO₄²⁻, CO₃²⁻):\n- Mtihani wa Sublimation: Chumvi za Ammonium (NH₄⁺) hupata sublimation wakati wa kupashwa moto kavu.\n- Mtihani wa AgNO₃: Silver nitrate hutoa precipitate nyeupe mbele ya Cl⁻ ambayo huyeyuka katika suluhisho la Ammonia.`
    };

    if (preAuthored[documentId]) {
      setSmartNotes(preAuthored[documentId]);
      return;
    }

    try {
      setLoadingSmartNotes(true);
      const response = await fetch('/api/claude.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: "Wewe ni Lupanulla AI. Tengeneza muhtasari fupi na mzuri wa somo (Interactive Study Guide) kwa Kiswahili kwa ajili ya mada hii ya kitaaluma nchini Tanzania ili mwanafunzi aweze kuisoma, kuielewa na kuchagua maandishi ya kuweka highlights na maelezo yake mwenwenye.",
          messages: [
            {
              role: 'user',
              content: `Tengeneza muhtasari na notisi kamili za kujisomea zenye vichwa vya habari na maelezo ya kina kwa ajili ya: "${doc?.title}". Maelezo ya kitabu/karatasi: "${doc?.description}". Somo: "${doc?.category}". Lebo: ${doc?.tags.join(', ')}.`
            }
          ]
        })
      });

      if (!response.ok) throw new Error('API Request Failed');
      const data = await response.json();
      if (data.reply) {
        setSmartNotes(data.reply);
      } else {
        throw new Error('No reply returned');
      }
    } catch (err) {
      console.error('Error generating smart notes:', err);
      setSmartNotes(`SURA YA REVISION: ${doc?.title || 'Muhtasari wa Somo'}\n\n1. UTANGULIZI\nMada hii inahusu ${doc?.category || 'Somo la Shule'}. Hapa mwanafunzi anapaswa kuelewa misingi ya ${doc?.tags.join(', ') || 'somo hili'}.\n\n2. MALENGO YA KUJIFUNZA\n- Kuelewa dhana kuu na mada muhimu za mitihani ya NECTA.\n- Kujenga uwezo vya kujibu maswali kwa ufasaha na kujiamini.\n- Kufanya mazoezi mfululizo kwa kutumia miongozo hii na kadi mahiri za Flashcards.\n\n[TAARIFA]: Chagua mstari wowote katika maelezo haya ili kuweka highlight yako na maelezo fupi ya kujikumbusha.`);
    } finally {
      setLoadingSmartNotes(false);
    }
  };

  const handleToggleReaderMode = (mode: 'pdf' | 'notes') => {
    setReaderMode(mode);
    if (mode === 'notes') {
      fetchSmartNotesContent();
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      if (text.length > 0) {
        setSelectedText(text);
      }
    }
  };

  const renderParagraphWithHighlights = (paraText: string, idx: number) => {
    if (highlights.length === 0) {
      if (paraText.startsWith('SURA') || paraText.startsWith('Sura') || paraText.startsWith('Chapter') || paraText.match(/^\d+\./)) {
        return <h3 key={idx} className="font-display font-extrabold text-slate-900 text-base sm:text-lg pt-4 border-b pb-1 border-slate-100 uppercase tracking-tight">{paraText}</h3>;
      }
      return <p key={idx} className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-slate-600">{paraText}</p>;
    }

    let matches = highlights.filter(h => paraText.toLowerCase().includes(h.text.toLowerCase()));
    if (matches.length === 0) {
      if (paraText.startsWith('SURA') || paraText.startsWith('Sura') || paraText.startsWith('Chapter') || paraText.match(/^\d+\./)) {
        return <h3 key={idx} className="font-display font-extrabold text-slate-900 text-base sm:text-lg pt-4 border-b pb-1 border-slate-100 uppercase tracking-tight">{paraText}</h3>;
      }
      return <p key={idx} className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-slate-600">{paraText}</p>;
    }

    let parts: { text: string; isHighlight: boolean; color?: string; note?: string }[] = [{ text: paraText, isHighlight: false }];

    for (const h of matches) {
      const newParts: typeof parts = [];
      for (const part of parts) {
        if (part.isHighlight) {
          newParts.push(part);
          continue;
        }

        const lowerText = part.text.toLowerCase();
        const lowerSearch = h.text.toLowerCase();
        const startIdx = lowerText.indexOf(lowerSearch);

        if (startIdx !== -1) {
          const before = part.text.substring(0, startIdx);
          const match = part.text.substring(startIdx, startIdx + h.text.length);
          const after = part.text.substring(startIdx + h.text.length);

          if (before) newParts.push({ text: before, isHighlight: false });
          newParts.push({ text: match, isHighlight: true, color: h.color, note: h.note });
          if (after) newParts.push({ text: after, isHighlight: false });
        } else {
          newParts.push(part);
        }
      }
      parts = newParts;
    }

    if (paraText.startsWith('SURA') || paraText.startsWith('Sura') || paraText.startsWith('Chapter') || paraText.match(/^\d+\./)) {
      return (
        <h3 key={idx} className="font-display font-extrabold text-slate-900 text-base sm:text-lg pt-4 border-b pb-1 border-slate-100 uppercase tracking-tight">
          {parts.map((p, pIdx) => p.isHighlight ? <span key={pIdx} className={`${p.color || 'bg-yellow-100'} px-1 rounded cursor-help`} title={p.note}>{p.text}</span> : p.text)}
        </h3>
      );
    }

    return (
      <p key={idx} className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-slate-600">
        {parts.map((p, pIdx) => p.isHighlight ? (
          <span 
            key={pIdx} 
            className={`${p.color || 'bg-yellow-100'} px-1 py-0.5 rounded cursor-help relative group inline`} 
            title={p.note}
          >
            {p.text}
            {p.note && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-950 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-xl z-30">
                📝 {p.note}
              </span>
            )}
          </span>
        ) : p.text)}
      </p>
    );
  };

  // Default seeds just in case the active ID matches one of our local seeds
  const localSeedDocs: DocumentMetadata[] = [
    {
      id: 'necta-phy-f4-2023',
      title: 'NECTA Physics Form IV (CSEE) 2023 Past Paper',
      description: 'Official national examination paper for Physics paper 1, complete with questions on mechanics, thermal physics, waves, electromagnetism and modern physics.',
      category: 'Science & Technology',
      tags: ['Physics', 'CSEE', 'NECTA', '2023', 'Form IV'],
      fileId: 'sample-drive-id-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 5,
      views: 1241,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2023,
      type: 'NECTA',
      sizeKB: 245
    },
    {
      id: 'necta-math-f4-2022',
      title: 'NECTA Basic Mathematics Form IV 2022 Past Paper',
      description: 'Official national mathematics paper 1 for form four secondary school candidates. Covers sets, quadratic equations, geometry, and trigonometry.',
      category: 'Mathematics',
      tags: ['Mathematics', 'CSEE', 'NECTA', '2022', 'Form IV'],
      fileId: 'sample-drive-id-2',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 10,
      views: 951,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2022,
      type: 'NECTA',
      sizeKB: 180
    },
    {
      id: 'mock-hist-f4-2024',
      title: 'Dar es Salaam Mock History Form IV 2024 Past Paper',
      description: 'Region mock assessment history examination paper 1. Contains great structure aligning with new syllabus updates.',
      category: 'History & Humanities',
      tags: ['History', 'Mock', 'Dar es Salaam', '2024', 'Form IV'],
      fileId: 'sample-drive-id-3',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'author-1',
      uploadedByName: 'Mwl. Kamau',
      createdAt: Date.now() - 3600000 * 24 * 2,
      views: 311,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2024,
      type: 'Mock',
      sizeKB: 140
    },
    {
      id: 'mock-bio-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Biology 1',
      description: 'Official regional mock examination paper for Biology 1. Features high-quality questions on physiology, classification, genetics, ecology, and evolution aligned with the latest NECTA syllabus.',
      category: 'Science & Technology',
      tags: ['Biology', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-4',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1, // 1 day ago
      views: 1845,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 295
    },
    {
      id: 'mock-geo-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Geography',
      description: 'Official regional mock examination paper for Geography. Contains Section A (Multiple choice & matching), Section B (Map extract of Liwale 280/4 & statistical data representation), and Section C (consequences of manufacturing, poverty vs environmental degradation, and tourism).',
      category: 'Geography & Environment',
      tags: ['Geography', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-5',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.1,
      views: 1420,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 320
    },
    {
      id: 'mock-chem-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Chemistry 1',
      description: 'Official regional mock examination paper for Chemistry 1. Includes detailed questions on laboratory safety, organic compounds, electrochemistry, and chemical reactions.',
      category: 'Science & Technology',
      tags: ['Chemistry', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-6',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.2,
      views: 1680,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 285
    },
    {
      id: 'mock-math-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Basic Mathematics',
      description: 'Official regional mock examination paper for Basic Mathematics. Covers algebra, set theory, vectors, coordinate geometry, trigonometry, and statistics.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-7',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.3,
      views: 2150,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 340
    },
    {
      id: 'mock-pe-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Physical Education',
      description: 'Official regional mock examination paper for Physical Education. Examines gymnastics, swimming stroke order, relay zones, and sports injuries.',
      category: 'Physical Education & Sports',
      tags: ['Physical Education', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-8',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.4,
      views: 920,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 210
    },
    {
      id: 'mock-phy-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Physics 1',
      description: 'Official regional mock examination paper for Physics 1. Features high-fidelity questions on mechanics, thermal physics, sound, magnetism, electronics, and waves.',
      category: 'Science & Technology',
      tags: ['Physics', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-9',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.5,
      views: 1950,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 310
    },
    {
      id: 'mock-chem2-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Chemistry 2 (Actual Practical)',
      description: 'Official regional mock practical examination paper for Chemistry 2. Consists of Question 1 (Volumetric analysis of Sodium Hydroxide contaminating a drinking water source) and Question 2 (Chemical kinetics of Sodium Thiosulphate and Hydrochloric acid reaction at different temperatures).',
      category: 'Science & Technology',
      tags: ['Chemistry', 'Practical', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-10',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.55,
      views: 1250,
      status: 'approved',
      paperNo: 'Paper 2',
      year: 2026,
      type: 'Mock',
      sizeKB: 290
    },
    {
      id: 'mock-chinese-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Chinese Language',
      description: 'Official regional mock examination paper for Chinese Language. Covers Pinyin, character translation, comprehension reading, matching patterns, and short composition writing topics.',
      category: 'Languages & Linguistics',
      tags: ['Chinese', 'Mock', 'Morogoro', '2026', 'Form IV', 'Language'],
      fileId: 'sample-drive-id-11',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.6,
      views: 840,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 320
    },
    {
      id: 'mock-civics-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Civics',
      description: 'Official regional mock examination paper for Civics. Evaluates human rights, courtship systems, cultural practices, local government roles, globalization effects, and reproductive education.',
      category: 'History & Humanities',
      tags: ['Civics', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-12',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.65,
      views: 1100,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 195
    },
    {
      id: 'mock-commerce-f4-2026',
      title: 'Morogoro Region Regional Form Four Mock Examination 2026 - Commerce',
      description: 'Official regional mock examination paper for Commerce. Includes calculations on stock turnover, cost of goods sold, gross profit markup, business risk management, partnership categories, and taxation systems.',
      category: 'Business & Economics',
      tags: ['Commerce', 'Mock', 'Morogoro', '2026', 'Form IV'],
      fileId: 'sample-drive-id-13',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now() - 3600000 * 24 * 1.7,
      views: 950,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2026,
      type: 'Mock',
      sizeKB: 230
    }
  ];

  useEffect(() => {
    loadDocument();
    
    // Check bookmark status
    const checkBookmarkStatus = async () => {
      if (!userProfile?.uid) {
        const storedBookmarks = localStorage.getItem('lupa_bookmarks');
        if (storedBookmarks) {
          const bookmarked = JSON.parse(storedBookmarks) as string[];
          setIsBookmarked(bookmarked.includes(documentId));
        }
        return;
      }
      
      try {
        const bookmarks = await fetchUserBookmarks(userProfile.uid);
        setIsBookmarked(bookmarks.some(b => b.resourceId === documentId));
      } catch (e) {
        console.error(e);
      }
    };

    checkBookmarkStatus();

    // Load active highlights, PDF page notes, and vocabulary items
    if (userProfile?.uid) {
      loadHighlights();
      loadPageNotes();
      loadVocabulary();
    }
  }, [documentId, userProfile?.uid]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if it's a dynamic NECTA past paper ID
      if (documentId && documentId.startsWith('necta-')) {
        // Format: necta-[level]-[subject]-[year]
        const parts = documentId.split('-');
        const levelCode = parts[1] || 'f4';
        const subjectCode = parts[2] || 'physics';
        const yearVal = parseInt(parts[3] || '2023', 10);
        
        // Map codes to localized names
        const levelNames: Record<string, string> = {
          'std4': 'Darasa la IV (Standard 4)',
          'std7': 'Darasa la VII (Standard 7 - PSLE)',
          'f2': 'Kidato cha Pili (Form II - FTSEE)',
          'f4': 'Kidato cha Nne (Form IV - CSEE)',
          'f6': 'Kidato cha Sita (Form VI - ACSEE)'
        };
        
        const subjectNames: Record<string, string> = {
          'physics': 'Physics (Fizikia)',
          'chemistry': 'Chemistry (Kemia)',
          'biology': 'Biology (Biolojia)',
          'basic-math': 'Basic Mathematics (Hisabati)',
          'adv-math': 'Advanced Mathematics',
          'history': 'History (Historia)',
          'geography': 'Geography (Jiografia)',
          'civics': 'Civics (Uraia)',
          'kiswahili': 'Kiswahili',
          'english': 'English Language (Kiingereza)',
          'commerce': 'Commerce (Biashara)',
          'bookkeeping': 'Book-keeping (Uhasibu)',
          'science': 'Science and Technology (Sayansi na Teknolojia)',
          'social-studies': 'Social Studies (Maarifa ya Jamii)',
          'civic-moral': 'Civic and Moral Education (Uraia na Maadili)',
          'mathematics': 'Mathematics (Hisabati)'
        };
        
        const levelCategory: Record<string, string> = {
          'std4': 'Primary School',
          'std7': 'Primary School',
          'f2': 'O-Level Secondary',
          'f4': 'O-Level Secondary',
          'f6': 'A-Level Secondary'
        };
        
        const subjectName = subjectNames[subjectCode] || subjectCode.charAt(0).toUpperCase() + subjectCode.slice(1);
        const levelName = levelNames[levelCode] || levelCode.toUpperCase();
        const categoryName = levelCategory[levelCode] || 'Past Papers';
        
        const savedCustomDrive = localStorage.getItem('lupa_drive_' + documentId);
        const driveUrl = savedCustomDrive ? formatGoogleDriveUrls(savedCustomDrive).embedUrl : '';
        
        const dynamicDoc: DocumentMetadata = {
          id: documentId,
          title: `NECTA ${subjectName} - ${levelName} (${yearVal})`,
          description: `Karatasi rasmi ya mtihani wa taifa wa NECTA kwa somo la ${subjectName}, ngazi ya ${levelName} kwa mwaka wa ${yearVal}. Jibu maswali haya ili kujiandaa na mitihani yako ya mwisho.`,
          category: categoryName,
          tags: ['NECTA', subjectName, levelName, String(yearVal), 'Past Paper'],
          fileId: `necta-${levelCode}-${subjectCode}-${yearVal}`,
          driveUrl: driveUrl,
          uploadedBy: 'system',
          uploadedByName: 'NECTA Past Papers Library',
          createdAt: Date.now() - 3600000 * 24 * 30,
          views: Math.floor(Math.random() * 5000) + 1200,
          status: 'approved',
          paperNo: 'Paper 1',
          year: yearVal,
          type: 'NECTA',
          sizeKB: Math.floor(Math.random() * 200) + 150
        };
        
        setDoc(dynamicDoc);
        setLoading(false);
        return;
      }

      let fetched: DocumentMetadata[] = [];
      try {
        fetched = await fetchDocuments();
      } catch (err) {
        console.warn('fetchDocuments error in ReaderView, using local fallback:', err);
      }

      const seed = localSeedDocs.find(d => d.id === documentId);
      const found = fetched.find(d => d.id === documentId) || seed;
      
      if (found) {
        const canAccess = !found.isForSale || (userProfile && (found.uploadedBy === userProfile.uid || userProfile.role === 'admin' || userProfile.role === 'super_admin'));
        if (!canAccess) {
          setError('Nyaraka hii inauzwa. Tafadhali inunue kwanza ili uweze kuisoma.');
        } else {
          setDoc(found);
        }
      } else {
        // Construct dynamic fallback DocumentMetadata so opening any library document never fails
        const cleanTitle = (documentId || 'Nyaraka ya Maktaba')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        const dynamicFallback: DocumentMetadata = {
          id: documentId || `doc-${Date.now()}`,
          title: cleanTitle.includes('Nectar') ? cleanTitle.replace('Nectar', 'NECTA') : cleanTitle,
          description: 'Nyaraka ya masomo na maelezo ya kina ya kujisomea iliyotolewa na Lupanulla Elimu Hub kwa ajili ya usaidizi wa wanafunzi.',
          category: 'Maktaba Kuu',
          tags: ['Maktaba', 'Elimu', 'Nyaraka'],
          fileId: documentId || 'doc-1',
          driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
          uploadedBy: 'system',
          uploadedByName: 'Lupanulla Elimu Hub',
          createdAt: Date.now(),
          views: 350,
          status: 'approved'
        };
        setDoc(dynamicFallback);
      }
    } catch (e) {
      console.error('loadDocument catch error:', e);
      const safeDoc: DocumentMetadata = {
        id: documentId || 'doc-1',
        title: 'Nyaraka ya Maktaba Kuu',
        description: 'Nyaraka za masomo na miongozo ya kujisomea kutoka Lupanulla Elimu Hub.',
        category: 'Maktaba Kuu',
        tags: ['Maktaba', 'Nyaraka'],
        fileId: documentId || 'doc-1',
        driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
        uploadedBy: 'system',
        uploadedByName: 'Lupanulla Elimu Hub',
        createdAt: Date.now(),
        views: 100,
        status: 'approved'
      };
      setDoc(safeDoc);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!doc) return;
    
    if (!userProfile?.uid) {
      // Fallback to localStorage for guest
      const storedBookmarks = localStorage.getItem('lupa_bookmarks');
      let bookmarked: string[] = storedBookmarks ? JSON.parse(storedBookmarks) : [];
      
      if (isBookmarked) {
        bookmarked = bookmarked.filter(id => id !== documentId);
        setIsBookmarked(false);
      } else {
        bookmarked.push(documentId);
        setIsBookmarked(true);
      }
      localStorage.setItem('lupa_bookmarks', JSON.stringify(bookmarked));
      return;
    }

    try {
      const result = await toggleBookmark(userProfile.uid, {
        id: doc.id,
        type: doc.type?.toLowerCase().includes('exam') ? 'exam' : 'document',
        title: doc.title
      });
      setIsBookmarked(result);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCopyrightReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportEmail || !reportDetails) return;

    try {
      setReportLoading(true);
      
      // 1. Submit feedback / report of type copyright_report
      await submitFeedback({
        userId: userProfile?.uid || 'anonymous',
        userName: userProfile?.name || 'Mripoti Hakimiliki',
        email: reportEmail,
        type: 'copyright_report',
        message: `HAKIMILIKI REPORT: Document [ID: ${doc?.id}] "${doc?.title}" imeripotiwa kwa ukiukaji wa hakimiliki na mtumiaji. Maelezo: ${reportDetails}`
      });

      // 2. Increment reportCount on the document, and if it exceeds e.g. 2, change status to pending or flagged for safety
      const currentReports = (doc?.reportCount || 0) + 1;
      const updates: any = {
        reportCount: currentReports,
      };

      // Auto-moderate for safety if reported multiple times (e.g. 3 reports hides it back to pending)
      if (currentReports >= 3) {
        updates.status = 'pending';
      }

      await updateDocument(documentId, updates);
      
      // Update local state as well
      if (doc) {
        setDoc({
          ...doc,
          ...updates
        });
      }

      setReportSuccess(true);
    } catch (err) {
      console.error('Failed to submit copyright report:', err);
      alert('Imeshindikana kuwasilisha ripoti. Tafadhali jaribu tena baada ya muda mfupi au wasiliana nasi moja kwa moja.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownload = () => {
    const url = doc?.driveUrl || 'https://www.orimi.com/pdf-test.pdf';
    window.dispatchEvent(new CustomEvent('start-pdf-download', {
      detail: { 
        title: doc?.title || 'Faili la Lupanulla', 
        url: url 
      }
    }));
  };

  const generateOfflinePDF = () => {
    try {
      if (!doc) {
        alert('Nyaraka haikupatikana au bado inapakia!');
        return;
      }

      // Initialize jsPDF document (A4, Portrait, millimeters)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageHeight = pdf.internal.pageSize.getHeight(); // A4 is 297mm
      const pageWidth = pdf.internal.pageSize.getWidth(); // A4 is 210mm
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2); // 170mm

      let y = 20;

      // Helper to add headers/footers on each page
      const addHeaderFooter = (pageNum: number, totalPagesPlaceholder: string) => {
        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        
        // Header line and branding text
        pdf.text('LUPANULLA ELIMU HUB - Kitovu cha Elimu ya Kidijitali Tanzania', margin, 10);
        pdf.line(margin, 12, pageWidth - margin, 12);

        // Footer line and page numbering
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        pdf.text(`Ukurasa ${pageNum}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('Hati hii imetengenezwa na Lupanulla Elimu Hub kwa usomaji wa nje ya mtandao.', margin, pageHeight - 10);
      };

      // Helper to handle text wrapping and automatic pagination
      const printParagraph = (text: string, fontSize: number, style: 'normal' | 'bold' | 'italic' = 'normal', color: [number, number, number] = [51, 65, 85], spacingBefore = 4, spacingAfter = 4) => {
        pdf.setFont('Helvetica', style);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.45; // Approx height per line in mm

        const blockHeight = spacingBefore + (lines.length * lineHeight) + spacingAfter;
        if (y + blockHeight > pageHeight - 20) {
          pdf.addPage();
          addHeaderFooter(pdf.getNumberOfPages(), '');
          y = 20; // reset vertical offset
        }

        y += spacingBefore;
        for (const line of lines) {
          pdf.text(line, margin, y);
          y += lineHeight;
        }
        y += spacingAfter;
      };

      // Draw beautiful page header branding
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(6, 182, 212); // cyan-500 color
      pdf.text('LUPANULLA ELIMU HUB', margin, y);
      y += 5;

      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // slate-500 color
      pdf.text('KIDIGITALI STUDY GUIDE & NOTES', margin, y);
      y += 8;

      pdf.setDrawColor(226, 232, 240); // slate-200 color
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Print Title of the document
      printParagraph(doc.title.toUpperCase(), 16, 'bold', [15, 23, 42], 2, 6);

      // Print Metadata: Subject, Category, Year, Type
      printParagraph(`Somo: ${doc.category || 'Mkuu'} | Mwaka: ${doc.year || 'N/A'} | Aina: ${doc.type || 'Necta'}`, 10, 'bold', [14, 116, 144], 2, 6);

      // Print Description if it exists
      if (doc.description) {
        printParagraph('Maelezo ya Nyaraka:', 11, 'bold', [71, 85, 105], 4, 2);
        printParagraph(doc.description, 10, 'italic', [100, 116, 139], 2, 8);
      }

      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Smart Notes Header
      printParagraph('MUHTASARI WA SOMO NA MAELEZO MAHIRI (SMART NOTES)', 12, 'bold', [15, 23, 42], 4, 6);

      const notesText = smartNotes || `Sura ya Revision: ${doc.title}\n\n1. UTANGULIZI\nMada hii inahusu ${doc.category || 'Somo la Shule'}. Hapa mwanafunzi anapaswa kuelewa misingi ya ${doc.tags?.join(', ') || 'somo hili'}.\n\n2. MALENGO YA KUJIFUNZA\n- Kuelewa dhana kuu na mada muhimu za mitihani ya NECTA.\n- Kujenga uwezo wa kujibu maswali kwa ufasaha na kujiamini.\n- Kufanya mazoezi mfululizo kwa kutumia miongozo hii na kadi mahiri za Flashcards.`;
      
      const paragraphs = notesText.split('\n\n');

      for (const para of paragraphs) {
        if (!para.trim()) continue;

        // Check if paragraph is a heading or chapter
        if (para.startsWith('SURA') || para.startsWith('Sura') || para.startsWith('Chapter') || para.match(/^\d+\./)) {
          printParagraph(para, 12, 'bold', [15, 23, 42], 8, 4);
        } else {
          printParagraph(para, 10, 'normal', [51, 65, 85], 2, 4);
        }
      }

      // Append Highlight Annotations if they exist
      if (highlights.length > 0) {
        if (y + 30 > pageHeight - 20) {
          pdf.addPage();
          addHeaderFooter(pdf.getNumberOfPages(), '');
          y = 20;
        } else {
          y += 5;
          pdf.line(margin, y, pageWidth - margin, y);
          y += 10;
        }

        printParagraph('HIGHLIGHTS NA TAFSIRI/DOKEZO ZANGU (MY ANNOTATIONS)', 12, 'bold', [6, 182, 212], 4, 6);

        for (const h of highlights) {
          printParagraph(`"${h.text}"`, 10, 'italic', [71, 85, 105], 3, 2);
          if (h.note) {
            printParagraph(`Dokezo langu: ${h.note}`, 9, 'bold', [14, 116, 144], 1, 3);
          }
          printParagraph(`Tarehe: ${new Date(h.createdAt).toLocaleDateString('sw-TZ')}`, 8, 'normal', [148, 163, 184], 1, 4);
        }
      }

      // Append PDF Page Notes if they exist
      if (pageNotes.length > 0) {
        if (y + 30 > pageHeight - 20) {
          pdf.addPage();
          addHeaderFooter(pdf.getNumberOfPages(), '');
          y = 20;
        } else {
          y += 5;
          pdf.line(margin, y, pageWidth - margin, y);
          y += 10;
        }

        printParagraph('NOTISI ZA KURASA ZA PDF (PAGE NOTES)', 12, 'bold', [16, 185, 129], 4, 6);

        for (const n of pageNotes) {
          printParagraph(`Ukurasa na. ${n.pageNumber}:`, 10, 'bold', [6, 95, 70], 2, 2);
          printParagraph(`${n.content}`, 9, 'normal', [30, 41, 59], 2, 3);
          printParagraph(`Tarehe: ${new Date(n.createdAt).toLocaleDateString('sw-TZ')}`, 8, 'italic', [148, 163, 184], 1, 4);
        }
      }

      // Add Headers/Footers on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addHeaderFooter(i, totalPages.toString());
      }

      // Save the generated PDF
      const sanitizedTitle = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      pdf.save(`Lupanulla_${sanitizedTitle}_SmartNotes.pdf`);

      alert('🎉 Hati yako ya PDF imetengenezwa kwa ufanisi na imepakuliwa nje ya mtandao! Unaweza kuisoma wakati wowote bila kuwa na bando la internet.');

    } catch (err: any) {
      console.error('Error generating PDF:', err);
      alert('Imeshindwa kutengeneza PDF: ' + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-cyan-600">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inafungua Karatasi ya Mtihani...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto py-16 space-y-4">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-sm uppercase">Hitilafu Imetokea</h3>
        <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">{error || 'Imeshindwa kufungua nyaraka.'}</p>
        <button onClick={() => onNavigate('library')} className="py-2 px-5 bg-slate-900 text-white font-bold text-xs rounded-xl">Rudi Kwenye Maktaba Kuu</button>
      </div>
    );
  }

  const isPremium = userProfile?.subscription === 'premium' || userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  return (
    <div 
      ref={readerRef}
      id="reader-view" 
      className={`animate-fade-in text-slate-800 transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] w-screen h-screen bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6' 
          : 'space-y-6'
      }`}
    >
      
      {/* Upper Navigation Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <button 
          onClick={() => onNavigate('library')}
          className="text-slate-500 hover:text-slate-900 font-bold text-xs flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Rudi Kwenye Maktaba Kuu
        </button>

        <div className="flex items-center gap-2">
          {/* PDF Page Note Button */}
          <button 
            onClick={() => handleOpenNoteModal(1)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer border border-emerald-500"
            title="Weka au angalia notisi za kurasa za PDF"
          >
            <StickyNote size={15} className="text-emerald-200" />
            <span className="hidden sm:inline">Note ya Ukurasa</span>
            <span className="sm:hidden">Note</span>
            {pageNotes.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 font-black text-[10px] rounded-full">
                {pageNotes.length}
              </span>
            )}
          </button>

          {/* My Vocabulary Button */}
          <button 
            onClick={() => handleOpenVocabModal()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm bg-purple-600 hover:bg-purple-500 text-white cursor-pointer border border-purple-500"
            title="Fungua msamiati wako wa marudio"
          >
            <BookMarked size={15} className="text-purple-200" />
            <span className="hidden sm:inline">Msamiati Wangu</span>
            <span className="sm:hidden">Msamiati</span>
            {vocabularyItems.length > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-950 text-purple-200 font-black text-[10px] rounded-full">
                {vocabularyItems.length}
              </span>
            )}
          </button>

          <button 
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border transition-all ${isBookmarked ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-slate-50 border-slate-150 text-slate-400 hover:text-slate-600'}`}
            title="Hifadhi"
          >
            <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
          </button>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Kiungo cha ukurasa huu kimenakiliwa! Unaweza kuwashirikisha rafiki zako.');
            }}
            className="p-2 rounded-xl border bg-slate-50 border-slate-150 text-slate-400 hover:text-slate-600 transition-all"
            title="Shirikisha"
          >
            <Share2 size={15} />
          </button>

          {/* Fullscreen Button */}
          <button 
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isFullscreen 
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-50 border-slate-150 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isFullscreen ? "Exit Fullscreen (Skrini Ndogo)" : "Soma kwa Skrini Nzima (Fullscreen)"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button 
            onClick={handleDownload}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isPremium 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
            }`}
          >
            {isPremium ? (
              <>
                <Download size={14} /> Pakua PDF (Bure)
              </>
            ) : (
              <>
                <Lock size={14} /> Pakua (Premium)
              </>
            )}
          </button>

          <button 
            onClick={generateOfflinePDF}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white"
            title="Pakua muhtasari na highlights zako kama PDF ya kusoma offline"
          >
            <Sparkles size={14} className="text-amber-300" /> Pakua Notisi (PDF Offline)
          </button>

          <button 
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm bg-slate-900 hover:bg-slate-800 text-white border border-slate-700"
            title="Chapa au Hamisha Notisi hizi kwenda PDF kwa kutumia chombo cha chapa cha kivinjari (Browser Print)"
          >
            <Printer size={14} /> Chapa / Hamisha PDF
          </button>
        </div>
      </div>

      {/* Tab Switcher for Reader Mode */}
      <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit gap-1 shadow-inner">
        <button
          onClick={() => handleToggleReaderMode('pdf')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            readerMode === 'pdf' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={14} /> Karatasi ya PDF (Original)
        </button>
        <button
          onClick={() => handleToggleReaderMode('notes')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            readerMode === 'notes' 
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles size={14} className={readerMode === 'notes' ? 'animate-pulse text-amber-300' : 'text-cyan-500'} /> Notisi Mahiri (Smart Notes)
        </button>
      </div>

      {/* Main Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Interactive Viewer/Reader area */}
        <div className="lg:col-span-3 space-y-4">
          {readerMode === 'pdf' ? (
            <div className="space-y-4">
              <PDFPreviewer 
                documentId={doc.id}
                documentTitle={doc.title}
                driveUrl={doc.driveUrl}
                category={doc.category}
                year={doc.year}
                type={doc.type}
                onSelectText={setSelectedText}
                onSwitchToNotes={() => handleToggleReaderMode('notes')}
                onAddPageNote={(page) => handleOpenNoteModal(page)}
                pageNotesCount={pageNotes.length}
                onAddVocabulary={(word) => handleOpenVocabModal(word)}
                vocabularyCount={vocabularyItems.length}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 min-h-[600px] animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-slate-950 text-base sm:text-lg uppercase flex items-center gap-2">
                    <Sparkles className="text-amber-500 animate-pulse" size={18} />
                    Notisi na Muhtasari wa Somo
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Kitabu cha Dijitali &bull; Lupanulla Elimu Hub</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-[10px] bg-cyan-50 border border-cyan-100 text-cyan-700 px-3 py-2 rounded-xl font-bold max-w-xs leading-tight">
                    💡 TIP: Chagua maandishi hapa chini kuweka highlight!
                  </div>
                  <button
                    onClick={generateOfflinePDF}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Pakua notisi hizi kama faili la PDF kwa kusoma bila bando"
                  >
                    <Download size={13} /> Pakua Notisi (PDF)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Chapa au Hamisha Notisi hizi kwenda PDF"
                  >
                    <Printer size={13} /> Chapa / Hamisha PDF
                  </button>
                </div>
              </div>

              {loadingSmartNotes ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-cyan-600">
                  <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold uppercase tracking-widest animate-pulse">AI Anatayarisha maelezo ya somo hili...</p>
                </div>
              ) : (
                <div 
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 select-text"
                  onMouseUp={handleTextSelection}
                  onTouchEnd={handleTextSelection}
                >
                  {smartNotes.split('\n\n').map((para, idx) => renderParagraphWithHighlights(para, idx))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Details and related tags */}
        <div className="lg:col-span-1 space-y-6">
          {/* Highlighter / Annotation Widget when in Notes Mode or when text is selected */}
          {(readerMode === 'notes' || selectedText) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5">
                <Highlighter size={14} className="text-cyan-500" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Highlight & Annotate</h4>
              </div>

              {selectedText ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Maandishi Uliyochagua:</span>
                    <div className="bg-slate-50 border-l-4 border-cyan-500 p-2.5 rounded-r-xl max-h-24 overflow-y-auto text-xs text-slate-600 font-semibold italic">
                      "{selectedText}"
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Rangi ya Highlighter:</span>
                    <div className="flex gap-2">
                      {[
                        { id: 'bg-yellow-100 text-yellow-900 border-yellow-300', colorClass: 'bg-yellow-200 border-yellow-400' },
                        { id: 'bg-emerald-100 text-emerald-900 border-emerald-300', colorClass: 'bg-emerald-200 border-emerald-400' },
                        { id: 'bg-cyan-100 text-cyan-900 border-cyan-300', colorClass: 'bg-cyan-200 border-cyan-400' },
                        { id: 'bg-rose-100 text-rose-900 border-rose-300', colorClass: 'bg-rose-200 border-rose-400' },
                      ].map(c => (
                        <button
                          key={c.id}
                          onClick={() => setHighlightColor(c.id)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            highlightColor === c.id ? 'scale-110 shadow-sm ring-2 ring-slate-900/10 border-slate-900' : 'opacity-70 hover:opacity-100 border-transparent'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full ${c.colorClass.split(' ')[0]}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Ongeza Nota/Maelezo Fupi:</span>
                    <input
                      type="text"
                      placeholder="Mf. Neno hili linaulizwa sana..."
                      value={highlightNote}
                      onChange={e => setHighlightNote(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleSaveHighlight}
                      disabled={savingHighlight}
                      className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={13} />
                      {savingHighlight ? 'Inahifadhi...' : 'Highlight'}
                    </button>
                    <button
                      onClick={handleQuickAddSelectionToVocab}
                      className="flex-1 py-2.5 px-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Weka neno hili kwenye Msamiati Wangu"
                    >
                      <BookOpen size={13} />
                      + Msamiati
                    </button>
                    <button
                      onClick={() => setSelectedText('')}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-extrabold uppercase transition-all"
                    >
                      Ghairi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Highlighter size={16} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-[180px] mx-auto uppercase tracking-wide">
                    CHAGUA MAANDISHI KATIKA NOTISI ILI KUWEKA HIGHLIGHT!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Highlights List inside Document */}
          {highlights.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Highlight Zangu ({highlights.length})</span>
                <span className="text-[8px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full uppercase">SALAMA</span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {highlights.map(h => (
                  <div key={h.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl relative group space-y-1.5">
                    <button
                      onClick={() => handleDeleteHighlight(h.id)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Futa Highlight"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className={`${h.color.split(' ')[0]} p-1 px-1.5 rounded text-[10px] font-semibold text-slate-800 italic leading-snug line-clamp-3`}>
                      "{h.text}"
                    </div>
                    {h.note && (
                      <p className="text-[10px] text-slate-600 font-semibold bg-white border border-slate-200/60 p-1.5 px-2 rounded-lg flex items-start gap-1">
                        <span className="text-cyan-500">📝</span> {h.note}
                      </p>
                    )}
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase">
                      {new Date(h.createdAt).toLocaleDateString('sw-TZ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] bg-cyan-50 border border-cyan-100 text-cyan-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase block w-fit">
              {doc.type || 'NECTA'} &bull; {doc.year || 2024}
            </span>
            <h2 className="font-display font-extrabold text-slate-950 text-base sm:text-lg leading-tight uppercase">{doc.title}</h2>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">{doc.description}</p>
            
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between"><span>Mada:</span> <span className="font-bold text-slate-950">{doc.category}</span></div>
              <div className="flex justify-between"><span>Ukubwa wa faili:</span> <span className="font-bold text-slate-950">{doc.sizeKB || 150} KB</span></div>
              <div className="flex justify-between"><span>Views:</span> <span className="font-bold text-slate-950">{doc.views + 1} views</span></div>
              <div className="flex justify-between"><span>Mchapishaji:</span> <span className="font-bold text-slate-950">{doc.uploadedByName || 'Lupanulla'}</span></div>
              {doc.sourceName && (
                <div className="flex justify-between">
                  <span>Chanzo Halisi:</span> 
                  <span className="font-bold text-cyan-700">
                    {doc.sourceUrl ? (
                      <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">
                        {doc.sourceName} ↗
                      </a>
                    ) : (
                      doc.sourceName
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Copyright Notice and Report Infringement trigger */}
          <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-1.5 text-[10.5px] text-amber-800 font-bold leading-normal">
              <ShieldAlert size={15} className="mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                Je, wewe ni mmiliki wa nyaraka hii na unataka iondolewe? Lupanulla inaheshimu hakimiliki na kufuata miongozo ya DMCA/Safe Harbor.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setReportEmail(userProfile?.email || '');
                setReportDetails('');
                setReportSuccess(false);
                setIsReportingOpen(true);
              }}
              className="w-full py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-amber-200/40"
            >
              Ripoti Ukiukaji wa Hakimiliki (DMCA)
            </button>
          </div>

          {/* Flashcard Generation CTA */}
          <div className="bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-3xl p-5 shadow-md text-white space-y-3 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Brain size={16} className="text-cyan-200" />
              </div>
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">Mazoezi ya Flashcards</h4>
            </div>
            <p className="text-white/80 text-[10px] leading-relaxed font-semibold">
              Soma kwa makini kisha jipime uelewa wako! Bofya hapa chini ili kutengeneza kadi mahiri za kujisomea kwa msaada wa Lupanulla AI.
            </p>
            <button
              onClick={() => setIsFlashcardsOpen(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-indigo-950 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-500 animate-pulse" />
              Tengeneza Flashcards
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase">Lebo za Somo (Tags)</h4>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map(t => (
                <span key={t} className="text-[10px] bg-slate-50 border border-slate-150 text-slate-500 font-bold px-2 py-0.5 rounded">#{t}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Printable Document Container (Only visible during print) */}
      <div className="hidden print:block print-only-container">
        <div className="border-b-2 border-slate-300 pb-4 flex justify-between items-end">
          <div>
            <span className="text-xs font-black tracking-widest text-cyan-600">LUPANULLA ELIMU HUB</span>
            <h1 className="text-2xl font-black mt-1 uppercase">{doc.title}</h1>
          </div>
          <div className="text-right text-xs text-slate-400 font-semibold">
            <div>{doc.category || 'Mada ya Masomo'}</div>
            <div>{doc.year ? `Mwaka: ${doc.year}` : ''} &bull; {doc.type || 'NECTA'}</div>
          </div>
        </div>

        {doc.description && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs italic text-slate-600 mt-4">
            <strong>Maelezo ya Nyaraka:</strong> {doc.description}
          </div>
        )}

        <div className="space-y-6 mt-6">
          <h2 className="text-lg font-black border-b border-slate-200 pb-1.5 uppercase text-slate-800">
            Muhtasari wa Somo na Notisi Mahiri (Smart Notes)
          </h2>
          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
            {(smartNotes || `Sura ya Revision: ${doc.title}\n\nNotisi bado zinatayarishwa na mfumo wa AI...`).split('\n\n').map((para, idx) => {
              if (para.startsWith('SURA') || para.startsWith('Sura') || para.startsWith('Chapter') || para.match(/^\d+\./)) {
                return (
                  <h3 key={idx} className="font-bold text-slate-900 text-sm sm:text-base pt-3 border-b pb-1 border-slate-100 uppercase tracking-tight">
                    {para}
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-slate-700 whitespace-pre-line">
                  {para}
                </p>
              );
            })}
          </div>
        </div>

        {highlights.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 mt-8">
            <h2 className="text-lg font-black border-b border-slate-200 pb-1.5 uppercase text-slate-800">
              Vipengele Muhimu Vilivyowekewa Alama (Highlights & Notes)
            </h2>
            <div className="space-y-4">
              {highlights.map((h, idx) => (
                <div key={h.id || idx} className="border-l-4 border-cyan-500 pl-4 py-1 space-y-1">
                  <p className="text-xs sm:text-sm italic text-slate-700 font-medium">"{h.text}"</p>
                  {h.note && (
                    <p className="text-xs font-bold text-cyan-700">
                      📝 Maelezo yangu: {h.note}
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Imehifadhiwa: {new Date(h.createdAt).toLocaleDateString('sw-TZ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-6 mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Hati hii imetengenezwa na Lupanulla Elimu Hub. © {new Date().getFullYear()} Lupanulla Elimu Hub. Haki zote zimehifadhiwa.
        </div>
      </div>

      <FlashcardsModal 
        doc={doc} 
        isOpen={isFlashcardsOpen} 
        onClose={() => setIsFlashcardsOpen(false)} 
      />

      {/* Copyright Report Modal */}
      {isReportingOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-950 text-sm uppercase">Ripoti ya Hakimiliki (DMCA)</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Lupanulla Content Safety & Safe Harbor</p>
              </div>
            </div>

            {reportSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} className="stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase">Ripoti Imewasilishwa!</h4>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed max-w-xs mx-auto font-medium">
                    Asante kwa taarifa yako. Timu yetu ya usalama inakagua ripoti hii ndani ya masaa 24 na kuchukua hatua za haraka, ikiwemo kuondoa nyenzo hii ikiwa inakiuka masharti.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportingOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Funga Dirisha
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendCopyrightReport} className="space-y-4">
                <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
                  Tafadhali weka taarifa zako na maelezo ya hakimiliki yako ili tuweze kuthibitisha na kuondoa nyaraka hii mara moja ikiwa inakiuka haki zako.
                </p>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Barua Pepe Yako (Email)</label>
                  <input
                    type="email"
                    required
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="mfano@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Maelezo ya Ukiukaji (Claim Details)</label>
                  <textarea
                    required
                    rows={4}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Tafadhali eleza kwa kina jinsi faili hili linavyokiuka hakimiliki yako au mali yako..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportingOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 font-bold text-[10.5px] uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Ghairi (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-600/15 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {reportLoading ? 'Inawasilisha...' : 'Ripoti (Submit)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PDF Page Notes Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <StickyNote size={20} className="text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base uppercase tracking-wide">Notisi za Kurasa za PDF</h3>
                  <p className="text-[11px] text-emerald-100 font-medium truncate max-w-md">{doc?.title || 'Weka maelezo kwenye kurasa za PDF'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsNoteModalOpen(false);
                  setEditingNoteId(null);
                  setNoteText('');
                }}
                className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Form to Add / Edit Note */}
              <form onSubmit={handleSavePageNote} className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Plus size={14} className="text-emerald-600" />
                    {editingNoteId ? 'Hariri Notisi ya Ukurasa' : 'Weka Notisi Mpya ya Ukurasa'}
                  </h4>
                  {editingNoteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteText('');
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Ghairi Uhariri
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Ukurasa Namba:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={selectedNotePage}
                        onChange={(e) => setSelectedNotePage(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Dokezo / Maelezo Yako:</label>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Andika muhtasari au dokezo ako kwenye ukurasa huu..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingNote || !noteText.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingNote ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Inahifadhi...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        {editingNoteId ? 'Hifadhi Mabadiliko' : 'Hifadhi Notisi katika Ukurasa'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* List of Saved Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <FileText size={15} className="text-emerald-600" />
                    Notisi Zilizohifadhiwa ({pageNotes.length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Zimepangwa kwa Ukurasa</span>
                </div>

                {pageNotes.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-8 text-center space-y-2">
                    <StickyNote size={32} className="text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Haujaweka notisi yoyote kwenye PDF hii bado.</p>
                    <p className="text-[11px] text-slate-400">Tumia fomu hapo juu kuandika notisi au bonyeza "Note Uk. X" wakati unasoma.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {pageNotes.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all space-y-2 shadow-sm relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1">
                            <FileText size={11} /> Ukurasa {n.pageNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(n.createdAt).toLocaleDateString('sw-TZ')}
                            </span>
                            <button
                              onClick={() => handleOpenNoteModal(n.pageNumber, n)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                              title="Hariri"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeletePageNote(n.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Futa"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {n.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Notisi zote zinahifadhiwa mtandaoni (Firestore) na zinaweza kufikiwa wakati wowote.
              </span>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Vocabulary Side-Panel Drawer */}
      {isVocabOpen && (
        <div className="fixed inset-0 z-[99998] flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setIsVocabOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full sm:w-[500px] lg:w-[540px] bg-white h-full z-[99999] shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-900 text-white p-5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <BookMarked size={22} className="text-purple-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-base uppercase tracking-wider">Msamiati Wangu</h3>
                    <span className="px-2 py-0.5 bg-purple-950/80 text-purple-200 font-black text-[11px] rounded-full border border-purple-400/30">
                      {vocabularyItems.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200 font-medium">Orodha binafsi ya maneno kwa marudio na maandalizi ya mitihani</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsVocabOpen(false);
                  setEditingVocabId(null);
                  setVocabWordInput('');
                  setVocabDefInput('');
                  setVocabContextInput('');
                }}
                className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer font-bold"
                title="Funga Msamiati"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter & Toolbar Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 space-y-3">
              {/* Search input & Revision mode toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={vocabSearchQuery}
                    onChange={(e) => setVocabSearchQuery(e.target.value)}
                    placeholder="Tafuta neno au maana..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  />
                  {vocabSearchQuery && (
                    <button
                      onClick={() => setVocabSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Revision mode toggle button */}
                <button
                  onClick={() => setRevisionMode(!revisionMode)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer whitespace-nowrap ${
                    revisionMode 
                      ? 'bg-amber-500 border-amber-600 text-white font-extrabold ring-2 ring-amber-500/20' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={revisionMode ? "Zima Hali ya Marudio" : "Washa Hali ya Marudio kujipima uwezo wa kukumbuka maneno"}
                >
                  {revisionMode ? <Brain size={14} className="text-white animate-bounce" /> : <EyeOff size={14} className="text-slate-500" />}
                  <span>{revisionMode ? 'Marudio 🧠' : 'Test Mode'}</span>
                </button>
              </div>

              {/* Document filter options */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterDocOption('current')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterDocOption === 'current'
                        ? 'bg-white text-purple-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kitabu Hiki ({vocabularyItems.filter(v => v.documentId === documentId).length})
                  </button>
                  <button
                    onClick={() => setFilterDocOption('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterDocOption === 'all'
                        ? 'bg-white text-purple-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Masomo Yote ({vocabularyItems.length})
                  </button>
                </div>

                {revisionMode && (
                  <button
                    onClick={() => {
                      const allRevealed = Object.keys(revealedVocabIds).length === vocabularyItems.length;
                      if (allRevealed) {
                        setRevealedVocabIds({});
                      } else {
                        const next: Record<string, boolean> = {};
                        vocabularyItems.forEach(v => next[v.id] = true);
                        setRevealedVocabIds(next);
                      }
                    }}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    {Object.keys(revealedVocabIds).length === vocabularyItems.length ? 'Ficha Maana Zote' : 'Onyesha Maana Zote'}
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Form to Add / Edit Vocabulary */}
              <form onSubmit={handleSaveVocabulary} className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Plus size={14} className="text-purple-600" />
                    {editingVocabId ? 'Hariri Msamiati' : 'Ongeza Neno Jipya la Msamiati'}
                  </h4>
                  {editingVocabId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVocabId(null);
                        setVocabWordInput('');
                        setVocabDefInput('');
                        setVocabContextInput('');
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Ghairi Uhariri
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Word Input */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Neno au Kishazi (Term / Word):</label>
                    <input
                      type="text"
                      value={vocabWordInput}
                      onChange={(e) => setVocabWordInput(e.target.value)}
                      placeholder="Mf. Photosynthesis, Ubepari, Gravity..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                      required
                    />
                  </div>

                  {/* Definition Input + AI Auto Define */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Fasili / Maana (Definition):</label>
                      <button
                        type="button"
                        onClick={handleAutoDefineWord}
                        disabled={isGeneratingDef || !vocabWordInput.trim()}
                        className="text-[10px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-100/80 hover:bg-purple-200 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        title="Tafuta maana ya neno hili moja kwa moja kwa kutumia Lupanulla AI"
                      >
                        <Sparkles size={11} className={isGeneratingDef ? 'animate-spin' : ''} />
                        {isGeneratingDef ? 'Inafasili...' : 'Pata Maana kwa AI'}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={vocabDefInput}
                      onChange={(e) => setVocabDefInput(e.target.value)}
                      placeholder="Andika maana au muhtasari wa neno hili..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* Context Sentence */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Sentensi au Muktadha wa Matumizi (Context Sentence):</label>
                    <input
                      type="text"
                      value={vocabContextInput}
                      onChange={(e) => setVocabContextInput(e.target.value)}
                      placeholder="Mf. Plants produce oxygen during photosynthesis..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingVocab || !vocabWordInput.trim()}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingVocab ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Inahifadhi...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        {editingVocabId ? 'Hifadhi Mabadiliko' : 'Hifadhi kwenye Msamiati'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Vocabulary Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookMarked size={15} className="text-purple-600" />
                    Maneno ya Msamiati Wangu (
                    {
                      vocabularyItems
                        .filter(v => filterDocOption === 'all' || v.documentId === documentId)
                        .filter(v => !vocabSearchQuery || v.word.toLowerCase().includes(vocabSearchQuery.toLowerCase()) || (v.definition && v.definition.toLowerCase().includes(vocabSearchQuery.toLowerCase()))).length
                    }
                    )
                  </h4>
                  {revisionMode && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      🧠 Hali ya Marudio Imewashwa
                    </span>
                  )}
                </div>

                {(() => {
                  const filtered = vocabularyItems
                    .filter(v => filterDocOption === 'all' || v.documentId === documentId)
                    .filter(v => !vocabSearchQuery || v.word.toLowerCase().includes(vocabSearchQuery.toLowerCase()) || (v.definition && v.definition.toLowerCase().includes(vocabSearchQuery.toLowerCase())));

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-8 text-center space-y-2">
                        <BookOpen size={36} className="text-purple-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          {vocabSearchQuery ? 'Hakuna msamiati unaofanana na utafutaji wako.' : 'Bado haujahifadhi maneno ya msamiati hapa.'}
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Chagua neno lolote katika notisi na ubonyeze "+ Msamiati" au tumia fomu hapo juu kuongeza maneno yako.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filtered.map((item) => {
                        const isRevealed = Boolean(revealedVocabIds[item.id]);

                        return (
                          <div
                            key={item.id}
                            className="bg-white border border-purple-100 hover:border-purple-300 rounded-2xl p-4 transition-all space-y-2.5 shadow-sm hover:shadow-md relative group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-display font-black text-base text-purple-950 capitalize tracking-tight">
                                    {item.word}
                                  </h5>
                                  <button
                                    onClick={() => handleSpeakWord(item.word)}
                                    className="p-1 text-purple-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                                    title="Sikia jinsi ya kutamka"
                                  >
                                    <Volume2 size={14} />
                                  </button>
                                </div>
                                {item.documentTitle && (
                                  <span className="inline-block text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-xs">
                                    📚 {item.documentTitle}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenVocabModal(undefined, item)}
                                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                                  title="Hariri Neno"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVocabulary(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                  title="Futa Neno"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Definition Box with Revision Mode feature */}
                            {revisionMode ? (
                              <div className="mt-2">
                                {isRevealed ? (
                                  <div className="bg-purple-50/70 border border-purple-200/70 rounded-xl p-3 space-y-1 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider">Fasili / Maana:</span>
                                      <button
                                        onClick={() => setRevealedVocabIds(prev => ({ ...prev, [item.id]: false }))}
                                        className="text-[9px] font-bold text-slate-400 hover:text-slate-600 underline"
                                      >
                                        Ficha Tena
                                      </button>
                                    </div>
                                    <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                                      {item.definition || 'Hakuna maana iliyowekwa.'}
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setRevealedVocabIds(prev => ({ ...prev, [item.id]: true }))}
                                    className="w-full py-3 px-4 bg-purple-100/60 hover:bg-purple-100 border border-dashed border-purple-300 rounded-xl text-center transition-all cursor-pointer group/rev"
                                  >
                                    <span className="text-xs font-bold text-purple-900 flex items-center justify-center gap-1.5 group-hover/rev:scale-105 transition-transform">
                                      <Brain size={14} className="text-purple-600" />
                                      🧠 Onyesha Maana (Tap to Reveal)
                                    </span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              item.definition && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                  <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                                    {item.definition}
                                  </p>
                                </div>
                              )
                            )}

                            {/* Context Sentence */}
                            {item.contextSentence && (
                              <div className="text-[11px] text-slate-500 italic bg-purple-50/30 p-2 rounded-lg border-l-2 border-purple-300">
                                "{item.contextSentence}"
                              </div>
                            )}

                            <div className="text-[9px] text-slate-400 text-right pt-0.5">
                              Ilihifadhiwa: {new Date(item.createdAt).toLocaleDateString('sw-TZ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Msamiati wako unahifadhiwa kwenye akaunti yako na unaweza kuusoma tena wakati wowote.
              </span>
              <button
                onClick={() => setIsVocabOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
