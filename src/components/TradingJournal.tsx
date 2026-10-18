import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  Search,
} from 'lucide-react';
import { Trade } from '../types/trade';
import { formatCurrency } from '../lib/calculations';

interface TradingJournalProps {
  trades: Trade[];
  currency: string;
  onOpenTradeModal: () => void;
  onViewTradeDetails: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
}

export const TradingJournal: React.FC<TradingJournalProps> = ({
  trades,
  currency,
  onOpenTradeModal,
  onViewTradeDetails,
  onEditTrade,
  onDeleteTrade,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'OPEN' | 'WIN' | 'LOSS'>('ALL');
  const [journalSearch, setJournalSearch] = useState('');

  const filteredTrades = trades.filter((t) => {
    if (filterTab === 'OPEN' && t.status !== 'OPEN') return false;
    if (filterTab === 'WIN' && t.outcome !== 'WIN') return false;
    if (filterTab === 'LOSS' && t.outcome !== 'LOSS') return false;

    if (journalSearch) {
      const q = journalSearch.toLowerCase();
      const match =
        t.pair.toLowerCase().includes(q) ||
        t.strategy?.toLowerCase().includes(q) ||
        t.entryReason?.toLowerCase().includes(q) ||
        t.evaluationNote?.toLowerCase().includes(q) ||
        t.psychology?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Jurnal Trading Forex
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Catatan visual dan evaluasi mendalam setiap setup transaksi, psikologi trader, dan screenshot chart.
          </p>
        </div>

        <button
          onClick={onOpenTradeModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] active:scale-98 transition-all cursor-pointer shadow-md shadow-[#00e599]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Entri Jurnal</span>
        </button>
      </div>

      {/* Control Bar: Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e1422] border border-slate-800 rounded-2xl p-3">
        {/* Unboxed Segmented Controls (Buttons with click handlers) */}
        <div className="flex items-center gap-1 bg-[#080c14] border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({trades.length})
          </button>
          <button
            onClick={() => setFilterTab('OPEN')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterTab === 'OPEN'
                ? 'bg-slate-800 text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open ({trades.filter((t) => t.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setFilterTab('WIN')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterTab === 'WIN'
                ? 'bg-slate-800 text-[#00e599] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Menang ({trades.filter((t) => t.outcome === 'WIN').length})
          </button>
          <button
            onClick={() => setFilterTab('LOSS')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterTab === 'LOSS'
                ? 'bg-slate-800 text-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kalah ({trades.filter((t) => t.outcome === 'LOSS').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari jurnal..."
            value={journalSearch}
            onChange={(e) => setJournalSearch(e.target.value)}
            className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599]"
          />
        </div>
      </div>

      {/* Journal Cards Grid */}
      {filteredTrades.length === 0 ? (
        <div className="py-16 text-center bg-[#0e1422] border border-slate-800 rounded-2xl p-6">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Tidak Ada Catatan Jurnal</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Belum ada transaksi yang sesuai dengan filter saat ini.
          </p>
          <button
            onClick={onOpenTradeModal}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] transition-all cursor-pointer"
          >
            + Catat Jurnal Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrades.map((t) => {
            const isWin = t.outcome === 'WIN';
            const isLoss = t.outcome === 'LOSS';

            return (
              <div
                key={t.id}
                onClick={() => onViewTradeDetails(t)}
                className="bg-[#0e1422] border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between cursor-pointer group shadow-lg"
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                          t.position === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {t.position}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#00e599] transition-colors">
                          {t.pair}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>
                            {new Date(t.entryDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{t.lotSize.toFixed(2)} Lot</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <p
                        className={`text-lg font-extrabold ${
                          t.status === 'OPEN'
                            ? 'text-slate-400'
                            : isWin
                            ? 'text-[#00e599]'
                            : isLoss
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {t.status === 'OPEN' ? 'OPEN' : formatCurrency(t.pnl, currency)}
                      </p>
                      {t.status === 'CLOSED' && (
                        <p className="text-[11px] text-slate-400">
                          {t.pips !== undefined ? `${t.pips > 0 ? '+' : ''}${t.pips} pips` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Level Parameters */}
                  <div className="grid grid-cols-4 gap-2 p-2.5 bg-[#080c14] border border-slate-800 rounded-xl text-center text-[11px] font-mono mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Entry</span>
                      <span className="text-white font-semibold">{t.entryPrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Exit</span>
                      <span className="text-white font-semibold">{t.exitPrice ?? '-'}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 block text-[10px]">SL</span>
                      <span className="text-rose-400 font-semibold">{t.stopLoss}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block text-[10px]">TP</span>
                      <span className="text-emerald-400 font-semibold">{t.takeProfit}</span>
                    </div>
                  </div>

                  {/* Strategy & Psychology Metadata (Clean text with typographic separator, zero-pill) */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="font-semibold text-slate-200">{t.strategy}</span>
                    <span aria-hidden="true">·</span>
                    <span>Psikologi: {t.psychology}</span>
                    {t.riskRewardRatio ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">1:{t.riskRewardRatio} RR</span>
                      </>
                    ) : null}
                  </div>

                  {/* Reason & Lessons */}
                  {t.entryReason && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-300 line-clamp-2">
                        <span className="font-semibold text-slate-400">Alasan Entry: </span>
                        {t.entryReason}
                      </p>
                    </div>
                  )}

                  {t.evaluationNote && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        <span className="font-semibold text-slate-500">Evaluasi: </span>
                        {t.evaluationNote}
                      </p>
                    </div>
                  )}

                  {/* Screenshots preview strip if present */}
                  {(t.chartBeforeUrl || t.chartAfterUrl) && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {t.chartBeforeUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black">
                          <img
                            src={t.chartBeforeUrl}
                            alt="Setup Before"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white">
                            Before
                          </span>
                        </div>
                      )}
                      {t.chartAfterUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black">
                          <img
                            src={t.chartAfterUrl}
                            alt="Result After"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white">
                            After
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div
                  className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px]">
                    Status: <strong className="text-white">{t.status}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditTrade(t)}
                      className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteTrade(t.id)}
                      className="px-2.5 py-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
