import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Sparkles,
  Sliders,
  Palette,
  Type as TypeIcon,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';

interface YoutubeThumbnailDesignerProps {
  currentTitle: string;
  genre: string;
  mood: string;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  availableTitles?: { title: string; vibe: string }[];
}

interface ThumbnailTheme {
  id: string;
  name: string;
  vibe: string;
  bgGradient: [string, string, string];
  accentColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  drawExtra?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

const THEMES: ThumbnailTheme[] = [
  {
    id: 'cozy-rainy-window',
    name: 'Cozy Rainy Window & Coffee',
    vibe: 'Moody Indigo, Soft Amber Glow & Rain',
    bgGradient: ['#070b19', '#0d1527', '#152238'],
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    badgeText: '#7dd3fc',
    drawExtra: (ctx, w, h) => {
      // Warm desk lamp glow in bottom-right corner
      const lampGlow = ctx.createRadialGradient(w * 0.82, h * 0.75, 0, w * 0.82, h * 0.75, 340);
      lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      lampGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
      lampGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.75, 340, 0, Math.PI * 2);
      ctx.fill();

      // Rain droplet streaks on window glass
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.18)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 45; i++) {
        const rx = (i * 37) % w;
        const ry = (i * 53) % (h * 0.85);
        const len = (i % 4) * 8 + 15;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + len);
        ctx.stroke();
      }
    },
  },
  {
    id: 'midnight-lofi-room',
    name: 'Midnight Attic & Neon Glow',
    vibe: 'Deep Violet, Cyberpunk Dusk & Starlight',
    bgGradient: ['#090514', '#150a2e', '#231245'],
    accentColor: '#c084fc',
    textColor: '#ffffff',
    badgeBg: 'rgba(192, 132, 252, 0.25)',
    badgeText: '#e9d5ff',
    drawExtra: (ctx, w, h) => {
      // Neon desk monitor rim glow
      const monitorGlow = ctx.createRadialGradient(w * 0.8, h * 0.4, 0, w * 0.8, h * 0.4, 280);
      monitorGlow.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      monitorGlow.addColorStop(0.6, 'rgba(99, 102, 241, 0.15)');
      monitorGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = monitorGlow;
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.4, 280, 0, Math.PI * 2);
      ctx.fill();

      // Subtle starry sky speckles
      ctx.fillStyle = 'rgba(233, 213, 255, 0.6)';
      for (let i = 0; i < 50; i++) {
        const sx = (i * 71) % (w * 0.6);
        const sy = (i * 29) % (h * 0.4);
        const r = (i % 2) + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'zen-bamboo-garden',
    name: 'Zen Garden & Morning Dew',
    vibe: 'Emerald Forest, Tranquil Mist & Sunlight',
    bgGradient: ['#04120e', '#09231c', '#10392f'],
    accentColor: '#34d399',
    textColor: '#ffffff',
    badgeBg: 'rgba(52, 211, 153, 0.25)',
    badgeText: '#a7f3d0',
    drawExtra: (ctx, w, h) => {
      // Soft water ripple rings
      ctx.lineWidth = 1.8;
      for (let r = 50; r < 360; r += 45) {
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.3 - (r / 360) * 0.25})`;
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.5, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Morning sunlight shaft
      const sunShaft = ctx.createLinearGradient(w * 0.6, 0, w, h);
      sunShaft.addColorStop(0, 'rgba(253, 224, 71, 0.15)');
      sunShaft.addColorStop(1, 'transparent');
      ctx.fillStyle = sunShaft;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: 'deep-focus-minimal',
    name: 'Deep Focus & Dark Mode (432Hz)',
    vibe: 'Ultra Minimal Slate, Cyan Waveform & Clean Typography',
    bgGradient: ['#030712', '#0b1120', '#111827'],
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    badgeText: '#bae6fd',
    drawExtra: (ctx, w, h) => {
      // Elegant minimal sine soundwave line across right side
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = w * 0.45; x < w; x += 6) {
        const y = h * 0.5 + Math.sin((x - w * 0.45) * 0.02) * 55 * Math.sin((x - w * 0.45) * 0.005);
        if (x === w * 0.45) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
  },
  {
    id: 'dreamy-sunset-clouds',
    name: 'Pastel Sunset & Deep Sleep',
    vibe: 'Warm Amber Peach, Gentle Lavender Horizon',
    bgGradient: ['#170b16', '#2d142c', '#421a36'],
    accentColor: '#f472b6',
    textColor: '#ffffff',
    badgeBg: 'rgba(244, 114, 182, 0.25)',
    badgeText: '#fbcfe8',
    drawExtra: (ctx, w, h) => {
      // Sunset glow
      const sunGlow = ctx.createRadialGradient(w * 0.75, h * 0.65, 0, w * 0.75, h * 0.65, 360);
      sunGlow.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
      sunGlow.addColorStop(0.5, 'rgba(244, 114, 182, 0.2)');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.65, 360, 0, Math.PI * 2);
      ctx.fill();
    },
  },
];

const BADGE_PRESETS = [
  '1 HOUR STUDY LOOP 📚',
  'DEEP FOCUS 432Hz 🧠',
  'RELAXING PIANO & RAIN 🌧️',
  'POMODORO 25/5 TIMER ⏱️',
  'SLEEP & INSOMNIA RELIEF 🌙',
  'COZY COFFEE SHOP JAZZ ☕',
  'NO VOCALS • 100% FOCUS 🎧',
];

export const YoutubeThumbnailDesigner: React.FC<YoutubeThumbnailDesignerProps> = ({
  currentTitle,
  genre,
  mood,
  onShowToast,
  availableTitles = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [title, setTitle] = useState<string>(currentTitle || 'Midnight Rain & Warm Coffee');
  const [subtitle, setSubtitle] = useState<string>(
    'Lo-Fi Beats to Relax / Study / Code to [1 Hour Loop]'
  );
  const [selectedBadge, setSelectedBadge] = useState<string>('1 HOUR STUDY LOOP 📚');
  const [activeThemeId, setActiveThemeId] = useState<string>('cozy-rainy-window');
  const [filmGrain, setFilmGrain] = useState<boolean>(true);
  const [vignette, setVignette] = useState<boolean>(true);
  const [titlePosition, setTitlePosition] = useState<'bottom-left' | 'center' | 'top-left'>('bottom-left');
  const [fontSize, setFontSize] = useState<number>(54);
  const [showDurationWatermark, setShowDurationWatermark] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync title when currentTitle changes from parent
  useEffect(() => {
    if (currentTitle && currentTitle !== title) {
      setTitle(currentTitle);
    }
  }, [currentTitle]);

  const activeTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  // Render YouTube standard 1280 x 720 HD thumbnail onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280;
    const H = 720;
    canvas.width = W;
    canvas.height = H;

    // 1. Draw Base Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, activeTheme.bgGradient[0]);
    bgGrad.addColorStop(0.5, activeTheme.bgGradient[1]);
    bgGrad.addColorStop(1, activeTheme.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Decorative Theme Elements
    if (activeTheme.drawExtra) {
      activeTheme.drawExtra(ctx, W, H);
    }

    // 3. Film Grain Texture Overlay for analog cozy feel
    if (filmGrain) {
      const grainCount = 18000;
      for (let i = 0; i < grainCount; i++) {
        const gx = Math.random() * W;
        const gy = Math.random() * H;
        const alpha = Math.random() * 0.08;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 1.5})`;
        ctx.fillRect(gx, gy, 1.2, 1.2);
      }
    }

    // 4. Dark Vignette & Atmospheric Shadows
    if (vignette) {
      const vigGrad = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // 5. Positioning Coordinates
    let textX = 80;
    let textY = H - 180;
    let textAlign: CanvasTextAlign = 'left';

    if (titlePosition === 'center') {
      textX = W / 2;
      textY = H / 2 - 20;
      textAlign = 'center';
    } else if (titlePosition === 'top-left') {
      textX = 80;
      textY = 220;
      textAlign = 'left';
    }

    ctx.textAlign = textAlign;

    // 6. Draw Badge Tag
    if (selectedBadge) {
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      const badgeText = selectedBadge.toUpperCase();
      const badgeMetrics = ctx.measureText(badgeText);
      const bW = badgeMetrics.width + 36;
      const bH = 40;
      const bX = textAlign === 'center' ? textX - bW / 2 : textX;
      const bY = titlePosition === 'top-left' ? textY - 110 : textY - 110;

      // Badge background pill
      ctx.fillStyle = activeTheme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 20);
      ctx.fill();

      // Badge border
      ctx.strokeStyle = activeTheme.accentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 20);
      ctx.stroke();

      // Badge text
      ctx.fillStyle = activeTheme.badgeText;
      ctx.textAlign = 'left';
      ctx.fillText(badgeText, bX + 18, bY + 27);

      ctx.textAlign = textAlign;
    }

    // 7. Draw Main Title
    ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    const displayTitle = (title || 'MIDNIGHT RAIN & COFFEE').toUpperCase();
    const maxWidth = W * 0.75;
    const words = displayTitle.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const lineHeight = fontSize * 1.15;
    lines.forEach((l, idx) => {
      ctx.fillStyle = idx === 0 ? activeTheme.textColor : activeTheme.accentColor;
      ctx.fillText(l, textX, textY + idx * lineHeight);
    });

    ctx.shadowColor = 'transparent';

    // 8. Draw Subtitle
    if (subtitle) {
      const subY = textY + lines.length * lineHeight + 22;
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(subtitle, textX, subY);
    }

    // 9. Duration Watermark (Bottom Right)
    if (showDurationWatermark) {
      const tagText = '1:00:00';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      const tm = ctx.measureText(tagText);
      const tagW = tm.width + 24;
      const tagH = 36;
      const tagX = W - tagW - 40;
      const tagY = H - tagH - 40;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(tagText, tagX + tagW / 2, tagY + 25);
    }
  }, [
    title,
    subtitle,
    selectedBadge,
    activeThemeId,
    filmGrain,
    vignette,
    titlePosition,
    fontSize,
    showDurationWatermark,
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_thumbnail.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('Thumbnail HD 1280x720 berhasil diunduh!', 'success');
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setIsCopied(true);
        onShowToast('Thumbnail disalin ke clipboard!', 'success');
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch {
      handleDownload();
    }
  };

  return (
    <div id="youtube-thumbnail-designer" className="space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wide flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            YouTube Thumbnail Designer (1280x720 HD Lo-Fi & Study)
          </span>
          <p className="text-[11px] text-gray-400">
            Desain cover video YouTube estetik beresolusi tinggi khusus kanal musik relaksasi & lo-fi study.
          </p>
        </div>
      </div>

      {/* Live Canvas Preview */}
      <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl group">
        <canvas
          ref={canvasRef}
          className="w-full h-auto aspect-video object-cover block"
        />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
            1280 × 720 HD
          </span>
        </div>
      </div>

      {/* Quick Title Selection from Suggestions */}
      {availableTitles.length > 0 && (
        <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
          <span className="text-[11px] font-semibold text-gray-400 mb-1.5 block">
            Gunakan Judul Tersedia:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableTitles.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTitle(t.title)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                  title === t.title
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-700'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme Presets */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          Pilih Tema Estetik Thumbnail:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEMES.map((theme) => {
            const isSelected = activeThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveThemeId(theme.id)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-gray-800 border-sky-500 ring-1 ring-sky-500 shadow-md'
                    : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                  <span className="text-xs font-bold text-white truncate">{theme.name}</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">{theme.vibe}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Customizers */}
      <div className="space-y-3 p-3.5 bg-gray-950 rounded-xl border border-gray-800 text-xs">
        <div>
          <label htmlFor="thumb-title-input" className="block text-gray-300 font-semibold mb-1">
            Judul Utama Thumbnail:
          </label>
          <input
            id="thumb-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="thumb-subtitle-input" className="block text-gray-300 font-semibold mb-1">
            Sub-judul / Keterangan:
          </label>
          <input
            id="thumb-subtitle-input"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 font-semibold mb-1">
            Badge Hook (Pill Text):
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {BADGE_PRESETS.map((bp) => (
              <button
                key={bp}
                type="button"
                onClick={() => setSelectedBadge(bp)}
                className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                  selectedBadge === bp
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                {bp}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={selectedBadge}
            onChange={(e) => setSelectedBadge(e.target.value)}
            placeholder="Atau ketik badge custom..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* Layout & Font Controls */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-gray-400 text-[11px] mb-1">Posisi Teks</label>
            <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-[10px]">
              <button
                type="button"
                onClick={() => setTitlePosition('bottom-left')}
                className={`flex-1 py-1 rounded ${titlePosition === 'bottom-left' ? 'bg-sky-600 text-white' : 'text-gray-400'}`}
              >
                Bawah
              </button>
              <button
                type="button"
                onClick={() => setTitlePosition('center')}
                className={`flex-1 py-1 rounded ${titlePosition === 'center' ? 'bg-sky-600 text-white' : 'text-gray-400'}`}
              >
                Tengah
              </button>
              <button
                type="button"
                onClick={() => setTitlePosition('top-left')}
                className={`flex-1 py-1 rounded ${titlePosition === 'top-left' ? 'bg-sky-600 text-white' : 'text-gray-400'}`}
              >
                Atas
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1">
              <span>Ukuran Font</span>
              <span className="font-mono text-sky-400">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="38"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-800 text-[11px] text-gray-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filmGrain}
              onChange={(e) => setFilmGrain(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-sky-500 focus:ring-sky-500"
            />
            <span>Film Grain (Vintage Lo-Fi)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={vignette}
              onChange={(e) => setVignette(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-sky-500 focus:ring-sky-500"
            />
            <span>Dark Vignette</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDurationWatermark}
              onChange={(e) => setShowDurationWatermark(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-sky-500 focus:ring-sky-500"
            />
            <span>Durasi Badge (1:00:00)</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-lg shadow-sky-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Thumbnail HD (PNG)</span>
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          className="px-4 py-3 rounded-xl font-semibold text-xs text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Salin gambar ke Clipboard"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">Salin</span>
        </button>
      </div>
    </div>
  );
};
