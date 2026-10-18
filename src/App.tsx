import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TradingJournal } from './components/TradingJournal';
import { TradeHistory } from './components/TradeHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { TradeFormModal } from './components/TradeFormModal';
import { TradeDetailModal } from './components/TradeDetailModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Trade, UserAccount } from './types/trade';
import {
  fetchTrades,
  addTrade,
  updateTrade,
  deleteTrade,
  loadUserAccount,
  saveUserAccount,
  resetToDemoTrades,
  clearAllTrades,
} from './lib/storage';
import { calculateTradeStats, calculateEquityCurve } from './lib/calculations';
import { isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'dashboard' | 'journal' | 'history' | 'analytics'>('landing');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [user, setUser] = useState<UserAccount>(loadUserAccount);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [detailModalTrade, setDetailModalTrade] = useState<Trade | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load trades on mount
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const data = await fetchTrades();
        setTrades(data);
      } catch (err) {
        console.error('Error fetching initial trades:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Compute calculated metrics
  const stats = useMemo(() => calculateTradeStats(trades, user.initialBalance), [trades, user.initialBalance]);
  const equityPoints = useMemo(() => calculateEquityCurve(trades, user.initialBalance), [trades, user.initialBalance]);

  // Handlers
  const handleSaveTrade = async (trade: Trade) => {
    try {
      if (editingTrade) {
        await updateTrade(trade);
        setTrades((prev) => prev.map((t) => (t.id === trade.id ? trade : t)));
        addToast('success', 'Transaksi Diperbarui', `${trade.pair} berhasil disimpan.`);
      } else {
        await addTrade(trade);
        setTrades((prev) => [trade, ...prev]);
        addToast('success', 'Transaksi Ditambahkan', `${trade.pair} (${trade.position}) tercatat di jurnal.`);

        // Confetti celebration if win
        if (trade.pnl > 0) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#00e599', '#10b981', '#34d399', '#6ee7b7'],
            });
          } catch {
            // Ignore if canvas unavailable
          }
        }
      }
      setEditingTrade(null);
    } catch (err) {
      console.error(err);
      addToast('error', 'Gagal Menyimpan Transaksi', 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await deleteTrade(id);
      setTrades((prev) => prev.filter((t) => t.id !== id));
      addToast('info', 'Transaksi Dihapus', 'Data transaksi berhasil dihapus dari jurnal.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Gagal Menghapus Transaksi');
    }
  };

  const handleSaveUserAccount = (updatedUser: UserAccount) => {
    setUser(updatedUser);
    saveUserAccount(updatedUser);
  };

  const handleResetDemoData = () => {
    const demoTrades = resetToDemoTrades();
    setTrades(demoTrades);
  };

  const handleClearAllData = () => {
    const cleared = clearAllTrades();
    setTrades(cleared);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-[#00e599]/20 selection:text-[#00e599]">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenTradeModal={() => {
          setEditingTrade(null);
          setTradeModalOpen(true);
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        user={user}
        isLoggedIn={true}
        isSupabaseConfigured={isSupabaseConfigured()}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onStartTrading={() => setCurrentTab('dashboard')}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else setCurrentTab('dashboard');
            }}
            stats={stats}
            currency={user.currency}
            recentTrades={trades}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            equityPoints={equityPoints}
            trades={trades}
            initialBalance={user.initialBalance}
            currency={user.currency}
            onOpenTradeModal={() => {
              setEditingTrade(null);
              setTradeModalOpen(true);
            }}
            onViewTradeDetails={(trade) => setDetailModalTrade(trade)}
            onSelectTab={setCurrentTab}
            onLoadDemoData={handleResetDemoData}
          />
        )}

        {currentTab === 'journal' && (
          <TradingJournal
            trades={trades}
            currency={user.currency}
            onOpenTradeModal={() => {
              setEditingTrade(null);
              setTradeModalOpen(true);
            }}
            onViewTradeDetails={(trade) => setDetailModalTrade(trade)}
            onEditTrade={(trade) => {
              setEditingTrade(trade);
              setTradeModalOpen(true);
            }}
            onDeleteTrade={handleDeleteTrade}
          />
        )}

        {currentTab === 'history' && (
          <TradeHistory
            trades={trades}
            currency={user.currency}
            onOpenTradeModal={() => {
              setEditingTrade(null);
              setTradeModalOpen(true);
            }}
            onViewTradeDetails={(trade) => setDetailModalTrade(trade)}
            onEditTrade={(trade) => {
              setEditingTrade(trade);
              setTradeModalOpen(true);
            }}
            onDeleteTrade={handleDeleteTrade}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            trades={trades}
            stats={stats}
            currency={user.currency}
            onViewTradeDetails={(trade) => setDetailModalTrade(trade)}
          />
        )}
      </main>

      {/* Global Modals */}
      <TradeFormModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        initialTrade={editingTrade}
        userId={user.id}
      />

      <TradeDetailModal
        isOpen={Boolean(detailModalTrade)}
        trade={detailModalTrade}
        onClose={() => setDetailModalTrade(null)}
        onEdit={(trade) => {
          setDetailModalTrade(null);
          setEditingTrade(trade);
          setTradeModalOpen(true);
        }}
        onDelete={handleDeleteTrade}
        currency={user.currency}
      />

      <AccountSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        user={user}
        onSaveUser={handleSaveUserAccount}
        onResetDemoData={handleResetDemoData}
        onClearAllData={handleClearAllData}
        onShowToast={addToast}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={(updatedUser) => {
          setUser(updatedUser);
          saveUserAccount(updatedUser);
        }}
        onShowToast={addToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
