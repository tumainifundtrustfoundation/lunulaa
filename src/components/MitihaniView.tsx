import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Bookmark, 
  Calendar, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Clock,
  BookOpen,
  Sparkles,
  Globe,
  User,
  X,
  Atom,
  Compass,
  Scale,
  GraduationCap,
  Edit,
  Trash2,
  Wand2,
  Loader
} from 'lucide-react';
import { autoDetectLinkMetadata, formatGoogleDriveUrls } from '../utils/linkAutoDetector';
import { 
  fetchDocuments, 
  fetchExamResultByCode, 
  fetchExamResults, 
  toggleBookmark as toggleBookmarkFirestore, 
  fetchUserBookmarks, 
  saveOrder,
  saveDocumentMetadata,
  updateDocument,
  deleteDocumentMetadata
} from '../firebase';
import { DocumentMetadata, ExamResult, UserBookmark } from '../types';
import { GoogleAdSenseUnit } from './MatangazoView';
import ExamTimer from './ExamTimer';
import MatokeoValidationModal from './MatokeoValidationModal';

interface MitihaniViewProps {
  onNavigate: (view: string, id?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userProfile: any;
}

export default function MitihaniView({
  onNavigate,
  searchQuery,
  onSearchChange,
  userProfile
}: MitihaniViewProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advanced Filtering States
  const [selectedType, setSelectedType] = useState<string>(''); // 'NECTA', 'Mock', 'Terminal', 'Majaribio'
  const [selectedLevel, setSelectedLevel] = useState<string>(''); // 'Primary', 'O-Level', 'A-Level'
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('subjectYear'); // 'subjectYear', 'newest', 'views', 'alphabetical'
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);

  // Quick View states for PDF Preview Modal
  const [quickViewDoc, setQuickViewDoc] = useState<DocumentMetadata | null>(null);
  const [quickViewTab, setQuickViewTab] = useState<'summary' | 'pdf'>('summary');

