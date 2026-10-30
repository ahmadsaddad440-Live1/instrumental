import React from 'react';
import { Headphones, Waves, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onScrollToSampler: () => void;
  historyCount: number;
  aiAvailable?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onScrollToSampler,
  historyCount,
  aiAvailable = true,
}) => {
  return (
    <header
      id="app-header"
      className="border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-teal-400 text-white shadow-lg shadow-indigo-500/20">
            <Waves className="w-6 h-6 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[9px] font-bold text-white items-center justify-center">
                AI
              </span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                <span>Suno Instrumental Master</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  RELAXATION & STUDY PRO
                </span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              Generator Prompt Suno AI: Musik Instrumental Relaksasi, Lo-Fi Study, Deep Work 432Hz & Tidur Nyenyak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {aiAvailable && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini 3.8 Connected</span>
            </div>
          )}

          <button
            id="btn-nav-beat-tester"
            onClick={onScrollToSampler}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-300 border border-cyan-500/20 transition-all hover:border-cyan-500/40 cursor-pointer"
            title="Uji soundscape instrumen relaksasi & lo-fi"
          >
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Soundscape Tester</span>
          </button>

          <button
            id="btn-nav-history"
            onClick={onOpenHistory}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 transition-all border border-gray-800 hover:border-gray-700 cursor-pointer"
            title="Buka riwayat prompt tersimpan"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Riwayat</span>
            <span
              id="history-counter-badge"
              className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-indigo-500/30"
            >
              {historyCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
