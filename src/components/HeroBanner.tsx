import React from 'react';
import { BookOpen, Sparkles, Waves, Moon, Coffee } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div
      id="hero-banner"
      className="relative overflow-hidden rounded-2xl p-5 sm:p-7 mb-8 border border-indigo-500/20 bg-gradient-to-r from-slate-950/80 via-indigo-950/40 to-slate-950/80 shadow-2xl backdrop-blur-sm"
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spesialis Musik Instrumental: Relaksasi, Fokus Belajar & Deep Work (Suno v3.5 & v4)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Ciptakan Musik Instrumental Relaksasi & Fokus Studi Berkualitas Tinggi
          </h2>
          <p className="text-sm text-gray-300 max-w-2xl mt-1.5 leading-relaxed">
            Hasilkan prompt presisi untuk Lo-Fi Chillhop kamar tidur, Ambient Deep Work 432Hz, Cozy Coffee Shop Jazz, Piano & Cello menyentuh kalbu, hingga alunan tidur nyenyak anti-insomnia. 100% murni instrumental tanpa vokal mengganggu, lengkap dengan synthesizer tekstur dan aransemen Suno AI.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-col lg:flex-row gap-2">
          <span className="text-xs bg-gray-900/80 border border-gray-700/80 px-2.5 py-1 rounded-lg text-cyan-300 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            #LoFiStudy
          </span>
          <span className="text-xs bg-gray-900/80 border border-gray-700/80 px-2.5 py-1 rounded-lg text-indigo-300 font-mono flex items-center gap-1.5">
            <Waves className="w-3 h-3 text-indigo-400" />
            #DeepFocus432Hz
          </span>
          <span className="text-xs bg-gray-900/80 border border-gray-700/80 px-2.5 py-1 rounded-lg text-amber-300 font-mono flex items-center gap-1.5">
            <Coffee className="w-3 h-3 text-amber-400" />
            #RainyCafeJazz
          </span>
          <span className="text-xs bg-gray-900/80 border border-gray-700/80 px-2.5 py-1 rounded-lg text-purple-300 font-mono flex items-center gap-1.5">
            <Moon className="w-3 h-3 text-purple-400" />
            #SleepAmbient
          </span>
        </div>
      </div>
    </div>
  );
};
