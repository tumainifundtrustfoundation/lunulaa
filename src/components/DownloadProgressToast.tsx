import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  X, 
  CheckCircle2, 
  Wifi, 
  HardDrive, 
  FileText, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActiveDownload {
  id: string;
  title: string;
  url: string;
  progress: number;
  totalSize: number; // in MB
  downloadedSize: number; // in MB
  speed: number; // in MB/s
  status: 'downloading' | 'syncing' | 'completed' | 'cancelled';
}

export default function DownloadProgressToast() {
  const [download, setDownload] = useState<ActiveDownload | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleStartDownload = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; url: string; fileSize?: number }>;
      const { title, url, fileSize } = customEvent.detail;

      // Clear any existing active download timer
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Generate a realistic file size for a "heavy past paper" (e.g., 14.5 MB to 22.8 MB)
      const calculatedTotalSize = fileSize || parseFloat((12.5 + Math.random() * 10).toFixed(1));
      
      const newDownload: ActiveDownload = {
        id: `dl-${Date.now()}`,
        title: title || 'Nyenzo ya Lupanulla',
        url: url,
        progress: 0,
        totalSize: calculatedTotalSize,
        downloadedSize: 0,
        speed: parseFloat((2.5 + Math.random() * 2).toFixed(1)),
        status: 'downloading'
      };

      setDownload(newDownload);

      // Start simulated download progress
      let currentProgress = 0;
      progressInterval.current = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 8) + 4; // realistic steps
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          if (progressInterval.current) clearInterval(progressInterval.current);

          // Transition to offline syncing
          setDownload(prev => {
            if (!prev) return null;
            return {
              ...prev,
              progress: 100,
              downloadedSize: prev.totalSize,
              status: 'syncing'
            };
          });

          // Simulate indexedDB/offline saving after 1.2 seconds
          setTimeout(() => {
            setDownload(prev => {
              if (!prev) return null;
              
              // Trigger actual file download in browser at the end of progress
              try {
                const link = document.createElement('a');
                link.href = prev.url;
                link.target = '_blank';
                link.download = prev.title.endsWith('.pdf') ? prev.title : `${prev.title}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (err) {
                console.error('Failed direct trigger, opening in tab instead:', err);
                window.open(prev.url, '_blank');
              }

              return {
                ...prev,
                status: 'completed'
              };
            });

            // Automatically clear toast after 4.5 seconds of completion
            setTimeout(() => {
              setDownload(prev => {
                if (prev && prev.status === 'completed') {
                  return null;
                }
                return prev;
              });
            }, 4500);

          }, 1200);

        } else {
          // Normal downloading state increment
          setDownload(prev => {
            if (!prev || prev.status !== 'downloading') return prev;
            
            // fluctuate speed slightly for high realism
            const speedFluctuation = parseFloat((prev.speed + (Math.random() * 0.8 - 0.4)).toFixed(1));
            const actualSpeed = Math.max(1.2, Math.min(6.5, speedFluctuation));
            const downloaded = parseFloat(((currentProgress / 100) * prev.totalSize).toFixed(1));

            return {
              ...prev,
              progress: currentProgress,
              downloadedSize: Math.min(downloaded, prev.totalSize),
              speed: actualSpeed
            };
          });
        }
      }, 250); // fast-paced feedback
    };

    window.addEventListener('start-pdf-download' as any, handleStartDownload);

    return () => {
      window.removeEventListener('start-pdf-download' as any, handleStartDownload);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleCancel = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setDownload(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'cancelled'
      };
    });
    setTimeout(() => {
      setDownload(null);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {download && (
        <motion.div
          id="download-progress-toast"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[200] w-full max-w-sm bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 overflow-hidden"
        >
          {/* Subtle gradient background line based on state */}
          <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${
            download.status === 'completed' ? 'bg-emerald-500' :
            download.status === 'syncing' ? 'bg-indigo-500' :
            download.status === 'cancelled' ? 'bg-rose-500' : 'bg-cyan-500'
          }`} />

          <div className="flex gap-3 items-start">
            {/* Left Icon Panel */}
            <div className={`p-2.5 rounded-xl shrink-0 ${
              download.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
              download.status === 'syncing' ? 'bg-indigo-500/10 text-indigo-400' :
              download.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'
            }`}>
              {download.status === 'completed' ? (
                <CheckCircle2 size={18} className="animate-bounce" />
              ) : download.status === 'syncing' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : download.status === 'cancelled' ? (
                <X size={18} />
              ) : (
                <Download size={18} className="animate-pulse" />
              )}
            </div>

            {/* Right Information Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    {download.status === 'completed' ? (
                      <span className="text-emerald-400">Upakuaji Umekamilika</span>
                    ) : download.status === 'syncing' ? (
                      <span className="text-indigo-400 flex items-center gap-1"><HardDrive size={10} className="animate-pulse" /> Inasawazisha Offline</span>
                    ) : download.status === 'cancelled' ? (
                      <span className="text-rose-400">Imesitishwa</span>
                    ) : (
                      <span className="text-cyan-400 flex items-center gap-1"><Wifi size={10} /> Inapakua Nyaraka Nzito</span>
                    )}
                  </p>
                  <h4 className="font-sans font-black text-xs truncate text-white mt-0.5" title={download.title}>
                    {download.title}
                  </h4>
                </div>
                {download.status !== 'completed' && download.status !== 'cancelled' && (
                  <button 
                    onClick={handleCancel}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Sitisha upakuaji"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Progress bar and numeric tracking */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>
                    {download.downloadedSize} MB ya {download.totalSize} MB
                  </span>
                  <span>{download.progress}%</span>
                </div>

                {/* Progress bar track */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${download.progress}%` }}
                    transition={{ duration: 0.2 }}
                    className={`h-full rounded-full ${
                      download.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      download.status === 'syncing' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                      download.status === 'cancelled' ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Network statistics & status text */}
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold uppercase">
                {download.status === 'downloading' && (
                  <>
                    <span className="flex items-center gap-1 text-cyan-400/90">
                      ⚡ {download.speed} MB/s
                    </span>
                    <span>
                      Sekunde {Math.ceil((download.totalSize - download.downloadedSize) / (download.speed || 1))} zimesalia
                    </span>
                  </>
                )}
                {download.status === 'syncing' && (
                  <span className="text-indigo-400 flex items-center gap-1 w-full justify-between">
                    <span>Inatayarisha faili la usomaji nje ya mtandao...</span>
                  </span>
                )}
                {download.status === 'completed' && (
                  <span className="text-emerald-400 flex items-center gap-1 w-full justify-between">
                    <span className="flex items-center gap-1"><HardDrive size={10} /> Offline Ready! Imehifadhiwa kikamilifu</span>
                    <button 
                      onClick={() => setDownload(null)}
                      className="text-[9px] text-slate-400 hover:text-white underline font-black ml-2 cursor-pointer uppercase"
                    >
                      Funga
                    </button>
                  </span>
                )}
                {download.status === 'cancelled' && (
                  <span className="text-rose-400">Upakuaji umefutwa kwa mafanikio.</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
