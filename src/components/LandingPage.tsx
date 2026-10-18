import React from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Calendar,
  Lock,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Trade, TradeStats } from '../types/trade';
import { formatCurrency } from '../lib/calculations';

interface LandingPageProps {
  onStartTrading: () => void;
  onExploreFeatures: () => void;
  stats: TradeStats;
  currency: string;
  recentTrades: Trade[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrading,
  onExploreFeatures,
  stats,
  currency,
  recentTrades,
}) => {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/60">
        {/* Ambient subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#00e599]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-4 tracking-wide">
              <span>Platform Jurnal Finansial Profesional</span>
              <span aria-hidden="true">·</span>
              <span>Data-Driven Discipline</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-[1.15] mb-6">
              Trade Smarter.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e599] via-emerald-400 to-teal-300">
                Track Every Move.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed text-balance mb-8">
              Jurnal trading forex untuk mencatat transaksi, menganalisis performa, dan meningkatkan disiplin trading.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartTrading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] active:scale-98 transition-all shadow-lg shadow-[#00e599]/20 cursor-pointer"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              >
                <span>Lihat Fitur</span>
              </button>
            </div>

            {/* Quick Proof Strip */}
            <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
                Kalkulasi Otomatis Win Rate & RRR
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
                Audit Psikologi & Evaluasi Setup
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
                Database Supabase & Row Level Security
              </span>
            </div>
          </div>

          {/* Interactive Trading Dashboard Preview Card */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-[#0d131f]/95 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window control bar */}
            <div className="px-5 py-3 border-b border-slate-800/80 bg-[#0a0f18] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">Jurnal Trading Workspace · Live Preview</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#00e599]">●</span> Demo Live Mode
              </div>
            </div>

            {/* Trading Workspace Graphic & Metrics Preview */}
            <div className="p-5 sm:p-7 space-y-6">
              {/* Stat Bar Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Total P&L</p>
                  <p className={`text-xl sm:text-2xl font-bold font-mono ${stats.totalPnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                    {formatCurrency(stats.totalPnl, currency)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Dari {stats.closedTrades} closed trades</p>
                </div>

                <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Win Rate</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {stats.winRate}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{stats.winningTrades} Menang · {stats.losingTrades} Kalah</p>
                </div>

                <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Profit Factor</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {stats.profitFactor}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1">Optimal &gt; 1.5</p>
                </div>

                <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Avg Risk to Reward</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    1:{stats.avgRiskReward || '2.4'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Disiplin risk management</p>
                </div>
              </div>

              {/* Workstation Hero Showcase Image */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[16/8] sm:aspect-[16/7]">
                <img
                  src="/src/assets/images/hero_trading_setup_1792334363981.jpg"
                  alt="Professional Forex Trading Setup"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/90 via-[#080c14]/30 to-transparent flex flex-col justify-end p-6">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold text-[#00e599] uppercase tracking-wider mb-1">
                      Platform Eksekusi & Evaluasi Terintegrasi
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      Fokus pada Proses, Bukan Emosi Sesaat
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Mulai catat setiap konfirmasi technical, psikologi entry, screenshot chart, hingga evaluasi post-trade.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Quick Trade Feed Preview */}
              <div className="bg-[#111827]/70 rounded-xl border border-slate-800/80 p-4">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>Transaksi Terkini (Contoh Data Demo)</span>
                  <button
                    onClick={onStartTrading}
                    className="text-[#00e599] hover:underline cursor-pointer"
                  >
                    Buka Dashboard Lengkap →
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {recentTrades.slice(0, 3).map((trade) => (
                    <div key={trade.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          trade.position === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {trade.position}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{trade.pair}</p>
                          <p className="text-[11px] text-slate-400">{trade.strategy}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className={`font-semibold ${trade.pnl >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                          {formatCurrency(trade.pnl, currency)}
                        </p>
                        <p className="text-[11px] text-slate-400">{trade.pips} pips</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 lg:py-28 border-b border-slate-800/60 bg-[#0a0e17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-[#00e599] tracking-widest uppercase mb-2">
              Fitur Lengkap Trader Modern
            </h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Dirancang untuk Mengasah Edge Trading Anda
            </h3>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Setiap aspek dari entri hingga analisis mendalam dibangun untuk mendukung konsistensi dan pertumbuhan akun jangka panjang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#00e599] mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Jurnal Transaksi Lengkap</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Catat pair (EUR/USD, XAU/USD, dll.), lot size, harga entry/exit, SL & TP, kalkulasi pips otomatis, serta screenshot chart sebelum dan sesudah eksekusi.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Equity Curve & Drawdown</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Pantau kurva modal trading secara real-time, evaluasi maximum drawdown ($ dan %), serta rasio untung rugi untuk menjaga ketahanan modal.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Analisis Pair & Strategi</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ketahui pair mana yang memberikan keuntungan tertinggi dan strategi trading mana (ICT, S&R, Trend Following) yang paling konsisten.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Kalender Trading Interaktif</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Visualisasikan hari-hari hijau (profit) dan merah (loss) secara kalenderikal. Identifikasi hari paling produktif dalam seminggu.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Audit Psikologi Trader</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Identifikasi bias emosional seperti FOMO, revenge trading, atau serakah. Tingkatkan disiplin mental yang membedakan trader pemenang.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#111827] border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Keamanan Supabase & RLS</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dukungan penyimpanan database cloud Supabase dengan Row Level Security (RLS) serta opsi offline local storage berkinerja tinggi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disiplin & CTA Section */}
      <section className="py-16 sm:py-24 bg-[#080c14] relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-gradient-to-b from-[#111827] to-[#0a0e17] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Siap Membawa Trading Anda ke Level Berikutnya?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Mulai catat transaksi pertama Anda dalam hitungan detik. Data tersimpan aman dan siap dianalisis kapan saja.
            </p>

            <button
              onClick={onStartTrading}
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] transition-all shadow-xl shadow-[#00e599]/20 cursor-pointer"
            >
              <span>Buka Jurnal Trading Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Financial Risk Notice & Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06090f] py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Regulatory Risk Disclaimer */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200/80 text-[11px] leading-relaxed">
            <span className="font-bold text-amber-300">Peringatan Risiko Finansial:</span> Perdagangan valuta asing (Forex) dan instrumen derivatif melibatkan risiko kerugian finansial yang signifikan dan mungkin tidak cocok untuk semua investor. Kinerja masa lalu tidak menjamin hasil di masa depan. Jurnal Trading adalah perangkat lunak analitik dan pencatatan mandiri untuk tujuan evaluasi edukatif dan jurnal pribadi, bukan penasihat keuangan atau broker, dan tidak menjanjikan imbal hasil keuntungan tertentu.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">Jurnal Trading</span>
              <span>·</span>
              <span>Platform Jurnal Forex Modern</span>
            </div>
            <p>© {new Date().getFullYear()} Jurnal Trading. Semua hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
