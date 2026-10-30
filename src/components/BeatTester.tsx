import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Square, Sparkles, Volume2, Waves } from 'lucide-react';
import { playLiveDrum, SoundPadType } from '../utils/audioSynth';

interface BeatTesterProps {
  bpm: number;
}

type GrooveStyle = 'lofi-study' | 'ambient-zen' | 'binaural-flow';

export const BeatTester: React.FC<BeatTesterProps> = ({ bpm }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [grooveStyle, setGrooveStyle] = useState<GrooveStyle>('lofi-study');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stepRef = useRef<number>(0);
  const bpmRef = useRef<number>(bpm);
  const grooveRef = useRef<GrooveStyle>(grooveStyle);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    grooveRef.current = grooveStyle;
  }, [grooveStyle]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const runStep = () => {
    const currentStep = stepRef.current;
    setActiveStep(currentStep);

    const style = grooveRef.current;

    if (style === 'lofi-study') {
      // Relaxing Lo-Fi Study Groove (Warm kick, soft snare, rhodes chord, vinyl texture)
      if (currentStep === 0) {
        playLiveDrum('rhodes');
        playLiveDrum('kick');
        playLiveDrum('vinyl');
      }
      if (currentStep === 4) {
        playLiveDrum('snare');
      }
      if (currentStep === 8) {
        playLiveDrum('rhodes');
        playLiveDrum('kick');
      }
      if (currentStep === 10) {
        playLiveDrum('kick');
      }
      if (currentStep === 12) {
        playLiveDrum('snare');
      }
      if (currentStep % 4 === 0) {
        playLiveDrum('vinyl');
      }
    } else if (style === 'ambient-zen') {
      // Meditative Zen Style (Singing bowl on downbeat, rain noise, soft bell resonances)
      if (currentStep === 0) {
        playLiveDrum('bowl');
        playLiveDrum('vinyl');
      }
      if (currentStep === 8) {
        playLiveDrum('rhodes');
      }
      if (currentStep % 4 === 0) {
        playLiveDrum('vinyl');
      }
    } else if (style === 'binaural-flow') {
      // Deep Work Alpha Wave Flow
      if (currentStep === 0 || currentStep === 8) {
        playLiveDrum('binaural');
        playLiveDrum('kick');
      }
      if (currentStep === 4 || currentStep === 12) {
        playLiveDrum('snare');
      }
      if (currentStep % 2 === 0) {
        playLiveDrum('vinyl');
      }
    }

    stepRef.current = (currentStep + 1) % 16;
    const currentBpm = bpmRef.current || 75;
    const stepDuration = (60 / currentBpm / 4) * 1000;

    timerRef.current = setTimeout(runStep, stepDuration);
  };

  const togglePlayLoop = () => {
    if (isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsPlaying(false);
      setActiveStep(-1);
    } else {
      setIsPlaying(true);
      stepRef.current = 0;
      runStep();
    }
  };

  return (
    <div
      id="kendang-sampler-panel"
      className="bg-gray-900/85 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Lo-Fi & Ambient Soundscape Tester</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {bpm} BPM
              </span>
            </h4>
            <p className="text-[11px] text-gray-400">
              Uji tekstur instrumen relaksasi, Rhodes piano, hujan, dan frekuensi gelombang fokus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Groove Style Selector */}
          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-[11px]">
            <button
              type="button"
              onClick={() => setGrooveStyle('lofi-study')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                grooveStyle === 'lofi-study'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lo-Fi Study
            </button>
            <button
              type="button"
              onClick={() => setGrooveStyle('ambient-zen')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                grooveStyle === 'ambient-zen'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Zen & Rain
            </button>
            <button
              type="button"
              onClick={() => setGrooveStyle('binaural-flow')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                grooveStyle === 'binaural-flow'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Alpha 432Hz
            </button>
          </div>

          <button
            id="btn-toggle-loop-beat"
            type="button"
            onClick={togglePlayLoop}
            className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all flex items-center gap-1.5 shadow-md ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Loop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Loop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 16-step visualizer bar */}
      <div className="flex gap-1 mb-3.5 py-1 px-1.5 bg-gray-950 rounded-lg border border-gray-800">
        {Array.from({ length: 16 }).map((_, idx) => {
          const isCurrent = activeStep === idx;
          const isDownbeat = idx % 4 === 0;
          return (
            <div
              key={idx}
              className={`flex-1 h-2 rounded-sm transition-all ${
                isCurrent
                  ? 'bg-cyan-400 shadow-sm shadow-cyan-400 scale-y-125'
                  : isDownbeat
                  ? 'bg-indigo-600/80'
                  : 'bg-gray-800/60'
              }`}
            />
          );
        })}
      </div>

      {/* 6 Interactive Sound Pads */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          id="pad-drum-rhodes"
          type="button"
          onClick={() => playLiveDrum('rhodes')}
          className="p-2.5 sm:p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/60 rounded-xl text-center transition-all active:scale-95 group focus:outline-none cursor-pointer"
        >
          <span className="block text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
            RHODES
          </span>
          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Jazz E-Piano</span>
        </button>

        <button
          id="pad-drum-vinyl"
          type="button"
          onClick={() => playLiveDrum('vinyl')}
          className="p-2.5 sm:p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-sky-500/60 rounded-xl text-center transition-all active:scale-95 group focus:outline-none cursor-pointer"
        >
          <span className="block text-xs font-bold text-sky-400 group-hover:text-sky-300">
            RAIN & TAPE
          </span>
          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Vinyl Hiss</span>
        </button>

        <button
          id="pad-drum-kick"
          type="button"
          onClick={() => playLiveDrum('kick')}
          className="p-2.5 sm:p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-teal-500/60 rounded-xl text-center transition-all active:scale-95 group focus:outline-none cursor-pointer"
        >
          <span className="block text-xs font-bold text-teal-400 group-hover:text-teal-300">
            WARM KICK
          </span>
          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Boom Bap</span>
        </button>

        <button
          id="pad-drum-snare"
          type="button"
          onClick={() => playLiveDrum('snare')}
          className="p-2.5 sm:p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/60 rounded-xl text-center transition-all active:scale-95 group focus:outline-none cursor-pointer"
        >
          <span className="block text-xs font-bold text-blue-400 group-hover:text-blue-300">
            RIM SNARE
          </span>
          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Muffled Snap</span>
        </button>

        <button
          id="pad-drum-bowl"
          type="button"
          onClick={() => playLiveDrum('bowl')}
          className="p-2.5 sm:p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-amber-500/60 rounded-xl text-center transition-all active:scale-95 group focus:outline-none cursor-pointer"
        >
          <span className="block text-xs font-bold text-amber-400 group-hover:text-amber-300">
            ZEN BOWL
          </span>
          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Singing Bell</span>
        </button>

        <button
          id="pad-drum-binaural"
          type="button"
          onClick={() => playLiveDrum('binaural')}
          className="p-2.5 sm:p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/60 rounded-xl text-center transition-all active:scale-95 group focus:outline-none cursor-pointer"
        >
          <span className="block text-xs font-bold text-purple-400 group-hover:text-purple-300">
            ALPHA 432Hz
          </span>
          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">Brainwave Pulse</span>
        </button>
      </div>
    </div>
  );
};
