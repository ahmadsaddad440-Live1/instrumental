/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { PresetSelector } from './components/PresetSelector';
import { ConfigForm } from './components/ConfigForm';
import { BeatTester } from './components/BeatTester';
import { OutputPanel } from './components/OutputPanel';
import { HistoryModal } from './components/HistoryModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SongConfig, ActiveTab, HistoryItem, VibePreset } from './types';

const DEFAULT_CONFIG: SongConfig = {
  genre: 'Lo-Fi Hip Hop Chillhop Instrumental',
  vocal: '100% Instrumental Saja (Tanpa Vokal - Recommended)',
  bpm: 78,
  mood: 'Fokus Tenang, Late Night Study, Cozy Rainy Window, Nostalgic Warmth',
  instruments: [
    'Warm Rhodes Electric Piano Chords',
    'Vinyl Crackle & Tape Hiss',
    'Soft Lo-Fi Boom Bap Drums',
    'Smooth Saxophone Melodic Lead',
    'Warm Analog Sub Bass',
  ],
  topic: 'Sesi belajar larut malam di kamar yang tenang dengan gemercik hujan lembut di jendela kaca dan secangkir cokelat hangat',
  language: '100% Instrumental (No Lyrics / Vocals)',
  sunoVersion: 'Suno v4',
};

