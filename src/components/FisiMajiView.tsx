import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Compass, 
  HelpCircle,
  CheckCircle,
  ArrowRight,
  User,
  Lightbulb,
  CornerDownLeft,
  Crown,
  Mic,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Brain,
  Globe,
  Settings,
  Download,
  Info
} from 'lucide-react';
import { addNotification } from '../firebase';
import PremiumLock from './PremiumLock';
import MarkdownRenderer from './MarkdownRenderer';

interface Attachment {
  name: string;
  mimeType: string;
  base64Data: string;
  url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  isThinking?: boolean;
}

interface FisiMajiViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function FisiMajiView({ onNavigate, userProfile }: FisiMajiViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'image-generator'>('chat');
  
  const isPremium = userProfile?.subscription === 'premium' || userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Free Messages Limit configurations
  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const freeMessagesLimit = 5;
  const hasRemainingFreeMessages = userMessagesCount < freeMessagesLimit;
  const canChat = isPremium || hasRemainingFreeMessages;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'any' | 'primary' | 'olevel' | 'alevel'>('olevel');
  const [modelChoice, setModelChoice] = useState<'lite' | 'flash' | 'pro'>('flash');
  const [thinking, setThinking] = useState(false);
  const [grounding, setGrounding] = useState<'none' | 'search' | 'maps'>('none');
  const [persona, setPersona] = useState<'default' | 'science' | 'languages' | 'planner'>('default');
  
  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Audio Recording State
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Image Generator State
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgRatio, setImgRatio] = useState('1:1');
  const [imgQuality, setImgQuality] = useState<'standard' | 'studio'>('standard');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  // Suggested prompt templates matching Tanzanian curriculum
  const suggestions = [
    {
      title: 'Solves Equation',
      text: 'Nisaidie kutatua na kuelewa swali la quadratic equation: 2x^2 + 5x - 3 = 0',
      icon: '📐'
    },
    {
      title: 'Explains Physics',
      text: 'Elezea tofauti kati ya Distance na Displacement kwa mifano rahisi ya sekondari.',
      icon: '⚡'
    },
    {
      title: 'Necta History',
      text: 'Je, ni mbinu gani zilizotumiwa na wakoloni kuingiza uchumi wa kikoloni nchini Tanganyika?',
      icon: '📜'
    },
    {
      title: 'TIE Swahili',
      text: 'Fupisha dhamana kuu na wahusika wa kitabu cha "Mstahiki Meya" kwa muhtasari.',
      icon: '✍️'
    }
  ];

  // Load chat history from localstorage if present
  useEffect(() => {
    const stored = localStorage.getItem('lupa_ai_chat');
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      const greetName = userProfile?.name || 'Mwanafunzi';
      setMessages([
        {
          role: 'assistant',
          content: `Habari gani, **${greetName}**! Mimi ni **Lupanulla AI**, msaidizi wako asilia wa masomo kutoka Lupanulla Foundation. 🇹🇿\n\nNimebobea kwenye mtaala wa **TIE na NECTA** kuanzia Shule ya Msingi hadi Kidato cha Sita. Unaweza kuniuliza maswali ya Hisabati, Fizikia, Kemia, Historia, au usaidizi wa kupanga ratiba ya mitihani. \n\n_Nitakusaidiaje kufikia ufaulu wa kiwango cha juu leo?_`
        }
      ]);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Recording timer
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const saveChatHistory = (updated: Message[]) => {
    setMessages(updated);
    localStorage.setItem('lupa_ai_chat', JSON.stringify(updated));
  };

  const handleClearChat = () => {
    const greetName = userProfile?.name || 'Mwanafunzi';
    const reset: Message[] = [
      {
        role: 'assistant',
        content: `Habari gani, **${greetName}**! Mimi ni **Lupanulla AI**, msaidizi wako asilia wa masomo kutoka Lupanulla Foundation. 🇹🇿\n\nNimebobea kwenye mtaala wa **TIE na NECTA** kuanzia Shule ya Msingi hadi Kidato cha Sita. Unaweza kuniuliza maswali ya Hisabati, Fizikia, Kemia, Historia, au usaidizi wa kupanga ratiba ya mitihani. \n\n_Nitakusaidiaje kufikia ufaulu wa kiwango cha juu leo?_`
      }
    ];
    saveChatHistory(reset);
    setError(null);
  };

  // Handle local files selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList) return;

    Array.from(filesList).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError("Samahani, picha au video haitakiwi kuzidi 10MB kwa usalama wa uhamishaji.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type,
            base64Data: base64Data,
            url: URL.createObjectURL(file)
          }
        ]);
      };
    });
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          
          setLoading(true);
          setError(null);
          try {
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Data,
                mimeType: 'audio/webm'
              })
            });

            if (!res.ok) throw new Error('Imeshindwa kutafsiri sauti kwenye seva.');
            const data = await res.json();
            if (data.text && data.text !== '(Sauti haieleweki)') {
              setInput(prev => prev ? prev + " " + data.text : data.text);
            } else {
              setError("Sauti haikueleweka vizuri, tafadhali ongea karibu na maikrofoni au andika.");
            }
          } catch (err: any) {
            console.error(err);
            setError('Imeshindwa kubadilisha sauti kuwa maandishi. Tafadhali jaribu tena au uandike.');
          } finally {
            setLoading(false);
          }
        };

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Tafadhali ruhusu matumizi ya maikrofoni ili kurekodi sauti.');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // Send Prompt to Gemini
  const handleSendPrompt = async (promptText: string) => {
    if (!canChat) {
      setError('🔒 Umefikia kikomo cha maswali ya bure (maswali 5). Tafadhali jiunge na Premium ili kuwasiliana na Lupanulla AI bila kikomo!');
      onNavigate('premium');
      return;
    }
    if ((!promptText.trim() && attachments.length === 0) || loading) return;

    setError(null);
    const userMsg: Message = { 
      role: 'user', 
      content: promptText,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    const updatedMessages = [...messages, userMsg];
    saveChatHistory(updatedMessages);
    
    setInput('');
    setAttachments([]); // Clear pending attachments
    setLoading(true);

    try {
      // Build systemic instructions based on class levels and persona selected
      let systemPrompt = `Wewe ni Lupanulla AI, Msaidizi wa Kujifunza wa Lupanulla Elimu Hub nchini Tanzania. 
Mada yako kuu ni kusaidia wanafunzi wa Kitanzania kujiandaa na mitihani yao ya kitaifa ya NECTA na majaribio mengine ya shule. 
Unajua kikamilifu mtaala wa TIE (Tanzania Institute of Education). `;

      if (persona === 'science') {
        systemPrompt += `Wewe ni Mwalimu Mbobezi wa Hisabati, Fizikia, na Kemia nchini Tanzania. Toa maelezo ya kina ya sayansi na hesabu za TIE hatua kwa hatua kwa lugha rahisi. `;
      } else if (persona === 'languages') {
        systemPrompt += `Wewe ni Mwalimu Mbobezi wa Kiswahili Fasihi, Kiingereza, na Historia ya Tanzania ya NECTA. Chambua kazi za fasihi na makala kwa uchambuzi wa kina. `;
      } else if (persona === 'planner') {
        systemPrompt += `Wewe ni Mshauri wa Kielimu Tanzania. Unasaidia kupanga ratiba za kujisomea, mbinu za kufaulu mitihani, na ushauri wa kujiandaa na NECTA. `;
      }

      if (selectedLevel === 'primary') {
        systemPrompt += `Mwanafunzi huyu ni wa ngazi ya Elimu ya Msingi (Primary School - Darasa la 5 hadi la 7). Tafadhali tumia lugha rahisi sana ya Kiswahili, toa mifano inayofaa kiwango cha umri wake na ueleze dhana kwa upendo. `;
      } else if (selectedLevel === 'olevel') {
        systemPrompt += `Mwanafunzi huyu ni wa ngazi ya Elimu ya Sekondari (Ordinary Level - Kidato cha 1 hadi cha 4). Eleza nadharia kwa kutumia mifano ya mtaala wa NECTA CSEE, taja masomo na mada husika na andika hatua za hisabati kwa usahihi wa kipekee. `;
      } else if (selectedLevel === 'alevel') {
        systemPrompt += `Mwanafunzi huyu ni wa ngazi ya Elimu ya Sekondari ya Juu (Advanced Level - Kidato cha 5 na 6). Toa majibu yenye mantiki na ushahidi wa kitaaluma wa hali ya juu (kiwango cha ACSEE). Tumia mifano mizuri na taja sayansi, hesabu au uchambuzi wa makala kwa kiingereza au kiswahili safi inavyohitajika. `;
      }

      systemPrompt += `\nUnapaswa kuwa mkarimu, kutoa majibu kwa kutumia markdown (kama orodha, vichwa vya habari, maandishi ya herufi nzito) ili kusaidia wanafunzi kusoma kwa urahisi. Kamwe usiongee kuhusu OpenAI au makampuni mengine, sema unatokana na Lupanulla Foundation. Jibu kwa Swahili safi ikiwezekana, au Kiingereza kwa mada za kiufundi (kama Sayansi/Hisabati). Toa miongozo na formula kila mwanafunzi anapoomba hesabu.`;

      const res = await fetch('/api/claude.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: updatedMessages,
          modelChoice: modelChoice,
          thinking: thinking,
          grounding: grounding
        })
      });

      if (!res.ok) {
        let errMsg = `Hitilafu ya seva (Seva imerudisha: ${res.status})`;
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          } else if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.message || data.error);
      }

      const assistantMsg: Message = { 
        role: 'assistant', 
        content: data.reply,
        isThinking: thinking
      };
      saveChatHistory([...updatedMessages, assistantMsg]);

      if (userProfile?.uid) {
        addNotification({
          userId: userProfile.uid,
          title: 'Lupanulla AI amejibu! 🤖',
          message: `${data.reply.substring(0, 80)}${data.reply.length > 80 ? '...' : ''}`,
          type: 'ai_response',
          link: 'fisimaji'
        }).catch(err => console.warn('Failed to add response notification:', err));
      }

    } catch (err: any) {
      console.error('Chat AI failure:', err);
      setError(err.message || 'Imeshindwa kuwasiliana na Lupanulla AI. Hakikisha upo mtandaoni au jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (!canChat) {
      alert('🔒 Umefikia kikomo cha maswali ya bure (maswali 5). Tafadhali jiunge na Premium ili kuweza kutumia Lupanulla AI bila kikomo!');
      onNavigate('premium');
      return;
    }
    handleSendPrompt(text);
  };

  // Image Generation Handler
  const handleGenerateImage = async () => {
    if (!isPremium) {
      alert('🔒 Kipengele hiki kinahitaji akaunti ya Lupanulla Premium. Tafadhali jiunge ili uweze kuchora picha kwa AI.');
      onNavigate('premium');
      return;
    }
    if (!imgPrompt.trim() || generatingImg) return;
    setGeneratingImg(true);
    setImgError(null);
    setGeneratedImg(null);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imgPrompt,
          aspectRatio: imgRatio,
          quality: imgQuality
        })
      });

      if (!res.ok) {
        let errMsg = 'Mchakato wa kutengeneza picha umeshindikana.';
        try {
          const errData = await res.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImg(data.imageUrl);
      } else {
        throw new Error('Hukuweza kupata picha kutoka kwa seva yetu ya AI.');
      }
    } catch (err: any) {
      console.error(err);
      setImgError(err.message || 'Mchakato umefeli. Tafadhali jaribu tena baadae.');
    } finally {
      setGeneratingImg(false);
    }
  };

  return (
    <div id="fisimaji-view" className="space-y-6 animate-fade-in text-slate-800 bg-slate-50 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Top Banner and Navigation Tabs */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 p-4 sm:p-5 rounded-3xl text-white shadow-md flex flex-col md:flex-row justify-between items-center gap-4 border border-cyan-500/10 flex-shrink-0">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 bg-cyan-500/20 text-cyan-300 rounded-xl flex items-center justify-center border border-cyan-400/20 shadow-inner">
            <Bot size={22} className="stroke-[2] animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <h1 className="font-display font-extrabold text-base sm:text-lg uppercase">Lupanulla AI Hub</h1>
              <span className="bg-purple-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">SMART TUTOR</span>
            </div>
            <p className="text-slate-300 text-[10px] sm:text-xs">
              Msaidizi binafsi wa masomo na Mchora picha za elimu aliyezoezwa mtaala wa NECTA &amp; TIE.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all uppercase flex items-center gap-2 ${activeTab === 'chat' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            <Bot size={14} /> Msaidizi wa Masomo
          </button>
          <button 
            onClick={() => setActiveTab('image-generator')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all uppercase flex items-center gap-2 ${activeTab === 'image-generator' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles size={14} /> Mchora Picha AI
          </button>
        </div>

        {/* Level Filter and Premium status configuration tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {isPremium ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/35 text-[10px] font-extrabold uppercase tracking-wider">
              <Crown size={11} className="animate-pulse text-amber-300" />
              Premium AI Active
            </div>
          ) : (
            <button
              onClick={() => onNavigate('premium')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer animate-pulse"
            >
              <Crown size={11} />
              Upgrade Premium
            </button>
          )}
        </div>
      </section>

      <>
        {activeTab === 'chat' ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
            
            {/* Left Column: Chat log */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between min-h-0 relative">
              
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={handleClearChat}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Futa Maongezi"
                >
                  <Trash size={16} />
                </button>
              </div>

              {/* Messages Flow Area */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
                {messages.map((msg, i) => {
                  const isAi = msg.role === 'assistant';
                  return (
                    <div key={i} className={`flex gap-3 max-w-[85%] ${isAi ? '' : 'ml-auto flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                        isAi ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isAi ? <Bot size={16} /> : <User size={16} />}
                      </div>

                      <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isAi 
                          ? 'bg-slate-50 border border-slate-150 text-slate-800' 
                          : 'bg-cyan-600 text-white shadow-md'
                      }`}>
                        <div className="space-y-1">
                          <MarkdownRenderer content={msg.content} />
                        </div>

                        {/* Rendering attached files indicators in history */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 border-t border-slate-200/50 pt-2">
                            {msg.attachments.map((att, attIdx) => (
                              <div key={attIdx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200">
                                {att.mimeType.startsWith('image/') ? <ImageIcon size={12} /> : <VideoIcon size={12} />}
                                <span className="max-w-[120px] truncate">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Thinking indicators */}
                        {isAi && msg.isThinking && (
                          <div className="flex items-center gap-1 text-[10px] text-purple-600 font-extrabold uppercase tracking-widest mt-2 border-t border-purple-100 pt-1">
                            <Brain size={10} className="animate-pulse" />
                            Imefikiriwa na Gemini Pro
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Typist loader */}
                {loading && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl px-4 py-3 text-slate-500 text-xs font-semibold flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                      <span>
                        {thinking ? 'Gemini anakamilisha mchakato mrefu wa kufikiri...' : 'Lupanulla AI anaandika...'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error alerts */}
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold items-center">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Attachments preview list */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl mb-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group w-16 h-16 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                      {att.mimeType.startsWith('image/') ? (
                        <img src={att.url} alt="attachment" className="w-full h-full object-cover" />
                      ) : (
                        <VideoIcon size={24} className="text-slate-400" />
                      )}
                      <button 
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all shadow-md z-10"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form input bar */}
              {canChat ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt(input);
                  }} 
                  className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5"
                >
                  {/* Media Attachment trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                    title="Weka Picha/Video"
                    disabled={loading}
                  >
                    <ImageIcon size={18} />
                  </button>
                  
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                  />

                  {/* Voice transcription / microphone trigger */}
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${recording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:text-cyan-600 hover:bg-cyan-50'}`}
                    title={recording ? 'Acha kurekodi sauti' : 'Zungumza kutafsiri sauti'}
                    disabled={loading}
                  >
                    <Mic size={18} />
                  </button>

                  {recording && (
                    <span className="text-xs text-red-600 font-extrabold animate-pulse ml-2">
                      Inarekodi: {recordingTime}s
                    </span>
                  )}

                  <input 
                    type="text" 
                    required={attachments.length === 0}
                    disabled={loading || recording}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={recording ? "Tafadhali zungumza sasa..." : "Uliza chochote hapa (Hesabu, Fizikia, Kemia, Historia, n.k)..."} 
                    className="flex-grow bg-transparent px-2 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
                  />
                  
                  <button 
                    type="submit" 
                    disabled={loading || recording || (!input.trim() && attachments.length === 0)}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-200 text-slate-950 disabled:text-slate-400 p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-400/35 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-yellow-500/5 opacity-40 blur-lg rounded-2xl pointer-events-none"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 p-2.5 rounded-xl flex-shrink-0 shadow-md">
                      <Crown size={18} className="animate-pulse" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        Lupanulla Premium Inahitajika 🚀
                      </h4>
                      <p className="text-[11px] sm:text-xs text-amber-900/90 font-bold leading-relaxed">
                        Umefikia kikomo cha maswali ya bure (maswali 5). Jiunge na Premium sasa upate majibu yasiyo na kikomo, uchoraji picha kwa AI, na mbinu zote za ufaulu wa NECTA!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('premium')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 relative z-10 transform hover:scale-102 active:scale-95"
                  >
                    <Crown size={14} /> Go Premium
                  </button>
                </div>
              )}

            </div>

            {/* Right Column: Suggested templates & AI settings (Desktop sidebar) */}
            <div className="lg:col-span-1 hidden lg:flex flex-col gap-6 overflow-y-auto">
              
              {/* AI Controller Panel */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Settings size={16} className="text-cyan-600" />
                  <h3 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-widest block">AI Control Panel</h3>
                </div>

                {/* Level / Class selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngazi ya Elimu</label>
                  <select 
                    value={selectedLevel}
                    onChange={(e: any) => setSelectedLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="primary">Msingi (Darasa la 5-7)</option>
                    <option value="olevel">O-Level (Kidato 1-4)</option>
                    <option value="alevel">A-Level (Kidato 5-6)</option>
                  </select>
                </div>

                {/* Persona choice */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mwalimu Persona</label>
                  <select 
                    value={persona}
                    onChange={(e: any) => setPersona(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="default">Standard Smart Tutor</option>
                    <option value="science">Mwalimu wa Sayansi &amp; Hesabu</option>
                    <option value="languages">Mwalimu wa Lugha &amp; Sanaa</option>
                    <option value="planner">Mshauri wa Ratiba &amp; Mitihani</option>
                  </select>
                </div>

                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Uwezo wa Model</label>
                  <select 
                    value={modelChoice}
                    disabled={thinking}
                    onChange={(e: any) => setModelChoice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  >
                    <option value="lite">Gemini Flash Lite (Fast)</option>
                    <option value="flash">Gemini Flash (General)</option>
                    <option value="pro">Gemini Pro (Advanced)</option>
                  </select>
                </div>

                {/* Thinking level toggle */}
                <div className="flex items-center justify-between bg-purple-50 p-3 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-purple-600" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Fikra Kina (Thinking)</span>
                      <span className="text-[9px] text-purple-600 font-semibold block">Gemini 3.1 Pro High</span>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={thinking}
                    onChange={(e) => {
                      setThinking(e.target.checked);
                      if (e.target.checked) {
                        setModelChoice('pro');
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {/* Grounding Option dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hali ya Grounding (Mtandao)</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setGrounding('none')}
                      className={`py-1.5 text-[9px] font-bold rounded-lg transition-all ${grounding === 'none' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Kawaida
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrounding('search')}
                      className={`py-1.5 text-[9px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${grounding === 'search' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'}`}
                      title="Google Search Grounding"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrounding('maps')}
                      className={`py-1.5 text-[9px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${grounding === 'maps' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'}`}
                      title="Google Maps Grounding"
                    >
                      Maps
                    </button>
                  </div>
                </div>

              </div>

              {/* Suggestions items */}
              <div className="space-y-3">
                <h3 className="font-display font-extrabold text-[10px] text-slate-400 uppercase tracking-widest block">Mifano ya Kuanza</h3>
                <div className="space-y-3">
                  {suggestions.map((sug, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleSuggestionClick(sug.text)}
                      className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-cyan-400 hover:shadow-sm transition-all cursor-pointer space-y-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{sug.icon}</span>
                        <h4 className="font-bold text-slate-900 text-xs">{sug.title}</h4>
                      </div>
                      <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 font-semibold">
                        &quot;{sug.text}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Image Generator Tab View */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
            
            {/* Left Options Form Panel */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="text-cyan-600" size={18} />
                  <h2 className="font-display font-extrabold text-sm text-slate-950 uppercase tracking-wider">Tengeneza Mchoro/Picha</h2>
                </div>

                {/* Prompt box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eleza picha unayotaka (Swahili au English)</label>
                  <textarea 
                    value={imgPrompt}
                    onChange={(e) => setImgPrompt(e.target.value)}
                    placeholder="Mfano: 'Chora picha ya ramani ya Tanzania ikionyesha maziwa makuu na mlima Kilimanjaro kwa mtindo wa kielektroniki, ubora wa juu sana'..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none font-semibold"
                  />
                </div>

                {/* Model quality choice */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ubora wa Mchoro (Model)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImgQuality('standard')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col gap-1 text-left ${imgQuality === 'standard' ? 'bg-cyan-50 border-cyan-300 text-cyan-950 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <span className="block">Kawaida (General)</span>
                      <span className="text-[9px] opacity-75 font-medium block">gemini-3.1-flash-image</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setImgQuality('studio')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col gap-1 text-left ${imgQuality === 'studio' ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <span className="block flex items-center gap-1 text-amber-900"><Crown size={12} /> Studio Quality</span>
                      <span className="text-[9px] opacity-75 font-medium block">gemini-3-pro-image</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio selections */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chagua Uwiano wa Picha (Aspect Ratio)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: '1:1', label: '1:1 (Square)', desc: 'Instagram' },
                      { value: '3:2', label: '3:2 (Landscape)', desc: 'Standard' },
                      { value: '2:3', label: '2:3 (Portrait)', desc: 'Urefu' },
                      { value: '3:4', label: '3:4', desc: 'Standard' },
                      { value: '4:3', label: '4:3', desc: 'Sura' },
                      { value: '9:16', label: '9:16 (Tall)', desc: 'Simu/Story' },
                      { value: '16:9', label: '16:9 (Wide)', desc: 'Skrini/TV' },
                      { value: '21:9', label: '21:9 (Cinematic)', desc: 'Cinema' }
                    ].map((ratio) => (
                      <button
                        key={ratio.value}
                        type="button"
                        onClick={() => setImgRatio(ratio.value)}
                        className={`p-2 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center text-center leading-tight ${imgRatio === ratio.value ? 'bg-cyan-500 border-cyan-600 text-slate-950 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="block">{ratio.value}</span>
                        <span className="text-[8px] opacity-75 font-medium block">{ratio.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                {imgError && (
                  <div className="bg-red-50 border border-red-150 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold items-center">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p>{imgError}</p>
                  </div>
                )}

                {isPremium ? (
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImg || !imgPrompt.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-200 text-slate-950 disabled:text-slate-400 font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <Sparkles size={14} className={generatingImg ? 'animate-spin' : ''} />
                    {generatingImg ? 'AI Inatengeneza...' : 'Tengeneza Picha'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      alert('🔒 Kipengele cha kuchora picha kwa AI kinahitaji akaunti ya Lupanulla Premium.');
                      onNavigate('premium');
                    }}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer transform hover:scale-[1.01] active:scale-95"
                  >
                    <Crown size={14} /> Go Premium (Mchora Picha AI)
                  </button>
                )}
              </div>

            </div>

            {/* Right Interactive Image Preview Canvas */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[400px]">
              
              <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 overflow-hidden relative min-h-[300px]">
                {generatingImg ? (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div>
                      <p className="text-slate-900 font-extrabold text-sm uppercase">AI Inapaka Rangi mchoro wako...</p>
                      <p className="text-slate-400 text-xs font-semibold mt-1">Inasindika uwiano wa {imgRatio} kwa kutumia Gemini.</p>
                    </div>
                  </div>
                ) : generatedImg ? (
                  <div className="w-full h-full flex items-center justify-center p-2 relative group">
                    <img 
                      src={generatedImg} 
                      alt="Generated Artwork" 
                      className="max-h-[450px] object-contain rounded-xl shadow-lg border border-slate-100" 
                    />
                    
                    <a 
                      href={generatedImg} 
                      download={`lupanulla_ai_${Date.now()}.png`}
                      className="absolute bottom-4 right-4 bg-slate-950/80 hover:bg-slate-950 text-white p-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Download size={14} /> Pakua Picha (Download)
                    </a>
                  </div>
                ) : (
                  <div className="text-center p-8 max-w-sm space-y-3">
                    <div className="w-16 h-16 bg-cyan-100/60 text-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <ImageIcon size={28} />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-slate-950 text-sm uppercase">Hakuna picha iliyotengenezwa bado</h3>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium mt-1">
                        Andika maelezo ya picha unayotaka kushoto, chagua uwiano (mfano. 16:9 au 1:1) na ubonyeze kitufe ili kuona uwezo mkubwa wa Gemini.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informational Footer */}
              <div className="mt-4 flex gap-2 items-start bg-slate-50 rounded-2xl p-3 border border-slate-200 text-slate-500 text-xs leading-relaxed">
                <Info size={16} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                  <strong>Kidokezo:</strong> Picha hizi hutengenezwa kwa uwezo wa kipekee wa kielektroniki. Unaweza kuzitumia kama michoro ya kujifunzia kwenye makala zako za elimu, notisi, au miradi ya masomo.
                </p>
              </div>

            </div>

          </div>
        )}
      </>

    </div>
  );
}
