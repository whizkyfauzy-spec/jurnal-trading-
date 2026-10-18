import React, { useState } from 'react';
import { X, Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Target, Shield, HeartPulse, Sparkles, ExternalLink } from 'lucide-react';
import { Trade } from '../types/trade';
import { formatCurrency } from '../lib/calculations';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  currency: string;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'charts'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !trade) return null;

  const isWin = (trade.pnl || 0) > 0.001;
  const isLoss = (trade.pnl || 0) < -0.001;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                trade.position === 'BUY'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trade.position}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{trade.pair}</span>
                {trade.isDemo && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Contoh Demo
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {new Date(trade.entryDate).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(trade)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Edit Transaksi"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Hapus Transaksi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete confirmation banner */}
        {showDeleteConfirm && (
          <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between text-xs text-rose-300">
            <span>Yakin ingin menghapus transaksi {trade.pair} ini dari database?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 text-slate-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDelete(trade.id);
                  onClose();
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'text-[#00e599] font-semibold border-b-2 border-[#00e599]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Parameter & Evaluasi
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'charts'
                ? 'text-[#00e599] font-semibold border-b-2 border-[#00e599]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Screenshot Chart ({trade.chartBeforeUrl || trade.chartAfterUrl ? 'Ada' : '0'})
          </button>
        </div>

        {/* Tab Content: Details */}
        {activeTab === 'details' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Primary Result Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Hasil / Net P&L</span>
                <span className={`text-xl font-bold font-mono ${
                  trade.status === 'OPEN'
                    ? 'text-slate-400'
                    : isWin
                    ? 'text-[#00e599]'
                    : isLoss
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}>
                  {trade.status === 'OPEN' ? 'OPEN' : formatCurrency(trade.pnl, currency)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Perolehan Pips</span>
                <span className={`text-xl font-bold font-mono ${
                  (trade.pips || 0) >= 0 ? 'text-[#00e599]' : 'text-rose-400'
                }`}>
                  {trade.pips !== undefined ? `${trade.pips > 0 ? '+' : ''}${trade.pips} p` : '-'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Risk-to-Reward (RRR)</span>
                <span className="text-xl font-bold font-mono text-white">
                  1:{trade.riskRewardRatio || '0.0'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Volume (Lot)</span>
                <span className="text-xl font-bold font-mono text-white">
                  {trade.lotSize.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Price Levels Matrix */}
            <div className="bg-[#111827]/60 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Level Harga Eksekusi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Harga Entry</span>
                  <span className="text-white font-bold">{trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Harga Exit</span>
                  <span className="text-white font-bold">{trade.exitPrice ?? 'Masih Aktif'}</span>
                </div>
                <div>
                  <span className="text-rose-400 block mb-1">Stop Loss (SL)</span>
                  <span className="text-rose-400 font-bold">{trade.stopLoss}</span>
                </div>
                <div>
                  <span className="text-emerald-400 block mb-1">Take Profit (TP)</span>
                  <span className="text-emerald-400 font-bold">{trade.takeProfit}</span>
                </div>
              </div>
            </div>

            {/* Strategy & Psychology Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#111827]/60 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Strategi Digunakan</span>
                <p className="text-sm font-bold text-white">{trade.strategy || '-'}</p>
              </div>

              <div className="bg-[#111827]/60 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Kondisi Psikologis</span>
                <p className="text-sm font-bold text-slate-200">{trade.psychology || '-'}</p>
              </div>
            </div>

            {/* Reason & Evaluation */}
            <div className="space-y-4">
              <div className="bg-[#111827]/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-1.5">Alasan Entry & Analisis Teknikal</h4>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {trade.entryReason || 'Tidak ada catatan alasan entry.'}
                </p>
              </div>

              <div className="bg-[#111827]/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 mb-1.5">Catatan Evaluasi / Lessons Learned</h4>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {trade.evaluationNote || 'Tidak ada catatan evaluasi post-trade.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Charts */}
        {activeTab === 'charts' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {!trade.chartBeforeUrl && !trade.chartAfterUrl ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada screenshot chart yang diunggah untuk transaksi ini. Anda dapat mengklik tombol Edit di atas untuk menambahkan screenshot.
              </div>
            ) : (
              <div className="space-y-6">
                {trade.chartBeforeUrl && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-200">1. Setup Chart Sebelum Entry</span>
                      <a
                        href={trade.chartBeforeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00e599] hover:underline flex items-center gap-1"
                      >
                        Buka Gambar Asli <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">
                      <img
                        src={trade.chartBeforeUrl}
                        alt="Chart Before Entry"
                        className="w-full max-h-[380px] object-contain"
                      />
                    </div>
                  </div>
                )}

                {trade.chartAfterUrl && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-200">2. Hasil Chart Sesudah Exit</span>
                      <a
                        href={trade.chartAfterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00e599] hover:underline flex items-center gap-1"
                      >
                        Buka Gambar Asli <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">
                      <img
                        src={trade.chartAfterUrl}
                        alt="Chart After Exit"
                        className="w-full max-h-[380px] object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#090d16] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
