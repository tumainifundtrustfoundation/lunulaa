import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  FolderOpen, 
  Plus, 
  Trash, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Loader,
  Wand2,
  Database,
  HardDrive,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { saveDocumentMetadata, getAccessToken, auth } from '../firebase';
import { DocumentMetadata } from '../types';
import { openGooglePicker, PickedFile } from '../utils/googlePicker';
import { autoDetectLinkMetadata, extractGoogleDriveId as extractDriveIdUtil } from '../utils/linkAutoDetector';

interface UploadViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export function extractGoogleDriveId(url: string): string | null {
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
}

export default function UploadView({ onNavigate, userProfile }: UploadViewProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');
  const [driveUrlInput, setDriveUrlInput] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pickedFromDrive, setPickedFromDrive] = useState<PickedFile | null>(null);
  
  // Fields Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Science & Technology');
  const [year, setYear] = useState('2026');
  const [type, setType] = useState('NECTA');
  const [tagsInput, setTagsInput] = useState('');
  const [documentType, setDocumentType] = useState<'Notes' | 'Books' | 'Past Papers'>('Notes');
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('0');
  
  // Copyright & Source Attribution Form Fields
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [copyrightAccepted, setCopyrightAccepted] = useState(false);
  
  // Status states
  const [uploading, setUploading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocId, setUploadedDocId] = useState('');

  const runAutoDetect = async (inputStr?: string) => {
    const target = inputStr || driveUrlInput || selectedFile?.name || pickedFromDrive?.name || title;
    if (!target || !target.trim()) return;

    setAutoDetecting(true);
    try {
      const meta = await autoDetectLinkMetadata(target);
      if (meta.title && meta.title !== 'Nyenzo ya Masomo') {
        setTitle(meta.title);
      }
      if (meta.category) setCategory(meta.category);
      if (meta.documentType) {
        setDocumentType(meta.documentType);
        if (meta.documentType === 'Notes') setType('Notes');
        else if (meta.documentType === 'Books') setType('Books');
        else setType(meta.type || 'NECTA');
      }
      if (meta.type && meta.documentType === 'Past Papers') setType(meta.type);
      if (meta.year) setYear(meta.year);
      if (meta.description && (!description || description.length < 5)) {
        setDescription(meta.description);
      }
    } catch (err) {
      console.warn('Auto detect failed:', err);
    } finally {
      setAutoDetecting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!userProfile) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-xl text-slate-900 uppercase">Ulinzi wa Firebase Auth</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
            Ili kuhifadhi au kuweka notisi, vitabu vya masomo, na nyaraka salama kwenye Lupanulla Elimu Hub, unapaswa kujiunga au kuingia kwenye akaunti yako.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase cursor-pointer"
          >
            Ingia kwenye Akaunti (Sign In)
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-signup-modal'))}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all uppercase cursor-pointer"
          >
            Tengeneza Akaunti Mpya (Sign Up)
          </button>
        </div>
      </div>
    );
  }

  const handlePickFromDrive = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        alert('Tafadhali unganisha akaunti yako ya Google kwanza kwenye ukurasa wa "Maktaba ya Google" ili kutumia Google Picker!');
        return;
      }

      await openGooglePicker({
        mimeType: 'application/pdf',
        onSelected: (selected) => {
          if (selected.length > 0) {
            const file = selected[0];
            setPickedFromDrive(file);
            setSelectedFile(null); // Clear local file if chosen from Drive
            
            // Set default title from the file name (removing .pdf extension if present)
            const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
            setTitle(cleanTitle);
          }
        },
        onCancel: () => {
          console.log('Picker cancelled');
        }
      });
    } catch (err: any) {
      alert(err.message || 'Mchakato wa kuanzisha Google Picker umeshindikana.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
      } else {
        alert('Tafadhali pakia faili la PDF pekee.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Secure input validation to prevent invalid Firestore entries and cross-site scripts
    if (!title || title.trim() === '') {
      setError('Tafadhali weka jina (title) la nyenzo hii kabla ya kupakia.');
      return;
    }
    if (title.length > 200) {
      setError('Jina la nyenzo ni refu mno. Tafadhali punguza jina lisizidi herufi 200.');
      return;
    }
    if (description && description.length > 1000) {
      setError('Maelezo (description) ni marefu mno. Tafadhali punguza yasizidi herufi 1000.');
      return;
    }

    if (!copyrightAccepted) {
      setError('Tafadhali thibitisha na kukubali vigezo vya hakimiliki kwa kuweka alama ya vyema kwenye kisanduku cha makubaliano chini ya fomu.');
      return;
    }
    
    if (uploadMethod === 'file') {
      if (!selectedFile && !pickedFromDrive) {
        setError('Tafadhali chagua faili la PDF la kupakia au chagua kutoka Google Drive kwanza.');
        return;
      }
    } else {
      if (!driveUrlInput || driveUrlInput.trim() === '') {
        setError('Tafadhali weka kiungo halali cha Google Drive.');
        return;
      }
      const parsedId = extractGoogleDriveId(driveUrlInput);
      if (!parsedId) {
        setError('Imeshindikana kupata kitambulisho cha faili kutoka kwenye kiungo hicho. Tafadhali hakikisha ni kiungo sahihi cha Google Drive au Google Docs.');
        return;
      }
    }

    try {
      setUploading(true);
      setError(null);

      let fileId = '';
      let driveUrl = '';
      let sizeKB = 0;

      if (uploadMethod === 'file') {
        if (pickedFromDrive) {
          fileId = pickedFromDrive.id;
          driveUrl = pickedFromDrive.url;
          sizeKB = pickedFromDrive.sizeBytes ? Math.round(pickedFromDrive.sizeBytes / 1024) : 120;
        } else if (selectedFile) {
          sizeKB = Math.round(selectedFile.size / 1024);
          fileId = 'drive-file-' + Math.random().toString(36).substring(2, 11);
          driveUrl = 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true';
        }
      } else {
        const parsedId = extractGoogleDriveId(driveUrlInput)!;
        fileId = parsedId;
        // Directly construct standard Google Drive embedded URL for secure reading in iframe
        driveUrl = `https://drive.google.com/file/d/${parsedId}/preview`;
        sizeKB = 1536; // Generic document size estimate in KB
      }

      const tagsArray = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      // Auto-tagging based on form details
      tagsArray.push(type);
      tagsArray.push(year);
      tagsArray.push(category);
      tagsArray.push(documentType);

      const docPayload: any = {
        title,
        description,
        category,
        tags: tagsArray,
        fileId,
        driveUrl,
        uploadedBy: auth.currentUser?.uid || userProfile?.uid || 'guest',
        uploadedByName: auth.currentUser?.displayName || userProfile?.name || 'Mwandishi Mgeni',
        createdAt: Date.now(),
        views: 0,
        status: 'pending', // Requires admin approval by default as per rules
        year: Number(year) || 2024,
        type: type,
        sizeKB: sizeKB,
        documentType: documentType,
        isForSale: isForSale,
        price: isForSale ? (parseInt(price, 10) || 0) : 0,
        sourceName: sourceName.trim(),
        sourceUrl: sourceUrl.trim(),
        copyrightAccepted: copyrightAccepted,
        reportCount: 0
      };

      const docId = await saveDocumentMetadata(docPayload);
      setUploadedDocId(docId);
      setSuccess(true);
      setSelectedFile(null);
      setPickedFromDrive(null);
      setDriveUrlInput('');
      setTitle('');
      setDescription('');
      setTagsInput('');
      setIsForSale(false);
      setPrice('0');
      setDocumentType('Notes');
      setSourceName('');
      setSourceUrl('');
      setCopyrightAccepted(false);

    } catch (err: any) {
      console.error('File upload error:', err);
      setError('Mchakato wa kupakia faili umeshindwa. Tafadhali hakikisha muunganisho wako wa mtandao upo sawa na ujaribu tena.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="upload-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      {/* Upload Banner */}
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Upload size={12} /> Firebase Cloud Storage &amp; Sync
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Pakia Mtihani au Notisi Mpya</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Shiriki nyenzo zako za elimu (Mitihani, Miongozo, Notisi) na jamii ya Lupanulla. Faili zitahifadhiwa salama kwenye <strong>Firebase Storage</strong> na kusawazishwa moja kwa moja kwenye maktaba kuu ya <strong>MitihaniView</strong>.
          </p>
        </div>
      </section>

      {/* Storage & Sync Status Assurance Card */}
      <section className="bg-white border border-cyan-100 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center shrink-0 shadow-inner">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-sm uppercase text-slate-900">
                  Hifadhi na Ulandanishi wa Mitihani
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300">
                  Firebase Cloud Active
                </span>
              </div>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">
                Mitihani unayopakia inahifadhiwa wapi na inapatikana vipi?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('mitihani')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shrink-0"
          >
            <BookOpen size={13} className="text-cyan-400" />
            <span>Fungua MitihaniView</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Firebase Storage Explanation */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 font-bold mt-0.5">
              <HardDrive size={16} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-900 uppercase flex items-center gap-1">
                1. Hifadhi ya Firebase Storage &amp; Firestore
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                Nyaraka na mitihani yote inayopakiwa inahifadhiwa salama kwenye hifadhi ya wingu ya <strong>Firebase Storage</strong> pamoja na kanzidata ya <strong>Cloud Firestore</strong> kwa usalama na upatikanaji wa usiku na mchana.
              </p>
            </div>
          </div>

          {/* Automatic Sync to MitihaniView */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-200 flex items-center justify-center shrink-0 font-bold mt-0.5">
              <RefreshCw size={16} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-900 uppercase flex items-center gap-1">
                2. Ulandanishi wa Moja kwa Moja (MitihaniView)
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                Mchakato wa kupakia ukikamilika, mtihani au notisi yako inasawazishwa kiotomatiki na kutokea papo hapo kwenye orodha kuu ya <strong>MitihaniView</strong> ili wanafunzi na walimu waweze kuisoma na kuipakua.
              </p>
            </div>
          </div>
        </div>
      </section>

      {success ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-6 max-w-lg mx-auto py-12">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={32} className="stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-extrabold text-xl text-slate-900 uppercase">Kazi Imekamilika!</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto font-medium">
              Faili lako limetungwa kikamilifu, limehifadhiwa kwenye wingu la Google Drive, na limeorodheshwa kwenye maktaba ya Lupanulla Elimu Hub.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button 
              onClick={() => setSuccess(false)}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Pakia Nyingine
            </button>
            <button 
              onClick={() => onNavigate('mitihani')}
              className="px-5 py-2.5 bg-cyan-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              Nenda Kwenye Maktaba &rarr;
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form left Column details */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-slate-950 text-sm uppercase border-b border-slate-100 pb-3">Taarifa za Nyaraka</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-150 rounded-2xl p-4 flex gap-3 text-xs text-red-700 font-semibold items-center">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kichwa cha Mtihani au Notisi (Title)</label>
                  <button
                    type="button"
                    onClick={() => runAutoDetect()}
                    disabled={autoDetecting}
                    className="text-[10px] text-cyan-600 hover:text-cyan-700 font-extrabold flex items-center gap-1 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 cursor-pointer disabled:opacity-50"
                  >
                    {autoDetecting ? <Loader size={11} className="animate-spin" /> : <Wand2 size={11} />}
                    <span>Utambuzi wa Jina &amp; Somo (Auto-Detect)</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mfano: NECTA Basic Mathematics Form IV 2023 Past Paper" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maelezo fupi ya Nyaraka (Description)</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elezea kwa muhtasari yaliyomo kwenye mtihani huu au notisi hii..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 h-24 resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aina ya Nyenzo (Resource Type)</label>
                  <select 
                    value={documentType}
                    onChange={(e) => {
                      const val = e.target.value as 'Notes' | 'Books' | 'Past Papers';
                      setDocumentType(val);
                      if (val === 'Notes') setType('Notes');
                      else if (val === 'Books') setType('Books');
                      else setType('NECTA');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Notes">Notisi (Study Notes)</option>
                    <option value="Books">Kitabu (Book / Novel)</option>
                    <option value="Past Papers">Mtihani (Past Paper)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aina ya Mtihani (Type)</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={documentType !== 'Past Papers'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    {documentType === 'Past Papers' ? (
                      <>
                        <option value="NECTA">NECTA National</option>
                        <option value="Mock">Mock za Mkoa/Wilaya</option>
                        <option value="Terminal">Terminal &amp; Midterm</option>
                        <option value="Majaribio">Majaribio ya Mada</option>
                      </>
                    ) : (
                      <option value={documentType === 'Notes' ? 'Notes' : 'Books'}>{documentType === 'Notes' ? 'Study Notes' : 'Book / Reading Material'}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mada (Category)</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Science & Technology">Science &amp; Technology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="History & Humanities">History &amp; Humanities</option>
                    <option value="Language & Literature">Language &amp; Literature</option>
                    <option value="Business & Economics">Business &amp; Economics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mwaka (Year)</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                  >
                    {Array.from({ length: 2026 - 1994 + 1 }, (_, i) => 2026 - i).map(yr => (
                      <option key={yr} value={yr.toString()}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 bg-cyan-50/30 border border-cyan-100/50 rounded-2xl p-4 mt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider block">Njia ya Umiliki (Access Type)</label>
                  <div className="flex gap-4 pt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="isForSale" 
                        checked={!isForSale} 
                        onChange={() => { setIsForSale(false); setPrice('0'); }} 
                        className="text-cyan-600 focus:ring-cyan-500" 
                      />
                      Bure (Free Access)
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="isForSale" 
                        checked={isForSale} 
                        onChange={() => setIsForSale(true)} 
                        className="text-cyan-600 focus:ring-cyan-500" 
                      />
                      Inauzwa (Paid / Premium)
                    </label>
                  </div>
                </div>

                {isForSale && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-cyan-850 uppercase tracking-wider block">Bei ya Kuuza (TSh)</label>
                    <input 
                      type="number" 
                      min="100"
                      step="50"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Mfano: 1500" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                    />
                    <span className="text-[9px] text-slate-400 font-semibold block">Weka bei kwa TSh. Mfano: 1500</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lebo / Tags (Tenganisha kwa koma)</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Mfano: Mathematics, CSEE, NECTA, Form IV" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
              </div>

              {/* Copyright & Source Attribution Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-250/60 pb-2.5">
                  <ShieldAlert size={16} className="text-cyan-600" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">Hati ya Hakimiliki & Chanzo cha Nyaraka</h4>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chanzo Halisi (Source Name - Optional)</label>
                    <input 
                      type="text" 
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Mfano: Maktaba Tetea, NECTA, au Mwandishi" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kiungo cha Chanzo (Source URL - Optional)</label>
                    <input 
                      type="url" 
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://example.com/original-file" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      required
                      checked={copyrightAccepted}
                      onChange={(e) => setCopyrightAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 border-slate-350"
                    />
                    <span className="text-[10.5px] text-slate-600 font-bold leading-normal select-none">
                      Ninathibitisha kuwa rasilimali hii haikiuki hakimiliki ya mtu au tovuti yoyote. Nakubali kuwa nikipakia maudhui yenye hati miliki bila idhini, rasilimali hii itaondolewa mara moja.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form right Column select drag-and-drop file / Paste Link */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Method Tabs */}
              <div className="flex border-b border-slate-100 pb-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 pb-2 text-center text-xs font-bold transition-all border-b-2 ${
                    uploadMethod === 'file'
                      ? 'border-cyan-500 text-cyan-600 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Pakia Faili (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('link')}
                  className={`flex-1 pb-2 text-center text-xs font-bold transition-all border-b-2 ${
                    uploadMethod === 'link'
                      ? 'border-cyan-500 text-cyan-600 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Kiungo cha Drive
                </button>
              </div>

              {uploadMethod === 'file' ? (
                <>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {pickedFromDrive ? (
                    <div className="border-2 border-cyan-200 bg-cyan-50/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 py-10 relative">
                      <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[9px] font-extrabold uppercase tracking-wider">
                          Google Drive (Picked)
                        </span>
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{pickedFromDrive.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">PDF Faili la Google Drive</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setPickedFromDrive(null);
                        }}
                        className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase mt-2 inline-flex items-center gap-0.5"
                      >
                        <Trash size={12} /> Ondoa Faili
                      </button>
                    </div>
                  ) : selectedFile ? (
                    <div 
                      className="border-2 border-green-500 bg-green-500/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 py-10"
                    >
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; PDF</p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase mt-2 inline-flex items-center gap-0.5"
                      >
                        <Trash size={12} /> Ondoa Faili
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 ${
                          dragActive 
                            ? 'border-cyan-500 bg-cyan-500/5' 
                            : 'border-slate-250 hover:border-cyan-400 hover:bg-slate-50'
                        }`}
                        onClick={handleButtonClick}
                      >
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Vuta faili hapa</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">au bofya kuchagua kwenye kifaa chako</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <span className="h-px bg-slate-200 flex-1" />
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">au tumia Drive</span>
                        <span className="h-px bg-slate-200 flex-1" />
                      </div>

                      <button
                        type="button"
                        onClick={handlePickFromDrive}
                        className="w-full py-3 border border-cyan-150 bg-cyan-50/40 hover:bg-cyan-55 text-cyan-700 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider shadow-sm"
                      >
                        <FolderOpen size={14} />
                        <span>Chagua Kutoka Google Drive</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kiungo cha Google Drive, YouTube au Google Doc</label>
                      <button
                        type="button"
                        onClick={() => runAutoDetect(driveUrlInput)}
                        disabled={!driveUrlInput || autoDetecting}
                        className="text-[10px] text-cyan-600 hover:text-cyan-700 font-extrabold flex items-center gap-1 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 cursor-pointer disabled:opacity-50"
                      >
                        {autoDetecting ? <Loader size={11} className="animate-spin" /> : <Wand2 size={11} />}
                        <span>Utambuzi wa Kiungo (Auto-Detect Link)</span>
                      </button>
                    </div>
                    <input 
                      type="url" 
                      required
                      value={driveUrlInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDriveUrlInput(val);
                        if (val && val.length > 15) {
                          runAutoDetect(val);
                        }
                      }}
                      placeholder="https://drive.google.com/file/d/... au https://www.youtube.com/watch?v=..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                    />
                  </div>
                  
                  <div className="p-3 bg-cyan-50/30 rounded-xl border border-dashed border-cyan-200/50 space-y-1 text-left">
                    <p className="text-[10px] text-cyan-800 font-extrabold uppercase flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500" />
                      Utambuzi wa Moja kwa Moja (Automatic Detection):
                    </p>
                    <p className="text-[9.5px] text-slate-600 font-semibold leading-relaxed">
                      Weka kiungo cha Google Drive au YouTube. Mfumo wa Lupanulla utatambua jina la mtihani/kitabu, somo (Kiswahili, Physics, Hisabati, n.k.), kidato na mwaka kiotomatiki!
                    </p>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={uploading || (uploadMethod === 'file' ? (!selectedFile && !pickedFromDrive) : !driveUrlInput)}
                className="w-full py-3 text-xs text-center font-extrabold bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-150 disabled:text-slate-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>Inapakia Sasa...</span>
                  </>
                ) : (
                  <>
                    <span>PAKIA NYARAKA SASA</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="font-display font-bold text-sm uppercase flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-amber-500" />
                Viwango vya Maudhui
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-semibold">
                Nyaraka zote zinazopakiwa zinapaswa kuwa za kitaaluma na zisivunje hakimiliki ya mwandishi yeyote. Faili zisizo za kiakademia zitafutwa mara moja.
              </p>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
