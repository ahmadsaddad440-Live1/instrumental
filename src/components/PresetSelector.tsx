import React from 'react';
import { Sparkles, Waves } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { VibePreset } from '../types';

interface PresetSelectorProps {
  activePresetId?: string;
  onSelectPreset: (preset: VibePreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div
      id="preset-selector-container"
      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span>Preset Vibe Instrumental (Studi, Relaksasi & Tidur)</span>
        </h3>
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Klik untuk auto-fill parameter
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3 rounded-xl border transition-all group ${
                isSelected
                  ? 'bg-indigo-950/50 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                  : 'bg-gray-950/80 border-gray-800/90 hover:border-cyan-500/50 hover:bg-gray-900'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 line-clamp-1">
                  {preset.name}
                </span>
              </div>
              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-semibold mb-1 border border-cyan-500/20">
                {preset.badge}
              </span>
              <p className="text-[11px] text-gray-400 line-clamp-1">
                {preset.genre.split('(')[0]} • {preset.bpm} BPM
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
