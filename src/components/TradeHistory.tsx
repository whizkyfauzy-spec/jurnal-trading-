import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Trade } from '../types/trade';
import { formatCurrency } from '../lib/calculations';
import { exportTradesToCSV } from '../lib/storage';

interface TradeHistoryProps {
  trades: Trade[];
  currency: string;
  onOpenTradeModal: () => void;
  onViewTradeDetails: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({
  trades,
  currency,
  onOpenTradeModal,
  onViewTradeDetails,
  onEditTrade,
  onDeleteTrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPair, setSelectedPair] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState('ALL');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D' | 'THIS_MONTH'>('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Extract unique pairs and strategies for filter dropdowns
  const uniquePairs = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => set.add(t.pair));
    return Array.from(set).sort();
  }, [trades]);

  const uniqueStrategies = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => {
      if (t.strategy) set.add(t.strategy);
    });
    return Array.from(set).sort();
  }, [trades]);

  // Filtered trades
  const filteredTrades = useMemo(() => {
    const now = new Date();

    return trades.filter((trade) => {
      // Search matching pair, strategy, reason, note
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          trade.pair.toLowerCase().includes(query) ||
          trade.strategy?.toLowerCase().includes(query) ||
          trade.entryReason?.toLowerCase().includes(query) ||
          trade.evaluationNote?.toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // Pair filter
      if (selectedPair !== 'ALL' && trade.pair !== selectedPair) return false;

      // Strategy filter
      if (selectedStrategy !== 'ALL' && trade.strategy !== selectedStrategy) return false;

      // Position filter
      if (selectedPosition !== 'ALL' && trade.position !== selectedPosition) return false;

      // Outcome filter
      if (selectedOutcome !== 'ALL') {
        if (selectedOutcome === 'OPEN' && trade.status !== 'OPEN') return false;
        if (selectedOutcome === 'WIN' && trade.outcome !== 'WIN') return false;
        if (selectedOutcome === 'LOSS' && trade.outcome !== 'LOSS') return false;
        if (selectedOutcome === 'BREAKEVEN' && trade.outcome !== 'BREAKEVEN') return false;
      }

      // Date range filter
      if (dateFilter !== 'ALL') {
        const tradeDate = new Date(trade.entryDate);
        if (dateFilter === '7D') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (tradeDate < sevenDaysAgo) return false;
        } else if (dateFilter === '30D') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (tradeDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'THIS_MONTH') {
          if (
            tradeDate.getMonth() !== now.getMonth() ||
            tradeDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [trades, searchTerm, selectedPair, selectedStrategy, selectedOutcome, selectedPosition, dateFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTrades.length / pageSize) || 1;
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, currentPage, pageSize]);

  const handleExport = () => {
    exportTradesToCSV(filteredTrades.length > 0 ? filteredTrades : trades);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPair('ALL');
    setSelectedStrategy('ALL');
    setSelectedOutcome('ALL');
    setSelectedPosition('ALL');
    setDateFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedPair !== 'ALL' ||
    selectedStrategy !== 'ALL' ||
    selectedOutcome !== 'ALL' ||
    selectedPosition !== 'ALL' ||
    dateFilter !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Riwayat Trading
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Total {trades.length} transaksi tercatat. Filter, analisa kembali, atau ekspor laporan ke CSV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenTradeModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] active:scale-98 transition-all cursor-pointer shadow-md shadow-[#00e599]/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pair, strategi, catatan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599]"
            />
          </div>

          {/* Pair Filter */}
          <div>
            <select
              value={selectedPair}
              onChange={(e) => {
                setSelectedPair(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
            >
              <option value="ALL">Semua Pair</option>
              {uniquePairs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Filter */}
          <div>
            <select
              value={selectedStrategy}
              onChange={(e) => {
                setSelectedStrategy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
            >
              <option value="ALL">Semua Strategi</option>
              {uniqueStrategies.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={selectedOutcome}
              onChange={(e) => {
                setSelectedOutcome(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
            >
              <option value="ALL">Semua Hasil</option>
              <option value="WIN">Menang (Win)</option>
              <option value="LOSS">Kalah (Loss)</option>
              <option value="BREAKEVEN">Breakeven</option>
              <option value="OPEN">Open (Aktif)</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
            >
              <option value="ALL">Semua Periode</option>
              <option value="7D">7 Hari Terakhir</option>
              <option value="30D">30 Hari Terakhir</option>
              <option value="THIS_MONTH">Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Menampilkan {filteredTrades.length} dari {trades.length} transaksi
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Trades Table */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#090d16] text-slate-400 select-none">
                <th className="py-3.5 px-4 font-semibold">Tanggal Entry</th>
                <th className="py-3.5 px-4 font-semibold">Pair</th>
                <th className="py-3.5 px-4 font-semibold">Posisi</th>
                <th className="py-3.5 px-4 font-semibold">Lot Size</th>
                <th className="py-3.5 px-4 font-semibold">Harga Entry</th>
                <th className="py-3.5 px-4 font-semibold">Harga Exit</th>
                <th className="py-3.5 px-4 font-semibold">SL / TP</th>
                <th className="py-3.5 px-4 font-semibold">R:R</th>
                <th className="py-3.5 px-4 font-semibold">Pips</th>
                <th className="py-3.5 px-4 font-semibold text-right">P&L ({currency})</th>
                <th className="py-3.5 px-4 font-semibold text-center">Hasil</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-sans">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedTrades.map((trade) => {
                  const isWin = trade.outcome === 'WIN';
                  const isLoss = trade.outcome === 'LOSS';

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onViewTradeDetails(trade)}
                    >
                      {/* Entry Date */}
                      <td className="py-3.5 px-4 font-sans text-slate-300 whitespace-nowrap">
                        {new Date(trade.entryDate).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Pair */}
                      <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                        <span className="font-bold text-white">{trade.pair}</span>
                        {trade.isDemo && (
                          <span className="ml-1 text-[9px] text-blue-400">demo</span>
                        )}
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trade.position === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {trade.position}
                        </span>
                      </td>

                      {/* Lot Size */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {trade.lotSize.toFixed(2)}
                      </td>

                      {/* Entry Price */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {trade.entryPrice}
                      </td>

                      {/* Exit Price */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {trade.exitPrice ?? '-'}
                      </td>

                      {/* SL / TP */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="text-rose-400">{trade.stopLoss}</span> /{' '}
                        <span className="text-emerald-400">{trade.takeProfit}</span>
                      </td>

                      {/* Risk Reward */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        1:{trade.riskRewardRatio || '-'}
                      </td>

                      {/* Pips */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={
                            (trade.pips || 0) >= 0 ? 'text-[#00e599]' : 'text-rose-400'
                          }
                        >
                          {trade.pips !== undefined
                            ? `${trade.pips > 0 ? '+' : ''}${trade.pips}`
                            : '-'}
                        </span>
                      </td>

                      {/* P&L */}
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        {trade.status === 'OPEN' ? (
                          <span className="text-slate-400">Open</span>
                        ) : (
                          <span className={trade.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}>
                            {formatCurrency(trade.pnl, currency)}
                          </span>
                        )}
                      </td>

                      {/* Outcome Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            trade.status === 'OPEN'
                              ? 'bg-blue-500/10 text-blue-400'
                              : isWin
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isLoss
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-slate-700/40 text-slate-300'
                          }`}
                        >
                          {trade.status === 'OPEN' ? 'OPEN' : trade.outcome || 'CLOSED'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewTradeDetails(trade)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Lihat Detail & Chart"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTrade(trade.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3.5 border-t border-slate-800 bg-[#090d16] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#080c14] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Menampilkan {filteredTrades.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredTrades.length)} dari {filteredTrades.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-700 bg-[#080c14] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-700 bg-[#080c14] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
