import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Scale,
  Plus,
  RefreshCw,
  FolderOpen,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { Trade, TradeStats, EquityPoint } from '../types/trade';
import { formatCurrency, calculateDailyPerformance } from '../lib/calculations';

interface DashboardProps {
  stats: TradeStats;
  equityPoints: EquityPoint[];
  trades: Trade[];
  initialBalance: number;
  currency: string;
  onOpenTradeModal: () => void;
  onViewTradeDetails: (trade: Trade) => void;
  onSelectTab: (tab: 'landing' | 'dashboard' | 'journal' | 'history' | 'analytics') => void;
  onLoadDemoData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  equityPoints,
  trades,
  initialBalance,
  currency,
  onOpenTradeModal,
  onViewTradeDetails,
  onSelectTab,
  onLoadDemoData,
}) => {
  const [performanceView, setPerformanceView] = useState<'daily' | 'monthly'>('daily');

  const currentBalance = initialBalance + stats.totalPnl;
  const returnPercentage = initialBalance > 0 ? (stats.totalPnl / initialBalance) * 100 : 0;
  const isProfitable = stats.totalPnl >= 0;

  // Compute daily performance data
  const dailyData = calculateDailyPerformance(trades).map((d) => ({
    label: d.date,
    pnl: d.pnl,
    count: d.tradesCount,
  }));

  // Group by month
  const monthlyMap = new Map<string, { month: string; pnl: number; count: number }>();
  trades.filter((t) => t.status === 'CLOSED').forEach((t) => {
    const monthKey = (t.exitDate || t.entryDate).substring(0, 7); // YYYY-MM
    const current = monthlyMap.get(monthKey) || { month: monthKey, pnl: 0, count: 0 };
    current.pnl += t.pnl || 0;
    current.count += 1;
    monthlyMap.set(monthKey, current);
  });
  const monthlyData = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      label: m.month,
      pnl: Number(m.pnl.toFixed(2)),
      count: m.count,
    }));

  const chartData = performanceView === 'daily' ? dailyData : monthlyData;

  const hasDemoData = trades.some((t) => t.isDemo);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Demo Notice */}
      {hasDemoData && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-blue-500/30 bg-[#0d1627] text-blue-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Data Demo</span>
            <span>Anda sedang melihat data contoh untuk demonstrasi fitur & grafik statistik Jurnal Trading.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenTradeModal}
              className="text-[#00e599] hover:underline font-semibold cursor-pointer"
            >
              + Tambah Transaksi Riil
            </button>
          </div>
        </div>
      )}

      {/* Header Summary & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Trading
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ringkasan performa finansial, rasio kemenangan, dan pertumbuhan ekuitas akun Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTradeModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] active:scale-98 transition-all shadow-md shadow-[#00e599]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net P&L Card */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Profit & Loss (P&L)</span>
            <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold ${
              isProfitable ? 'text-[#00e599]' : 'text-rose-400'
            }`}>
              {isProfitable ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              isProfitable ? 'text-[#00e599]' : 'text-rose-400'
            }`}>
              {formatCurrency(stats.totalPnl, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span>Saldo: {formatCurrency(currentBalance, currency)}</span>
            <span>Modal: {formatCurrency(initialBalance, currency)}</span>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Win Rate</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {stats.winRate}%
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span className="text-emerald-400">{stats.winningTrades} Menang</span>
            <span className="text-rose-400">{stats.losingTrades} Kalah</span>
            <span className="text-slate-400">{stats.breakevenTrades} BE</span>
          </div>
        </div>

        {/* Profit Factor Card */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Profit Factor</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {stats.profitFactor}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {stats.profitFactor >= 1.5 ? '(Sehat)' : stats.profitFactor >= 1.0 ? '(Moderat)' : '(Evaluasi)'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span>Gross Profit: +{formatCurrency(stats.grossProfit, currency)}</span>
            <span>Gross Loss: -{formatCurrency(stats.grossLoss, currency)}</span>
          </div>
        </div>

        {/* Avg Risk to Reward Card */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Avg Risk-to-Reward (RRR)</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              1:{stats.avgRiskReward || '0.0'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span>Avg Win: +{formatCurrency(stats.avgWin, currency)}</span>
            <span>Avg Loss: -{formatCurrency(stats.avgLoss, currency)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d131f] border border-slate-800 rounded-xl p-4 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Total Trades</span>
          <span className="font-mono text-sm font-bold text-white">{stats.totalTrades} ({stats.closedTrades} Selesai)</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Max Drawdown</span>
          <span className="font-mono text-sm font-bold text-rose-400">
            {formatCurrency(stats.maxDrawdown, currency)} ({stats.maxDrawdownPercent}%)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Max Consec. Wins</span>
          <span className="font-mono text-sm font-bold text-emerald-400">{stats.consecutiveWins} Trades Beruntun</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Expectancy</span>
          <span className={`font-mono text-sm font-bold ${stats.expectancy >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
            {formatCurrency(stats.expectancy, currency)} / trade
          </span>
        </div>
      </div>

      {/* Empty State when zero trades */}
      {trades.length === 0 && (
        <div className="text-center py-16 px-4 bg-[#0d131f] border border-slate-800/90 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Belum Ada Transaksi Tercatat</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            Mulai bangun rekam jejak trading forex Anda dengan mencatat transaksi pertama, atau muat data demo untuk melihat simulasi lengkap.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenTradeModal}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] transition-all cursor-pointer"
            >
              + Catat Transaksi Pertama
            </button>
            <button
              onClick={onLoadDemoData}
              className="px-5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Muat Data Demo
            </button>
          </div>
        </div>
      )}

      {/* Charts Section: Equity Curve & Performance */}
      {trades.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equity Curve (2 cols) */}
          <div className="lg:col-span-2 bg-[#0e1422] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Equity Curve</span>
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    (Saldo Akun Seiring Waktu)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualisasi pertumbuhan modal dari transaksi 1 hingga sekarang.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e599]" />
                <span>Ekuitas ({currency})</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e599" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00e599" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="tradeNumber"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `T#${val}`}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0f18',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(value: any) => [formatCurrency(Number(value), currency), 'Ekuitas']}
                    labelFormatter={(tradeNum) => `Transaksi ke-${tradeNum}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#00e599"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Breakdown (Bar Chart) */}
          <div className="bg-[#0e1422] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Distribusi P&L</h3>
                <p className="text-xs text-slate-400">Hasil performa per periode</p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#080c14] border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setPerformanceView('daily')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    performanceView === 'daily'
                      ? 'bg-slate-800 text-[#00e599] font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setPerformanceView('monthly')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    performanceView === 'monthly'
                      ? 'bg-slate-800 text-[#00e599] font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => (val ? val.slice(5) : '')}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0f18',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val), currency), 'Net P&L']}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? '#00e599' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Trades Preview Strip */}
      {trades.length > 0 && (
        <div className="bg-[#0e1422] border border-slate-800/90 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Transaksi Terakhir</h3>
              <p className="text-xs text-slate-400">Ringkasan cepat posisi trading terbaru</p>
            </div>
            <button
              onClick={() => onSelectTab('history')}
              className="text-xs font-semibold text-[#00e599] hover:underline cursor-pointer"
            >
              Lihat Semua ({trades.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Pair</th>
                  <th className="pb-3 font-medium">Posisi</th>
                  <th className="pb-3 font-medium">Lot</th>
                  <th className="pb-3 font-medium">Entry / Exit</th>
                  <th className="pb-3 font-medium">Strategi</th>
                  <th className="pb-3 font-medium text-right">P&L ({currency})</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {trades.slice(0, 5).map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onViewTradeDetails(t)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 text-slate-300 font-sans">
                      {new Date(t.entryDate).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3 font-bold text-white font-sans">{t.pair}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        t.position === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {t.position}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{t.lotSize.toFixed(2)}</td>
                    <td className="py-3 text-slate-300">
                      {t.entryPrice} → {t.exitPrice || 'Open'}
                    </td>
                    <td className="py-3 text-slate-400 font-sans">{t.strategy}</td>
                    <td className={`py-3 text-right font-bold ${
                      t.status === 'OPEN'
                        ? 'text-slate-400'
                        : t.pnl >= 0
                        ? 'text-[#00e599]'
                        : 'text-rose-400'
                    }`}>
                      {t.status === 'OPEN' ? 'Open' : formatCurrency(t.pnl, currency)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                        t.status === 'OPEN'
                          ? 'bg-blue-500/10 text-blue-400'
                          : t.outcome === 'WIN'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.outcome === 'LOSS'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}>
                        {t.status === 'OPEN' ? 'OPEN' : t.outcome || 'CLOSED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
