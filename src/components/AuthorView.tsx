import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Award,
  Upload,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DocumentMetadata } from '../types';
import { fetchDocuments, deleteDocumentMetadata, updateUserProfile, getAccessToken } from '../firebase';

interface AuthorViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
  onProfileRefresh: () => void;
}

export default function AuthorView({
  onNavigate,
  userProfile,
  onProfileRefresh
}: AuthorViewProps) {
  const [myDocs, setMyDocs] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Upgrade role loading
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && (userProfile.role === 'author' || userProfile.role === 'admin')) {
      loadMyDocuments();
    } else {
      setLoading(false);
    }
  }, [userProfile?.uid, userProfile?.role]);

  const loadMyDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all files uploaded by this user, regardless of status
      const docs = await fetchDocuments({ uploadedBy: userProfile.uid });
      docs.sort((a, b) => b.createdAt - a.createdAt);
      setMyDocs(docs);
    } catch (err: any) {
      console.error('Error fetching author documents:', err);
      setError('Imeshindwa kupakia orodha yako ya faili. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAuthorNetwork = async () => {
    if (!userProfile) return;
    setIsUpgrading(true);
    try {
      // Upgrade role from student to author in Firestore
      await updateUserProfile(userProfile.uid, { role: 'author' });
      onProfileRefresh();
    } catch (err) {
      console.error('Failed to upgrade user role:', err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDeleteFile = async (docId: string, fileId: string, title: string) => {
    // MANDATORY explicit user confirmation before executing destructive action on Workspace data
    const confirmed = window.confirm(
      `Je, una uhakika unataka kufuta kabisa nyaraka "${title}"? Kitendo hiki kitaifuta kwenye jukwaa na pia kutoka kwenye hifadhi yako ya Google Drive na hakiwezi kurejeshwa.`
    );
    if (!confirmed) return;

    setDeletingId(docId);
    let token = getAccessToken();

    try {
      // Step 1: Delete from Google Drive if authorized
      if (token && fileId) {
        console.log(`Deleting file ${fileId} from Google Drive...`);
        const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!driveResponse.ok && driveResponse.status !== 404) {
          console.warn('Google Drive deletion warning:', driveResponse.statusText);
        }
      }

      // Step 2: Delete Firestore Record
      await deleteDocumentMetadata(docId);
      
      // Update local state
      setMyDocs(myDocs.filter(d => d.id !== docId));
      alert('Nyaraka imefutwa kikamilifu.');
    } catch (err: any) {
      console.error('Error during deletion:', err);
      alert('Hitilafu imetokea wakati wa kufuta faili. Tafadhali jaribu tena.');
    } finally {
      setDeletingId(null);
    }
  };

  const getFormatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalViews = myDocs.reduce((sum, d) => sum + (d.views || 0), 0);
  const pendingCount = myDocs.filter(d => d.status === 'pending').length;
  const approvedCount = myDocs.filter(d => d.status === 'approved').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-400">Inatafuta faili zako...</p>
      </div>
    );
  }

  // If user is Student, show onboarding screen to become Author
  if (userProfile && userProfile.role === 'student') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center py-10 space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner border border-indigo-100/50">
            <Sparkles size={36} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">ScribdShare Creator Club</span>
            <h1 className="text-3xl font-sans font-extrabold text-gray-900 leading-tight">Jiunge na Mtandao wa Waandishi</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Shiriki notisi zako, mada, miongozo, au mitihani ya majaribio uliyoiandaa na wasomaji wengine. Jenga jina lako, pata wafuasi na kusaidia maelfu ya wanafunzi nchini.
            </p>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 text-left divide-y divide-gray-100 shadow-sm space-y-4">
            <div className="flex gap-3 pt-0 items-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Hifadhi Moja kwa Moja Google Drive</h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Faili zako zote zinahifadhiwa kwenye akaunti yako binafsi ya Google Drive, zikiongozwa salama na Google APIs wetu.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Uhakiki na Wasimamizi (Moderation)</h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Wasimamizi wanahakiki maudhui kabla ya kuyaweka wazi ili kuhakikisha ubora unabaki kuwa daraja la kwanza.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleJoinAuthorNetwork}
            disabled={isUpgrading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
          >
            <UserCheck size={18} />
            {isUpgrading ? 'Inajiunga...' : 'Sajili Akaunti yangu kama Mwandishi (Author)'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="author-view" className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-extrabold text-gray-900 flex items-center gap-2">
            <Award size={28} className="text-indigo-600" />
            Author Portal Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Karibu {userProfile?.name}! Dhibiti na uangalie takwimu za faili ulizozipandisha.
          </p>
        </div>
        <button
          onClick={() => onNavigate('upload')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Upload size={16} />
          Pakia Faili Jipya
        </button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nyaraka Zako</p>
          <p className="text-3xl font-sans font-extrabold text-gray-900">{myDocs.length}</p>
          <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 leading-none">
            Uploaded items
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jumla ya Views</p>
          <p className="text-3xl font-sans font-extrabold text-gray-900">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 leading-none">
            <TrendingUp size={10} />
            +8.2% this week
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Approved Files</p>
          <p className="text-3xl font-sans font-extrabold text-emerald-600">{approvedCount}</p>
          <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 leading-none">
            Approved status
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inasubiri (Pending)</p>
          <p className="text-3xl font-sans font-extrabold text-amber-500">{pendingCount}</p>
          <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 leading-none">
            Awaiting reviews
          </span>
        </div>
      </div>

      {/* Main Section */}
      <section className="space-y-4 bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-sans font-extrabold text-gray-900">Maudhui Yako Yote</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-2 text-red-700 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {myDocs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <FileText size={20} />
            </div>
            <p className="text-sm text-gray-400 font-bold">Bado haujapakia nyaraka yoyote kwenye ScribdShare</p>
            <button
              onClick={() => onNavigate('upload')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
            >
              Pakia Nyaraka ya Kwanza
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase font-bold bg-gray-50/50 rounded-lg">
                <tr>
                  <th scope="col" className="px-4 py-3">Nyaraka</th>
                  <th scope="col" className="px-4 py-3">Kundi</th>
                  <th scope="col" className="px-4 py-3">Imepakiwa</th>
                  <th scope="col" className="px-4 py-3">Views</th>
                  <th scope="col" className="px-4 py-3">Hali</th>
                  <th scope="col" className="px-4 py-3 text-right">Vitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => onNavigate('reader', doc.id)}
                      >
                        <div className="w-10 h-12 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center flex-shrink-0 border border-indigo-100">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-800 line-clamp-1 group-hover:text-indigo-600 group-hover:underline transition-all">
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-gray-400 line-clamp-1">
                            {doc.description || 'Hakuna maelezo...'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                      {getFormatDate(doc.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={12} className="text-gray-400" />
                        {doc.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold">
                      {doc.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">
                          <CheckCircle size={10} />
                          Approved
                        </span>
                      )}
                      {doc.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                      {doc.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">
                          <XCircle size={10} />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDeleteFile(doc.id, doc.fileId, doc.title)}
                        disabled={deletingId === doc.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Futa nyaraka kabisa"
                      >
                        <Trash2 size={16} className={deletingId === doc.id ? 'animate-pulse' : ''} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