export default function App() {
  const [config, setConfig] = useState<SongConfig>(DEFAULT_CONFIG);
  const [activePresetId, setActivePresetId] = useState<string>('lofi-study-chillhop');

  const [styleTags, setStyleTags] = useState<string>('');
  const [lyrics, setLyrics] = useState<string>('');
  const [proTips, setProTips] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('style');

  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isRefiningLyrics, setIsRefiningLyrics] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [aiAvailable, setAiAvailable] = useState<boolean>(true);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load history from localStorage and check backend health on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('suno_instrumental_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAiAvailable(Boolean(data?.status === 'ok'));
      })
      .catch(() => {
        setAiAvailable(false);
      });
  }, []);

  // Generate instant formulaic tags
  const generateInstantTags = useCallback(
    (cfg: SongConfig = config) => {
      const cleanGenre = cfg.genre.split('(')[0].trim().toLowerCase();
      const instTags = cfg.instruments.map((i) => i.split('(')[0].trim().toLowerCase());
      const vocalTag = 'instrumental, no vocals';

      const tagList = [
        cleanGenre,
        vocalTag,
        `${cfg.bpm} bpm`,
        'relaxing study vibe',
        ...instTags,
      ];

      const uniqueTags = Array.from(new Set(tagList)).slice(0, 8).join(', ');
      setStyleTags(uniqueTags);

      if (!lyrics.trim() || lyrics.includes('[Intro:')) {
        const defaultLyrics = `[Intro: Soft Vinyl Crackle & Ambient Rain]\n[Tempo: ${cfg.bpm} BPM]\n\n[Warm Rhodes Electric Piano Chords]\n\n[Beat Drop: Soft Lo-Fi Boom Bap Drums]\n\n[Smooth Saxophone Melodic Solo]\n\n[Bridge: Deep Upright Bass & Kalimba Plucks]\n\n[Atmospheric Synth Pad Swell]\n\n[Outro: Fading Rain & Piano Arpeggio]\n[Fade Out]\n[End]`;
        setLyrics(defaultLyrics);
      }
    },
    [config, lyrics]
  );

  // Initial tag generation on first mount
  useEffect(() => {
    generateInstantTags(DEFAULT_CONFIG);
  }, []);

  const handleSelectPreset = (preset: VibePreset) => {
    setActivePresetId(preset.id);
    const updated: SongConfig = {
      ...config,
      genre: preset.genre,
      vocal: preset.vocal,
      bpm: preset.bpm,
      mood: preset.mood,
      instruments: preset.instruments,
      topic: preset.topic,
      language: preset.language,
    };
    setConfig(updated);
    generateInstantTags(updated);
    showToast(`Preset "${preset.name}" diaktifkan!`, 'success');
  };

  const handleConfigChange = (updated: Partial<SongConfig>) => {
    const newConfig = { ...config, ...updated };
    setConfig(newConfig);
    // If BPM or genre changed, adjust instant tags smoothly
    if (updated.bpm || updated.genre || updated.instruments) {
      generateInstantTags(newConfig);
    }
  };

  const handleResetForm = () => {
    setConfig(DEFAULT_CONFIG);
    setActivePresetId('lofi-study-chillhop');
    generateInstantTags(DEFAULT_CONFIG);
    showToast('Form telah direset ke default', 'info');
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    showToast('AI sedang merancang prompt instrumental & aransemen...', 'info');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('API server error');

      const result = await response.json();
      if (result.success && result.data) {
        setStyleTags(result.data.styleTags || '');
        setLyrics(result.data.lyricsAndStructure || '');
        setProTips(result.data.proTips || []);
        showToast(
          result.source === 'gemini'
            ? `Prompt Instrumental berhasil dibuat dengan AI (${result.modelUsed || 'Gemini'})!`
            : 'Prompt Instrumental berhasil dibuat (Kurasi Cerdas)!',
          'success'
        );
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      console.warn('Falling back to local generator due to:', err.message);
      generateInstantTags();
      showToast('Prompt instrumental dibuat (Mode Cepat)!', 'success');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRefineLyrics = async () => {
    if (!lyrics.trim()) {
      showToast('Isi aransemen terlebih dahulu untuk diperkaya', 'error');
      return;
    }

    setIsRefiningLyrics(true);
    showToast('AI sedang memperkaya aransemen instrumental...', 'info');

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLyrics: lyrics }),
      });

      const data = await response.json();
      if (data.success && data.refinedLyrics) {
        setLyrics(data.refinedLyrics);
        showToast('Aransemen berhasil diperkaya dengan nuansa ambient!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses aransemen', 'error');
    } finally {
      setIsRefiningLyrics(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!styleTags.trim()) {
      showToast('Belum ada prompt untuk disimpan', 'error');
      return;
    }

    const newItem: HistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      genre: config.genre.split('(')[0].trim(),
      bpm: config.bpm,
      styleTags,
      lyricsAndStructure: lyrics,
    };

    const updated = [newItem, ...history.slice(0, 24)];
    setHistory(updated);
    try {
      localStorage.setItem('suno_instrumental_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist history:', e);
    }
    showToast('Tersimpan di Riwayat Favorit!', 'success');
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setStyleTags(item.styleTags);
    setLyrics(item.lyricsAndStructure);
    setIsHistoryOpen(false);
    showToast(`Prompt "${item.genre}" dipulihkan!`, 'success');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('suno_instrumental_history');
    } catch (e) {
      console.error(e);
    }
    showToast('Semua riwayat telah dihapus', 'info');
  };

  const scrollToSampler = () => {
    const el = document.getElementById('kendang-sampler-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('ring-2', 'ring-cyan-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400'), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-gray-200">
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onScrollToSampler={scrollToSampler}
        historyCount={history.length}
        aiAvailable={aiAvailable}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroBanner />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Presets, Config Form, Beat Tester (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <PresetSelector
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
            />

            <ConfigForm
              config={config}
              onChange={handleConfigChange}
              onReset={handleResetForm}
              onGenerateAI={handleGenerateAI}
              onInstantTags={() => {
                generateInstantTags();
                showToast('Instant Tag diperbarui!', 'success');
              }}
              isGenerating={isGeneratingAI}
            />

            <BeatTester bpm={config.bpm} />
          </div>

          {/* Right Column: Output Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <OutputPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              styleTags={styleTags}
              onStyleTagsChange={setStyleTags}
              lyrics={lyrics}
              onLyricsChange={setLyrics}
              isGeneratingAI={isGeneratingAI}
              onRefineLyrics={handleRefineLyrics}
              isRefiningLyrics={isRefiningLyrics}
              onSaveToHistory={handleSaveToHistory}
              onShowToast={showToast}
              currentConfig={config}
              proTips={proTips}
            />
          </div>
        </div>
      </main>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
        onClear={handleClearHistory}
        onShowToast={showToast}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
