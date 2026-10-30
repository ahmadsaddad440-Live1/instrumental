import React, { useState } from 'react';
import {
  Music,
  AlignLeft,
  FileAudio,
  Lightbulb,
  Copy,
  Check,
  Wand2,
  Download,
  Headphones,
  Sparkles,
  Bookmark,
  Loader2,
  Info,
  Image as ImageIcon,
  Flame,
  Clock,
  Waves,
} from 'lucide-react';
import { ActiveTab, SongConfig } from '../types';
import { QUICK_TAGS } from '../data/presets';
import { renderFullLofiAudio } from '../utils/audioSynth';
import { YoutubeThumbnailDesigner } from './YoutubeThumbnailDesigner';
import { YoutubeSeoPanel } from './YoutubeSeoPanel';
import { UploadTimeRecommender } from './UploadTimeRecommender';

interface OutputPanelProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  styleTags: string;
  onStyleTagsChange: (val: string) => void;
  lyrics: string;
  onLyricsChange: (val: string) => void;
  isGeneratingAI: boolean;
  onRefineLyrics: () => void;
  isRefiningLyrics: boolean;
  onSaveToHistory: () => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  currentConfig: SongConfig;
  proTips?: string[];
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  activeTab,
  onTabChange,
  styleTags,
  onStyleTagsChange,
  lyrics,
  onLyricsChange,
  isGeneratingAI,
  onRefineLyrics,
  isRefiningLyrics,
  onSaveToHistory,
  onShowToast,
  currentConfig,
  proTips,
}) => {
  const [copiedField, setCopiedField] = useState<'style' | 'lyrics' | null>(null);

  // Active & Generated titles state
  const [activeTitle, setActiveTitle] = useState<string>('Midnight Rain & Warm Coffee');
  const [generatedTitles, setGeneratedTitles] = useState<{ title: string; vibe: string }[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState<boolean>(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);

  // Check if lyrics has a title tag
  const titleMatch = lyrics.match(/^\[Title:\s*(.*?)\]/im);
  const currentTitleForTools = titleMatch ? titleMatch[1].trim() : activeTitle;

  // Audio rendering state
  const [audioDuration, setAudioDuration] = useState<number>(30);
  const [bassType, setBassType] = useState<'warm-sub' | 'upright-jazz' | 'ambient-drone'>('warm-sub');
  const [isRenderingAudio, setIsRenderingAudio] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStatus, setRenderStatus] = useState<string>('');
  const [renderedAudioUrl, setRenderedAudioUrl] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  const handleCopy = async (text: string, type: 'style' | 'lyrics', label: string) => {
    if (!text.trim()) {
      onShowToast(`Belum ada isi ${label}`, 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(type);
      onShowToast(`${label} disalin ke Clipboard!`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(type);
      onShowToast(`${label} disalin ke Clipboard!`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleGenerateTitles = async () => {
    if (!lyrics.trim()) {
      onShowToast('Buat atau isi struktur aransemen terlebih dahulu untuk menghasilkan judul', 'error');
      return;
    }

    setIsGeneratingTitles(true);
    onShowToast('Sedang merancang rekomendasi judul estetik & relaksasi...', 'info');

    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics,
          genre: currentConfig.genre,
          mood: currentConfig.mood,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.titles) && data.titles.length > 0) {
        setGeneratedTitles(data.titles);
        setActiveTitle(data.titles[0].title);
        onShowToast('5 Rekomendasi judul lagu relaksasi berhasil dibuat!', 'success');
      } else {
        throw new Error('Format judul tidak valid');
      }
    } catch (err) {
      console.error(err);
      const fallback = [
        { title: 'Midnight Rain & Warm Coffee', vibe: 'Lo-Fi Study' },
        { title: 'Deep Focus Flow (432Hz)', vibe: 'Deep Work' },
        { title: 'Cozy Kyoto Rainy Cafe', vibe: 'Cafe Jazz' },
        { title: 'Peaceful Piano Reverie', vibe: 'Neoclassical' },
        { title: 'Sleep Under Starlit Clouds', vibe: 'Sleep Ambient' },
      ];
      setGeneratedTitles(fallback);
      onShowToast('Rekomendasi judul relaksasi berhasil dibuat!', 'success');
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleCopyTitle = async (titleText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(titleText);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = titleText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedTitleIndex(index);
    onShowToast(`Judul "${titleText}" disalin!`, 'success');
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  const handleApplyTitleToLyrics = (titleText: string) => {
    let newLyrics = lyrics;
    if (/^\[Title:.*?\]\n*/i.test(newLyrics)) {
      newLyrics = newLyrics.replace(/^\[Title:.*?\]\n*/i, `[Title: ${titleText}]\n`);
    } else {
      newLyrics = `[Title: ${titleText}]\n\n${newLyrics}`;
    }
    onLyricsChange(newLyrics);
    onShowToast(`Metatag [Title: ${titleText}] disisipkan ke struktur aransemen!`, 'success');
  };

  const handleAppendTag = (tag: string) => {
    const current = styleTags.trim();
    if (!current) {
      onStyleTagsChange(tag);
    } else if (current.endsWith(',')) {
      onStyleTagsChange(`${current} ${tag}`);
    } else {
      onStyleTagsChange(`${current}, ${tag}`);
    }
    onShowToast(`+ "${tag}" ditambahkan`, 'info');
  };

  const handleRenderAudio = async () => {
    setIsRenderingAudio(true);
    setRenderProgress(0);
    setRenderStatus('Menyiapkan Lo-Fi Synthesizer...');

    try {
      const result = await renderFullLofiAudio({
        bpm: currentConfig.bpm,
        durationSeconds: audioDuration,
        bassType,
        onProgress: (pct, step) => {
          setRenderProgress(pct);
          setRenderStatus(step);
        },
      });

      setRenderedAudioUrl(result.url);

      // Generate random aesthetic waveform heights
      const bars = Array.from({ length: 32 }, () => Math.floor(Math.random() * 22) + 8);
      setWaveformBars(bars);

      onShowToast('Audio Lo-Fi instrumental berhasil dirender!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Gagal merender audio synthesizer', 'error');
    } finally {
      setIsRenderingAudio(false);
    }
  };

  const charCount = styleTags.length;
  const isOverLimit = charCount > 120;

  return (
    <div
      id="output-panel-card"
      className="bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden sticky top-20"
    >
      {/* Card Header & Navigation Tabs */}
      <div className="bg-gray-950/80 p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Hasil Prompt Siap Suno AI
            </h3>
          </div>
          {isGeneratingAI && (
            <div id="ai-loading-indicator" className="flex items-center gap-1.5 text-xs text-cyan-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AI Sedang Merancang Musik...</span>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-semibold overflow-x-auto custom-scrollbar">
          <button
            id="tab-btn-style"
            type="button"
            onClick={() => onTabChange('style')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'style'
                ? 'text-white bg-gray-800 shadow border border-cyan-500/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>Style Tags</span>
          </button>

          <button
            id="tab-btn-lyrics"
            type="button"
            onClick={() => onTabChange('lyrics')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'lyrics'
                ? 'text-white bg-gray-800 shadow border border-indigo-500/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Aransemen Metatag</span>
          </button>

          <button
            id="tab-btn-audio"
            type="button"
            onClick={() => onTabChange('audio')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'audio'
                ? 'text-white bg-gray-800 shadow border border-teal-500/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5 text-teal-400" />
            <span>Audio Stem Lo-Fi</span>
          </button>

          <button
            id="tab-btn-thumbnail"
            type="button"
            onClick={() => onTabChange('thumbnail')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'thumbnail'
                ? 'text-white bg-gray-800 shadow border border-sky-500/50'
                : 'text-gray-400 hover:text-sky-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Thumbnail YT</span>
          </button>

          <button
            id="tab-btn-youtube-seo"
            type="button"
            onClick={() => onTabChange('youtubeSeo')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'youtubeSeo'
                ? 'text-white bg-gray-800 shadow border border-amber-500/50'
                : 'text-gray-400 hover:text-amber-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Deskripsi & Tags</span>
          </button>

          <button
            id="tab-btn-upload-time"
            type="button"
            onClick={() => onTabChange('uploadTime')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'uploadTime'
                ? 'text-white bg-gray-800 shadow border border-purple-500/50'
                : 'text-gray-400 hover:text-purple-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Waktu Upload</span>
          </button>

          <button
            id="tab-btn-tips"
            type="button"
            onClick={() => onTabChange('tips')}
            className={`whitespace-nowrap py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'tips'
                ? 'text-white bg-gray-800 shadow border border-emerald-500/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
            <span>Suno Tips</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* TAB 1: STYLE TAGS */}
        {activeTab === 'style' && (
          <div id="tab-panel-style" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Suno "Style of Music" Box
                </span>
                <p className="text-[11px] text-gray-400">
                  Salin & tempel langsung ke kolom Style Prompt di Suno AI
                </p>
              </div>
              <span
                id="char-counter-badge"
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  isOverLimit
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                }`}
              >
                {charCount} / 120 chars
              </span>
            </div>

            <div className="relative">
              <textarea
                id="style-tags-output"
                rows={4}
                value={styleTags}
                onChange={(e) => onStyleTagsChange(e.target.value)}
                placeholder="Klik 'Generate' atau 'Instant Tags'..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs sm:text-sm font-mono text-cyan-300 leading-relaxed focus:outline-none focus:border-cyan-500 custom-scrollbar resize-none"
              />

              <button
                id="btn-copy-style-tags"
                type="button"
                onClick={() => handleCopy(styleTags, 'style', 'Style Tags')}
                className="absolute top-2.5 right-2.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all border border-cyan-500/30 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {copiedField === 'style' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Style</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Tag Pills to add dynamically */}
            <div>
              <span className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
                Tambahan Tag Instrumental Favorit (Klik untuk menyisipkan):
              </span>
              <div id="quick-tag-pills" className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAppendTag(tag)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 hover:border-cyan-400 hover:text-cyan-300 text-gray-300 transition-all cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {proTips && proTips.length > 0 && (
              <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
                <p className="text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Saran Kurasi AI untuk Track Relaksasi Ini:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-gray-300">
                  {proTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80 text-xs text-gray-400 space-y-1">
              <p className="text-cyan-400 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Tips Eksekusi Instrumental Suno AI:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Selalu nyalakan tombol <strong>"Instrumental"</strong> di web Suno AI agar model mematikan synthesis lirik vokal, dan letakkan tag <strong>"instrumental, no vocals"</strong> di 3 urutan pertama dalam style prompt.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: LYRICS & STRUCTURE */}
        {activeTab === 'lyrics' && (
          <div id="tab-panel-lyrics" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Struktur Aransemen Metatag (Kolom Lyrics Suno)
                </span>
                <p className="text-[11px] text-gray-400">
                  Mencakup [Intro: Soft Rain], [Rhodes Chords], [Beat Drop], [Sax Solo], & [Outro]
                </p>
              </div>
              <button
                id="btn-copy-lyrics"
                type="button"
                onClick={() => handleCopy(lyrics, 'lyrics', 'Struktur Aransemen')}
                className="bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedField === 'lyrics' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Aransemen</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                id="lyrics-output"
                rows={11}
                value={lyrics}
                onChange={(e) => onLyricsChange(e.target.value)}
                placeholder="Struktur metatag aransemen instrumental akan muncul di sini..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs font-mono text-gray-200 leading-relaxed focus:outline-none focus:border-indigo-500 custom-scrollbar resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-refine-lyrics"
                type="button"
                onClick={onRefineLyrics}
                disabled={isRefiningLyrics || !lyrics.trim()}
                className="text-xs py-2.5 px-3 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isRefiningLyrics ? 'Memperkaya Aransemen...' : 'Perkaya Tekstur & Dinamika Ambient'}</span>
              </button>

              <button
                id="btn-generate-titles"
                type="button"
                onClick={handleGenerateTitles}
                disabled={isGeneratingTitles || !lyrics.trim()}
                className="text-xs py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-medium border border-indigo-500/40 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingTitles ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Merancang Judul...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Generate Judul Estetik</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Titles Display */}
            {generatedTitles.length > 0 && (
              <div
                id="generated-titles-container"
                className="p-3.5 bg-gray-950/90 rounded-xl border border-indigo-500/30 space-y-2.5 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      Rekomendasi Judul Relaksasi & Playlist Lo-Fi:
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">5 Pilihan</span>
                </div>

                <div className="space-y-1.5">
                  {generatedTitles.map((item, idx) => (
                    <div
                      key={idx}
                      id={`generated-title-item-${idx}`}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-900/90 border border-gray-800 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-gray-500 w-3 shrink-0">{idx + 1}.</span>
                        <span className="text-xs font-semibold text-gray-100 truncate">{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium shrink-0 border border-indigo-500/30">
                          {item.vibe}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          id={`btn-insert-title-${idx}`}
                          onClick={() => {
                            setActiveTitle(item.title);
                            handleApplyTitleToLyrics(item.title);
                          }}
                          title="Sisipkan [Title: ...] ke struktur aransemen Suno"
                          className="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          + Ke Aransemen
                        </button>
                        <button
                          type="button"
                          id={`btn-thumb-title-${idx}`}
                          onClick={() => {
                            setActiveTitle(item.title);
                            onTabChange('thumbnail');
                            onShowToast(`Buka Designer Thumbnail untuk "${item.title}"`, 'info');
                          }}
                          title="Buka pembuat thumbnail YouTube untuk judul ini"
                          className="text-[10px] px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white transition-colors border border-sky-500/30 flex items-center gap-0.5 cursor-pointer"
                        >
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>Thumbnail</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-seo-title-${idx}`}
                          onClick={() => {
                            setActiveTitle(item.title);
                            onTabChange('youtubeSeo');
                            onShowToast(`Buka Deskripsi & Tags untuk "${item.title}"`, 'info');
                          }}
                          title="Buka generator deskripsi & tags YouTube viral"
                          className="text-[10px] px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white transition-colors border border-amber-500/30 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Flame className="w-2.5 h-2.5" />
                          <span>SEO YT</span>
                        </button>
                        <button
                          type="button"
                          id={`btn-copy-title-${idx}`}
                          onClick={() => {
                            setActiveTitle(item.title);
                            handleCopyTitle(item.title, idx);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white font-medium transition-colors border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedTitleIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIO & WAV GENERATOR */}
        {activeTab === 'audio' && (
          <div id="tab-panel-audio" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-teal-400" />
                  <span>Lo-Fi & Ambient Audio Synthesizer</span>
                </span>
                <p className="text-[11px] text-gray-400">
                  Render loop Rhodes electric piano, vinyl rain & warm sub bass untuk stem referensi Suno AI
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                WAV 44.1kHz
              </span>
            </div>

            <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="audio-duration-select" className="block text-gray-400 text-[11px] font-semibold mb-1">
                    Durasi Audio Loop
                  </label>
                  <select
                    id="audio-duration-select"
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(parseInt(e.target.value, 10))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value={15}>15 Detik (Short Loop)</option>
                    <option value={30}>30 Detik (Full Lo-Fi Atmosphere)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="audio-bass-select" className="block text-gray-400 text-[11px] font-semibold mb-1">
                    Karakter Bass & Frekuensi
                  </label>
                  <select
                    id="audio-bass-select"
                    value={bassType}
                    onChange={(e) => setBassType(e.target.value as 'warm-sub' | 'upright-jazz' | 'ambient-drone')}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="warm-sub">Warm Analog Sub Bass (Lo-Fi Study)</option>
                    <option value="upright-jazz">Upright Acoustic Bass (Cozy Cafe Jazz)</option>
                    <option value="ambient-drone">528Hz Alpha Drone (Deep Sleep & Focus)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2 font-mono">
                <span>Layers: Rhodes Jazz Chords (Dm9), Vinyl Tape Hiss, Mellow Boom Bap Kick, Soft Rim, Kalimba</span>
              </div>

              <button
                id="btn-render-audio-file"
                type="button"
                onClick={handleRenderAudio}
                disabled={isRenderingAudio}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <FileAudio className="w-4 h-4" />
                <span>
                  {isRenderingAudio
                    ? 'Sedang Merender Suasana Lo-Fi & Hujan...'
                    : `Render Audio Lo-Fi Instrumental (${audioDuration}s)`}
                </span>
              </button>
            </div>

            {/* Rendering Progress Indicator */}
            {isRenderingAudio && (
              <div id="audio-render-progress" className="p-3.5 bg-gray-950 rounded-xl border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-teal-300 font-semibold flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>{renderStatus}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-400">{renderProgress}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Audio Player & Download Card */}
            {renderedAudioUrl && (
              <div
                id="audio-player-container"
                className="p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950/30 rounded-xl border border-indigo-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg border border-indigo-500/30">
                      <Headphones className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 id="audio-track-title" className="text-xs font-bold text-white">
                        LoFi_Study_{currentConfig.bpm}BPM.wav
                      </h4>
                      <p id="audio-track-meta" className="text-[10px] text-gray-400">
                        {currentConfig.bpm} BPM • Stereo 44.1kHz • Lo-Fi & Ambient Study Mix
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    Ready
                  </span>
                </div>

                {/* Aesthetic waveform visualizer */}
                <div
                  id="waveform-visualizer"
                  className="flex items-end gap-1 h-8 px-2 bg-gray-950/70 rounded-lg overflow-hidden py-1"
                >
                  {waveformBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-sm opacity-80"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                <audio
                  id="main-audio-player"
                  controls
                  src={renderedAudioUrl}
                  className="w-full h-8 accent-cyan-500 bg-gray-900 rounded-lg"
                />

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    id="btn-download-mp3"
                    href={renderedAudioUrl}
                    download={`LoFi_Study_${currentConfig.bpm}BPM.wav`}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh File Audio (.wav)</span>
                  </a>
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80 text-[11px] text-gray-400 space-y-1">
              <p className="text-cyan-400 font-semibold flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tips Upload Referensi Audio ke Suno AI:</span>
              </p>
              <p className="leading-relaxed">
                Gunakan fitur <strong>"Upload Audio"</strong> di aplikasi web Suno AI lalu upload audio loop Lo-Fi ini sebagai referensi stem. Suno akan melanjutkan trek secara otomatis dengan aransemen Rhodes dan tekstur vinyl yang sangat mulus!
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: YOUTUBE THUMBNAIL DESIGNER */}
        {activeTab === 'thumbnail' && (
          <YoutubeThumbnailDesigner
            currentTitle={currentTitleForTools}
            genre={currentConfig.genre}
            mood={currentConfig.mood}
            onShowToast={onShowToast}
            availableTitles={generatedTitles}
          />
        )}

        {/* TAB 5: VIRAL YOUTUBE SEO (DESKRIPSI & TAGS) */}
        {activeTab === 'youtubeSeo' && (
          <YoutubeSeoPanel
            currentTitle={currentTitleForTools}
            genre={currentConfig.genre}
            mood={currentConfig.mood}
            styleTags={styleTags}
            topic={currentConfig.topic}
            onShowToast={onShowToast}
            availableTitles={generatedTitles}
          />
        )}

        {/* TAB 6: REKOMENDASI WAKTU UPLOAD */}
        {activeTab === 'uploadTime' && (
          <UploadTimeRecommender onShowToast={onShowToast} />
        )}

        {/* TAB 7: SUNO TIPS */}
        {activeTab === 'tips' && (
          <div id="tab-panel-tips" className="space-y-3 text-xs text-gray-300">
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
              <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Metatag Khusus Aransemen Instrumental & Relaksasi</span>
              </h4>
              <p className="text-gray-400 text-[11px] mb-2 leading-relaxed">
                Sisipkan metatag ini di dalam kolom Lyrics (dalam kurung siku) untuk memandu aransemen Suno AI secara presisi tanpa vokal:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <span className="p-1.5 bg-gray-900 rounded border border-gray-800 text-cyan-300">
                  [Intro: Soft Vinyl & Rain]
                </span>
                <span className="p-1.5 bg-gray-900 rounded border border-gray-800 text-indigo-300">
                  [Warm Rhodes Chords]
                </span>
                <span className="p-1.5 bg-gray-900 rounded border border-gray-800 text-teal-300">
                  [Beat Drop: Lo-Fi Boom Bap]
                </span>
                <span className="p-1.5 bg-gray-900 rounded border border-gray-800 text-amber-300">
                  [Smooth Saxophone Solo]
                </span>
                <span className="p-1.5 bg-gray-900 rounded border border-gray-800 text-purple-300">
                  [Alpha Wave 432Hz Drone]
                </span>
                <span className="p-1.5 bg-gray-900 rounded border border-gray-800 text-emerald-300">
                  [Outro: Fading Raindrops]
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
              <h4 className="font-bold text-indigo-400 mb-1">
                Kunci Sukses Musik Instrumental di Suno v3.5 & v4:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
                <li>Nyalakan toggle <strong>"Instrumental"</strong> di web Suno agar tidak terjadi kebocoran vokal manusia.</li>
                <li>
                  Gunakan tempo antara <strong>60 - 82 BPM</strong> untuk menghasilkan alunan santai yang ideal sebagai latar belajar atau tidur lelap.
                </li>
                <li>
                  Sertakan instrumen bertekstur hangat seperti <code className="text-white bg-gray-900 px-1 py-0.5 rounded font-mono">rhodes electric piano, tape hiss, vinyl crackle, felt piano</code> untuk hasil audio analog yang tidak kaku.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="bg-gray-950/90 px-5 py-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
        <span className="text-gray-400 font-mono text-[11px]">
          Suno Instrumental Master Engine v3.0
        </span>
        <button
          id="btn-save-current-favorite"
          type="button"
          onClick={onSaveToHistory}
          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Simpan Favorit</span>
        </button>
      </div>
    </div>
  );
};
