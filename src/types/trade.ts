export type TradePosition = 'BUY' | 'SELL';

export type TradeStatus = 'CLOSED' | 'OPEN';

export type TradeOutcome = 'WIN' | 'LOSS' | 'BREAKEVEN';

export type TradingStrategy = 
  | 'Trend Following'
  | 'ICT / Smart Money Concepts'
  | 'Support & Resistance'
  | 'Supply & Demand'
  | 'Breakout & Retest'
  | 'Scalping'
  | 'Fibonacci Retracement'
  | 'Chart Pattern'
  | 'News Trading';

export type TradingPsychology = 
  | 'Disiplin & Tenang'
  | 'Fokus Sesuai Plan'
  | 'FOMO (Fear Of Missing Out)'
  | 'Balas Dendam (Revenge Trade)'
  | 'Ragu-ragu (Hesitant)'
  | 'Serakah (Overconfident)'
  | 'Cemas & Panik';

export interface Trade {
  id: string;
  userId: string;
  pair: string;                 // e.g. 'EUR/USD', 'GBP/USD', 'XAU/USD'
  position: TradePosition;      // 'BUY' | 'SELL'
  status: TradeStatus;          // 'CLOSED' | 'OPEN'
  entryDate: string;            // ISO datetime
  exitDate?: string;            // ISO datetime
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  pnl: number;                  // Net profit / loss in account currency
  pips?: number;
  riskRewardRatio?: number;
  outcome?: TradeOutcome;
  strategy: TradingStrategy | string;
  psychology: TradingPsychology | string;
  entryReason: string;
  evaluationNote?: string;
  chartBeforeUrl?: string;      // Base64 or URL
  chartAfterUrl?: string;       // Base64 or URL
  tags?: string[];
  createdAt: string;
  isDemo?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  initialBalance: number;
  currentBalance: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'IDR' | 'JPY' | 'AUD';
  riskPerTradePercent: number;
  maxDailyLoss: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Professional';
  supabaseConnected?: boolean;
}

export interface TradeStats {
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;              // percentage 0 - 100
  totalPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;         // grossProfit / abs(grossLoss)
  avgRiskReward: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  expectancy: number;
}

export interface DailyPerformance {
  date: string;                 // YYYY-MM-DD
  pnl: number;
  tradesCount: number;
  winsCount: number;
  lossesCount: number;
}

export interface EquityPoint {
  date: string;
  tradeNumber: number;
  equity: number;
  pnl: number;
  pair: string;
}
