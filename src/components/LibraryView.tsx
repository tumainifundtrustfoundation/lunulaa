import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Search, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight,
  Download,
  Eye,
  Share2,
  Lock,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Folder,
  FileText,
  Calendar,
  MapPin,
  X,
  RefreshCw,
  Clock,
  Bookmark,
  User
} from 'lucide-react';
import { fetchDocuments, fetchLibraryConfig, incrementDocumentViews, incrementDocumentDownloads, LibraryConfig, DEFAULT_LIBRARY_CONFIG, toggleBookmark, fetchUserBookmarks, saveOrder } from '../firebase';
import { DocumentMetadata, UserProfile, UserBookmark } from '../types';

interface LibraryViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: UserProfile | null;
}

export default function LibraryView({ onNavigate, userProfile }: LibraryViewProps) {
  // Configs and Data State
  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig>(DEFAULT_LIBRARY_CONFIG);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDocType, setSelectedDocType] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Premium Modal State
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [modalBookTitle, setModalBookTitle] = useState<string>('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Purchase/Order State for Paid Documents
  const [purchasingDoc, setPurchasingDoc] = useState<DocumentMetadata | null>(null);
  const [purchaseAction, setPurchaseAction] = useState<'read' | 'download'>('read');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerNetwork, setBuyerNetwork] = useState('M-Pesa');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Unique Years and Regions dynamically gathered from documents list
  const [dynamicYears, setDynamicYears] = useState<string[]>([]);
  const [dynamicRegions, setDynamicRegions] = useState<string[]>([]);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const config = await fetchLibraryConfig();
      setLibraryConfig(config);

      const docs = await fetchDocuments({ status: 'approved' });
      setDocuments(docs);

      // Extract unique years and regions dynamically from existing records
      const years = Array.from(new Set(docs.map(d => String(d.year || '')).filter(Boolean))).sort((a, b) => b.localeCompare(a));
      const regions = Array.from(new Set(docs.map(d => String(d.accent || '')).filter(Boolean))).sort(); // Using accent/other fields or preset list
      
      setDynamicYears(years);
      setDynamicRegions(regions);
    } catch (err) {
      console.error('Error loading library data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBookmarks = async () => {
    if (!userProfile?.uid) {
      const stored = localStorage.getItem('lupa_bookmarks');
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
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

  useEffect(() => {
    loadData();
    loadBookmarks();
  }, [userProfile?.uid]);

  const handleToggleBookmark = async (doc: DocumentMetadata, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userProfile?.uid) {
      // Guest local storage
      let updated: string[];
      if (bookmarkedIds.includes(doc.id)) {
        updated = bookmarkedIds.filter(id => id !== doc.id);
        showToast(`Imeondolewa kwenye hifadhi ya muda.`);
      } else {
        updated = [...bookmarkedIds, doc.id];
        showToast(`Imehifadhiwa kwenye kivinjari chako!`);
      }
      setBookmarkedIds(updated);
      localStorage.setItem('lupa_bookmarks', JSON.stringify(updated));
      return;
    }

    try {
      const isNowBookmarked = await toggleBookmark(userProfile.uid, {
        id: doc.id,
        type: 'document',
        title: doc.title
      });
      
      if (isNowBookmarked) {
        setBookmarkedIds(prev => [...prev, doc.id]);
        showToast(`Imehifadhiwa kwenye akaunti yako!`);
      } else {
        setBookmarkedIds(prev => prev.filter(id => id !== doc.id));
        showToast(`Imeondolewa kwenye hifadhi.`);
      }
    } catch (e) {
      console.error(e);
      showToast(`Hitilafu imetokea!`);
    }
  };

  const handleShare = (doc: DocumentMetadata) => {
    const shareUrl = `${window.location.origin}/#reader?id=${doc.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast(`Mtawanyiko wa nyaraka "${doc.title}" umenakiliwa!`);
    } else {
      showToast(`Link: ${shareUrl}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const canAccessDirectly = (doc: DocumentMetadata) => {
    if (!doc.isForSale) return true;
    if (userProfile && (doc.uploadedBy === userProfile.uid || userProfile.role === 'admin' || userProfile.role === 'super_admin')) return true;
    return false;
  };

  const handlePurchasePrompt = (doc: DocumentMetadata, action: 'read' | 'download') => {
    setPurchasingDoc(doc);
    setPurchaseAction(action);
    setBuyerName(userProfile?.name || '');
    setBuyerPhone(userProfile?.phone || '');
    setBuyerNetwork('M-Pesa');
    setShowPurchaseModal(true);
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

      showToast(`Agizo limetengenezwa! Unahamishiwa WhatsApp kukamilisha malipo...`);
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

  const handlePreview = async (doc: DocumentMetadata) => {
    if (!canAccessDirectly(doc)) {
      handlePurchasePrompt(doc, 'read');
      return;
    }
    await incrementDocumentViews(doc.id);
    onNavigate('reader', doc.id);
  };

  const handleDownload = async (doc: DocumentMetadata) => {
    if (!canAccessDirectly(doc)) {
      handlePurchasePrompt(doc, 'download');
      return;
    }
    const isBook = doc.type?.toLowerCase() === 'books' || doc.category?.toLowerCase() === 'books' || (doc as any).documentType?.toLowerCase() === 'books';
    const isPremiumUser = userProfile?.subscription === 'premium' || userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

    if (isBook && !isPremiumUser) {
      setModalBookTitle(doc.title);
      setShowPremiumModal(true);
      return;
    }

    // Dispatch start-pdf-download event with progress
    window.dispatchEvent(new CustomEvent('start-pdf-download', {
      detail: { 
        title: doc.title, 
        url: doc.driveUrl 
      }
    }));
    await incrementDocumentDownloads(doc.id);
    
    // Refresh list view counters silently
    setTimeout(() => {
      loadData(true);
    }, 1500);
  };

  // Helper to get beautiful, subject-specific visual colors and placeholders
  const getSubjectColor = (subject: string = '') => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return { bg: 'from-blue-500 to-indigo-600', text: 'text-indigo-600', badgeBg: 'bg-indigo-50 border-indigo-100' };
    if (s.includes('biol') || s.includes('chem') || s.includes('phys') || s.includes('scie')) return { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', badgeBg: 'bg-emerald-50 border-emerald-100' };
    if (s.includes('hist') || s.includes('geog') || s.includes('civi')) return { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600', badgeBg: 'bg-amber-50 border-amber-100' };
    if (s.includes('kisw') || s.includes('engl') || s.includes('lang')) return { bg: 'from-rose-500 to-pink-600', text: 'text-rose-600', badgeBg: 'bg-rose-50 border-rose-100' };
    return { bg: 'from-slate-500 to-gray-600', text: 'text-slate-600', badgeBg: 'bg-slate-50 border-slate-100' };
  };

  // Filtering Logic
  const filteredDocs = documents.filter(doc => {
    // Search Query
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = doc.title?.toLowerCase().includes(searchLower);
    const descMatch = doc.description?.toLowerCase().includes(searchLower);
    const subjectMatch = (doc.subject || doc.category)?.toLowerCase().includes(searchLower);
    const tagsMatch = doc.tags?.some(t => t?.toLowerCase().includes(searchLower));
    
    if (searchQuery && !(titleMatch || descMatch || subjectMatch || tagsMatch)) {
      return false;
    }

    // Education Level Filter (if specified in metadata)
    const docLevel = (doc as any).educationLevel || '';
    if (selectedLevel !== 'All' && docLevel.toLowerCase() !== selectedLevel.toLowerCase()) {
      return false;
    }

    // Class Filter
    const docClass = (doc as any).classLevel || '';
    if (selectedClass !== 'All' && docClass.toLowerCase() !== selectedClass.toLowerCase()) {
      return false;
    }

    // Subject Filter
    const docSubject = doc.subject || doc.category || '';
    if (selectedSubject !== 'All' && docSubject.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }

    // Document Type Filter
    const docType = (doc as any).documentType || doc.type || '';
    if (selectedDocType !== 'All' && docType.toLowerCase() !== selectedDocType.toLowerCase()) {
      return false;
    }

    // Year Filter
    const docYear = String(doc.year || '');
    if (selectedYear !== 'All' && docYear !== selectedYear) {
      return false;
    }

    // Region Filter (using accent/region property)
    const docRegion = (doc as any).region || doc.accent || '';
    if (selectedRegion !== 'All' && docRegion.toLowerCase() !== selectedRegion.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Calculate Paginated Items
  const totalItems = filteredDocs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedClass, selectedSubject, selectedDocType, selectedYear, selectedRegion]);

  return (
    <div id="library-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-slide-in">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-600/10 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles size={11} className="animate-pulse" />
            Maktaba ya Dijitali
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight">
            Maktaba Kuu ya Nyaraka & Vitabu
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
            Gundua na upakue maelezo, vitabu vya kiada, mitihani ya NECTA, mock papers na schemes za kusahihisha zilizopangwa kwa viwango vyote vya elimu.
          </p>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tafuta kwa kichwa, somo, maelezo au maneno kuu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 shadow-inner"
            />
          </div>
          
          {/* Refresh Action */}
          <button 
            onClick={() => loadData(true)} 
            disabled={refreshing}
            className="px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 hover:text-emerald-600 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-600" : ""} />
            {refreshing ? 'Inapakia...' : 'Ondoa vichujio'}
          </button>
        </div>

        {/* Multi-Dimensional Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Education Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Kiwango cha Elimu</label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedClass('All'); // Reset class when level changes
              }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">Ngazi Zote</option>
              {libraryConfig.educationLevels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* 2. Class Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Darasa / Kidato</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">Madarasa Yote</option>
              {libraryConfig.classes
                .filter(cls => {
                  if (selectedLevel === 'All') return true;
                  if (selectedLevel === 'Primary') return cls.toLowerCase().includes('darasa');
                  if (selectedLevel === 'O-Level') return cls.toLowerCase().includes('form 1') || cls.toLowerCase().includes('form 2') || cls.toLowerCase().includes('form 3') || cls.toLowerCase().includes('form 4');
                  if (selectedLevel === 'A-Level') return cls.toLowerCase().includes('form 5') || cls.toLowerCase().includes('form 6');
                  if (selectedLevel === 'Teachers') return cls.toLowerCase().includes('diploma') || cls.toLowerCase().includes('degree') || cls.toLowerCase().includes('grade');
                  return true;
                })
                .map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
            </select>
          </div>

          {/* 3. Subject */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Somo</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">Masomo Yote</option>
              {libraryConfig.subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* 4. Document Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Aina ya Nyaraka</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">Aina Zote</option>
              {libraryConfig.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 5. Year */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Mwaka</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">Miaka Yote</option>
              {Array.from({ length: 2026 - 1994 + 1 }, (_, i) => 2026 - i).map(yr => (
                <option key={yr} value={yr.toString()}>{yr}</option>
              ))}
            </select>
          </div>

          {/* 6. Region */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Mkoa / Eneo</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">Mikoa Yote</option>
              {dynamicRegions.length > 0 ? (
                dynamicRegions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))
              ) : (
                ['Dar es Salaam', 'Arusha', 'Mwanza', 'Kilimanjaro', 'Dodoma', 'Mbeya', 'Tanga', 'Morogoro'].map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* TOTAL COUNT & FILTER CHIPS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs font-bold text-gray-500">
          Nyaraka zilizopatikana: <span className="text-emerald-600 font-extrabold">{totalItems}</span>
        </p>

        {/* Active chips summary */}
        <div className="flex flex-wrap gap-1.5">
          {selectedLevel !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
              Ngazi: {selectedLevel}
              <X size={10} className="cursor-pointer text-emerald-500 hover:text-emerald-700" onClick={() => setSelectedLevel('All')} />
            </span>
          )}
          {selectedClass !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100">
              Darasa: {selectedClass}
              <X size={10} className="cursor-pointer text-indigo-500 hover:text-indigo-700" onClick={() => setSelectedClass('All')} />
            </span>
          )}
          {selectedSubject !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-100">
              Somo: {selectedSubject}
              <X size={10} className="cursor-pointer text-amber-500 hover:text-amber-700" onClick={() => setSelectedSubject('All')} />
            </span>
          )}
          {selectedDocType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded-full border border-rose-100">
              Aina: {selectedDocType}
              <X size={10} className="cursor-pointer text-rose-500 hover:text-rose-700" onClick={() => setSelectedDocType('All')} />
            </span>
          )}
          {selectedYear !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-slate-50 rounded-full border border-slate-100">
              Mwaka: {selectedYear}
              <X size={10} className="cursor-pointer text-slate-500 hover:text-slate-700" onClick={() => setSelectedYear('All')} />
            </span>
          )}
          {selectedRegion !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-teal-700 bg-teal-50 rounded-full border border-teal-100">
              Eneo: {selectedRegion}
              <X size={10} className="cursor-pointer text-teal-500 hover:text-teal-700" onClick={() => setSelectedRegion('All')} />
            </span>
          )}
        </div>
      </div>

      {/* MAIN DOCUMENTS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw size={40} className="animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-gray-500 animate-pulse">Inapakia catalog ya nyaraka kutoka wingu...</p>
        </div>
      ) : paginatedDocs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <BookOpen size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-gray-900 text-base">Hakuna nyaraka zilizopatikana</h3>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              Tafadhali jaribu kurekebisha maneno ya utafutaji au kubadilisha vichujio vingine ili kupata unachotaka.
            </p>
          </div>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedLevel('All');
              setSelectedClass('All');
              setSelectedSubject('All');
              setSelectedDocType('All');
              setSelectedYear('All');
              setSelectedRegion('All');
            }} 
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Futa Vichujio Vyote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedDocs.map((doc) => {
            const docSubject = doc.subject || doc.category || 'General';
            const design = getSubjectColor(docSubject);
            const isPremiumBook = doc.type?.toLowerCase() === 'books' || doc.category?.toLowerCase() === 'books' || (doc as any).documentType?.toLowerCase() === 'books';

            return (
              <div 
                key={doc.id} 
                className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Visual Thumbnail Frame */}
                <div className={`h-40 bg-gradient-to-br ${design.bg} relative flex items-center justify-center p-4 overflow-hidden`}>
                  {/* Dynamic background curves */}
                  <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-900 to-transparent scale-150"></div>
                  
                  {/* Real Image or Icon Display */}
                  {doc.mimeType?.includes('image') || (doc as any).thumbnailUrl ? (
                    <img 
                      src={(doc as any).thumbnailUrl || doc.driveUrl} 
                      alt={doc.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-white text-center space-y-1 relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                        {isPremiumBook ? <BookOpen size={24} /> : <FileText size={24} />}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 mt-1.5">
                        {(doc as any).documentType || doc.type || 'Nyaraka'}
                      </p>
                    </div>
                  )}

                  {/* Level & Class floating Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white bg-slate-950/60 backdrop-blur-sm rounded-md border border-white/10">
                      {(doc as any).educationLevel || 'Kawaida'}
                    </span>
                    {((doc as any).classLevel) && (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-900 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                        {(doc as any).classLevel}
                      </span>
                    )}
                  </div>

                  {/* Year badge */}
                  {doc.year && (
                    <div className="absolute top-3 right-3 z-10 bg-emerald-950/70 border border-emerald-400/20 backdrop-blur-sm rounded-lg p-1.5 flex items-center gap-1 text-[10px] font-extrabold text-emerald-300">
                      <Calendar size={11} />
                      {doc.year}
                    </div>
                  )}

                  {/* Premium Lock visual overlay on book cards */}
                  {isPremiumBook && (
                    <div className="absolute bottom-3 right-3 z-10 bg-amber-400 border border-amber-500 shadow-md text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-black uppercase tracking-wider">
                      <Crown size={10} />
                      PREMIUM
                    </div>
                  )}

                  {/* Price Tag badge */}
                  <div className="absolute bottom-3 left-3 z-10 flex gap-1">
                    {doc.isForSale ? (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 border border-amber-500 rounded-md shadow-md flex items-center gap-0.5">
                        TSh {(doc.price || 0).toLocaleString()}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white bg-emerald-600 border border-emerald-500 rounded-md shadow-md">
                        BURE
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Subject Tag */}
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${design.badgeBg} ${design.text}`}>
                        {docSubject}
                      </span>
                      {((doc as any).region || doc.accent) && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100">
                          <MapPin size={10} />
                          {(doc as any).region || doc.accent}
                        </span>
                      )}
                    </div>

                    {/* Document Title */}
                    <h3 className="font-sans font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 transition-colors">
                      {doc.title}
                    </h3>

                    {/* Brief description */}
                    <p className="text-slate-500 font-semibold text-xs line-clamp-2 leading-relaxed">
                      {doc.description || 'Hakuna maelezo ya ziada yaliyotolewa kwa nyaraka hii.'}
                    </p>

                    {/* Uploader info (Mpakiaji) */}
                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 pt-1">
                      <User size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate">Mpakiaji: <span className="text-slate-600 font-extrabold">{doc.uploadedByName || 'Mwanachama'}</span></span>
                    </div>
                  </div>

                  {/* Metadata and Actions footer */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {(doc.views || 0).toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={12} />
                        {(doc.downloadsCount || 0).toLocaleString()} downloads
                      </span>
                    </div>

                    {/* Actions Group */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="py-2.5 px-2 bg-gray-50 hover:bg-gray-100 hover:text-emerald-700 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm border border-gray-100"
                      >
                        <Eye size={11} />
                        Soma
                      </button>
                      
                      <button
                        onClick={() => handleDownload(doc)}
                        className={`py-2.5 px-2 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm ${
                          isPremiumBook 
                            ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 hover:text-amber-950 border border-amber-400' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                        }`}
                      >
                        <Download size={11} />
                        Pakua
                      </button>

                      <button
                        onClick={(e) => handleToggleBookmark(doc, e)}
                        className={`py-2.5 px-2 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border shadow-sm ${
                          bookmarkedIds.includes(doc.id)
                            ? 'bg-amber-50 border-amber-100 text-amber-600'
                            : 'bg-gray-50 border-gray-100 text-slate-700 hover:text-emerald-700'
                        }`}
                      >
                        <Bookmark size={11} fill={bookmarkedIds.includes(doc.id) ? "currentColor" : "none"} />
                        {bookmarkedIds.includes(doc.id) ? 'Imehifadhiwa' : 'Hifadhi'}
                      </button>

                      <button
                        onClick={() => handleShare(doc)}
                        className="py-2.5 px-2 bg-gray-50 hover:bg-gray-100 hover:text-indigo-700 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-gray-100 shadow-sm"
                      >
                        <Share2 size={11} />
                        Gawa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLIENT SIDE PAGINATION CONTROL */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNo => (
              <button
                key={pageNo}
                onClick={() => setCurrentPage(pageNo)}
                className={`w-9 h-9 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                  currentPage === pageNo 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNo}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* PREMIUM UPGRADE MODAL OVERLAY */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-amber-400/30 text-white w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative space-y-6">
            <button 
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all cursor-pointer p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>

            {/* Glowing Aura Decoration */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 opacity-10 blur-xl pointer-events-none"></div>

            {/* Icon */}
            <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 rounded-full flex items-center justify-center shadow-xl">
              <Crown size={32} className="animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-950 border border-amber-400 rounded-full flex items-center justify-center">
                <Lock size={12} className="text-amber-400" />
              </div>
            </div>

            {/* Info details */}
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest border border-amber-400/20">
                <Sparkles size={10} className="text-amber-400" />
                LUPANULLA PREMIUM REQUIRED
              </span>
              <h3 className="font-sans font-extrabold text-white text-base sm:text-lg">
                Fungua Kitabu hiki cha Premium
              </h3>
              <p className="text-slate-300 font-semibold text-xs leading-relaxed max-w-sm mx-auto">
                Kitabu <span className="text-amber-300 font-extrabold">"{modalBookTitle}"</span> ni cha Lupanulla Premium pekee. Jiunge sasa ili kupata vitabu vyote vya kiada, vya ziada na notes zote bila vikomo.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2 text-center">
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  onNavigate('premium');
                }}
                className="w-full py-3 px-5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                Jiunge na Premium Sasa
                <ArrowRight size={14} />
              </button>
              
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Gharama nafuu ya TZS 3,000 tu kwa mwezi!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAID DOCUMENT PURCHASE MODAL OVERLAY */}
      {showPurchaseModal && purchasingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in">
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

    </div>
  );
}
