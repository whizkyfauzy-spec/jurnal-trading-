import { Trade, TradeStats, EquityPoint, DailyPerformance } from '../types/trade';

export function calculateTradeStats(trades: Trade[], initialBalance: number = 10000): TradeStats {
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');
  const openTrades = trades.filter((t) => t.status === 'OPEN');

  const totalTrades = trades.length;
  const closedCount = closedTrades.length;

  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let totalPnl = 0;
  let totalRR = 0;
  let rrCount = 0;
  let largestWin = 0;
  let largestLoss = 0;

  // For consecutive calculations
  let currentConsecWins = 0;
  let maxConsecWins = 0;
  let currentConsecLosses = 0;
  let maxConsecLosses = 0;

  // Sort chronologically for sequence & drawdown
  const sortedTrades = [...closedTrades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let currentPeak = initialBalance;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let runningBalance = initialBalance;

  for (const trade of sortedTrades) {
    const pnl = trade.pnl || 0;
    totalPnl += pnl;
    runningBalance += pnl;

    if (runningBalance > currentPeak) {
      currentPeak = runningBalance;
    }

    const drawdown = currentPeak - runningBalance;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = currentPeak > 0 ? (drawdown / currentPeak) * 100 : 0;
    }

    if (pnl > 0.001) {
      winningTrades++;
      grossProfit += pnl;
      if (pnl > largestWin) largestWin = pnl;

      currentConsecWins++;
      currentConsecLosses = 0;
      if (currentConsecWins > maxConsecWins) maxConsecWins = currentConsecWins;
    } else if (pnl < -0.001) {
      losingTrades++;
      grossLoss += Math.abs(pnl);
      if (Math.abs(pnl) > largestLoss) largestLoss = Math.abs(pnl);

      currentConsecLosses++;
      currentConsecWins = 0;
      if (currentConsecLosses > maxConsecLosses) maxConsecLosses = currentConsecLosses;
    } else {
      breakevenTrades++;
      currentConsecWins = 0;
      currentConsecLosses = 0;
    }

    if (trade.riskRewardRatio && trade.riskRewardRatio > 0) {
      totalRR += trade.riskRewardRatio;
      rrCount++;
    }
  }

  const winRate = closedCount > 0 ? (winningTrades / closedCount) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;
  const avgRiskReward = rrCount > 0 ? totalRR / rrCount : 0;
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;

  // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
  const winDecimal = closedCount > 0 ? winningTrades / closedCount : 0;
  const lossDecimal = closedCount > 0 ? losingTrades / closedCount : 0;
  const expectancy = winDecimal * avgWin - lossDecimal * avgLoss;

  return {
    totalTrades,
    closedTrades: closedCount,
    openTrades: openTrades.length,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate: Number(winRate.toFixed(1)),
    totalPnl: Number(totalPnl.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    avgRiskReward: Number(avgRiskReward.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(1)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    consecutiveWins: maxConsecWins,
    consecutiveLosses: maxConsecLosses,
    expectancy: Number(expectancy.toFixed(2)),
  };
}

export function calculateEquityCurve(trades: Trade[], initialBalance: number = 10000): EquityPoint[] {
  const closedTrades = trades
    .filter((t) => t.status === 'CLOSED')
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

  if (closedTrades.length === 0) {
    return [
      {
        date: new Date().toISOString().split('T')[0],
        tradeNumber: 0,
        equity: initialBalance,
        pnl: 0,
        pair: 'Initial Balance',
      },
    ];
  }

  let currentEquity = initialBalance;
  const points: EquityPoint[] = [
    {
      date: closedTrades[0].entryDate ? closedTrades[0].entryDate.split('T')[0] : 'Start',
      tradeNumber: 0,
      equity: initialBalance,
      pnl: 0,
      pair: 'Initial Balance',
    },
  ];

  closedTrades.forEach((t, index) => {
    currentEquity += t.pnl || 0;
    points.push({
      date: t.exitDate ? t.exitDate.split('T')[0] : t.entryDate.split('T')[0],
      tradeNumber: index + 1,
      equity: Number(currentEquity.toFixed(2)),
      pnl: t.pnl || 0,
      pair: t.pair,
    });
  });

  return points;
}

export function calculateDailyPerformance(trades: Trade[]): DailyPerformance[] {
  const map = new Map<string, { pnl: number; count: number; wins: number; losses: number }>();

  trades
    .filter((t) => t.status === 'CLOSED')
    .forEach((t) => {
      const dateKey = (t.exitDate || t.entryDate).split('T')[0];
      const existing = map.get(dateKey) || { pnl: 0, count: 0, wins: 0, losses: 0 };

      existing.pnl += t.pnl || 0;
      existing.count += 1;
      if (t.pnl > 0.001) existing.wins += 1;
      else if (t.pnl < -0.001) existing.losses += 1;

      map.set(dateKey, existing);
    });

  const result: DailyPerformance[] = [];
  map.forEach((val, date) => {
    result.push({
      date,
      pnl: Number(val.pnl.toFixed(2)),
      tradesCount: val.count,
      winsCount: val.wins,
      lossesCount: val.losses,
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function calculatePairStats(trades: Trade[]) {
  const map = new Map<
    string,
    { pair: string; totalTrades: number; wins: number; losses: number; pnl: number; totalVolume: number }
  >();

  trades
    .filter((t) => t.status === 'CLOSED')
    .forEach((t) => {
      const existing = map.get(t.pair) || {
        pair: t.pair,
        totalTrades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        totalVolume: 0,
      };

      existing.totalTrades += 1;
      existing.pnl += t.pnl || 0;
      existing.totalVolume += t.lotSize || 0;
      if (t.pnl > 0.001) existing.wins += 1;
      else if (t.pnl < -0.001) existing.losses += 1;

      map.set(t.pair, existing);
    });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      pnl: Number(item.pnl.toFixed(2)),
      winRate: item.totalTrades > 0 ? Number(((item.wins / item.totalTrades) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

export function calculateStrategyStats(trades: Trade[]) {
  const map = new Map<
    string,
    { strategy: string; totalTrades: number; wins: number; losses: number; pnl: number; profitFactor: number; grossProfit: number; grossLoss: number }
  >();

  trades
    .filter((t) => t.status === 'CLOSED')
    .forEach((t) => {
      const strat = t.strategy || 'Lainnya';
      const existing = map.get(strat) || {
        strategy: strat,
        totalTrades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        profitFactor: 0,
        grossProfit: 0,
        grossLoss: 0,
      };

      existing.totalTrades += 1;
      existing.pnl += t.pnl || 0;
      if (t.pnl > 0.001) {
        existing.wins += 1;
        existing.grossProfit += t.pnl;
      } else if (t.pnl < -0.001) {
        existing.losses += 1;
        existing.grossLoss += Math.abs(t.pnl);
      }

      map.set(strat, existing);
    });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      pnl: Number(item.pnl.toFixed(2)),
      winRate: item.totalTrades > 0 ? Number(((item.wins / item.totalTrades) * 100).toFixed(1)) : 0,
      profitFactor:
        item.grossLoss > 0
          ? Number((item.grossProfit / item.grossLoss).toFixed(2))
          : item.grossProfit > 0
          ? Number(item.grossProfit.toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

export function calculateDayOfWeekStats(trades: Trade[]) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayData = [1, 2, 3, 4, 5].map((dayIndex) => ({
    day: days[dayIndex],
    dayIndex,
    pnl: 0,
    trades: 0,
    wins: 0,
  }));

  trades
    .filter((t) => t.status === 'CLOSED')
    .forEach((t) => {
      const date = new Date(t.entryDate);
      const dIndex = date.getDay();
      const match = dayData.find((d) => d.dayIndex === dIndex);
      if (match) {
        match.trades += 1;
        match.pnl += t.pnl || 0;
        if (t.pnl > 0.001) match.wins += 1;
      }
    });

  return dayData.map((d) => ({
    ...d,
    pnl: Number(d.pnl.toFixed(2)),
    winRate: d.trades > 0 ? Number(((d.wins / d.trades) * 100).toFixed(1)) : 0,
  }));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  switch (currency) {
    case 'IDR':
      return `${sign}Rp ${abs.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    case 'EUR':
      return `${sign}€${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GBP':
      return `${sign}£${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'JPY':
      return `${sign}¥${abs.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
    case 'AUD':
      return `${sign}A$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'USD':
    default:
      return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function calculatePips(pair: string, entry: number, exit: number, position: 'BUY' | 'SELL'): number {
  if (!entry || !exit) return 0;
  const isJpy = pair.toUpperCase().includes('JPY');
  const isGold = pair.toUpperCase().includes('XAU') || pair.toUpperCase().includes('GOLD');
  const multiplier = isJpy ? 100 : isGold ? 10 : 10000;

  const diff = position === 'BUY' ? exit - entry : entry - exit;
  return Number((diff * multiplier).toFixed(1));
}

export function calculateRiskRewardRatio(entry: number, stopLoss: number, takeProfit: number, position: 'BUY' | 'SELL'): number {
  if (!entry || !stopLoss || !takeProfit) return 0;
  
  const risk = position === 'BUY' ? entry - stopLoss : stopLoss - entry;
  const reward = position === 'BUY' ? takeProfit - entry : entry - takeProfit;

  if (risk <= 0 || reward <= 0) return 0;
  return Number((reward / risk).toFixed(2));
}
