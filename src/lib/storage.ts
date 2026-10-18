import { Trade, UserAccount } from '../types/trade';
import { SAMPLE_TRADES } from './sampleData';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_TRADES = 'tradelog_trades_v1';
const STORAGE_KEY_USER = 'tradelog_user_v1';

export const DEFAULT_USER: UserAccount = {
  id: 'usr_default_trader',
  name: 'Forex Trader',
  email: 'trader@example.com',
  initialBalance: 10000,
  currentBalance: 10000,
  currency: 'USD',
  riskPerTradePercent: 1.0,
  maxDailyLoss: 300,
  experienceLevel: 'Intermediate',
  supabaseConnected: false,
};

export function loadUserAccount(): UserAccount {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (stored) {
    try {
      return { ...DEFAULT_USER, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_USER;
    }
  }
  return DEFAULT_USER;
}

export function saveUserAccount(account: UserAccount): void {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(account));
}

export async function fetchTrades(): Promise<Trade[]> {
  const supabase = getSupabase();
  const account = loadUserAccount();

  // Try Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database columns (snake_case) to Trade interface (camelCase)
        const mapped: Trade[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || account.id,
          pair: d.pair,
          position: d.position,
          status: d.status,
          entryDate: d.entry_date,
          exitDate: d.exit_date,
          entryPrice: Number(d.entry_price),
          exitPrice: d.exit_price ? Number(d.exit_price) : undefined,
          stopLoss: Number(d.stop_loss),
          takeProfit: Number(d.take_profit),
          lotSize: Number(d.lot_size),
          pnl: Number(d.pnl || 0),
          pips: d.pips ? Number(d.pips) : undefined,
          riskRewardRatio: d.risk_reward_ratio ? Number(d.risk_reward_ratio) : undefined,
          outcome: d.outcome,
          strategy: d.strategy || 'Lainnya',
          psychology: d.psychology || 'Disiplin & Tenang',
          entryReason: d.entry_reason || '',
          evaluationNote: d.evaluation_note || '',
          chartBeforeUrl: d.chart_before_url,
          chartAfterUrl: d.chart_after_url,
          createdAt: d.created_at,
          isDemo: d.is_demo || false,
        }));
        // Update local cache
        localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Local Storage fallback
  const stored = localStorage.getItem(STORAGE_KEY_TRADES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return SAMPLE_TRADES;
    }
  }

  // First time initialization: populate sample trades
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(SAMPLE_TRADES));
  return SAMPLE_TRADES;
}

export async function addTrade(trade: Trade): Promise<Trade> {
  const current = await fetchTrades();
  const updated = [trade, ...current];
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updated));

  const supabase = getSupabase();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('trades').insert([
        {
          id: trade.id,
          user_id: trade.userId,
          pair: trade.pair,
          position: trade.position,
          status: trade.status,
          entry_date: trade.entryDate,
          exit_date: trade.exitDate,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          lot_size: trade.lotSize,
          pnl: trade.pnl,
          pips: trade.pips,
          risk_reward_ratio: trade.riskRewardRatio,
          outcome: trade.outcome,
          strategy: trade.strategy,
          psychology: trade.psychology,
          entry_reason: trade.entryReason,
          evaluation_note: trade.evaluationNote,
          chart_before_url: trade.chartBeforeUrl,
          chart_after_url: trade.chartAfterUrl,
          is_demo: trade.isDemo || false,
        },
      ]);
    } catch (err) {
      console.error('Supabase insert trade failed:', err);
    }
  }

  return trade;
}

export async function updateTrade(trade: Trade): Promise<Trade> {
  const current = await fetchTrades();
  const updated = current.map((t) => (t.id === trade.id ? trade : t));
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updated));

  const supabase = getSupabase();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('trades')
        .update({
          pair: trade.pair,
          position: trade.position,
          status: trade.status,
          entry_date: trade.entryDate,
          exit_date: trade.exitDate,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          lot_size: trade.lotSize,
          pnl: trade.pnl,
          pips: trade.pips,
          risk_reward_ratio: trade.riskRewardRatio,
          outcome: trade.outcome,
          strategy: trade.strategy,
          psychology: trade.psychology,
          entry_reason: trade.entryReason,
          evaluation_note: trade.evaluationNote,
          chart_before_url: trade.chartBeforeUrl,
          chart_after_url: trade.chartAfterUrl,
        })
        .eq('id', trade.id);
    } catch (err) {
      console.error('Supabase update trade failed:', err);
    }
  }

  return trade;
}

export async function deleteTrade(id: string): Promise<void> {
  const current = await fetchTrades();
  const updated = current.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(updated));

  const supabase = getSupabase();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('trades').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete trade failed:', err);
    }
  }
}

export function resetToDemoTrades(): Trade[] {
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(SAMPLE_TRADES));
  return SAMPLE_TRADES;
}

export function clearAllTrades(): Trade[] {
  localStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify([]));
  return [];
}

export function exportTradesToCSV(trades: Trade[]): void {
  const headers = [
    'ID',
    'Tanggal Entry',
    'Tanggal Exit',
    'Pair',
    'Posisi',
    'Status',
    'Lot Size',
    'Harga Entry',
    'Harga Exit',
    'Stop Loss',
    'Take Profit',
    'P&L',
    'Pips',
    'Risk:Reward',
    'Hasil',
    'Strategi',
    'Psikologi',
    'Alasan Entry',
    'Evaluasi',
    'Tipe Data',
  ];

  const rows = trades.map((t) => [
    t.id,
    t.entryDate,
    t.exitDate || '',
    t.pair,
    t.position,
    t.status,
    t.lotSize,
    t.entryPrice,
    t.exitPrice || '',
    t.stopLoss,
    t.takeProfit,
    t.pnl,
    t.pips || 0,
    t.riskRewardRatio || '',
    t.outcome || '',
    `"${(t.strategy || '').replace(/"/g, '""')}"`,
    `"${(t.psychology || '').replace(/"/g, '""')}"`,
    `"${(t.entryReason || '').replace(/"/g, '""')}"`,
    `"${(t.evaluationNote || '').replace(/"/g, '""')}"`,
    t.isDemo ? 'Demo' : 'Real',
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Jurnal_Trading_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
