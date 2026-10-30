import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Flame,
  Tag,
  FileText,
  HelpCircle,
  RefreshCw,
  Headphones,
} from 'lucide-react';
import { YoutubeSeoData } from '../types';

interface YoutubeSeoPanelProps {
  currentTitle: string;
  genre: string;
  mood: string;
  styleTags: string;
  topic?: string;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  availableTitles?: { title: string; vibe: string }[];
}

export const YoutubeSeoPanel: React.FC<YoutubeSeoPanelProps> = ({
  currentTitle,
  genre,
  mood,
  styleTags,
  topic = 'Sesi belajar larut malam di kamar yang tenang dengan gemercik hujan lembut di jendela kaca',
  onShowToast,
  availableTitles = [],
}) => {
  const [selectedTitle, setSelectedTitle] = useState<string>(currentTitle || 'Midnight Rain & Warm Coffee');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // SEO Data State with curated initial values for Study, Lo-Fi & Relaxation
  const [seoData, setSeoData] = useState<YoutubeSeoData>({
    videoTitle: `${(currentTitle || 'Midnight Rain & Warm Coffee').toUpperCase()} 🌧️ [1 Hour Study & Relaxing Beats] Lo-Fi Instrumental For Deep Focus & Coding`,
    description: `Put on your headphones, grab your favorite warm drink, and immerse yourself in peaceful focus. ✨📖 Perfect companion for studying, coding, reading, or unwinding after a long day.\n\n✨ Tracklist & Chapters:\n00:00 - ${currentTitle || 'Midnight Rain & Warm Coffee'} (Soft Rain & Rhodes Intro)\n12:30 - Deep Focus & Warm Sub Bass\n27:45 - Midnight Coffee & Calm Reflection\n42:10 - Ambient Pad & Soft Tape Saturation\n56:20 - Gentle Outro & Fading Raindrops\n\n🎧 Best Enjoyed For:\n• Late night study sessions & homework concentration\n• Deep work, programming, and distraction-free writing\n• Reading, journaling, and quiet relaxation\n• Relieving stress, calming anxiety, and drifting into peaceful sleep\n\n💡 Pomodoro Tip: Focus for 25 minutes, take a 5-minute deep breath stretch, and repeat.\n\n🎵 Crafted with Suno AI & Suno Instrumental Master\n\n#lofi #studybeats #relaxingmusic #deepwork #ambientpiano #chillhop #focusmusic #sleepmusic`,
    tags: [
      'lofi hip hop',
      'study beats',
      'relaxing instrumental',
      'music to study to',
      'deep focus music',
      'coding music',
      'chillhop instrumental',
      'rain sounds for sleep',
      'peaceful piano',
      'lofi rain',
      'relaxing study music',
      'background music for work',
      'calm instrumental',
      'pomodoro study beats',
      'lofi 2026',
    ],
    algorithmTips: [
      'Jadikan video berdurasi 1 hingga 3 jam (looping audio yang mulus) untuk memaksimalkan total jam tayang (watch time) algoritma YouTube.',
      'Gunakan visual aesthetic looping seperti animasi jendela kamar hujan, kafe hangat, atau meja belajar temaram.',
      'Sematkan komentar (pinned comment): "Apa yang sedang kamu pelajari atau kerjakan hari ini? Semoga hari dan sesi belajarmu produktif! ☕📚"',
    ],
  });

  const [customTagInput, setCustomTagInput] = useState<string>('');

  // Handle Generate with AI
  const handleGenerateSeo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-youtube-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTitle,
          genre,
          mood,
          styleTags,
          topic,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSeoData(data.data);
        onShowToast('Metadata YouTube Lo-Fi & Study viral berhasil dioptimasi!', 'success');
      } else {
        throw new Error('Gagal memproses metadata');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Menggunakan template relaksasi & lo-fi teroptimasi', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, sectionKey: string, toastLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedSection(sectionKey);
    onShowToast(`${toastLabel} disalin ke clipboard!`, 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Calculate tags total character count (YouTube Studio limit is 500 characters)
  const allTagsString = seoData.tags.join(', ');
  const tagsCharCount = allTagsString.length;
  const isTagsOverLimit = tagsCharCount > 500;

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (seoData.tags.includes(trimmed)) {
      onShowToast('Tag sudah ada dalam daftar', 'info');
      return;
    }
    setSeoData({
      ...seoData,
      tags: [...seoData.tags, trimmed],
    });
    setCustomTagInput('');
    onShowToast(`Tag "${trimmed}" ditambahkan`, 'success');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSeoData({
      ...seoData,
      tags: seoData.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div id="youtube-seo-panel" className="space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            YouTube & Spotify Metadata Optimizer (Lo-Fi, Study & Ambient)
          </span>
          <p className="text-[11px] text-gray-400">
            Diformulasikan khusus untuk algoritma pencarian & retensi video Lo-Fi Girl, Study Beats, dan Musik Relaksasi.
          </p>
        </div>

        <button
          id="btn-generate-youtube-seo"
          type="button"
          onClick={handleGenerateSeo}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-950/40 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          )}
          <span>{isLoading ? 'Mengoptimasi...' : 'Generate Metadata AI'}</span>
        </button>
      </div>

      {/* Title Selection Bar */}
      <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 space-y-2">
        <label className="text-[11px] font-semibold text-gray-300 flex items-center justify-between">
          <span>Judul Lagu Dasar yang Dioptimasi:</span>
          {availableTitles.length > 0 && (
            <span className="text-[10px] text-gray-400 font-normal">Pilih cepat dari daftar:</span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={selectedTitle}
            onChange={(e) => setSelectedTitle(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 focus:border-amber-500 focus:outline-none text-white font-medium"
            placeholder="Masukkan judul lagu..."
          />
          <button
            type="button"
            onClick={handleGenerateSeo}
            className="px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium border border-gray-700 transition-colors cursor-pointer"
          >
            Terapkan
          </button>
        </div>

        {availableTitles && availableTitles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableTitles.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedTitle(t.title);
                  onShowToast(`Judul "${t.title}" dipilih`, 'info');
                }}
                className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  selectedTitle === t.title
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: HIGH-CTR YOUTUBE TITLE */}
      <div className="p-3.5 bg-gray-950/70 rounded-xl border border-gray-800 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-gray-200">1. Judul Video YouTube (Click-Magnet Audiens Belajar & Santai)</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(seoData.videoTitle, 'title', 'Judul Video')}
            className="text-[11px] px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center gap-1 border border-gray-700/60 transition-colors cursor-pointer"
          >
            {copiedSection === 'title' ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>Salin Judul</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={seoData.videoTitle}
            onChange={(e) => setSeoData({ ...seoData, videoTitle: e.target.value })}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-amber-500 focus:outline-none text-amber-300 font-mono tracking-tight"
          />
        </div>
        <p className="text-[10px] text-gray-400">
          Format formula: JUDUL POETIK + emoji hujan/kopi + kurung siku durasi [1 Hour Study Beats] terbukti menghasilkan retensi tontonan tertinggi di kanal Lo-Fi global.
        </p>
      </div>

      {/* SECTION 2: DESCRIPTION WITH CHAPTERS */}
      <div className="p-3.5 bg-gray-950/70 rounded-xl border border-gray-800 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-gray-200">2. Deskripsi Lengkap + Chapters & Tips Belajar</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(seoData.description, 'description', 'Deskripsi Video')}
            className="text-[11px] px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center gap-1 border border-gray-700/60 transition-colors cursor-pointer"
          >
            {copiedSection === 'description' ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>Salin Deskripsi</span>
          </button>
        </div>

        <textarea
          rows={7}
          value={seoData.description}
          onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
          className="w-full text-xs font-mono p-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-gray-300 leading-relaxed custom-scrollbar resize-none"
        />
        <p className="text-[10px] text-gray-400">
          Dilengkapi stempel waktu (chapters) otomatis yang memudahkan pendengar melompat ke bagian yang disukai dan meningkatkan sinyal retensi algoritma.
        </p>
      </div>

      {/* SECTION 3: TOP RANKING SEARCH TAGS */}
      <div className="p-3.5 bg-gray-950/70 rounded-xl border border-gray-800 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-gray-200">3. Tag Pencarian YouTube (Maks 500 Karakter)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isTagsOverLimit
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {tagsCharCount} / 500
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(allTagsString, 'tags', 'Daftar Tags')}
              className="text-[11px] px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center gap-1 border border-gray-700/60 transition-colors cursor-pointer"
            >
              {copiedSection === 'tags' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>Salin Semua Tags</span>
            </button>
          </div>
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
          {seoData.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-cyan-200 font-mono"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                title="Hapus tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add custom tag */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTag();
              }
            }}
            placeholder="Tambah tag baru (tekan Enter)..."
            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-indigo-500 focus:outline-none text-white font-mono"
          />
          <button
            type="button"
            onClick={handleAddCustomTag}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium border border-gray-700 cursor-pointer"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* SECTION 4: ALGORITHM STRATEGY TIPS */}
      <div className="p-3.5 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950/40 rounded-xl border border-indigo-500/20 space-y-2">
        <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Strategi Pertumbuhan Kanal YouTube Lo-Fi & Study:</span>
        </h4>
        <ul className="space-y-1.5 text-[11px] text-gray-300">
          {seoData.algorithmTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