  // Purchase states for Paid Documents
  const [purchasingDoc, setPurchasingDoc] = useState<DocumentMetadata | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerNetwork, setBuyerNetwork] = useState('M-Pesa');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  // Admin action states
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<DocumentMetadata | null>(null);
  
  // Admin form fields
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examSubject, setExamSubject] = useState('Physics');
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [examLevel, setExamLevel] = useState('O-Level');
  const [examClassLevel, setExamClassLevel] = useState('Form 4');
  const [examDriveUrl, setExamDriveUrl] = useState('');
  const [examFileId, setExamFileId] = useState('');
  const [examCategory, setExamCategory] = useState('Past Papers');
  const [examTagsInput, setExamTagsInput] = useState('');
  const [examPaperNo, setExamPaperNo] = useState('Paper 1');
  const [examIsForSale, setExamIsForSale] = useState(false);
  const [examPrice, setExamPrice] = useState(0);
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);
  const [examAutoDetecting, setExamAutoDetecting] = useState(false);

  const handleAutoDetectExam = async (inputStr?: string) => {
    const target = inputStr || examDriveUrl || examTitle;
    if (!target || !target.trim()) return;

    setExamAutoDetecting(true);
    try {
      const meta = await autoDetectLinkMetadata(target);
      if (meta.title && meta.title !== 'Nyenzo ya Masomo') {
        setExamTitle(meta.title);
      }
      if (meta.category) {
        setExamSubject(meta.category);
      }
      if (meta.year) {
        setExamYear(Number(meta.year) || new Date().getFullYear());
      }
      if (meta.type) {
        if (meta.type.includes('Form 1')) setExamClassLevel('Form 1');
        else if (meta.type.includes('Form 2')) setExamClassLevel('Form 2');
        else if (meta.type.includes('Form 3')) setExamClassLevel('Form 3');
        else if (meta.type.includes('Form 4')) setExamClassLevel('Form 4');
        else if (meta.type.includes('Form 5')) setExamClassLevel('Form 5');
        else if (meta.type.includes('Form 6')) setExamClassLevel('Form 6');
        else if (meta.type.includes('Primary') || meta.type.includes('Std')) setExamClassLevel('Standard 7');

        if (meta.type.includes('Form 5') || meta.type.includes('Form 6')) setExamLevel('A-Level');
        else if (meta.type.includes('Primary') || meta.type.includes('Std')) setExamLevel('Primary');
        else setExamLevel('O-Level');
      }
      if (meta.documentType === 'Past Papers') {
        setExamCategory('Past Papers');
      }
      setExamTagsInput(`${meta.category}, ${meta.type}, Past Paper, ${meta.year}`);
    } catch (err) {
      console.warn('Exam auto detect failed:', err);
    } finally {
      setExamAutoDetecting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingExam(null);
    setExamTitle('');
    setExamDescription('');
    setExamSubject('Physics');
    setExamYear(new Date().getFullYear());
    setExamLevel('O-Level');
    setExamClassLevel('Form 4');
    setExamDriveUrl('');
    setExamFileId('');
    setExamCategory('Past Papers');
    setExamTagsInput('NECTA, Past Paper, Form 4');
    setExamPaperNo('Paper 1');
    setExamIsForSale(false);
    setExamPrice(0);
    setIsAddExamModalOpen(true);
  };

  const handleOpenEditModal = (doc: DocumentMetadata) => {
    setEditingExam(doc);
    setExamTitle(doc.title || '');
    setExamDescription(doc.description || '');
    setExamSubject((doc as any).subject || 'Physics');
    setExamYear(doc.year || new Date().getFullYear());
    setExamLevel((doc as any).educationLevel || 'O-Level');
    setExamClassLevel((doc as any).classLevel || 'Form 4');
    setExamDriveUrl(doc.driveUrl || '');
    setExamFileId(doc.fileId || '');
    setExamCategory(doc.category || 'Past Papers');
    setExamTagsInput(doc.tags?.join(', ') || '');
    setExamPaperNo((doc as any).paperNo || 'Paper 1');
    setExamIsForSale(!!doc.isForSale);
    setExamPrice(doc.price || 0);
    setIsEditExamModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDriveUrl.trim()) {
      alert('Tafadhali jaza Jina la Mtihani na Drive URL ya faili la PDF!');
      return;
    }

    setIsAdminActionLoading(true);
    try {
      const tags = examTagsInput.split(',').map(t => t.trim()).filter(Boolean);
      if (!tags.some(t => t.toLowerCase() === 'necta') && examCategory.toLowerCase() === 'past papers') {
        tags.push('NECTA');
      }

      const payload: any = {
        title: examTitle.trim(),
        description: examDescription.trim(),
        category: examCategory,
        tags: tags,
        driveUrl: examDriveUrl.trim(),
        fileId: examFileId.trim() || `exam-${Date.now()}`,
        uploadedBy: userProfile?.uid || 'admin',
        uploadedByName: userProfile?.name || 'Msimamizi Lupanulla',
        year: Number(examYear) || new Date().getFullYear(),
        status: 'approved',
        rating: 5,
        downloadsCount: editingExam?.downloadsCount || 0,
        educationLevel: examLevel,
        classLevel: examClassLevel,
        subject: examSubject,
        documentType: examCategory,
        paperNo: examPaperNo,
        isForSale: examIsForSale,
        price: examIsForSale ? Number(examPrice) || 0 : 0,
        views: editingExam?.views || 0,
      };

      if (editingExam) {
        await updateDocument(editingExam.id, payload);
        alert('Mtihani umerekebishwa kikamilifu!');
        setIsEditExamModalOpen(false);
      } else {
        await saveDocumentMetadata(payload);
        alert('Mtihani mpya umeongezwa kikamilifu!');
        setIsAddExamModalOpen(false);
      }
      await loadDocs();
    } catch (err: any) {
      console.error('Error saving exam:', err);
      alert('Imeshindikana kuhifadhi mtihani: ' + (err.message || err));
    } finally {
      setIsAdminActionLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!window.confirm(`Je, una uhakika unataka kufuta mtihani huu: "${title}"?`)) {
      return;
    }

    try {
      await deleteDocumentMetadata(id);
      alert('Mtihani umefutwa kikamilifu!');
      await loadDocs();
    } catch (err: any) {
      console.error('Error deleting exam:', err);
      alert('Imeshindikana kufuta mtihani: ' + (err.message || err));
    }
  };

  const canAccessDirectly = (doc: DocumentMetadata) => {
    if (!doc.isForSale) return true;
    if (userProfile && (doc.uploadedBy === userProfile.uid || userProfile.role === 'admin' || userProfile.role === 'super_admin')) return true;
    return false;
  };

  const handleDocClick = (doc: DocumentMetadata) => {
    setQuickViewDoc(doc);
    setQuickViewTab('summary');
  };

  const extractGoogleDriveId = (url: string): string | null => {
    if (!url) return null;
    const regD = /\/d\/([a-zA-Z0-9-_]+)/;
    const matchD = url.match(regD);
    if (matchD && matchD[1]) {
      return matchD[1];
    }
    const regId = /[?&]id=([a-zA-Z0-9-_]+)/;
    const matchId = url.match(regId);
    if (matchId && matchId[1]) {
      return matchId[1];
    }
    if (/^[a-zA-Z0-9-_]{20,100}$/.test(url.trim())) {
      return url.trim();
    }
    return null;
  };

  const getDownloadInfo = (doc: DocumentMetadata) => {
    const activeDriveUrl = doc.driveUrl || localStorage.getItem('lupa_drive_' + doc.id);
    if (activeDriveUrl) {
      const formatted = formatGoogleDriveUrls(activeDriveUrl);
      return { 
        url: formatted.embedUrl || formatted.directUrl || activeDriveUrl, 
        directUrl: formatted.directUrl || activeDriveUrl,
        title: doc.title,
        isDrive: formatted.isDrive
      };
    }
    
    return { 
      url: '', 
      directUrl: '',
      title: doc.title || 'Mtihani wa Masomo',
      isDrive: false
    };
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchasingDoc) return;

    try {
      setOrderSaving(true);

      const orderPayload: any = {
        userId: userProfile?.uid || 'guest',
        customerName: buyerName,
        customerPhone: buyerPhone,
        paymentMethod: buyerNetwork,
        items: [{
          id: purchasingDoc.id,
          name: purchasingDoc.title,
          price: purchasingDoc.price,
          quantity: 1,
          type: purchasingDoc.documentType || 'document'
        }],
        totalAmount: purchasingDoc.price || 0,
        status: 'pending',
        notes: `Ombi la kununua nyaraka: ${purchasingDoc.title} (Aina: ${purchasingDoc.documentType || 'Nyaraka'})`
      };

      // Save order to Firebase
      const orderId = await saveOrder(orderPayload);

      // Create WhatsApp purchase message
      let waMessage = `📋 *AGIZO JIPYA LA NYARAKA - LUPANULLA ELIMU HUB*\n`;
      waMessage += `------------------------------------------------\n`;
      waMessage += `*Namba ya Agizo:* #${orderId.substring(0, 7).toUpperCase()}\n`;
      waMessage += `*Mteja:* ${buyerName}\n`;
      waMessage += `*Simu:* ${buyerPhone}\n`;
      waMessage += `*Njia ya Malipo:* ${buyerNetwork}\n`;
      waMessage += `------------------------------------------------\n`;
      waMessage += `*NYENZO INAYOAGIZWA:*\n`;
      waMessage += `1. *${purchasingDoc.title}*\n`;
      waMessage += `   _Mwandishi/Mpakiaji:_ ${purchasingDoc.uploadedByName || 'Mwanachama'}\n`;
      waMessage += `   _Bei:_ TSh ${(purchasingDoc.price || 0).toLocaleString()}\n`;
      waMessage += `------------------------------------------------\n`;
      waMessage += `💰 *JUMLA YA KULIPIA:* TSh ${(purchasingDoc.price || 0).toLocaleString()}\n\n`;
      waMessage += `Tafadhali wasilisha agizo langu na unipe maelekezo ya jinsi ya kutuma malipo ili nipate nyenzo hii. Asante!`;

      const encodedMessage = encodeURIComponent(waMessage);
      const waUrl = `https://wa.me/255699479032?text=${encodedMessage}`;

      alert(`Agizo limetengenezwa! Unahamishiwa WhatsApp kukamilisha malipo...`);
      setShowPurchaseModal(false);

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1200);

    } catch (err) {
      console.error('Purchase order saving error:', err);
      alert('Imeshindwa kutengeneza agizo. Tafadhali jaribu tena.');
    } finally {
      setOrderSaving(false);
    }
  };

  // --- NEW: Exam Results Check States ---
  const [candidateCode, setCandidateCode] = useState<string>('');
  const [checkingResult, setCheckingResult] = useState<boolean>(false);
  const [checkedResult, setCheckedResult] = useState<ExamResult | null>(null);
  const [resultLookupError, setResultLookupError] = useState<string | null>(null);
  const [dbResults, setDbResults] = useState<ExamResult[]>([]);
  const [selectedResultForModal, setSelectedResultForModal] = useState<ExamResult | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  // --- NEW: NECTA Past Papers Library Wizard States & Configuration ---
  const [nectaWizardLevel, setNectaWizardLevel] = useState<string>('f4');
  const [nectaWizardSubject, setNectaWizardSubject] = useState<string>('physics');
  const [nectaWizardYear, setNectaWizardYear] = useState<string>('2023');
  const [requestedPapers, setRequestedPapers] = useState<string[]>([]);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const NECTA_LEVELS = [
    { id: 'std7', name: 'Darasa la 7 (PSLE)', description: 'Mitihani ya Kuhitimu Elimu ya Msingi' },
    { id: 'f2', name: 'Kidato cha 2 (FTSEE)', description: 'Upimaji wa Kitaifa Kidato cha Pili' },
    { id: 'f4', name: 'Kidato cha 4 (CSEE)', description: 'Mtihani wa Kuhitimu Elimu ya Sekondari' },
    { id: 'f6', name: 'Kidato cha 6 (ACSEE)', description: 'Mtihani wa Kidato cha Sita na Vyuo' },
  ];

  const NECTA_SUBJECTS: Record<string, { id: string; name: string }[]> = {
    std7: [
      { id: 'mathematics', name: 'Mathematics (Hisabati)' },
      { id: 'science', name: 'Science & Tech (Sayansi)' },
      { id: 'social-studies', name: 'Social Studies (Maarifa ya Jamii)' },
      { id: 'civic-moral', name: 'Civic & Moral (Uraia na Maadili)' },
      { id: 'english', name: 'English Language (Kiingereza)' },
      { id: 'kiswahili', name: 'Kiswahili' },
    ],
    f2: [
      { id: 'basic-math', name: 'Basic Mathematics' },
      { id: 'physics', name: 'Physics (Fizikia)' },
      { id: 'chemistry', name: 'Chemistry (Kemia)' },
      { id: 'biology', name: 'Biology (Biolojia)' },
      { id: 'geography', name: 'Geography (Jiografia)' },
      { id: 'history', name: 'History (Historia)' },
      { id: 'civics', name: 'Civics (Uraia)' },
      { id: 'english', name: 'English Language' },
      { id: 'kiswahili', name: 'Kiswahili' },
    ],
    f4: [
      { id: 'basic-math', name: 'Basic Mathematics' },
      { id: 'physics', name: 'Physics (Fizikia)' },
      { id: 'chemistry', name: 'Chemistry (Kemia)' },
      { id: 'biology', name: 'Biology (Biolojia)' },
      { id: 'geography', name: 'Geography (Jiografia)' },
      { id: 'history', name: 'History (Historia)' },
      { id: 'civics', name: 'Civics (Uraia)' },
      { id: 'english', name: 'English Language' },
      { id: 'kiswahili', name: 'Kiswahili' },
      { id: 'commerce', name: 'Commerce (Biashara)' },
      { id: 'bookkeeping', name: 'Book-keeping' },
    ],
    f6: [
      { id: 'physics', name: 'Physics (Fizikia)' },
      { id: 'chemistry', name: 'Chemistry (Kemia)' },
      { id: 'biology', name: 'Biology (Biolojia)' },
      { id: 'adv-math', name: 'Advanced Mathematics' },
      { id: 'geography', name: 'Geography (Jiografia)' },
      { id: 'history', name: 'History (Historia)' },
      { id: 'english', name: 'English Language' },
      { id: 'kiswahili', name: 'Kiswahili' },
      { id: 'general-studies', name: 'General Studies' },
    ],
  };

  const NECTA_YEARS = Array.from({ length: 2026 - 1994 + 1 }, (_, i) => (2026 - i).toString());

  // Load active publisher configuration
  const [adsenseActive, setAdsenseActive] = useState<boolean>(() => localStorage.getItem('lup_adsense_active') !== 'false');

  const handleLookupResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckedResult(null);
    setResultLookupError(null);
    
    const code = candidateCode.trim().toUpperCase();
    if (!code) return;

    setCheckingResult(true);
    try {
      // 1. Kwanza tafuta kwenye hifadhidata ya ndani ya Firestore
      const match = await fetchExamResultByCode(code);
      if (match) {
        setCheckedResult(match);
      } else {
        // 2. Kama haijapatikana, tafuta kwenye mitandao na mifumo mingine ya NECTA kupitia API yetu yenye Search Grounding
        try {
          const response = await fetch('/api/check-necta', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ candidateCode: code }),
          });
          
          if (response.ok) {
            const externalResult = await response.json();
            if (externalResult && externalResult.subjects && externalResult.subjects.length > 0) {
              setCheckedResult({
                ...externalResult,
                isExternal: true
              });
            } else {
              setResultLookupError('Samahani! Hakuna matokeo yaliyopatikana kwa nambari ya mtihani uliyoingiza. Hakikisha namba na mwaka vipo sahihi (Mfano: S0101/0001/2023).');
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            setResultLookupError(errorData.error || 'Samahani! Hakuna matokeo yaliyopatikana kwa nambari hii kwenye hifadhidata yetu wala mtandaoni kwa sasa.');
          }
        } catch (apiErr) {
          console.error('Error searching online NECTA results:', apiErr);
          setResultLookupError('Hitilafu imetokea wakati wa kuwasiliana na mfumo wa utafutaji wa NECTA mtandaoni. Tafadhali jaribu tena.');
        }
      }
    } catch (err) {
      console.error('Error fetching exam result:', err);
      setResultLookupError('Hitilafu imetokea wakati wa kutafuta matokeo. Tafadhali jaribu tena baadae.');
    } finally {
      setCheckingResult(false);
    }
  };

  // Seed documents array if Firebase Firestore is completely empty
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
      createdAt: Date.now() - 3600000 * 24 * 5, // 5 days ago
      views: 1240,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2023,
      type: 'NECTA',
      sizeKB: 245,
      accent: 'border-cyan-400'
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
      createdAt: Date.now() - 3600000 * 24 * 10, // 10 days ago
      views: 950,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2022,
      type: 'NECTA',
      sizeKB: 180,
      accent: 'border-amber-400'
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
      createdAt: Date.now() - 3600000 * 24 * 2, // 2 days ago
      views: 310,
      status: 'approved',
      paperNo: 'Paper 1',
      year: 2024,
      type: 'Mock',
      sizeKB: 140,
      accent: 'border-purple-400'
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
      sizeKB: 210,
      accent: 'border-green-400'
    },
    {
      id: 'uvinza-math-f1-2026',
      title: 'Uvinza District Council - Form One Terminal Joint Examination, May 2026 - Mathematics',
      description: 'Joint terminal examination for Form One students in Uvinza District. Covers branches of mathematics, fractions, weight, and profit calculations.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Form One', 'Terminal', 'Uvinza', '2026'],
      fileId: 'uvinza-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 45,
      status: 'approved',
      paperNo: 'Terminal',
      year: 2026,
      type: 'Terminal',
      sizeKB: 320,
      accent: 'border-cyan-500'
    },
    {
      id: 'chamwino-math-f1-2026',
      title: 'Chamwino District - Form One Terminal Examination - Basic Mathematics, May 2026',
      description: 'Standard terminal assessment for Form One candidates in Chamwino. Focuses on basic operations, rational numbers, and mathematical definitions.',
      category: 'Mathematics',
      tags: ['Basic Mathematics', 'Form One', 'Terminal', 'Chamwino', '2026'],
      fileId: 'chamwino-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 67,
      status: 'approved',
      paperNo: 'Terminal',
      year: 2026,
      type: 'Terminal',
      sizeKB: 290,
      accent: 'border-indigo-500'
    },
    {
      id: 'busega-math-f1-2026',
      title: 'Busega District Council - Form One Terminal Examination - Mathematics, May 2026',
      description: 'Regional terminal evaluation for Busega district. Includes significant figures, decimals, and algebraic simplifications.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Form One', 'Terminal', 'Busega', '2026'],
      fileId: 'busega-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 89,
      status: 'approved',
      paperNo: 'Terminal',
      year: 2026,
      type: 'Terminal',
      sizeKB: 310,
      accent: 'border-emerald-500'
    },
    {
      id: 'tulia-math-f1-2026',
      title: 'Dr. Tulia Ackson Secondary School - Form One Opening Examination, July 2026',
      description: 'Opening assessment for new Form One students. Covers branches of mathematics, rational numbers, and variable expressions.',
      category: 'Mathematics',
      tags: ['Mathematics', 'Form One', 'Opening', 'Dr. Tulia Ackson', '2026'],
      fileId: 'tulia-1',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Lupanulla Admin',
      createdAt: Date.now(),
      views: 110,
      status: 'approved',
      paperNo: 'Opening',
      year: 2026,
      type: 'Terminal',
      sizeKB: 275,
      accent: 'border-amber-600'
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
      sizeKB: 320,
      accent: 'border-cyan-400'
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
      sizeKB: 285,
      accent: 'border-rose-400'
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
      sizeKB: 340,
      accent: 'border-amber-400'
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
      sizeKB: 210,
      accent: 'border-purple-400'
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
      sizeKB: 310,
      accent: 'border-indigo-400'
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
      sizeKB: 290,
      accent: 'border-emerald-500'
    },
    {
      id: 'chem-practical-handout',
      title: 'Chemistry Practical Solutions - IV (Subject Handout)',
      description: 'A comprehensive chemistry practical guide prepared by Sir. Donny Company. Contains detailed volumetric analysis, rate of chemical reactions & equilibrium, qualitative analysis, balanced equations, tables of results, and calculation steps.',
      category: 'Science & Technology',
      tags: ['Chemistry', 'Practical', 'Handout', 'Guide', 'Form IV', 'NECTA'],
      fileId: 'sample-drive-id-chem-handout',
      driveUrl: 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true',
      uploadedBy: 'admin',
      uploadedByName: 'Sir. Donny',
      createdAt: Date.now() - 3600000 * 24 * 0.5,
      views: 2450,
      status: 'approved',
      paperNo: 'Practical Guide',
      year: 2026,
      type: 'Handout',
      sizeKB: 412,
      accent: 'border-cyan-500'
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
      sizeKB: 320,
      accent: 'border-red-500'
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
      sizeKB: 195,
      accent: 'border-blue-500'
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
      sizeKB: 230,
      accent: 'border-amber-500'
    }
  ];

  const loadResults = async () => {
    try {
      const results = await fetchExamResults();
      if (results && results.length > 0) {
        setDbResults(results);
      } else {
        setDbResults([
          {
            id: "seed-1",
            studentName: "Yohana Marco Bahati",
            candidateCode: "S0101/0001/2026",
            examType: "NECTA Mock Examination",
            level: "Form IV",
            year: 2026,
            division: "Division I",
            gpa: 1.14,
            subjects: [
              { subject: "Basic Mathematics", grade: "A", score: 88 },
              { subject: "Physics", grade: "A", score: 85 },
              { subject: "Chemistry", grade: "B", score: 76 },
              { subject: "Biology", grade: "A", score: 81 },
              { subject: "English Language", grade: "B", score: 78 },
              { subject: "Civics", grade: "A", score: 82 },
              { subject: "History", grade: "B", score: 74 }
            ],
            publishedAt: Date.now() - 3600000 * 24 * 10,
            status: "published"
          },
          {
            id: "seed-2",
            studentName: "Anna John Simba",
            candidateCode: "S0101/0002/2026",
            examType: "NECTA Mock Examination",
            level: "Form IV",
            year: 2026,
            division: "Division II",
            gpa: 2.43,
            subjects: [
              { subject: "Basic Mathematics", grade: "C", score: 58 },
              { subject: "Physics", grade: "B", score: 68 },
              { subject: "Chemistry", grade: "C", score: 55 },
              { subject: "Biology", grade: "B", score: 65 },
              { subject: "English Language", grade: "B", score: 70 },
              { subject: "Civics", grade: "C", score: 52 },
              { subject: "History", grade: "D", score: 48 }
            ],
            publishedAt: Date.now() - 3600000 * 24 * 10,
            status: "published"
          },
          {
            id: "seed-3",
            studentName: "Juma Shaban Mwinyi",
            candidateCode: "S1245/0050/2026",
            examType: "NECTA Terminal Examination",
            level: "Form IV",
            year: 2026,
            division: "Division III",
            gpa: 3.57,
            subjects: [
              { subject: "Basic Mathematics", grade: "D", score: 44 },
              { subject: "Physics", grade: "D", score: 41 },
              { subject: "Chemistry", grade: "C", score: 52 },
              { subject: "Biology", grade: "D", score: 43 },
              { subject: "English Language", grade: "C", score: 50 },
              { subject: "Civics", grade: "D", score: 40 },
              { subject: "History", grade: "F", score: 32 }
            ],
            publishedAt: Date.now() - 3600000 * 24 * 10,
            status: "published"
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading exam results:", err);
    }
  };

  useEffect(() => {
    loadDocs();
    loadResults();
    const checkBookmarks = async () => {
      if (!userProfile?.uid) {
        const storedBookmarks = localStorage.getItem('lupa_bookmarks');
        if (storedBookmarks) {
          setBookmarkedIds(JSON.parse(storedBookmarks));
        }
        return;
      }
      
      try {
        const bookmarks = await fetchUserBookmarks(userProfile.uid);
        setBookmarkedIds(bookmarks.map(b => b.resourceId));
      } catch (e) {
        console.error(e);
      }
    };
    checkBookmarks();
  }, [userProfile?.uid]);

  const loadDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await fetchDocuments({ status: 'approved' });
      
      // Combine fetched documents with our default pre-populated seeds
      // To ensure a full, rich library even if Firestore is currently blank
      const combined = [...fetched];
      
      // Prevent duplicates by ID
      localSeedDocs.forEach(seed => {
        if (!combined.some(d => d.id === seed.id)) {
          combined.push(seed);
        }
      });

      setDocuments(combined);
    } catch (e) {
      console.error(e);
      // Fallback to local seeds on error to protect user experience
      setDocuments(localSeedDocs);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (doc: DocumentMetadata, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating
    
    if (!userProfile?.uid) {
      // Fallback for guest
      let updated: string[];
      if (bookmarkedIds.includes(doc.id)) {
        updated = bookmarkedIds.filter(id => id !== doc.id);
      } else {
        updated = [...bookmarkedIds, doc.id];
      }
      setBookmarkedIds(updated);
      localStorage.setItem('lupa_bookmarks', JSON.stringify(updated));
      return;
    }

    try {
      const isNowBookmarked = await toggleBookmarkFirestore(userProfile.uid, {
        id: doc.id,
        type: 'exam',
        title: doc.title
      });
      
      if (isNowBookmarked) {
        setBookmarkedIds(prev => [...prev, doc.id]);
      } else {
        setBookmarkedIds(prev => prev.filter(id => id !== doc.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter application
  const filteredDocs = documents.filter((doc) => {
    // Basic global search (Title, Tags, Category, etc.)
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Advanced specific filters
    const docType = doc.type || (doc.tags.some(t => t.toLowerCase() === 'necta') ? 'NECTA' : 'Majaribio');
    const matchesType = !selectedType || docType.toLowerCase() === selectedType.toLowerCase();

    const matchesSubject = !selectedSubject || doc.tags.some(t => t.toLowerCase() === selectedSubject.toLowerCase());

    const docYear = doc.year || (doc.tags.includes('2023') ? 2023 : doc.tags.includes('2022') ? 2022 : 2024);
    const matchesYear = !selectedYear || String(docYear) === selectedYear;

    const isPrimary = doc.tags.some(t => ['primary', 'msingi', 'darasa'].includes(t.toLowerCase()));
    const isAlevel = doc.tags.some(t => ['advanced', 'a-level', 'form v', 'form vi', 'kidato cha tano', 'kidato cha sita'].includes(t.toLowerCase()));
    const isOlevel = !isPrimary && !isAlevel;

    let docLevel = 'O-Level';
    if (isPrimary) docLevel = 'Primary';
    else if (isAlevel) docLevel = 'A-Level';

    const matchesLevel = !selectedLevel || docLevel.toLowerCase() === selectedLevel.toLowerCase();

    return matchesSearch && matchesType && matchesSubject && matchesYear && matchesLevel;
  });

  const getDocSubject = (doc: DocumentMetadata) => {
    if (doc.subject) return doc.subject;
    // Look through standard subjects
    const subjects = [
      'Mathematics', 'Basic Mathematics', 'Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 
      'History', 'Geography', 'Civics', 'English', 'Kiswahili', 'Commerce', 'Bookkeeping', 'Physical Education', 'Chinese'
    ];
    for (const s of subjects) {
      if (
        doc.title.toLowerCase().includes(s.toLowerCase()) || 
        doc.tags.some(t => t.toLowerCase() === s.toLowerCase() || t.toLowerCase().includes(s.toLowerCase()))
      ) {
        // Normalize names
        if (s.toLowerCase().includes('math')) return 'Mathematics (Hisabati)';
        if (s.toLowerCase().includes('phy')) return 'Physics (Fizikia)';
        if (s.toLowerCase().includes('chem')) return 'Chemistry (Kemia)';
        if (s.toLowerCase().includes('bio')) return 'Biology (Biolojia)';
        if (s.toLowerCase().includes('hist')) return 'History (Historia)';
        if (s.toLowerCase().includes('geo')) return 'Geography (Jiografia)';
        if (s.toLowerCase().includes('civ')) return 'Civics (Uraia)';
        if (s.toLowerCase().includes('eng')) return 'English Language';
        if (s.toLowerCase().includes('kisw')) return 'Kiswahili';
        if (s.toLowerCase().includes('comm')) return 'Commerce (Biashara)';
        if (s.toLowerCase().includes('book')) return 'Book-keeping';
        return s;
      }
    }
    return doc.category || 'Masomo Mengine';
  };

  const getSubjectTheme = (subjectName: string) => {
    const sub = subjectName.toLowerCase();
    
    if (sub.includes('math') || sub.includes('hisabati')) {
      return {
        gradient: 'from-blue-600 to-indigo-800',
        accentColor: 'text-blue-200',
        icon: Compass,
        pattern: 'bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]'
      };
    }
    if (sub.includes('physics') || sub.includes('fizikia')) {
      return {
        gradient: 'from-violet-700 to-indigo-950',
        accentColor: 'text-indigo-200',
        icon: Atom,
        pattern: 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [background-size:10px_10px]'
      };
    }
    if (sub.includes('chemistry') || sub.includes('kemia')) {
      return {
        gradient: 'from-teal-600 to-emerald-950',
        accentColor: 'text-teal-200',
        icon: Sparkles,
        pattern: 'bg-[radial-gradient(#ffffff0c_1.5px,transparent_1.5px)] [background-size:16px_16px]'
      };
    }
    if (sub.includes('biology') || sub.includes('biolojia')) {
      return {
        gradient: 'from-emerald-600 to-teal-900',
        accentColor: 'text-emerald-100',
        icon: GraduationCap,
        pattern: 'bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:8px_8px]'
      };
    }
    if (sub.includes('history') || sub.includes('historia')) {
      return {
        gradient: 'from-amber-800 to-red-950',
        accentColor: 'text-amber-200',
        icon: FileText,
        pattern: 'bg-[repeating-linear-gradient(45deg,#ffffff03_0px,#ffffff03_2px,transparent_2px,transparent_10px)]'
      };
    }
    if (sub.includes('geography') || sub.includes('jiografia')) {
      return {
        gradient: 'from-sky-600 to-blue-900',
        accentColor: 'text-sky-200',
        icon: Globe,
        pattern: 'bg-[radial-gradient(#ffffff0d_1.5px,transparent_1.5px)] [background-size:14px_14px]'
      };
    }
    if (sub.includes('civics') || sub.includes('uraia')) {
      return {
        gradient: 'from-red-600 to-rose-950',
        accentColor: 'text-red-200',
        icon: Scale,
        pattern: 'bg-[linear-gradient(45deg,#ffffff04_25%,transparent_25%,transparent_75%,#ffffff04_75%,#ffffff04),linear-gradient(45deg,#ffffff04_25%,transparent_25%,transparent_75%,#ffffff04_75%,#ffffff04)] [background-size:16px_16px] [background-position:0_0,8px_8px]'
      };
    }
    if (sub.includes('english') || sub.includes('kiingereza')) {
      return {
        gradient: 'from-fuchsia-700 to-rose-950',
        accentColor: 'text-fuchsia-200',
        icon: BookOpen,
        pattern: 'bg-[repeating-linear-gradient(to_right,#ffffff03_0px,#ffffff03_1px,transparent_1px,transparent_12px)]'
      };
    }
    if (sub.includes('kiswahili')) {
      return {
        gradient: 'from-orange-600 to-amber-950',
        accentColor: 'text-orange-200',
        icon: BookOpen,
        pattern: 'bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:10px_10px]'
      };
    }
    if (sub.includes('commerce') || sub.includes('biashara') || sub.includes('bookkeeping') || sub.includes('uhasibu')) {
      return {
        gradient: 'from-cyan-600 to-indigo-950',
        accentColor: 'text-cyan-200',
        icon: FileText,
        pattern: 'bg-[linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] [background-size:10px_8px]'
      };
    }
    
    // Default fallback
    return {
      gradient: 'from-slate-600 to-slate-900',
      accentColor: 'text-slate-300',
      icon: BookOpen,
      pattern: 'bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]'
    };
  };

  const renderBookCover = (doc: DocumentMetadata) => {
    const subject = getDocSubject(doc);
    const theme = getSubjectTheme(subject);
    const IconComponent = theme.icon;
    
    const year = doc.year || 2024;
    const typeLabel = doc.type || (doc.tags.includes('NECTA') ? 'NECTA' : 'Mock');

    return (
      <div className={`relative w-[95px] h-[135px] sm:w-[105px] sm:h-[145px] rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-gradient-to-br ${theme.gradient} flex flex-col justify-between p-3 text-white select-none group-hover:scale-[1.03] transition-transform duration-300 border border-white/10`}>
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none" />
        
        {/* Book spine simulation on the left */}
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-black/25 rounded-l-2xl blur-[0.5px]" />
        <div className="absolute top-0 bottom-0 left-[1px] w-[0.5px] bg-white/15 rounded-l-2xl" />

        {/* Diagonal stripes or background pattern */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${theme.pattern}`} />

        {/* Header/Badge on cover */}
        <div className="relative z-10 flex justify-between items-start">
          <span className="text-[7.5px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10">
            {typeLabel}
          </span>
          <span className="text-[8px] font-mono font-black text-white/90">
            {year}
          </span>
        </div>

        {/* Central subject graphic */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1 text-center">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shadow-inner border border-white/10 mb-1 group-hover:rotate-6 transition-transform">
            <IconComponent size={14} className={theme.accentColor} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider leading-tight max-w-[85px] line-clamp-2 text-white">
            {subject.replace(/\s*\(.*\)/, '')}
          </span>
        </div>

        {/* Footer info/Lupanulla seal */}
        <div className="relative z-10 border-t border-white/15 pt-1.5 text-[6px] font-black uppercase tracking-widest text-white/60 text-center">
          ELIMU HUB
        </div>
      </div>
    );
  };

  // Sort application
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'subjectYear') {
      const subA = getDocSubject(a);
      const subB = getDocSubject(b);
      const subCompare = subA.localeCompare(subB);
      if (subCompare !== 0) return subCompare;
      
      const yrA = a.year || (a.tags.includes('2023') ? 2023 : a.tags.includes('2022') ? 2022 : a.tags.includes('2024') ? 2024 : 2026);
      const yrB = b.year || (b.tags.includes('2023') ? 2023 : b.tags.includes('2022') ? 2022 : b.tags.includes('2024') ? 2024 : 2026);
      return yrB - yrA; // Newer year first
    } else if (sortBy === 'newest') {
      return b.createdAt - a.createdAt;
    } else if (sortBy === 'views') {
      return b.views - a.views;
    } else if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Find matching verified document in the system
  const parsedYear = parseInt(nectaWizardYear, 10);
  const matchingDoc = documents.find(d => {
    const matchesYear = d.year === parsedYear;
    const matchesType = d.type?.toUpperCase() === 'NECTA';
    
    // Tag matching is very robust
    const tagsStr = d.tags?.map(t => t.toLowerCase()).join(' ') || '';
    const levelMatch = 
      (nectaWizardLevel === 'std7' && (tagsStr.includes('psle') || tagsStr.includes('primary') || tagsStr.includes('darasa la 7'))) ||
      (nectaWizardLevel === 'std4' && (tagsStr.includes('sfna') || tagsStr.includes('primary') || tagsStr.includes('darasa la 4'))) ||
      (nectaWizardLevel === 'f2' && (tagsStr.includes('ftsee') || tagsStr.includes('f2') || tagsStr.includes('kidato cha pili') || tagsStr.includes('ftna'))) ||
      (nectaWizardLevel === 'f4' && (tagsStr.includes('csee') || tagsStr.includes('f4') || tagsStr.includes('kidato cha nne'))) ||
      (nectaWizardLevel === 'f6' && (tagsStr.includes('acsee') || tagsStr.includes('f6') || tagsStr.includes('kidato cha sita')));

    // Simple subject match
    const subjectMatch = tagsStr.includes(nectaWizardSubject.toLowerCase()) || 
                         d.title?.toLowerCase().includes(nectaWizardSubject.toLowerCase());

    return matchesYear && matchesType && levelMatch && subjectMatch;
  });

  const levelLabels: Record<string, string> = {
    std7: 'Darasa la 7 (PSLE)',
    std4: 'Darasa la 4 (SFNA)',
    f2: 'Kidato cha 2 (FTSEE)',
    f4: 'Kidato cha 4 (CSEE)',
    f6: 'Kidato cha 6 (ACSEE)'
  };

  const currentSubjectLabel = NECTA_SUBJECTS[nectaWizardLevel]?.find(s => s.id === nectaWizardSubject)?.name || nectaWizardSubject;
  const currentLevelLabel = levelLabels[nectaWizardLevel] || nectaWizardLevel;
  const paperRequestKey = `${nectaWizardLevel}-${nectaWizardSubject}-${nectaWizardYear}`;
  const isPaperAlreadyRequested = requestedPapers.includes(paperRequestKey);

  const handleRequestPaper = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setRequestedPapers(prev => [...prev, paperRequestKey]);
      setIsRequesting(false);
    }, 1000);
  };

  // Popular Trending Carousel subset
  const trendingPapers = [...documents]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <div id="mitihani-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 relative">
      {/* Exam Timer Floating Widget */}
      {showTimer && <ExamTimer onClose={() => setShowTimer(false)} />}
      
      {/* ── Banner Section ── */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden border border-cyan-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
              <TrendingUp size={12} className="text-amber-400" />
              Scribd-Drive File Sharing Integrated
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Past Papers &amp; Mitihani</h1>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Vinjari maktaba yetu kubwa ya past papers za NECTA, majaribio ya Mock ya mikoa na wilaya, na mitihani ya kawaida ya muhula. Soma mtandaoni na pakua bure!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => setShowTimer(!showTimer)}
              className={`font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md ${
                showTimer 
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Clock size={16} /> 
              {showTimer ? 'Funga Kipima Muda' : 'Kipima Muda (Timer)'}
            </button>

            {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') ? (
              <button 
                onClick={handleOpenAddModal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Ongeza Mtihani Mpya (Admin)
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-sm">
                <BookOpen size={14} className="text-cyan-300 animate-pulse" />
                <span>Njia ya Usomaji Imewashwa</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── NEW: Exam Results Verification & Transcript Portal ── */}
      <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Kituo cha Hakiki na Kutazama Matokeo</h2>
              <p className="text-xs text-slate-400">Hakiki matokeo rasmi ya NECTA Mock, Terminal, na majaribio ya shule</p>
            </div>
          </div>
          <span className="self-start sm:self-auto bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">
            Mfumo wa Uhakiki Umewashwa (Active)
          </span>
        </div>

        <form onSubmit={handleLookupResult} className="max-w-xl space-y-3">
          <div className="space-y-1">
            <label className="block text-slate-400 font-bold uppercase text-[9px] tracking-wider">Ingiza Namba ya Mtihani (Candidate Code)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  required
                  value={candidateCode}
                  onChange={(e) => setCandidateCode(e.target.value)}
                  placeholder="Mfano: S0101/0001/2026 au LUP-2026-88"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 placeholder-slate-400"
                />
              </div>
              <button 
                type="submit"
                disabled={checkingResult}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap disabled:opacity-75"
              >
                {checkingResult ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Tafuta Matokeo</span>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-400 font-bold">
          <span>Namba za majaribio ya haraka (Mifano):</span>
          <button
            type="button"
            onClick={() => setCandidateCode('S0101/0001/2026')}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md border border-slate-200 font-mono transition-colors cursor-pointer"
          >
            S0101/0001/2026
          </button>
          <button
            type="button"
            onClick={() => setCandidateCode('S0101/0002/2026')}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md border border-slate-200 font-mono transition-colors cursor-pointer"
          >
            S0101/0002/2026
          </button>
        </div>

        {/* Info Block */}
        <div className="bg-indigo-50/45 border border-indigo-100 rounded-2xl p-4 max-w-xl text-xs space-y-1.5 text-indigo-950 font-medium">
          <p className="font-extrabold uppercase text-[10px] text-indigo-700 tracking-wider">Matokeo yanayopatikana sasa:</p>
          <ul className="list-disc list-inside space-y-0.5 text-indigo-900 font-semibold">
            <li>Form IV NECTA Mock Examinations (2026)</li>
            <li>Form IV NECTA Terminal (2026)</li>
          </ul>
        </div>

        {/* Orodha ya Matokeo Yaliyosajiliwa (Registered Exam Results List) */}
        {dbResults && dbResults.length > 0 && (
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Matokeo ya Ndani (Database Results List)
              </h3>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full">
                {dbResults.length} Zilizopo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dbResults.map((res) => (
                <div 
                  key={res.id} 
                  className="bg-white border border-slate-200 hover:border-indigo-200 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {res.candidateCode}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{res.examType.split(' ')[0]}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{res.studentName}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span>{res.level} &bull; {res.year}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-600 font-black">{res.division}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCandidateCode(res.candidateCode);
                        setCheckedResult(res);
                        setResultLookupError(null);
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase py-2 px-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Search className="w-3 h-3" /> Tazama
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResultForModal(res);
                        setIsValidationModalOpen(true);
                      }}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[9px] uppercase py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Hakiki
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {resultLookupError && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-xs text-rose-700">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={16} />
            <p className="font-semibold leading-normal">{resultLookupError}</p>
          </div>
        )}

        {/* Verified Result Transcript Card */}
        {checkedResult && (
          <div className="border border-indigo-200 rounded-3xl bg-slate-50 overflow-hidden shadow-md animate-fade-in max-w-2xl">
            {/* Transcript Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 sm:p-6 text-white relative">
              <div className="absolute top-4 right-4 flex gap-1.5">
                {(checkedResult as any).isExternal ? (
                  <div className="bg-cyan-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow flex items-center gap-1.5">
                    <Globe size={10} />
                    MTANDAONI (ONLINE NECTA)
                  </div>
                ) : (
                  <div className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    HAKIKIWA (VERIFIED)
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Ripoti Rasmi ya Maendeleo ya Taaluma</span>
                <h3 className="font-display font-extrabold text-base sm:text-lg leading-tight">{checkedResult.studentName}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-slate-300 pt-1">
                  <span>Candidate No: <strong className="text-white">{checkedResult.candidateCode}</strong></span>
                  <span>•</span>
                  <span>Exam: <strong className="text-white">{checkedResult.examType} ({checkedResult.year})</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-white">{checkedResult.level}</strong></span>
                </div>
              </div>
            </div>

            {/* Transcript Details & Scores */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div>
                  <span className="text-slate-400 block font-extrabold text-[9px] uppercase tracking-wider mb-0.5">Msimamo wa Divisheni</span>
                  <span className="text-slate-800 font-black text-sm sm:text-base uppercase">{checkedResult.division}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-extrabold text-[9px] uppercase tracking-wider mb-0.5">Wastani wa Alama (GPA)</span>
                  <span className="text-indigo-600 font-mono font-black text-sm sm:text-base">{checkedResult.gpa}</span>
                </div>
              </div>

              {/* Subject Table */}
              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-150 flex justify-between font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  <span>Somo (Subject)</span>
                  <div className="flex gap-8">
                    <span>Alama</span>
                    <span>Daraja (Grade)</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {checkedResult.subjects.map((sub, idx) => {
                    const g = sub.grade.trim().toUpperCase();
                    const badgeClass = g === 'A' ? 'bg-green-100 text-green-800 border-green-200' :
                                       g === 'B' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                       g === 'C' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                       g === 'D' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                       'bg-rose-100 text-rose-800 border-rose-200';
                    return (
                      <div key={idx} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/50">
                        <span className="font-bold text-slate-700">{sub.subject}</span>
                        <div className="flex gap-12 font-mono items-center">
                          <span className="text-slate-500 w-8 text-right font-bold">{sub.score}%</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border text-center w-24 ${badgeClass}`}>
                            Grade {sub.grade}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verification Footer Disclaimer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-[10px] text-slate-400 leading-normal">
                <p className="flex-1">
                  * Ripoti hii imetolewa na kuhakikiwa kielektroniki kutoka kwenye Hifadhi ya Takwimu ya Lupanulla Elimu Hub. 
                  Hakuna saini ya mkono inayohitajika.
                </p>
                <div className="flex gap-2 self-end shrink-0">
                  <button 
                    onClick={() => {
                      setSelectedResultForModal(checkedResult);
                      setIsValidationModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <ShieldCheck size={12} />
                    Hakiki (Validate)
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer size={12} />
                    Chapa (Print)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic AdSense Integration Area inside Verification section */}
        {adsenseActive && (
          <div className="pt-2">
            <GoogleAdSenseUnit 
              slot="mitihani-results-banner" 
              adFormat="horizontal" 
              className="shadow-sm border-indigo-200 bg-indigo-50/5" 
            />
          </div>
        )}
      </section>

      {/* ── NEW: Maktaba Kuu ya Past Papers za NECTA (Verified & Database Driven) ── */}
      <section id="necta-past-papers-center" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-500/15 text-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-400/30">
              <BookOpen size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-black text-white text-base uppercase tracking-tight">Maktaba ya Past Papers za NECTA (Iliyohakikiwa)</h2>
              <p className="text-xs text-slate-300">Tafuta na upakue mitihani yote halisi ya kitaifa iliyohakikiwa na walimu wetu ili kuepuka viungo vilivyoharibika.</p>
            </div>
          </div>
          <span className="self-start sm:self-auto bg-emerald-500/10 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400 animate-pulse" />
            Maktaba Iliyohakikiwa Active
          </span>
        </div>

        {/* Wizard step selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Step 1: Select Level */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Hatua ya 1: Chagua Ngazi ya Elimu</span>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {NECTA_LEVELS.map((lvl) => {
                const isActive = nectaWizardLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setNectaWizardLevel(lvl.id);
                      // Default to the first subject of that level to keep state valid
                      const subs = NECTA_SUBJECTS[lvl.id] || [];
                      if (subs.length > 0) {
                        setNectaWizardSubject(subs[0].id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/45 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs uppercase">{lvl.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{lvl.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Subject */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Hatua ya 2: Chagua Somo</span>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {(NECTA_SUBJECTS[nectaWizardLevel] || []).map((sub) => {
                const isActive = nectaWizardSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setNectaWizardSubject(sub.id)}
                    className={`text-center p-2.5 rounded-xl border text-xs font-bold transition-all line-clamp-2 min-h-[46px] flex items-center justify-center cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow shadow-cyan-500/10' 
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/30'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Select Year */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Hatua ya 3: Chagua Mwaka wa Mtihani</span>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {NECTA_YEARS.map((yr) => {
                const isActive = nectaWizardYear === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setNectaWizardYear(yr)}
                    className={`py-2 px-1 rounded-lg border text-[11px] font-mono font-bold transition-all text-center cursor-pointer ${
                      isActive 
                        ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md font-black' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/30'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Selected past paper detail card */}
        {nectaWizardLevel && nectaWizardSubject && nectaWizardYear && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 mt-2">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 animate-fade-in">
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-400 animate-pulse" />
                    {matchingDoc ? 'ILIYOHAKIKIWA (VERIFIED)' : 'LUPANULLA DOCUMENT CLOUD'}
                  </span>
                  <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded">
                    MWAKA {nectaWizardYear}
                  </span>
                </div>
                <h3 className="font-sans font-black text-white text-base sm:text-lg leading-tight">
                  {matchingDoc ? matchingDoc.title : `NECTA ${currentSubjectLabel} - ${currentLevelLabel} Past Paper (${nectaWizardYear})`}
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  {matchingDoc ? matchingDoc.description : `Soma na upakue mtihani rasmi wa kitaifa wa NECTA wa mwaka ${nectaWizardYear} kwa somo la ${currentSubjectLabel}. Karatasi hii ipo kwenye mfumo wa Lupanulla Document Cloud na inakuwezesha kujipima uwezo wako.`}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-mono">
                  <span>Matazamaji: {matchingDoc ? matchingDoc.views.toLocaleString() : '1,500+'}</span>
                  <span>•</span>
                  <span>Saizi: {matchingDoc ? `${matchingDoc.sizeKB} KB` : '1.2 MB'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    let docToPreview: DocumentMetadata;
                    if (matchingDoc) {
                      docToPreview = matchingDoc;
                    } else {
                      const levelName = nectaWizardLevel === 'std4' ? 'Darasa la 4' :
                                        nectaWizardLevel === 'std7' ? 'Darasa la 7' :
                                        nectaWizardLevel === 'f2' ? 'Kidato cha 2' :
                                        nectaWizardLevel === 'f4' ? 'Kidato cha 4' : 'Kidato cha 6';
                      const label = `NECTA ${currentSubjectLabel} (${levelName}) - ${nectaWizardYear}`;
                      docToPreview = {
                        id: `necta-${nectaWizardLevel}-${nectaWizardSubject}-${nectaWizardYear}`,
                        title: label,
                        description: `Soma na upakue mtihani rasmi wa kitaifa wa NECTA wa mwaka ${nectaWizardYear} kwa somo la ${currentSubjectLabel}. Karatasi hii ipo kwenye mfumo wa Lupanulla Document Cloud na inakuwezesha kujipima uwezo wako.`,
                        category: 'NECTA',
                        type: 'NECTA',
                        tags: ['NECTA', nectaWizardLevel, nectaWizardSubject, String(nectaWizardYear)],
                        year: parseInt(nectaWizardYear, 10),
                        views: 1540,
                        downloadsCount: 380,
                        sizeKB: 1250,
                        createdAt: Date.now(),
                        status: 'approved'
                      } as DocumentMetadata;
                    }
                    handleDocClick(docToPreview);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
                >
                  <Eye size={15} />
                  Soma Mtandaoni
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let downloadUrl = '';
                    let downloadTitle = `NECTA ${nectaWizardSubject.toUpperCase()} (${nectaWizardLevel}) - ${nectaWizardYear}`;
                    if (matchingDoc && matchingDoc.driveUrl) {
                      const formatted = formatGoogleDriveUrls(matchingDoc.driveUrl);
                      downloadUrl = formatted.directUrl || formatted.embedUrl || matchingDoc.driveUrl;
                      downloadTitle = matchingDoc.title;
                    } else {
                      const customDrive = localStorage.getItem('lupa_drive_necta-' + nectaWizardLevel + '-' + nectaWizardSubject + '-' + nectaWizardYear);
                      if (customDrive) {
                        const formatted = formatGoogleDriveUrls(customDrive);
                        downloadUrl = formatted.directUrl || customDrive;
                      }
                    }

                    if (!downloadUrl) {
                      const userLink = prompt(`Ingiza au weka Kiungo cha Google Drive cha Mtihani wa NECTA ${nectaWizardSubject.toUpperCase()} (${nectaWizardYear}):`, `https://drive.google.com/file/d/...`);
                      if (userLink && userLink.trim()) {
                        const formatted = formatGoogleDriveUrls(userLink.trim());
                        downloadUrl = formatted.directUrl || userLink.trim();
                        localStorage.setItem('lupa_drive_necta-' + nectaWizardLevel + '-' + nectaWizardSubject + '-' + nectaWizardYear, userLink.trim());
                      } else {
                        return;
                      }
                    }

                    window.dispatchEvent(new CustomEvent('start-pdf-download', {
                      detail: { 
                        title: downloadTitle, 
                        url: downloadUrl 
                      }
                    }));
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
                >
                  <Download size={15} />
                  Pakua PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTimer(true);
                    alert(`⏱️ Kipima muda kimeanzishwa! Una dakika 180 (Masaa 3) kufanya mtihani huu. Unaweza kuona saa inayorudi nyuma juu ya skrini yako sasa.`);
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
                >
                  <Clock size={15} />
                  Zoezi la Saa (Timer)
                </button>
              </div>
            </div>

            {/* Verification & Request section at the bottom */}
            {!matchingDoc && (
              <div className="border-t border-slate-800/80 pt-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-[10.5px] text-slate-400 font-semibold max-w-xl">
                  💡 <strong className="text-slate-300">Ukaguzi wa Ubora:</strong> Karatasi hii imepakiwa moja kwa moja kutoka kwenye Lupanulla Public Index. Unaweza kuomba jopo la walimu wetu kuikagua, kuisahihisha, au kuweka majibu yake (marking scheme) kwenye mfumo wetu.
                </p>
                {isPaperAlreadyRequested ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                    ✓ Ombi la Uhakiki Limepokelewa
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPaper}
                    disabled={isRequesting}
                    className="text-[10px] bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 hover:text-amber-200 border border-amber-400/20 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                  >
                    {isRequesting ? 'Inatuma...' : 'Omba Uhakiki na Majibu'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Trending & Popular Past Papers Carousel Slider ── */}
      <section className="space-y-4">
        <h2 className="font-display font-extrabold text-lg text-slate-900 uppercase flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-600" />
          Mitihani Maarufu Wiki Hii
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingPapers.map((paper) => {
            const docAccent = paper.accent || 'border-cyan-300';
            return (
              <div 
                key={paper.id}
                onClick={() => handleDocClick(paper)}
                className={`bg-white border-l-4 ${docAccent} border border-slate-200 p-4 rounded-3xl shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer flex gap-4 min-h-[11rem] h-auto group`}
              >
                {/* Beautiful Book Cover Thumbnail */}
                {renderBookCover(paper)}

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{paper.type || 'NECTA'} &bull; {paper.year || 2023}</span>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px]">{paper.category}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors">
                        {paper.title}
                      </h3>
                      <p className="text-slate-500 text-[10.5px] line-clamp-2 leading-normal mt-0.5 font-medium">
                        {paper.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-bold mt-1.5">
                    <span>{paper.views} views</span>
                    <span className="text-cyan-600 flex items-center gap-0.5 font-extrabold">Fungua &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Advanced Search & Filter Workspace ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        
        {/* Row 1: Big Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Tafuta mtihani kwa mada, somo, namba ya past paper, mwaka, au neno lolote..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 pt-1">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aina ya Mtihani</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Aina Zote</option>
              <option value="NECTA">NECTA National</option>
              <option value="Mock">Mock za Mikoa</option>
              <option value="Terminal">Terminal &amp; Exams</option>
              <option value="Majaribio">Majaribio ya Mada</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngazi ya Shule</label>
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Ngazi Zote</option>
              <option value="Primary">Shule ya Msingi</option>
              <option value="O-Level">O-Level (F1-F4)</option>
              <option value="A-Level">A-Level (F5-F6)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Somo (Subject)</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Masomo Yote</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Kiswahili">Kiswahili</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mwaka (Year)</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="">Miaka Yote</option>
              {Array.from({ length: 2026 - 1994 + 1 }, (_, i) => 2026 - i).map(yr => (
                <option key={yr} value={yr.toString()}>{yr}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Panga kwa (Sort)</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
            >
              <option value="subjectYear">Somo na Mwaka (A-Z, 2026-2010)</option>
              <option value="newest">Mpya Zaidi</option>
              <option value="views">Kusomwa Sana (Views)</option>
              <option value="alphabetical">Herufi (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* ── Main Catalog Document Grid ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
          <p>Kupata mitihani {sortedDocs.length} kulingana na vichujio vyako</p>
          <button 
            onClick={() => {
              setSelectedType('');
              setSelectedLevel('');
              setSelectedSubject('');
              setSelectedYear('');
              onSearchChange('');
            }}
            className="text-cyan-600 hover:underline"
          >
            Futa Vichujio Vyote
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-cyan-600">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inasoma Maktaba ya Nyaraka...</p>
          </div>
        ) : sortedDocs.length > 0 ? (
          sortBy === 'subjectYear' ? (
            <div className="space-y-10">
              {Object.entries(
                sortedDocs.reduce((acc, doc) => {
                  const sub = getDocSubject(doc);
                  if (!acc[sub]) acc[sub] = [];
                  acc[sub].push(doc);
                  return acc;
                }, {} as Record<string, DocumentMetadata[]>)
              ).map(([subject, docs]) => (
                <div key={subject} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <BookOpen size={18} className="text-cyan-600" />
                    <h3 className="font-display font-extrabold text-slate-950 text-base uppercase tracking-tight">
                      {subject} <span className="text-slate-400 font-mono text-xs font-normal">({docs.length} {docs.length === 1 ? 'mtihani' : 'mitihani'})</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map((doc) => {
                      const isBookmarked = bookmarkedIds.includes(doc.id);
                      const docAccent = doc.accent || 'border-cyan-200';
                      const fileKB = doc.sizeKB || 150;
                      const typeLabel = doc.type || (doc.tags.includes('NECTA') ? 'NECTA' : 'Mock');
                      const isPremium = doc.tags.includes('premium') || doc.tags.includes('PRO');

                      return (
                        <div 
                          key={doc.id}
                          onClick={() => handleDocClick(doc)}
                          className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer flex gap-4 min-h-[11rem] h-auto hover:scale-[1.01] group"
                        >
                          {/* Beautiful Book Cover Thumbnail */}
                          {renderBookCover(doc)}

                          {/* Details / Info on Right */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start gap-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {isPremium && (
                                    <span className="bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Crown size={10} /> PRO
                                    </span>
                                  )}
                                  {doc.isForSale ? (
                                    <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                      TSh {(doc.price || 0).toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                      BURE
                                    </span>
                                  )}
                                </div>
                                
                                <button 
                                  onClick={(e) => handleToggleBookmark(doc, e)}
                                  className={`p-1.5 rounded-lg border transition-all shrink-0 ${isBookmarked ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'}`}
                                >
                                  <Bookmark size={13} className={isBookmarked ? 'fill-current' : ''} />
                                </button>
                              </div>

                              <div>
                                <h3 className="font-bold text-slate-950 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors">
                                  {doc.title}
                                </h3>
                                <p className="text-slate-500 text-[10.5px] line-clamp-2 leading-normal mt-0.5 font-medium">
                                  {doc.description}
                                </p>
                                <div className="text-[9.5px] text-slate-400 font-bold flex items-center gap-1 pt-1.5">
                                  <User size={9} className="text-slate-400 shrink-0" />
                                  <span className="truncate">Mpakiaji: <span className="text-slate-600 font-extrabold">{doc.uploadedByName || 'Mwanachama'}</span></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-bold mt-1.5">
                              <span className="flex items-center gap-0.5 text-[9px]">
                                {fileKB} KB
                              </span>
                              <span className="text-cyan-600 font-extrabold inline-flex items-center gap-0.5 hover:underline">
                                SOMA &rarr;
                              </span>
                            </div>

                            {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
                              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 mt-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenEditModal(doc)}
                                  className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit size={10} /> Hariri
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={10} /> Futa
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDocs.map((doc) => {
                const isBookmarked = bookmarkedIds.includes(doc.id);
                const docAccent = doc.accent || 'border-cyan-200';
                const fileKB = doc.sizeKB || 150;
                const typeLabel = doc.type || (doc.tags.includes('NECTA') ? 'NECTA' : 'Mock');
                const isPremium = doc.tags.includes('premium') || doc.tags.includes('PRO');

                return (
                  <div 
                    key={doc.id}
                    onClick={() => handleDocClick(doc)}
                    className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer flex gap-4 min-h-[11rem] h-auto hover:scale-[1.01] group"
                  >
                    {/* Beautiful Book Cover Thumbnail */}
                    {renderBookCover(doc)}

                    {/* Details / Info on Right */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isPremium && (
                              <span className="bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Crown size={10} /> PRO
                              </span>
                            )}
                            {doc.isForSale ? (
                              <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                TSh {(doc.price || 0).toLocaleString()}
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                BURE
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => handleToggleBookmark(doc, e)}
                            className={`p-1.5 rounded-lg border transition-all shrink-0 ${isBookmarked ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'}`}
                          >
                            <Bookmark size={13} className={isBookmarked ? 'fill-current' : ''} />
                          </button>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-slate-500 text-[10.5px] line-clamp-2 leading-normal mt-0.5 font-medium">
                            {doc.description}
                          </p>
                          <div className="text-[9.5px] text-slate-400 font-bold flex items-center gap-1 pt-1.5">
                            <User size={9} className="text-slate-400 shrink-0" />
                            <span className="truncate">Mpakiaji: <span className="text-slate-600 font-extrabold">{doc.uploadedByName || 'Mwanachama'}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-bold mt-1.5">
                        <span className="flex items-center gap-0.5 text-[9px]">
                          {fileKB} KB
                        </span>
                        <span className="text-cyan-600 font-extrabold inline-flex items-center gap-0.5 hover:underline">
                          SOMA &rarr;
                        </span>
                      </div>

                      {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
                        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 mt-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditModal(doc)}
                            className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit size={10} /> Hariri
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} /> Futa
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center gap-3 py-16">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-1">
              <FolderOpen size={28} className="stroke-[1.5]" />
            </div>
            <h3 className="font-display font-extrabold text-slate-900 text-sm uppercase">Hakuna Karatasi Iliyopatikana</h3>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed font-medium">
              Sikuweza kupata past papers au mitihani yoyote inayolingana na vichujio vyako vya sasa. Tafadhali jaribu kufuta au kubadilisha masharti ya utafutaji.
            </p>
            <button 
              onClick={() => {
                setSelectedType('');
                setSelectedLevel('');
                setSelectedSubject('');
                setSelectedYear('');
                onSearchChange('');
              }}
              className="mt-2 py-2 px-4 text-xs font-bold bg-slate-950 text-white rounded-xl"
            >
              FUTA VICHUJIO VYOTE
            </button>
          </div>
        )}
      </div>

      {/* ── Footer Copyright ── */}
      <footer className="pt-10 pb-6 border-t border-slate-200 text-center space-y-2">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          © 2026 Lupanulla Foundation. Haki miliki zote zimehifadhiwa na kulindwa.
        </p>
        <p className="text-[9px] text-slate-300 italic max-w-md mx-auto">
          Maudhui haya ya mitihani yanatolewa kwa madhumuni ya kitaaluma pekee kusaidia wanafunzi wa Kitanzania katika maandalizi yao ya mitihani.
        </p>
      </footer>

      <MatokeoValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        result={selectedResultForModal}
      />

      {/* PAID DOCUMENT PURCHASE MODAL OVERLAY */}
      {showPurchaseModal && purchasingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in animate-duration-150">
          <div className="bg-white text-slate-800 w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative space-y-6 border border-slate-100">
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-all cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-widest border border-amber-200">
                <Sparkles size={10} /> Nyenzo Inauzwa
              </span>
              <h3 className="font-sans font-extrabold text-slate-900 text-base sm:text-lg">
                Lipia Kupata Nyaraka Hii
              </h3>
              <p className="text-slate-500 font-semibold text-xs leading-relaxed max-w-sm mx-auto">
                Nyaraka <span className="text-emerald-600 font-extrabold">"{purchasingDoc.title}"</span> imeandaliwa na mwandishi <span className="text-slate-700 font-extrabold">{purchasingDoc.uploadedByName || 'Mwanachama'}</span> na inauzwa kwa <span className="text-emerald-600 font-black">TSh {(purchasingDoc.price || 0).toLocaleString()}</span>.
              </p>
            </div>

            <form onSubmit={handleConfirmPurchase} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jina Lako Kamili</label>
                <input 
                  type="text" 
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Mfano: Juma Ally"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Namba yako ya Simu ya Malipo</label>
                <input 
                  type="tel" 
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Mfano: 0712345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mtandao wa Malipo</label>
                <select 
                  value={buyerNetwork}
                  onChange={(e) => setBuyerNetwork(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                >
                  <option value="M-Pesa">Vodacom M-Pesa</option>
                  <option value="Tigo Pesa">Tigo Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Halopesa">Halotel Halopesa</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 leading-relaxed space-y-1 font-semibold">
                <p className="font-extrabold text-slate-700">📌 Jinsi ya kukamilisha:</p>
                <p>1. Bonyeza "Agiza Sasa hapa chini" ili kuhifadhi agizo lako.</p>
                <p>2. Utaelekezwa moja kwa moja kwenye WhatsApp ya kituo cha huduma Lupanulla.</p>
                <p>3. Tuma ujumbe huo ili upokee maelekezo ya jinsi ya kulipia kwa urahisi na kupokea nyaraka yako.</p>
              </div>

              <button
                type="submit"
                disabled={orderSaving}
                className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {orderSaving ? 'Inatengeneza Agizo...' : `Agiza Sasa hivi (TSh ${(purchasingDoc.price || 0).toLocaleString()})`}
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin Add/Edit Exam Modal ── */}
      {(isAddExamModalOpen || isEditExamModalOpen) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-950 p-6 text-white flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-display font-extrabold text-lg uppercase tracking-tight">
                  {editingExam ? 'Hariri Mtihani' : 'Ongeza Mtihani Mpya'}
                </h3>
                <p className="text-emerald-100 text-xs">Jaza fomu hapa chini ili kuweka mtihani kwenye mfumo</p>
              </div>
              <button 
                onClick={() => {
                  setIsAddExamModalOpen(false);
                  setIsEditExamModalOpen(false);
                }}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSaveExam} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {/* Title */}
                <div className="md:col-span-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kichwa cha Mtihani (Title) *</label>
                    <button
                      type="button"
                      onClick={() => handleAutoDetectExam()}
                      disabled={examAutoDetecting}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer disabled:opacity-50"
                    >
                      {examAutoDetecting ? <Loader size={11} className="animate-spin" /> : <Wand2 size={11} />}
                      <span>Utambuzi wa Moja kwa Moja (Auto-Detect)</span>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Mfano: NECTA Physics Form IV 2024"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maelezo Mafupi (Description)</label>
                  <textarea 
                    value={examDescription}
                    onChange={(e) => setExamDescription(e.target.value)}
                    placeholder="Maelezo kidogo kuhusu mtihani huu..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Somo (Subject)</label>
                  <select 
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Basic Mathematics">Basic Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Geography">Geography</option>
                    <option value="History">History</option>
                    <option value="Civics">Civics</option>
                    <option value="English Language">English Language</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Bookkeeping">Bookkeeping</option>
                    <option value="General Studies">General Studies</option>
                    <option value="Advanced Mathematics">Advanced Mathematics</option>
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mwaka (Year)</label>
                  <input 
                    type="number" 
                    required
                    value={examYear}
                    onChange={(e) => setExamYear(Number(e.target.value))}
                    placeholder="2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Education Level */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kiwango cha Elimu (Level)</label>
                  <select 
                    value={examLevel}
                    onChange={(e) => setExamLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Primary">Primary (Msingi)</option>
                    <option value="O-Level">O-Level (Sekondari Form 1-4)</option>
                    <option value="A-Level">A-Level (Sekondari Form 5-6)</option>
                  </select>
                </div>

                {/* Class Level */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Darasa (Class Level)</label>
                  <select 
                    value={examClassLevel}
                    onChange={(e) => setExamClassLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                    <option value="Form 5">Form 5</option>
                    <option value="Form 6">Form 6</option>
                    <option value="Standard 7">Standard 7</option>
                    <option value="Standard 4">Standard 4</option>
                  </select>
                </div>

                {/* Google Drive PDF URL */}
                <div className="md:col-span-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Google Drive, YouTube au Link ya PDF (URL) *</label>
                    <button
                      type="button"
                      onClick={() => handleAutoDetectExam(examDriveUrl)}
                      disabled={!examDriveUrl || examAutoDetecting}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer disabled:opacity-50"
                    >
                      {examAutoDetecting ? <Loader size={11} className="animate-spin" /> : <Wand2 size={11} />}
                      <span>Utambuzi wa Kiungo (Auto-Detect Link)</span>
                    </button>
                  </div>
                  <input 
                    type="url" 
                    required
                    value={examDriveUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExamDriveUrl(val);
                      if (val && val.length > 15) {
                        handleAutoDetectExam(val);
                      }
                    }}
                    placeholder="https://drive.google.com/file/d/... au https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kundi la Mtihani (Category)</label>
                  <select 
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Past Papers">Past Papers</option>
                    <option value="Mock Exams">Mock Exams</option>
                    <option value="Terminal Exams">Terminal Exams</option>
                    <option value="Mid-Term Exams">Mid-Term Exams</option>
                    <option value="Monthly Tests">Monthly Tests</option>
                  </select>
                </div>

                {/* Paper Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Namba ya Karatasi (Paper No)</label>
                  <input 
                    type="text" 
                    value={examPaperNo}
                    onChange={(e) => setExamPaperNo(e.target.value)}
                    placeholder="Paper 1, Paper 2, Practical"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lebo (Tags) - Tenganisha kwa mkato</label>
                  <input 
                    type="text" 
                    value={examTagsInput}
                    onChange={(e) => setExamTagsInput(e.target.value)}
                    placeholder="NECTA, Past Paper, Fizikia, 2024"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Is For Sale */}
                <div className="md:col-span-2 flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="examIsForSale"
                    checked={examIsForSale}
                    onChange={(e) => setExamIsForSale(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="examIsForSale" className="text-xs font-extrabold text-slate-700 cursor-pointer select-none">
                    Mtihani huu unahitaji malipo ili kuusoma? (Kuuza)
                  </label>
                </div>

                {/* Price (if for sale) */}
                {examIsForSale && (
                  <div className="md:col-span-2 space-y-1 animate-fade-in">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bei ya Mtihani (TSh) *</label>
                    <input 
                      type="number" 
                      required={examIsForSale}
                      value={examPrice}
                      onChange={(e) => setExamPrice(Number(e.target.value))}
                      placeholder="Bei kwa Shilingi za Kitanzania (Mfano: 500)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddExamModalOpen(false);
                    setIsEditExamModalOpen(false);
                  }}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={isAdminActionLoading}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAdminActionLoading ? 'Inahifadhi...' : 'Hifadhi Mtihani'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QUICK VIEW MODAL OVERLAY ── */}
      {quickViewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in animate-duration-150 text-left">
          <div className="bg-white text-slate-800 w-full max-w-5xl h-[90vh] md:h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-slate-100">
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setQuickViewDoc(null)}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 transition-all cursor-pointer p-1.5 rounded-full bg-white/90 hover:bg-slate-100 shadow-sm border border-slate-200"
            >
              <X size={18} />
            </button>

            {/* LEFT SIDE: Preview & Tabs */}
            <div className="w-full md:w-1/2 bg-slate-950 flex flex-col h-[40%] md:h-full border-b md:border-b-0 md:border-r border-slate-800 relative">
              {/* Tab Selector */}
              <div className="flex bg-slate-900 p-1.5 border-b border-slate-800 justify-center items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setQuickViewTab('summary')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    quickViewTab === 'summary' 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen size={13} />
                  Muhtasari wa Maswali
                </button>
                <button
                  type="button"
                  onClick={() => setQuickViewTab('pdf')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    quickViewTab === 'pdf' 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={13} />
                  Soma Karatasi (PDF View)
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-start">
                {quickViewTab === 'summary' ? (
                  <div className="space-y-4 max-w-md mx-auto w-full text-slate-200 py-4">
                    {/* Visual Cover Mini-Preview */}
                    <div className="flex justify-center items-center gap-6 mb-4">
                      {renderBookCover(quickViewDoc)}
                      <div className="space-y-2 text-left">
                        <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-cyan-400/20 uppercase tracking-widest">
                          Muhtasari wa AI
                        </span>
                        <h4 className="font-display font-extrabold text-white text-xs sm:text-sm uppercase tracking-tight leading-tight">
                          {quickViewDoc.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock size={12} className="text-cyan-400" />
                          <span>Masaa 3 ya Mtihani</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Exam Structure Details */}
                    {(() => {
                      const subject = getDocSubject(quickViewDoc).toLowerCase();
                      let isScience = ['physics', 'chemistry', 'biology', 'science', 'mathematics', 'basic-math', 'adv-math'].some(s => subject.includes(s));
                      let sections = [
                        { name: 'Sehemu A (Section A)', desc: 'Maswali 10 ya kuchagua (Multiple Choice) na kujaza nafasi zilizo wazi.', weight: 'Alama 15 (15 Marks)' },
                        { name: 'Sehemu B (Section B)', desc: isScience ? 'Maswali 5 ya kokotoa na majaribio ya kimaabara yenye maelezo mafupi.' : 'Maswali ya insha, uchambuzi wa matukio na ramani za kijiografia.', weight: 'Alama 70 (70 Marks)' },
                        { name: 'Sehemu C (Section C)', desc: isScience ? 'Swali la 1 la uchambuzi wa kina au practical scenario/titration.' : 'Maswali 2 ya insha ya kina kuchagua moja.', weight: 'Alama 15 (15 Marks)' },
                      ];
                      let prepTips = isScience 
                        ? 'Zingatia kukariri formula muhimu, kuchora michoro safi yenye lebo, na kufuata hatua zote za kokotoa alama kamili.'
                        : 'Hakikisha unaelewa vizuri mifano ya kijamii, tarehe za kihistoria, mada za insha na jinsi ya kueleza hoja zako kwa mtiririko mzuri.';
                      
                      let difficulty = 'Kati / Medium';
                      let difficultyBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      if (subject.includes('math') || subject.includes('physics')) {
                        difficulty = 'Ngumu / Hard';
                        difficultyBg = 'bg-red-500/10 text-red-400 border-red-500/20';
                      } else if (subject.includes('kiswahili') || subject.includes('english')) {
                        difficulty = 'Rahisi / Easy';
                        difficultyBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      }

                      return (
                        <div className="space-y-4">
                          {/* Syllabus coverage and difficulty */}
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kiwango cha Ugumu</span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${difficultyBg}`}>
                                {difficulty}
                              </span>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mtaala wa NECTA</span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded-md">
                                <ShieldCheck size={12} /> 100% Sahihi
                              </span>
                            </div>
                          </div>

                          {/* Exam sections breakdown */}
                          <div className="space-y-2.5 text-left">
                            <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Muundo wa Karatasi</h5>
                            {sections.map((sec, idx) => (
                              <div key={idx} className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800/60 flex items-start gap-3">
                                <span className="bg-cyan-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h6 className="font-bold text-xs text-white truncate">{sec.name}</h6>
                                    <span className="text-[10px] font-black text-cyan-400 shrink-0">{sec.weight}</span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-400 leading-normal font-medium">{sec.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Prep Advice */}
                          <div className="p-3 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 space-y-1 text-left">
                            <h6 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles size={11} /> Mwongozo wa Kufaulu (Success Tip)
                            </h6>
                            <p className="text-[10.5px] text-slate-300 leading-relaxed font-medium">
                              {prepTips}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center py-2">
                    {/* Render Real PDF iframe preview */}
                    {(() => {
                      let embedUrl = '';
                      if (quickViewDoc.driveUrl) {
                        const parsedId = extractGoogleDriveId(quickViewDoc.driveUrl);
                        if (parsedId) {
                          embedUrl = `https://drive.google.com/file/d/${parsedId}/preview`;
                        } else {
                          embedUrl = quickViewDoc.driveUrl;
                        }
                      } else {
                        const downloadInfo = getDownloadInfo(quickViewDoc);
                        embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(downloadInfo.url)}&embedded=true`;
                      }

                      return (
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col relative min-h-[250px] md:min-h-0">
                          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-extrabold z-10 flex items-center gap-1 border border-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            Hakiki PDF ya Mtandaoni
                          </div>
                          <iframe 
                            src={embedUrl} 
                            className="w-full h-full border-0 rounded-2xl bg-slate-900" 
                            title="PDF Preview"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Details & Actions */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col h-[60%] md:h-full justify-between overflow-y-auto">
              <div className="space-y-6">
                {/* Header Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black px-2.5 py-1 rounded-lg border border-cyan-200 uppercase tracking-widest">
                    {quickViewDoc.type || 'NECTA'}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                    Mwaka {quickViewDoc.year || 2024}
                  </span>
                  {quickViewDoc.tags?.includes('premium') && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-0.5">
                      <Crown size={11} /> PRO
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2 text-left">
                  <h3 className="font-sans font-black text-slate-950 text-base sm:text-lg tracking-tight leading-tight">
                    {quickViewDoc.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                    {quickViewDoc.description || `Soma na upakue mtihani rasmi wa kitaifa wa NECTA wa mwaka {quickViewDoc.year} kwa somo hili. Karatasi hii ipo kwenye mfumo wa Lupanulla Document Cloud na inakuwezesha kujipima uwezo wako.`}
                  </p>
                </div>

                {/* Stats block with Rating and Views */}
                <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Watazamaji</span>
                    <span className="text-slate-900 font-black text-xs sm:text-sm">{quickViewDoc.views?.toLocaleString() || '1,500'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ukubwa</span>
                    <span className="text-slate-900 font-black text-xs sm:text-sm">{(quickViewDoc.sizeKB ? (quickViewDoc.sizeKB / 1024).toFixed(1) : '1.2')} MB</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kiwango</span>
                    <span className="text-amber-500 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-0.5">
                      ★ 4.9 <span className="text-slate-400 text-[10px] font-bold">(85)</span>
                    </span>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-left">
                  <div className="space-y-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Somo</span>
                    <span className="text-slate-900 text-xs font-extrabold">{getDocSubject(quickViewDoc)}</span>
                  </div>
                  <div className="space-y-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kundi</span>
                    <span className="text-slate-900 text-xs font-extrabold">{quickViewDoc.category || 'Past Papers'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside footer-like space */}
              <div className="space-y-3 pt-6 border-t border-slate-100 mt-6 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Primary: Soma kwa Skrini Nzima */}
                  <button
                    type="button"
                    onClick={() => {
                      setQuickViewDoc(null); // Close preview modal
                      // Trigger direct check or navigate
                      if (!canAccessDirectly(quickViewDoc)) {
                        setPurchasingDoc(quickViewDoc);
                        setBuyerName(userProfile?.name || '');
                        setBuyerPhone(userProfile?.phone || '');
                        setBuyerNetwork('M-Pesa');
                        setShowPurchaseModal(true);
                      } else {
                        onNavigate('reader', quickViewDoc.id);
                      }
                    }}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <Eye size={16} />
                    Soma Skrini Nzima
                  </button>

                  {/* Secondary: Pakua PDF */}
                  <button
                    type="button"
                    onClick={() => {
                      const downloadInfo = getDownloadInfo(quickViewDoc);
                      // Dispatch the actual download event
                      window.dispatchEvent(new CustomEvent('start-pdf-download', {
                        detail: { 
                          title: downloadInfo.title, 
                          url: downloadInfo.url 
                        }
                      }));
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <Download size={16} />
                    Pakua PDF Bure
                  </button>
                </div>

                {/* Additional Option: Zoezi la Saa (Practice Timer) */}
                <button
                  type="button"
                  onClick={() => {
                    setQuickViewDoc(null);
                    setShowTimer(true);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock size={14} className="text-slate-500" />
                  Anza Zoezi la Saa 3 (Simulated Exam)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
