import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Calculator, Check, AlertCircle } from 'lucide-react';
import {
  Trade,
  TradePosition,
  TradeStatus,
  TradingStrategy,
  TradingPsychology,
} from '../types/trade';
import { calculatePips, calculateRiskRewardRatio } from '../lib/calculations';

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialTrade?: Trade | null;
  userId: string;
}

const COMMON_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'XAU/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'USD/CHF',
  'NZD/USD',
  'GBP/JPY',
  'EUR/JPY',
  'BTC/USD',
];

const STRATEGIES: TradingStrategy[] = [
  'Trend Following',
  'ICT / Smart Money Concepts',
  'Support & Resistance',
  'Supply & Demand',
  'Breakout & Retest',
  'Scalping',
  'Fibonacci Retracement',
  'Chart Pattern',
  'News Trading',
];

const PSYCHOLOGY_OPTIONS: TradingPsychology[] = [
  'Disiplin & Tenang',
  'Fokus Sesuai Plan',
  'FOMO (Fear Of Missing Out)',
  'Balas Dendam (Revenge Trade)',
  'Ragu-ragu (Hesitant)',
  'Serakah (Overconfident)',
  'Cemas & Panik',
];

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTrade,
  userId,
}) => {
  const [pair, setPair] = useState('EUR/USD');
  const [customPair, setCustomPair] = useState('');
  const [position, setPosition] = useState<TradePosition>('BUY');
  const [status, setStatus] = useState<TradeStatus>('CLOSED');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 16));
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 16));
  const [entryPrice, setEntryPrice] = useState<number | ''>(1.08500);
  const [exitPrice, setExitPrice] = useState<number | ''>(1.08900);
  const [stopLoss, setStopLoss] = useState<number | ''>(1.08250);
  const [takeProfit, setTakeProfit] = useState<number | ''>(1.09200);
  const [lotSize, setLotSize] = useState<number | ''>(1.00);
  const [pnl, setPnl] = useState<number | ''>(400);
  const [strategy, setStrategy] = useState<string>('ICT / Smart Money Concepts');
  const [psychology, setPsychology] = useState<string>('Disiplin & Tenang');
  const [entryReason, setEntryReason] = useState('');
  const [evaluationNote, setEvaluationNote] = useState('');
  const [chartBeforeUrl, setChartBeforeUrl] = useState('');
  const [chartAfterUrl, setChartAfterUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize on edit modal open
  useEffect(() => {
    if (initialTrade) {
      if (COMMON_PAIRS.includes(initialTrade.pair)) {
        setPair(initialTrade.pair);
        setCustomPair('');
      } else {
        setPair('OTHER');
        setCustomPair(initialTrade.pair);
      }
      setPosition(initialTrade.position);
      setStatus(initialTrade.status);
      setEntryDate(initialTrade.entryDate.slice(0, 16));
      setExitDate(initialTrade.exitDate ? initialTrade.exitDate.slice(0, 16) : '');
      setEntryPrice(initialTrade.entryPrice);
      setExitPrice(initialTrade.exitPrice ?? '');
      setStopLoss(initialTrade.stopLoss);
      setTakeProfit(initialTrade.takeProfit);
      setLotSize(initialTrade.lotSize);
      setPnl(initialTrade.pnl);
      setStrategy(initialTrade.strategy);
      setPsychology(initialTrade.psychology);
      setEntryReason(initialTrade.entryReason || '');
      setEvaluationNote(initialTrade.evaluationNote || '');
      setChartBeforeUrl(initialTrade.chartBeforeUrl || '');
      setChartAfterUrl(initialTrade.chartAfterUrl || '');
    } else {
      // Default reset for new entry
      setPair('EUR/USD');
      setPosition('BUY');
      setStatus('CLOSED');
      setEntryDate(new Date().toISOString().slice(0, 16));
      setExitDate(new Date().toISOString().slice(0, 16));
      setEntryPrice(1.08500);
      setExitPrice(1.08900);
      setStopLoss(1.08250);
      setTakeProfit(1.09200);
      setLotSize(1.00);
      setPnl(400);
      setStrategy('ICT / Smart Money Concepts');
      setPsychology('Disiplin & Tenang');
      setEntryReason('');
      setEvaluationNote('');
      setChartBeforeUrl('');
      setChartAfterUrl('');
      setErrorMsg('');
    }
  }, [initialTrade, isOpen]);

  if (!isOpen) return null;

  const currentPair = pair === 'OTHER' ? customPair.toUpperCase().trim() : pair;

  // Auto-calculated RRR and pips
  const calcPips =
    entryPrice && exitPrice && status === 'CLOSED'
      ? calculatePips(currentPair, Number(entryPrice), Number(exitPrice), position)
      : 0;

  const calcRRR =
    entryPrice && stopLoss && takeProfit
      ? calculateRiskRewardRatio(Number(entryPrice), Number(stopLoss), Number(takeProfit), position)
      : 0;

  // Auto calculate PnL based on pips and standard contract value
  const handleAutoCalculatePnL = () => {
    if (!entryPrice || !exitPrice || !lotSize) return;
    const pipsVal = calculatePips(currentPair, Number(entryPrice), Number(exitPrice), position);
    const isGold = currentPair.includes('XAU') || currentPair.includes('GOLD');
    const isJpy = currentPair.includes('JPY');
    const pipMultiplier = isGold ? 10 : isJpy ? 9.5 : 10; // rough standard lot pip value in USD
    const estimatedPnl = Number((pipsVal * pipMultiplier * Number(lotSize)).toFixed(2));
    setPnl(estimatedPnl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (type === 'before') setChartBeforeUrl(reader.result);
        else setChartAfterUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPair) {
      setErrorMsg('Pilih atau masukkan Pair forex.');
      return;
    }

    if (!entryPrice || Number(entryPrice) <= 0) {
      setErrorMsg('Harga Entry harus berupa angka positif.');
      return;
    }

    if (!stopLoss || Number(stopLoss) <= 0) {
      setErrorMsg('Stop Loss wajib diisi untuk manajemen risiko.');
      return;
    }

    if (!takeProfit || Number(takeProfit) <= 0) {
      setErrorMsg('Take Profit wajib diisi.');
      return;
    }

    if (!lotSize || Number(lotSize) <= 0) {
      setErrorMsg('Lot Size minimal 0.01.');
      return;
    }

    const netPnl = status === 'CLOSED' ? (pnl === '' ? 0 : Number(pnl)) : 0;
    let outcome: 'WIN' | 'LOSS' | 'BREAKEVEN' | undefined;
    if (status === 'CLOSED') {
      if (netPnl > 0.001) outcome = 'WIN';
      else if (netPnl < -0.001) outcome = 'LOSS';
      else outcome = 'BREAKEVEN';
    }

    const tradeData: Trade = {
      id: initialTrade?.id || `trade_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: initialTrade?.userId || userId,
      pair: currentPair,
      position,
      status,
      entryDate: new Date(entryDate).toISOString(),
      exitDate: status === 'CLOSED' && exitDate ? new Date(exitDate).toISOString() : undefined,
      entryPrice: Number(entryPrice),
      exitPrice: status === 'CLOSED' && exitPrice !== '' ? Number(exitPrice) : undefined,
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      lotSize: Number(lotSize),
      pnl: netPnl,
      pips: calcPips,
      riskRewardRatio: calcRRR,
      outcome,
      strategy,
      psychology,
      entryReason,
      evaluationNote,
      chartBeforeUrl: chartBeforeUrl || undefined,
      chartAfterUrl: chartAfterUrl || undefined,
      createdAt: initialTrade?.createdAt || new Date().toISOString(),
      isDemo: false,
    };

    onSave(tradeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{initialTrade ? 'Edit Transaksi' : 'Catat Transaksi Forex'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Pair & Position Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pair selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Forex Pair <span className="text-[#00e599]">*</span>
              </label>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00e599]"
              >
                {COMMON_PAIRS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="OTHER">Lainnya (Custom)...</option>
              </select>
              {pair === 'OTHER' && (
                <input
                  type="text"
                  placeholder="Misal: NZD/CHF"
                  value={customPair}
                  onChange={(e) => setCustomPair(e.target.value)}
                  className="mt-2 w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#00e599]"
                />
              )}
            </div>

            {/* Position BUY / SELL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Posisi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPosition('BUY')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    position === 'BUY'
                      ? 'bg-emerald-500/20 text-[#00e599] border border-emerald-500/50'
                      : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setPosition('SELL')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    position === 'SELL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>

            {/* Status OPEN / CLOSED */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('CLOSED')}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    status === 'CLOSED'
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Closed (Selesai)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('OPEN')}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    status === 'OPEN'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Open (Aktif)
                </button>
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tanggal & Waktu Entry
              </label>
              <input
                type="datetime-local"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                required
              />
            </div>

            {status === 'CLOSED' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tanggal & Waktu Exit
                </label>
                <input
                  type="datetime-local"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                />
              </div>
            )}
          </div>

          {/* Pricing Row: Entry, Exit, SL, TP, Lot */}
          <div className="p-4 bg-[#111827]/60 border border-slate-800 rounded-xl space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Harga Entry <span className="text-[#00e599]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.08500"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full font-mono bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  required
                />
              </div>

              {status === 'CLOSED' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Harga Exit
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.08900"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full font-mono bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Lot Size <span className="text-[#00e599]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.10"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full font-mono bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                  Stop Loss (SL) <span className="text-[#00e599]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.08200"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full font-mono bg-[#090d16] border border-rose-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                  Take Profit (TP) <span className="text-[#00e599]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="1.09200"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full font-mono bg-[#090d16] border border-emerald-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              {status === 'CLOSED' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Profit / Loss ($)
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoCalculatePnL}
                      title="Hitung perkiraan otomatis"
                      className="text-[10px] text-[#00e599] hover:underline flex items-center gap-0.5"
                    >
                      <Calculator className="w-2.5 h-2.5" /> Hitung
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 150 atau -75"
                    value={pnl}
                    onChange={(e) => setPnl(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className={`w-full font-mono bg-[#090d16] border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none ${
                      Number(pnl) >= 0 ? 'border-emerald-500/40' : 'border-rose-500/40'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Dynamic Calculated Badges */}
            <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
              <div>
                <span>Est. Risk:Reward: </span>
                <span className="text-white font-bold">1:{calcRRR > 0 ? calcRRR : '-'}</span>
              </div>
              {status === 'CLOSED' && (
                <div>
                  <span>Pips: </span>
                  <span className={`font-bold ${calcPips >= 0 ? 'text-[#00e599]' : 'text-rose-400'}`}>
                    {calcPips > 0 ? `+${calcPips}` : calcPips} pips
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Strategy & Psychology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Strategi Trading
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
              >
                {STRATEGIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kondisi Psikologis saat Entry
              </label>
              <select
                value={psychology}
                onChange={(e) => setPsychology(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
              >
                {PSYCHOLOGY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reasons & Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alasan Entry & Konfirmasi Teknikal
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Liquidity sweep sesi London, mitigasi Order Block H1, rejection candle..."
                value={entryReason}
                onChange={(e) => setEntryReason(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Evaluasi / Lessons Learned
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Apakah mematuhi trading plan? Apakah exit terlalu dini atau geser SL?"
                value={evaluationNote}
                onChange={(e) => setEvaluationNote(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599]"
              />
            </div>
          </div>

          {/* Screenshot Chart Upload Before & After */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-300">
              Screenshot Chart (Sebelum & Sesudah Eksekusi)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chart Before */}
              <div className="border border-slate-800 rounded-xl p-3 bg-[#111827]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Chart Sebelum Entry</span>
                  {chartBeforeUrl && (
                    <button
                      type="button"
                      onClick={() => setChartBeforeUrl('')}
                      className="text-rose-400 hover:underline text-[10px]"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {chartBeforeUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={chartBeforeUrl}
                      alt="Chart Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-slate-700/80 hover:border-[#00e599]/50 bg-slate-900/40 cursor-pointer p-4 transition-colors">
                    <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[11px] text-slate-400">Upload screenshot setup</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>
                )}
                <input
                  type="text"
                  placeholder="Atau tempel link gambar/TradingView"
                  value={chartBeforeUrl}
                  onChange={(e) => setChartBeforeUrl(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300"
                />
              </div>

              {/* Chart After */}
              <div className="border border-slate-800 rounded-xl p-3 bg-[#111827]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Chart Sesudah Exit</span>
                  {chartAfterUrl && (
                    <button
                      type="button"
                      onClick={() => setChartAfterUrl('')}
                      className="text-rose-400 hover:underline text-[10px]"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {chartAfterUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={chartAfterUrl}
                      alt="Chart After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-slate-700/80 hover:border-[#00e599]/50 bg-slate-900/40 cursor-pointer p-4 transition-colors">
                    <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[11px] text-slate-400">Upload screenshot hasil</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'after')}
                      className="hidden"
                    />
                  </label>
                )}
                <input
                  type="text"
                  placeholder="Atau tempel link gambar/TradingView"
                  value={chartAfterUrl}
                  onChange={(e) => setChartAfterUrl(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] active:scale-98 transition-all cursor-pointer shadow-md shadow-[#00e599]/20"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{initialTrade ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
