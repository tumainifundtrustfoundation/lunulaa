import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Library, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  GraduationCap, 
  ClipboardCheck,
  RefreshCw,
  Clock,
  Search,
  Calendar,
  Palette,
  Mail,
  Plus,
  Send,
  Inbox,
  FileEdit,
  User,
  PlusCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  WorkspaceCourse, 
  WorkspaceFile, 
  WorkspaceForm, 
  WorkspaceAssignment, 
  WorkspaceEmail, 
  WorkspaceDoc, 
  AppTheme 
} from '../types';
import FocusTimer from './FocusTimer';
import { getAccessToken, signInWithGoogle } from '../firebase';
import { openGooglePicker, PickedFile } from '../utils/googlePicker';

interface WorkspaceViewProps {
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
}

export default function WorkspaceView({ theme, onChangeTheme }: WorkspaceViewProps) {
  const [token, setTokenLocal] = useState<string | null>(getAccessToken());
  const [courses, setCourses] = useState<WorkspaceCourse[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [forms, setForms] = useState<WorkspaceForm[]>([]);
  const [assignments, setAssignments] = useState<WorkspaceAssignment[]>([]);
  const [emails, setEmails] = useState<WorkspaceEmail[]>([]);
  const [docs, setDocs] = useState<WorkspaceDoc[]>([]);
  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'classroom' | 'assignments' | 'drive' | 'forms' | 'gmail' | 'docs'>('classroom');

  // Modals state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLaunchPicker = async () => {
    try {
      await openGooglePicker({
        onSelected: (selected) => {
          setPickedFiles(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const newFiles = selected.filter(f => !existingIds.has(f.id));
            return [...newFiles, ...prev];
          });
          setFeedbackMessage({ 
            type: 'success', 
            text: `${selected.length} faili limechaguliwa kupitia Google Picker!` 
          });
        },
        onCancel: () => {
          console.log('Picker cancelled');
        }
      });
    } catch (err: any) {
      alert(err.message || 'Mchakato wa kufungua Google Picker umeshindikana.');
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setTokenLocal(res.accessToken);
        fetchData(res.accessToken);
      } else {
        throw new Error('Hukuweza kuunganisha akaunti ya Google.');
      }
    } catch (err: any) {
      setError(err.message || 'Kuingia kwa Google kumeshindikana. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    setLoading(true);
    setError(null);
    try {
      const headers = { 'x-oauth-token': currentToken };
      const [coursesRes, filesRes, formsRes, assignmentsRes, emailsRes, docsRes] = await Promise.all([
        fetch('/api/workspace/courses', { headers }),
        fetch('/api/workspace/files', { headers }),
        fetch('/api/workspace/forms', { headers }),
        fetch('/api/workspace/assignments', { headers }),
        fetch('/api/workspace/emails', { headers }),
        fetch('/api/workspace/docs', { headers })
      ]);

      let coursesData = { courses: [] };
      let filesData = { files: [] };
      let formsData = { files: [] };
      let assignmentsData = { assignments: [] };
      let emailsData = { emails: [] };
      let docsData = { docs: [] };

      if (coursesRes.ok) coursesData = await coursesRes.json();
      if (filesRes.ok) filesData = await filesRes.json();
      if (formsRes.ok) formsData = await formsRes.json();
      if (assignmentsRes.ok) assignmentsData = await assignmentsRes.json();
      if (emailsRes.ok) emailsData = await emailsRes.json();
      if (docsRes.ok) docsData = await docsRes.json();

      setCourses(coursesData.courses || []);
      setFiles(filesData.files || []);
      setForms(formsData.files || []);
      setAssignments(assignmentsData.assignments || []);
      setEmails(emailsData.emails || []);
      setDocs(docsData.docs || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Kuna hitilafu ilitokea wakati wa kupata data ya Google.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_PICKER_IMAGE_SELECTED') {
        const selectedFile = {
          id: event.data.fileId,
          name: event.data.name,
          mimeType: event.data.mimeType,
          url: event.data.url,
          thumbnailUrl: event.data.thumbnailUrl,
        };
        
        setPickedFiles(prev => {
          const existingIds = new Set(prev.map(f => f.id));
          if (existingIds.has(selectedFile.id)) return prev;
          return [selectedFile, ...prev];
        });

        setFeedbackMessage({ 
          type: 'success', 
          text: `Picha "${selectedFile.name}" imechaguliwa kutoka kwenye Ukurasa wa Google Picker!` 
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle Compose Email submission
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      alert('Tafadhali jaza sehemu zote kabla ya kutuma.');
      return;
    }

    // MANDATORY confirmation dialog before mutating operation
    const confirmed = window.confirm(
      `Je, una uhakika unataka kutuma barua pepe hii kwenda kwa: ${composeTo.trim()}?`
    );
    if (!confirmed) return;

    setSendingEmail(true);
    try {
      const response = await fetch('/api/workspace/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-oauth-token': token || ''
        },
        body: JSON.stringify({
          to: composeTo.trim(),
          subject: composeSubject.trim(),
          body: composeBody.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Kushindwa kutuma barua pepe. Tafadhali jaribu tena.');
      }

      setFeedbackMessage({ type: 'success', text: 'Barua pepe imetumwa kikamilifu!' });
      setShowComposeModal(false);
      
      // Reset compose state
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      
      // Refresh emails
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Hitilafu imetokea.');
    } finally {
      setSendingEmail(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Handle Create Google Doc submission
  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      alert('Tafadhali andika jina la Nyaraka.');
      return;
    }

    // MANDATORY confirmation dialog before mutating operation
    const confirmed = window.confirm(
      `Je, unataka kutengeneza Google Doc mpya yenye jina "${newDocName.trim()}"?`
    );
    if (!confirmed) return;

    setCreatingDoc(true);
    try {
      const response = await fetch('/api/workspace/docs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-oauth-token': token || ''
        },
        body: JSON.stringify({ name: newDocName.trim() })
      });

      if (!response.ok) {
        throw new Error('Kushindwa kutengeneza Nyaraka Mpya.');
      }

      const result = await response.json();
      setFeedbackMessage({ type: 'success', text: `Nyaraka "${newDocName.trim()}" imetengenezwa kikamilifu!` });
      setShowCreateDocModal(false);
      setNewDocName('');

      // Refresh documents
      fetchData();

      // Automatically open the new document in a new tab for supreme user experience
      if (result.file?.webViewLink) {
        window.open(result.file.webViewLink, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'Hitilafu imetokea.');
    } finally {
      setCreatingDoc(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Render Login state if not authenticated with Google
  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in flex items-center justify-center min-h-[70vh]">
        <div className="max-w-lg w-full bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
            <Library className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display">Unganisha Maktaba ya Google</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Fungua ulimwengu wako wa masomo! Unganisha Google Classroom, Google Drive, Gmail, na Google Docs kwa ajili ya kupata notisi na kuandika muhtasari wa masomo yako kwa urahisi zaidi.
            </p>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            <span>{loading ? 'Inaunganisha...' : 'Unganisha na Google Account'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in relative">
      {/* Toast Feedback notifications */}
      {feedbackMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-lg flex items-center gap-3 border animate-bounce ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 border-emerald-150 text-emerald-800' : 'bg-red-50 border-red-150 text-red-800'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">{feedbackMessage.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Maktaba ya Google</h1>
          <p className="text-slate-500">Dhibiti Classroom, Barua Pepe (Gmail), Drive, na Nyaraka (Google Docs)</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'gmail' && (
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Andika Barua Pepe</span>
            </button>
          )}
          {activeTab === 'docs' && (
            <button
              onClick={() => {
                setNewDocName('Muhtasari mpya wa somo');
                setShowCreateDocModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tengeneza Doc Mpya</span>
            </button>
          )}
          {activeTab === 'drive' && (
            <button
              onClick={handleLaunchPicker}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Chagua kwa Google Picker</span>
            </button>
          )}
          <button 
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Inapakia...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Grid: Resources (Left) & Focus Timer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Resources Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs List */}
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full gap-1">
            {[
              { id: 'classroom', label: 'Classroom', icon: GraduationCap },
              { id: 'assignments', label: 'Kazi', icon: Clock },
              { id: 'drive', label: 'Drive', icon: Library },
              { id: 'forms', label: 'Quizzes', icon: ClipboardCheck },
              { id: 'gmail', label: 'Gmail ✉️', icon: Mail },
              { id: 'docs', label: 'Docs 📝', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-white text-cyan-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="min-h-[400px]">
            {error ? (
              <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center">
                <p className="font-bold">Hitilafu imetokea!</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={handleConnect}
                  className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Unganisha Upya Google
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* classroom Tab */}
                {activeTab === 'classroom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.length > 0 ? courses.map((course) => (
                      <div key={course.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{course.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.section || course.descriptionHeading || 'Hakuna maelezo'}</p>
                        <a 
                          href={course.alternateLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700"
                        >
                          Fungua Classroom <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )) : (
                      <EmptyState message="Hujajiunga na kozi yoyote kwenye Google Classroom." />
                    )}
                  </div>
                )}

                {/* assignments Tab */}
                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    {assignments.length > 0 ? assignments.map((assignment) => (
                      <div key={assignment.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                            <ClipboardCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                            <p className="text-xs text-slate-500 mb-1">{assignment.courseName}</p>
                            {assignment.dueDate && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
                                <Clock className="w-3 h-3" />
                                Mwisho: {assignment.dueDate.day}/{assignment.dueDate.month}/{assignment.dueDate.year}
                              </div>
                            )}
                          </div>
                        </div>
                        <a 
                          href={assignment.alternateLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors text-center"
                        >
                          Fanya Kazi
                        </a>
                      </div>
                    )) : (
                      <EmptyState message="Hongera! Huna kazi yoyote ya kufanya kwa sasa." />
                    )}
                  </div>
                )}

                {/* drive Tab */}
                {activeTab === 'drive' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Launch Picker Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700/30">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
                          Google Picker Integration
                        </span>
                        <h3 className="font-bold text-lg font-display">Tafuta kwa Google Picker Visual Utility</h3>
                        <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                          Njia rahisi na ya haraka ya kutazama, kuchagua, na kufungua faili zako moja kwa moja kutoka Google Drive visual pop-up interface.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                          onClick={handleLaunchPicker}
                          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-md active:scale-98 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                        >
                          <Search className="w-4 h-4" />
                          <span>Inline Picker</span>
                        </button>
                        <a
                          href="/picker.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-md active:scale-98 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer text-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                          <span>Kiteuzi Kamili (HTML Page)</span>
                        </a>
                      </div>
                    </div>

                    {/* Display Picked Files from Google Picker */}
                    {pickedFiles.length > 0 && (
                      <div className="space-y-3 bg-cyan-50/20 border border-cyan-100/50 p-6 rounded-3xl">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
                            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse" />
                            Faili Zilizochaguliwa Kupitia Google Picker
                          </h4>
                          <button 
                            onClick={() => setPickedFiles([])}
                            className="text-xs text-red-500 hover:text-red-600 font-bold uppercase tracking-wider"
                          >
                            Ondoa Zote
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {pickedFiles.map((file) => (
                            <div key={file.id} className="bg-white border-2 border-cyan-100/60 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex gap-4 relative group">
                              <div className="shrink-0 w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                {file.thumbnailUrl ? (
                                  <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-cyan-400 bg-cyan-50/50">
                                    <FileText className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                                <div>
                                  <h3 className="font-bold text-slate-900 line-clamp-2 text-xs leading-snug mb-1 pr-6 group-hover:text-cyan-600 transition-colors">{file.name}</h3>
                                  <p className="text-[10px] text-cyan-600 uppercase font-extrabold tracking-wider">
                                    {file.mimeType.split('.').pop() || 'Drive file'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:underline"
                                  >
                                    Fungua Sasa <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                              <button
                                onClick={() => setPickedFiles(prev => prev.filter(f => f.id !== file.id))}
                                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Ondoa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Maudhui ya Google Drive Yako</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {files.length > 0 ? files.map((file) => (
                          <div key={file.id} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all flex gap-4">
                            <div className="shrink-0 w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                              {file.thumbnailLink ? (
                                <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <FileText className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-between py-1">
                              <div>
                                <h3 className="font-bold text-slate-900 line-clamp-2 text-sm mb-1">{file.name}</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                  {file.mimeType.split('.').pop()}
                                </p>
                              </div>
                              <a 
                                href={file.webViewLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-cyan-600 flex items-center gap-1 hover:underline"
                              >
                                Tazama Drive <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )) : (
                          <EmptyState message="Hakuna mafaili yaliyopatikana kwenye Google Drive yako." />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* forms Tab */}
                {activeTab === 'forms' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {forms.length > 0 ? forms.map((form) => (
                      <div key={form.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                          <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4 line-clamp-2">{form.name}</h3>
                        <a 
                          href={form.webViewLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                        >
                          Anza Maswali <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )) : (
                      <EmptyState message="Hakuna fomu (quizzes) zilizopatikana." />
                    )}
                  </div>
                )}

                {/* GMAIL TAB */}
                {activeTab === 'gmail' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <Inbox className="w-4 h-4" />
                        <span>Barua Pepe za hivi karibuni</span>
                      </div>
                    </div>

                    {emails.length > 0 ? (
                      <div className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                        {emails.map((email) => (
                          <div 
                            key={email.id} 
                            className="p-5 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-start justify-between gap-4"
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex items-center gap-2">
                                <span className="inline-block text-xs font-extrabold text-slate-800 line-clamp-1 max-w-[200px]">
                                  {email.from.split('<')[0] || email.from}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                  {new Date(email.date).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-1">
                                {email.subject}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {email.snippet}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 md:self-center">
                              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Gmail
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="Hakuna barua pepe zilizopatikana kwenye Kikasha (Inbox) chako." />
                    )}
                  </div>
                )}

                {/* GOOGLE DOCS TAB */}
                {activeTab === 'docs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <FileText className="w-4 h-4" />
                        <span>Nyaraka zako za hivi karibuni</span>
                      </div>
                    </div>

                    {docs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {docs.map((doc) => (
                          <div key={doc.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
                            <div className="flex gap-4 items-start">
                              <div className="shrink-0 w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors text-sm line-clamp-2 leading-tight">
                                  {doc.name}
                                </h3>
                                {doc.modifiedTime && (
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    Ilibadilishwa mwisho: {new Date(doc.modifiedTime).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Google Doc
                              </span>
                              <a 
                                href={doc.webViewLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 hover:underline"
                              >
                                Fungua Nyaraka <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="Hakuna nyaraka za Google zilizopatikana." />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Focus Timer Study Companion Column */}
        <div className="lg:col-span-1 space-y-6">
          <FocusTimer />

          {/* Theme Switcher Widget */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">Mada ya Jukwaa</h3>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Badili mwonekano wako</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Chagua mada inayokufaa zaidi wakati wa kujisomea ili kulinda macho au kuongeza umakini.
            </p>

            <div className="space-y-2 pt-1">
              {[
                { id: 'theme-tanzania-forest', label: 'Tanzania Forest 🌲', desc: 'Teal/Green asili ya asili' },
                { id: 'theme-night-mode', label: 'Night Mode 🌙', desc: 'Mwangaza hafifu kulinda macho' },
                { id: 'theme-high-contrast', label: 'High Contrast 👁️', desc: 'Nyeusi na nyeupe kwa uoni safi' }
              ].map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onChangeTheme(t.id as any)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isActive 
                        ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/10' 
                        : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{t.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t.desc}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isActive ? 'border-cyan-500 bg-cyan-600 text-white' : 'border-slate-200'
                    }`}>
                      {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COMPOSE EMAIL MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">Andika Barua Pepe (Gmail)</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Tuma kwenda popote duniani</p>
                </div>
              </div>
              <button 
                onClick={() => setShowComposeModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mpokeaji (Email Address)</label>
                <input
                  type="email"
                  required
                  placeholder="mwalimu@lupanulla.co.tz"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kichwa cha Habari (Subject)</label>
                <input
                  type="text"
                  required
                  placeholder="Maswali kuhusu Notisi za Biolojia"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ujumbe wako (Message Body)</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Habari Mwalimu, ninaomba msaada wa muhtasari wa..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Inatuma...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Tuma Sasa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GOOGLE DOC MODAL */}
      {showCreateDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">Google Doc Mpya</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Tengeneza mazingira ya kuandikia</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateDocModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jina la Nyaraka (Document Name)</label>
                <input
                  type="text"
                  required
                  placeholder="Notisi za Biolojia - Topic 1"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(false)}
                  className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={creatingDoc}
                  className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingDoc ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Inatengeneza...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tengeneza Sasa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-20 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
        <Search className="w-10 h-10" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
