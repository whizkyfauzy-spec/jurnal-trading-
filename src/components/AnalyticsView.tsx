import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  PieChart as PieIcon,
  Layers,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Trade, TradeStats } from '../types/trade';
import {
  formatCurrency,
  calculatePairStats,
  calculateStrategyStats,
  calculateDayOfWeekStats,
} from '../lib/calculations';

interface AnalyticsViewProps {
  trades: Trade[];
  stats: TradeStats;
  currency: string;
  onViewTradeDetails: (trade: Trade) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trades,
  stats,
  currency,
  onViewTradeDetails,
}) => {
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [selectedCalendarDayTrades, setSelectedCalendarDayTrades] = useState<Trade[] | null>(null);
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>('');

  // Pair analysis
  const pairStats = useMemo(() => calculatePairStats(trades), [trades]);

  // Strategy analysis
  const strategyStats = useMemo(() => calculateStrategyStats(trades), [trades]);

  // Day of week analysis
  const dayStats = useMemo(() => calculateDayOfWeekStats(trades), [trades]);

  // Win / Loss donut data
  const outcomeDonutData = [
    { name: 'Menang (Win)', value: stats.winningTrades, color: '#00e599' },
    { name: 'Kalah (Loss)', value: stats.losingTrades, color: '#f43f5e' },
    { name: 'Breakeven', value: stats.breakevenTrades, color: '#64748b' },
  ].filter((d) => d.value > 0);

  // Trading sessions analysis
  const sessionStats = useMemo(() => {
    let asian = { count: 0, pnl: 0, wins: 0 };
    let london = { count: 0, pnl: 0, wins: 0 };
    let newyork = { count: 0, pnl: 0, wins: 0 };

    trades
      .filter((t) => t.status === 'CLOSED')
      .forEach((t) => {
        const hour = new Date(t.entryDate).getUTCHours();
        if (hour >= 0 && hour < 8) {
          asian.count++;
          asian.pnl += t.pnl || 0;
          if (t.pnl > 0.001) asian.wins++;
        } else if (hour >= 8 && hour < 14) {
          london.count++;
          london.pnl += t.pnl || 0;
          if (t.pnl > 0.001) london.wins++;
        } else {
          newyork.count++;
          newyork.pnl += t.pnl || 0;
          if (t.pnl > 0.001) newyork.wins++;
        }
      });

    return [
      {
        session: 'Asia (Tokyo/Sydney)',
        hours: '00:00 - 08:00 UTC',
        pnl: Number(asian.pnl.toFixed(2)),
        trades: asian.count,
        winRate: asian.count > 0 ? Number(((asian.wins / asian.count) * 100).toFixed(1)) : 0,
      },
      {
        session: 'London (Eropa)',
        hours: '08:00 - 14:00 UTC',
        pnl: Number(london.pnl.toFixed(2)),
        trades: london.count,
        winRate: london.count > 0 ? Number(((london.wins / london.count) * 100).toFixed(1)) : 0,
      },
      {
        session: 'New York (US)',
        hours: '13:00 - 22:00 UTC',
        pnl: Number(newyork.pnl.toFixed(2)),
        trades: newyork.count,
        winRate: newyork.count > 0 ? Number(((newyork.wins / newyork.count) * 100).toFixed(1)) : 0,
      },
    ];
  }, [trades]);

  // Calendar logic
  const calendarDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + calendarMonthOffset);
    return d;
  }, [calendarMonthOffset]);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map trades in this month
    const tradesByDay = new Map<number, { trades: Trade[]; pnl: number }>();
    trades.forEach((t) => {
      const d = new Date(t.exitDate || t.entryDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        const current = tradesByDay.get(dayNum) || { trades: [], pnl: 0 };
        current.trades.push(t);
        if (t.status === 'CLOSED') {
          current.pnl += t.pnl || 0;
        }
        tradesByDay.set(dayNum, current);
      }
    });

    const grid = [];
    // Padding before day 1
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ day: null, trades: [], pnl: 0 });
    }
    // Real days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = tradesByDay.get(day) || { trades: [], pnl: 0 };
      grid.push({
        day,
        trades: dayData.trades,
        pnl: Number(dayData.pnl.toFixed(2)),
      });
    }

    return grid;
  }, [year, month, trades]);

  const monthName = calendarDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const handleCalendarDayClick = (dayData: { day: number | null; trades: Trade[]; pnl: number }) => {
    if (!dayData.day || dayData.trades.length === 0) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayData.day).padStart(2, '0')}`;
    setSelectedCalendarDateStr(dateStr);
    setSelectedCalendarDayTrades(dayData.trades);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Analytics & Edge Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Identifikasi pola keberhasilan Anda berdasarkan pair, strategi, sesi market, dan kalender P&L.
        </p>
      </div>

      {/* Row 1: Interactive Calendar & Win Rate Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar (2 cols) */}
        <div className="lg:col-span-2 bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#00e599]" />
                <span>Kalender Trading Harian</span>
              </h3>
              <p className="text-xs text-slate-400">
                P&L harian: Klik pada tanggal untuk melihat rincian transaksi hari tersebut.
              </p>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-2 bg-[#080c14] border border-slate-800 rounded-xl px-2.5 py-1">
              <button
                onClick={() => setCalendarMonthOffset((o) => o - 1)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-200 capitalize min-w-[120px] text-center">
                {monthName}
              </span>
              <button
                onClick={() => setCalendarMonthOffset((o) => o + 1)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="py-1 font-semibold text-slate-400 border-b border-slate-800 mb-1">
                {d}
              </div>
            ))}

            {calendarDays.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={`empty-${idx}`} className="h-16 rounded-lg bg-transparent" />;
              }

              const hasTrades = cell.trades.length > 0;
              const isProfit = cell.pnl > 0.001;
              const isLoss = cell.pnl < -0.001;

              return (
                <div
                  key={`day-${cell.day}`}
                  onClick={() => handleCalendarDayClick(cell)}
                  className={`h-16 rounded-xl p-1.5 border flex flex-col justify-between text-left transition-all ${
                    hasTrades ? 'cursor-pointer hover:border-slate-400' : 'cursor-default'
                  } ${
                    isProfit
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : isLoss
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : hasTrades
                      ? 'bg-slate-800/40 border-slate-700'
                      : 'bg-[#080c14] border-slate-800/60 text-slate-500'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{cell.day}</span>
                  {hasTrades && (
                    <div className="text-right font-mono">
                      <p
                        className={`text-[11px] font-bold ${
                          isProfit ? 'text-[#00e599]' : isLoss ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {cell.pnl >= 0 ? '+' : ''}
                        {formatCurrency(cell.pnl, currency).replace(/[A-Za-z$€£¥\s]/g, '')}
                      </p>
                      <p className="text-[9px] text-slate-400 font-sans">{cell.trades.length} trade</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date Trades Modal / Drawer preview */}
          {selectedCalendarDayTrades && (
            <div className="mt-4 p-4 rounded-xl border border-slate-700 bg-[#090d16] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  Rincian Transaksi Tanggal {selectedCalendarDateStr} ({selectedCalendarDayTrades.length} trades)
                </span>
                <button
                  onClick={() => setSelectedCalendarDayTrades(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Tutup
                </button>
              </div>
              <div className="divide-y divide-slate-800 text-xs">
                {selectedCalendarDayTrades.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onViewTradeDetails(t)}
                    className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 px-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.position === 'BUY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {t.position}
                      </span>
                      <span className="font-bold text-white">{t.pair}</span>
                      <span className="text-slate-400 text-[11px]">({t.strategy})</span>
                    </div>
                    <div className="font-mono font-bold">
                      <span className={t.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}>
                        {formatCurrency(t.pnl, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Win Rate Donut & Ratio */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Rasio Kemenangan</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Proporsi Menang, Kalah, dan Breakeven</p>

            <div className="h-52 w-full flex items-center justify-center">
              {stats.closedTrades === 0 ? (
                <div className="text-xs text-slate-400 text-center">Belum ada transaksi tertutup.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeDonutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {outcomeDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0f18',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e599]" />
                Menang (Win)
              </span>
              <span className="font-mono font-bold text-white">
                {stats.winningTrades} ({stats.winRate}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Kalah (Loss)
              </span>
              <span className="font-mono font-bold text-white">
                {stats.losingTrades} ({stats.closedTrades > 0 ? (100 - stats.winRate).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Breakeven
              </span>
              <span className="font-mono font-bold text-white">{stats.breakevenTrades}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Performa Pair & Performa Strategi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pair Performance */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00e599]" />
                <span>Performa Forex Pair</span>
              </h3>
              <p className="text-xs text-slate-400">Pair dengan akumulasi profit tertinggi</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {pairStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-sans">Belum ada data pair.</div>
            ) : (
              pairStats.map((p) => (
                <div
                  key={p.pair}
                  className="p-3 bg-[#111827]/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-bold text-white font-sans">{p.pair}</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      {p.totalTrades} trades · Win Rate {p.winRate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${p.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                      {formatCurrency(p.pnl, currency)}
                    </p>
                    <p className="text-[11px] text-slate-400 font-sans">Vol: {p.totalVolume.toFixed(2)} lot</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Efektivitas Strategi Trading</span>
              </h3>
              <p className="text-xs text-slate-400">Profit factor & win rate berdasarkan setup</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {strategyStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-sans">Belum ada data strategi.</div>
            ) : (
              strategyStats.map((s) => (
                <div
                  key={s.strategy}
                  className="p-3 bg-[#111827]/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-bold text-white font-sans">{s.strategy}</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      {s.totalTrades} trades · WR {s.winRate}% · PF {s.profitFactor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${s.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                      {formatCurrency(s.pnl, currency)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Trading Sessions & Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Sesi Pasar Forex</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Hasil transaksi berdasarkan jam sesi global</p>

          <div className="space-y-3 font-mono text-xs">
            {sessionStats.map((s) => (
              <div
                key={s.session}
                className="p-3 bg-[#111827]/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white font-sans">{s.session}</span>
                  <p className="text-[11px] text-slate-400 font-sans">{s.hours}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${s.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                    {formatCurrency(s.pnl, currency)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-sans">
                    {s.trades} trades · {s.winRate}% Win
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <CalendarIcon className="w-4 h-4 text-purple-400" />
            <span>Hari Trading dalam Seminggu</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Statistik hari Senin s/d Jumat</p>

          <div className="space-y-2.5 font-mono text-xs">
            {dayStats.map((d) => (
              <div
                key={d.day}
                className="p-2.5 bg-[#111827]/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
              >
                <div className="w-24">
                  <span className="font-bold text-white font-sans">{d.day}</span>
                </div>
                <div className="text-slate-400 font-sans text-[11px]">
                  {d.trades} trades · WR {d.winRate}%
                </div>
                <div className="text-right w-28">
                  <span className={`font-bold ${d.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                    {formatCurrency(d.pnl, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Risk & Drawdown Management Console */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Statistik Manajemen Risiko & Drawdown</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Parameter ketahanan akun untuk mencegah margin call dan mengontrol risiko per transaksi.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1 font-sans">Max Drawdown</span>
            <p className="text-lg font-bold text-rose-400">
              {formatCurrency(stats.maxDrawdown, currency)}
            </p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">{stats.maxDrawdownPercent}% dari peak modal</p>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1 font-sans">Rata-rata Kemenangan</span>
            <p className="text-lg font-bold text-[#00e599]">
              +{formatCurrency(stats.avgWin, currency)}
            </p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Largest: +{formatCurrency(stats.largestWin, currency)}</p>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1 font-sans">Rata-rata Kerugian</span>
            <p className="text-lg font-bold text-rose-400">
              -{formatCurrency(stats.avgLoss, currency)}
            </p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Largest: -{formatCurrency(stats.largestLoss, currency)}</p>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1 font-sans">Streak Loss Maksimal</span>
            <p className="text-lg font-bold text-amber-400">
              {stats.consecutiveLosses} berturut-turut
            </p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Streak Menang: {stats.consecutiveWins}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
