import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface UploadTimeRecommenderProps {
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

type IndoZone = 'WIB' | 'WITA' | 'WIT';

interface SlotDetail {
  id: string;
  name: string;
  badge: string;
  wibTime: string;
  witaTime: string;
  witTime: string;
  targetAudience: string;
  whyItWorks: string;
  strategy: string;
  suitableGenre: string;
}

const GOLDEN_SLOTS: SlotDetail[] = [
  {
    id: 'slot-night-study',
    name: 'Slot Emas #1: Belajar Malam & Deep Work Coding (Puncak Traffic Lo-Fi)',
    badge: '🔥 Puncak Traffic Lo-Fi & Study',
    wibTime: '20:00 – 01:00 WIB',
    witaTime: '21:00 – 02:00 WITA',
    witTime: '22:00 – 03:00 WIT',
    targetAudience: 'Mahasiswa mengerjakan tugas akhir, programmer coding malam hari, pekerja lepas (freelancer), dan pembaca buku',
    whyItWorks:
      'Ini adalah jam puncak di mana orang mencari musik instrumental tanpa lirik untuk menemani konsentrasi tanpa distraksi. Durasi tontonan (retention) di jam ini adalah yang terpanjang hingga berjam-jam.',
    strategy: 'Gunakan judul bertema "Late Night Study" atau "Midnight Coding" dengan thumbnail nuansa lampu meja temaram atau hujan di jendela.',
    suitableGenre: 'Lo-Fi Chillhop, Deep Work 432Hz, Synthwave Chill',
  },
  {
    id: 'slot-morning-focus',
    name: 'Slot Emas #2: Pagi Produktif & Meja Kerja (Morning Routine Focus)',
    badge: '☕ Fokus Kerja Pagi Hari',
    wibTime: '07:00 – 10:30 WIB',
    witaTime: '08:00 – 11:30 WITA',
    witTime: '09:00 – 12:30 WIT',
    targetAudience: 'Pekerja kantor, WFH, pembelajar pagi hari, dan penikmat suasana kafe hangat',
    whyItWorks:
      'Di pagi hari, pendengar membutuhkan musik instrumen berenergi tenang dan menyenangkan untuk memicu mood produktif tanpa membuat mengantuk.',
    strategy: 'Beri judul "Morning Coffee & Focus" atau "Cozy Study Desk", bagikan di playlist Spotify atau komunitas produktivitas.',
    suitableGenre: 'Cozy Coffee Shop Jazz, Acoustic Felt Piano, Morning Nature Ambient',
  },
  {
    id: 'slot-sleep-winddown',
    name: 'Slot Emas #3: Pengantar Tidur Nyenyak & Anti-Insomnia (Sleep Therapy)',
    badge: '🌙 Khusus Tidur & Meditasi',
    wibTime: '21:30 – 00:30 WIB',
    witaTime: '22:30 – 01:30 WITA',
    witTime: '23:30 – 02:30 WIT',
    targetAudience: 'Orang yang mengalami insomnia, kelelahan mental, stres seharian, atau pecinta meditasi pernapasan',
    whyItWorks:
      'Menjelang tidur, orang menyetel video 1-3 jam dengan suara hujan atau drone 528Hz agar tertidur lelap tanpa iklan yang mengagetkan.',
    strategy: 'Pastikan transisi suara sangat lembut tanpa hentakan drum mendadak, gunakan thumbnail gelap pastel bertema malam berbintang.',
    suitableGenre: 'Deep Sleep Theta Waves, Ambient Drone 528Hz, Zen Bamboo Meditation',
  },
];

export const UploadTimeRecommender: React.FC<UploadTimeRecommenderProps> = ({ onShowToast }) => {
  const [indoZone, setIndoZone] = useState<IndoZone>('WIB');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in different timezones
  const formatTimezone = (timeZone: string, label: string) => {
    try {
      const timeStr = currentTime.toLocaleTimeString('en-US', {
        timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const dateStr = currentTime.toLocaleDateString('id-ID', {
        timeZone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      return { timeStr, dateStr, label };
    } catch {
      return { timeStr: '--:--:--', dateStr: '', label };
    }
  };

  const wib = formatTimezone('Asia/Jakarta', 'WIB (Barat)');
  const wita = formatTimezone('Asia/Makassar', 'WITA (Tengah)');
  const wit = formatTimezone('Asia/Jayapura', 'WIT (Timur)');

  return (
    <div id="upload-time-recommender" className="space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Rekomendasi Waktu Upload YouTube (Kanal Studi & Relaksasi)
          </span>
          <p className="text-[11px] text-gray-400">
            Jadwal prime time terbaik untuk mengunggah video Lo-Fi, musik belajar, dan tidur nyenyak agar langsung ditonton ribuan orang.
          </p>
        </div>
      </div>

      {/* Real-time Indo Clocks Grid */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-gray-950 rounded-xl border border-gray-800">
        <div
          onClick={() => {
            setIndoZone('WIB');
            onShowToast('Tampilan jadwal diubah ke WIB', 'info');
          }}
          className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
            indoZone === 'WIB'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20'
              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
          }`}
        >
          <span className="text-[10px] font-bold text-gray-400 block mb-0.5">WIB (Jakarta)</span>
          <span className="text-base sm:text-lg font-mono font-bold text-purple-300 block">
            {wib.timeStr}
          </span>
          <span className="text-[9px] text-gray-500 font-mono block">{wib.dateStr}</span>
        </div>

        <div
          onClick={() => {
            setIndoZone('WITA');
            onShowToast('Tampilan jadwal diubah ke WITA', 'info');
          }}
          className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
            indoZone === 'WITA'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20'
              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
          }`}
        >
          <span className="text-[10px] font-bold text-gray-400 block mb-0.5">WITA (Bali/Makassar)</span>
          <span className="text-base sm:text-lg font-mono font-bold text-purple-300 block">
            {wita.timeStr}
          </span>
          <span className="text-[9px] text-gray-500 font-mono block">{wita.dateStr}</span>
        </div>

        <div
          onClick={() => {
            setIndoZone('WIT');
            onShowToast('Tampilan jadwal diubah ke WIT', 'info');
          }}
          className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
            indoZone === 'WIT'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20'
              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
          }`}
        >
          <span className="text-[10px] font-bold text-gray-400 block mb-0.5">WIT (Papua/Maluku)</span>
          <span className="text-base sm:text-lg font-mono font-bold text-purple-300 block">
            {wit.timeStr}
          </span>
          <span className="text-[9px] text-gray-500 font-mono block">{wit.dateStr}</span>
        </div>
      </div>

      {/* 3 Golden Slots */}
      <div className="space-y-3">
        {GOLDEN_SLOTS.map((slot) => {
          const displayTime =
            indoZone === 'WIB' ? slot.wibTime : indoZone === 'WITA' ? slot.witaTime : slot.witTime;

          return (
            <div
              key={slot.id}
              className="p-4 bg-gray-950/90 rounded-xl border border-gray-800 hover:border-purple-500/40 transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>{slot.name}</span>
                </h4>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  {slot.badge}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rekomendasi Jam Tayang: {displayTime}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300 pt-1">
                <div className="p-2.5 bg-gray-900/60 rounded-lg border border-gray-800/80">
                  <span className="font-semibold text-gray-400 block mb-0.5">Target Audiens:</span>
                  <p>{slot.targetAudience}</p>
                </div>
                <div className="p-2.5 bg-gray-900/60 rounded-lg border border-gray-800/80">
                  <span className="font-semibold text-gray-400 block mb-0.5">Mengapa Efektif:</span>
                  <p>{slot.whyItWorks}</p>
                </div>
              </div>

              <div className="p-2.5 bg-indigo-950/30 rounded-lg border border-indigo-500/20 text-[11px] text-indigo-200">
                <span className="font-semibold text-indigo-300 block mb-0.5">💡 Tips Algoritma:</span>
                <p>{slot.strategy}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Strategy Box */}
      <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1.5">
        <h5 className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Tips Algoritma Watch-Time YouTube untuk Musik Instrumental:</span>
        </h5>
        <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed">
          <li>
            <strong>Publikasikan 15-30 menit sebelum jam puncak:</strong> Ini memberi waktu YouTube memproses kualitas HD/4K dan menempatkan thumbnail ke feed Subscriber tepat saat mereka mulai belajar atau tidur.
          </li>
          <li>
            <strong>Buat Video 1 Jam Looping:</strong> Kanal musik belajar mendapatkan skor rekomendasi tertinggi karena penonton membiarkan video menyala sepanjang sesi kerja atau membaca.
          </li>
          <li>
            <strong>Sematkan Kartu End-Screen:</strong> Tautkan ke video musik relaksasi berikutnya di menit terakhir agar sesi belajar penonton berlanjut tanpa terhenti.
          </li>
        </ul>
      </div>
    </div>
  );
};
