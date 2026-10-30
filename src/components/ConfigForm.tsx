import React from 'react';
import { Sliders, RotateCcw, Dice5, Sparkles, Tag, Headphones } from 'lucide-react';
import { SongConfig } from '../types';
import {
  GENRE_OPTIONS,
  VOCAL_OPTIONS,
  MOOD_OPTIONS,
  INSTRUMENT_OPTIONS,
  RANDOM_TOPICS,
} from '../data/presets';

interface ConfigFormProps {
  config: SongConfig;
  onChange: (updated: Partial<SongConfig>) => void;
  onReset: () => void;
  onGenerateAI: () => void;
  onInstantTags: () => void;
  isGenerating: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  onChange,
  onReset,
  onGenerateAI,
  onInstantTags,
  isGenerating,
}) => {
  const getBpmLabel = (bpm: number) => {
    if (bpm < 55) return 'Tidur Lelap (Delta/Theta Waves)';
    if (bpm < 68) return 'Meditasi & Deep Focus (Alpha Waves)';
    if (bpm < 82) return 'Lo-Fi Study & Pomodoro Work';
    return 'Chillhop & Coding Downtempo';
  };

  const handleInstrumentToggle = (instrumentValue: string) => {
    const exists = config.instruments.includes(instrumentValue);
    if (exists) {
      onChange({ instruments: config.instruments.filter((i) => i !== instrumentValue) });
    } else {
      onChange({ instruments: [...config.instruments, instrumentValue] });
    }
  };

  const handleRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
    onChange({ topic: RANDOM_TOPICS[randomIndex] });
  };

  return (
    <div
      id="customizer-form-card"
      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5"
    >
      <div className="border-b border-gray-800 pb-3.5 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Konfigurasi Genre, Suasana & Instrumen Relaksasi</span>
        </h3>
        <button
          id="btn-reset-form"
          type="button"
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sub-genre & Vocal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="genre-select" className="block text-xs font-semibold text-gray-300 mb-1.5">
            Genre Instrumental Relaksasi / Studi
          </label>
          <select
            id="genre-select"
            value={config.genre}
            onChange={(e) => onChange({ genre: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            {GENRE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vocal-select" className="block text-xs font-semibold text-gray-300 mb-1.5">
            Format Vokal / Suara Latar
          </label>
          <select
            id="vocal-select"
            value={config.vocal}
            onChange={(e) => onChange({ vocal: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            {VOCAL_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BPM & Mood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="bpm-range" className="text-xs font-semibold text-gray-300">
              Tempo Tenang (BPM)
            </label>
            <span
              id="bpm-display-badge"
              className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20"
            >
              {config.bpm} BPM ({getBpmLabel(config.bpm)})
            </span>
          </div>
          <input
            id="bpm-range"
            type="range"
            min="45"
            max="95"
            step="1"
            value={config.bpm}
            onChange={(e) => onChange({ bpm: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
            <span>48 (Sleep)</span>
            <span>60 (Alpha 432Hz)</span>
            <span>75 (Lo-Fi Study)</span>
            <span>85 (Chillhop)</span>
          </div>
        </div>

        <div>
          <label htmlFor="mood-select" className="block text-xs font-semibold text-gray-300 mb-1.5">
            Suasana / Vibe Musik
          </label>
          <select
            id="mood-select"
            value={config.mood}
            onChange={(e) => onChange({ mood: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            {MOOD_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instruments Checkboxes */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          Instrumen Relaksasi, Lo-Fi & Akustik Pilihan:
        </label>
        <div id="instruments-checkboxes-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INSTRUMENT_OPTIONS.map((inst) => {
            const isChecked = config.instruments.includes(inst.value);
            return (
              <label
                key={inst.id}
                id={`label-inst-${inst.id}`}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  isChecked
                    ? 'bg-indigo-950/40 border-cyan-500/60 text-cyan-200 shadow-sm'
                    : 'bg-gray-950/80 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <input
                  id={`checkbox-inst-${inst.id}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleInstrumentToggle(inst.value)}
                  className="rounded border-gray-700 text-cyan-500 focus:ring-cyan-500 bg-gray-900"
                />
                <span className="truncate">{inst.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Story / Atmosphere Idea */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="topic-input" className="text-xs font-semibold text-gray-300">
            Latar Suasana / Deskripsi Tema Visual (Study, Cafe, Rain, dll)
          </label>
          <button
            id="btn-random-topic"
            type="button"
            onClick={handleRandomTopic}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Dice5 className="w-3.5 h-3.5" />
            <span>Ide Acak Suasana</span>
          </button>
        </div>
        <input
          id="topic-input"
          type="text"
          value={config.topic}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder="Contoh: Sesi belajar larut malam di kamar yang tenang dengan gemercik hujan lembut di jendela kaca"
          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Jelaskan suasana visual: meja belajar, kamar tidur hujan, kedai kopi estetik, hutan pagi berkabut, atau langit malam.
        </p>
      </div>

      {/* Language & Suno Version */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="language-select" className="block text-xs font-semibold text-gray-300 mb-1.5">
            Pengaturan Format Vokal / Instrumental
          </label>
          <select
            id="language-select"
            value={config.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="100% Instrumental (No Lyrics / Vocals)">100% Murni Instrumental (Tanpa Vokal / Lirik)</option>
            <option value="Instrumental + Ambient Field Recording">Instrumental + Suara Alam / Hujan (Field Recording)</option>
            <option value="Instrumental + Wordless Vocal Chants">Instrumental + Senandung Halus Tanpa Kata (Wordless Chants)</option>
          </select>
        </div>

        <div>
          <label htmlFor="suno-version-select" className="block text-xs font-semibold text-gray-300 mb-1.5">
            Target Model Suno AI
          </label>
          <select
            id="suno-version-select"
            value={config.sunoVersion}
            onChange={(e) => onChange({ sunoVersion: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="Suno v4">Suno v4 (Kualitas Audio & Separasi Instrumen Tertinggi)</option>
            <option value="Suno v3.5">Suno v3.5 (Standar Lo-Fi & Felt Piano Hangat)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          id="btn-generate-ai"
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'AI Sedang Menyusun Prompt Instrumental...' : 'Generate Prompt Instrumental Relaksasi AI'}</span>
        </button>

        <button
          id="btn-quick-tags"
          type="button"
          onClick={onInstantTags}
          className="sm:w-auto px-4 py-3 rounded-xl font-semibold text-xs text-gray-200 bg-gray-800/90 hover:bg-gray-700 border border-gray-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Tag className="w-3.5 h-3.5 text-cyan-400" />
          <span>Instant Tags</span>
        </button>
      </div>
    </div>
  );
};
