import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { speechService } from '../services/speech';
import { useI18n } from '../services/i18n';

export const AudioPlayerBar: React.FC = () => {
  const { language } = useI18n();
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [text, setText] = useState<string>('');

  useEffect(() => {
    const unsub = speechService.subscribe((newStatus, newText) => {
      setStatus(newStatus);
      setText(newText);
    });
    return unsub;
  }, []);

  if (status === 'idle') return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
          <Volume2 className="w-5 h-5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              {status === 'playing'
                ? language === 'hi'
                  ? 'आवाज़ में पढ़ा जा रहा है'
                  : 'Reading Aloud'
                : language === 'hi'
                ? 'विराम दिया गया'
                : 'Paused'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          </div>
          <p className="text-xs text-slate-300 truncate max-w-[280px] sm:max-w-md">
            {text}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {status === 'playing' ? (
          <button
            onClick={() => speechService.pause()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            title={language === 'hi' ? 'रोकें' : 'Pause'}
            aria-label="Pause reading"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => speechService.resume()}
            className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors"
            title={language === 'hi' ? 'जारी रखें' : 'Resume'}
            aria-label="Resume reading"
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => speechService.stop()}
          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/30 text-rose-300 transition-colors"
          title={language === 'hi' ? 'बंद करें' : 'Stop'}
          aria-label="Stop reading"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
