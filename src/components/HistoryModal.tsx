import React from 'react';
import { History, X, Trash2, ArrowUpRight, Copy, Calendar } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onClear,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const handleCopyTags = (tags: string) => {
    navigator.clipboard.writeText(tags);
    onShowToast('Style tags disalin!', 'success');
  };

  return (
    <div
      id="history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="history-modal-content"
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Riwayat Prompt Tersimpan</h3>
            <span className="text-xs text-gray-400 font-mono">({history.length})</span>
          </div>
          <button
            id="btn-close-history-modal"
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div id="history-items-list" className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <History className="w-8 h-8 mx-auto opacity-40 text-cyan-400" />
              <p className="text-xs">Belum ada riwayat prompt yang disimpan.</p>
              <p className="text-[11px] text-gray-400">
                Klik "Simpan Favorit" pada hasil prompt untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                id={`history-card-${item.id}`}
                className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-cyan-400">{item.genre}</span>
                    <span className="text-[11px] text-gray-400 ml-2 font-mono flex-inline items-center gap-1">
                      <Calendar className="w-3 h-3 inline mr-1 text-gray-400" />
                      {item.bpm} BPM • {item.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyTags(item.styleTags)}
                      className="text-[11px] p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Salin Style Tags"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestore(item)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white font-semibold transition-all flex items-center gap-1 border border-cyan-500/30 cursor-pointer"
                    >
                      <span>Gunakan</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-300 font-mono line-clamp-2 bg-gray-900/90 p-2 rounded-lg border border-gray-800/80">
                  {item.styleTags}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-800 bg-gray-950 flex justify-between items-center">
          {history.length > 0 ? (
            <button
              id="btn-clear-all-history"
              type="button"
              onClick={onClear}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Riwayat</span>
            </button>
          ) : (
            <div></div>
          )}
          <span className="text-[11px] text-gray-400 font-mono">Tersimpan di local storage</span>
        </div>
      </div>
    </div>
  );
};
