import React, { useState } from 'react';
import { Plus, User, Menu, X, Database, SlidersHorizontal } from 'lucide-react';
import { UserAccount } from '../types/trade';

interface NavbarProps {
  currentTab: 'landing' | 'dashboard' | 'journal' | 'history' | 'analytics';
  onSelectTab: (tab: 'landing' | 'dashboard' | 'journal' | 'history' | 'analytics') => void;
  onOpenTradeModal: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  user: UserAccount;
  isLoggedIn: boolean;
  isSupabaseConfigured: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenTradeModal,
  onOpenSettings,
  onOpenAuth,
  user,
  isLoggedIn,
  isSupabaseConfigured,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Beranda' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'journal', label: 'Jurnal Trading' },
    { id: 'history', label: 'Riwayat' },
    { id: 'analytics', label: 'Analytics' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => {
            onSelectTab('landing');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
            <span className="font-mono text-sm font-bold text-[#00e599]">JT</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Jurnal <span className="text-[#00e599]">Trading</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single-line, unboxed, hover underline) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                currentTab === item.id
                  ? 'text-[#00e599] font-semibold border-b-2 border-[#00e599]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Profile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Catat Transaksi Button */}
          <button
            onClick={onOpenTradeModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-[#00e599] rounded-lg hover:bg-[#10f2a7] active:scale-98 transition-all whitespace-nowrap shrink-0 shadow-sm shadow-[#00e599]/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Trade</span>
          </button>

          {/* Account / Settings button */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan Akun & Supabase"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors border border-slate-800"
            aria-label="Pengaturan Akun"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* User state toggle */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
            {isSupabaseConfigured && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" title="Supabase Terhubung" />
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Buka navigasi mobile"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#080c14] px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === item.id
                  ? 'bg-slate-800/80 text-[#00e599]'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Status Database: {isSupabaseConfigured ? 'Supabase' : 'Local Storage'}</span>
            </button>
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-[#00e599] hover:underline py-1"
            >
              Ganti Akun
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
