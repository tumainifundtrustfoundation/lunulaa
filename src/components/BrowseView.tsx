import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Eye, 
  Clock, 
  Star, 
  ArrowRight, 
  FolderOpen, 
  User,
  CheckCircle,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DocumentMetadata, CATEGORIES } from '../types';
import { fetchDocuments } from '../firebase';

interface BrowseViewProps {
  onNavigate: (view: string, id?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userProfile: any;
}

export default function BrowseView({
  onNavigate,
  searchQuery,
  onSearchChange,
  userProfile
}: BrowseViewProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllDocuments();
  }, []);

  const loadAllDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch only approved documents for general browse
      const docs = await fetchDocuments({ status: 'approved' });
      // Sort by newest by default
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError('Imeshindwa kupakia maktaba ya nyaraka. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents by category, search query, or tag
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFormatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div id="browse-view" className="space-y-8 animate-fade-in">
      {/* Banner / Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            Maktaba Kuu ya ScribdShare
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight leading-tight text-white">
            Soma na ushiriki <span className="font-serif italic font-medium text-indigo-300">nyaraka</span> za kisomo popote ulipo.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Gundua maelfu ya vitabu vya mazoezi, notes za shule, miongozo ya walimu, na makala za kimasomo kutoka kote nchini. Inafanya kazi moja kwa moja na Google Drive na Firestore.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('upload')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
            >
              Pakia Nyaraka Sasa
            </button>
            <button
              onClick={() => setSelectedCategory('')}
              className="bg-white/10 hover:bg-white/15 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all border border-white/10"
            >
              Chunguza Masomo Yote
            </button>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <FolderOpen size={14} className="text-indigo-500" />
          Kategoria za Masomo
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              selectedCategory === ''
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            All Subjects
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-sans font-extrabold text-gray-900">
              {selectedCategory || 'Nyaraka Zote'}
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Inaonyesha nyaraka zilizothibitishwa kikamilifu
            </p>
          </div>
          <div className="text-xs text-gray-400 font-bold bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
            {filteredDocs.length} items found
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-400 tracking-wide">Inapakia maktaba ya nyaraka...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600 max-w-lg mx-auto space-y-3">
            <AlertCircle className="mx-auto text-3xl" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={loadAllDocuments}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
            >
              Jaribu Tena
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDocs.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <h3 className="font-sans font-extrabold text-lg text-gray-900">Hakuna nyaraka zilizopatikana</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Haijapatikana nyaraka yoyote kwenye kategoria au utafutaji ulioufanya bado. Kuwa wa kwanza kupakia!
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
            >
              Pakia ya Kwanza
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <article
              key={doc.id}
              onClick={() => onNavigate('reader', doc.id)}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
            >
              {/* Document Cover Preview (Scribd Styled Sheet layout) */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100 border-b border-gray-50 flex flex-col items-center justify-center px-6 pt-6 overflow-hidden">
                {/* Visual Scribd Page Representation */}
                <div className="relative w-28 h-36 bg-white border border-gray-200/80 rounded-t-lg shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-2 duration-300 flex flex-col px-3 pt-3 overflow-hidden">
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-0 border-l-0 border-r-[16px] border-b-[16px] border-b-transparent border-r-indigo-400"></div>
                  
                  {/* Visual Paper elements */}
                  <div className="flex items-center gap-1 mb-2">
                    <FileText size={10} className="text-indigo-600 flex-shrink-0" />
                    <span className="text-[6px] font-extrabold text-indigo-700 tracking-wider truncate uppercase">
                      {doc.category}
                    </span>
                  </div>
                  
                  <p className="text-[8px] font-bold text-gray-800 line-clamp-2 leading-tight">
                    {doc.title}
                  </p>
                  
                  <div className="w-full h-[1px] bg-gray-100 my-1"></div>
                  
                  <div className="space-y-1">
                    <div className="h-0.5 bg-gray-100 w-full rounded"></div>
                    <div className="h-0.5 bg-gray-100 w-11/12 rounded"></div>
                    <div className="h-0.5 bg-gray-100 w-10/12 rounded"></div>
                  </div>
                </div>

                {/* Overlaid Hover State */}
                <div className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4">
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 text-xs font-bold shadow-md transform scale-95 group-hover:scale-100 transition-transform duration-300">
                    <BookOpen size={14} />
                    Soma Sura Kamili
                  </span>
                </div>
              </div>

              {/* Document Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 flex items-center gap-0.5">
                      <CheckCircle size={10} />
                      Approved
                    </span>
                  </div>

                  <h3 className="text-base font-sans font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {doc.description || 'Hakuna maelezo ya ziada yaliyowekwa na mwandishi.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-gray-400" />
                    <span className="truncate max-w-[100px] text-gray-500">{doc.uploadedByName}</span>
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Eye size={12} className="text-gray-400" />
                    <span>{doc.views.toLocaleString()} views</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-gray-600">5.0</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
