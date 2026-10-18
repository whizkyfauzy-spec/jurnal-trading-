import React, { useState } from 'react';
import { X, Save, Database, Key, Check, Copy, AlertCircle, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types/trade';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SCHEMA_SQL,
} from '../lib/supabaseClient';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onSaveUser: (user: UserAccount) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onResetDemoData,
  onClearAllData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'supabase' | 'danger'>('profile');

  // Profile Form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [initialBalance, setInitialBalance] = useState<number>(user.initialBalance);
  const [currency, setCurrency] = useState<UserAccount['currency']>(user.currency);
  const [riskPercent, setRiskPercent] = useState<number>(user.riskPerTradePercent);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(user.maxDailyLoss);
  const [experienceLevel, setExperienceLevel] = useState<UserAccount['experienceLevel']>(user.experienceLevel);

  // Supabase Form state
  const initialSupabase = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialSupabase.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialSupabase.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...user,
      name,
      email,
      initialBalance: Number(initialBalance) || 10000,
      currency,
      riskPerTradePercent: Number(riskPercent) || 1.0,
      maxDailyLoss: Number(maxDailyLoss) || 300,
      experienceLevel,
    };
    onSaveUser(updated);
    onShowToast('success', 'Pengaturan Profil Disimpan', 'Modal awal dan mata uang akun berhasil diperbarui.');
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestResult({
        success: false,
        message: 'Masukkan URL dan Anon Public Key Supabase Anda terlebih dahulu.',
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      onSaveUser({ ...user, supabaseConnected: true });
      onShowToast('success', 'Koneksi Supabase Aktif', 'Data transaksi kini tersinkronisasi ke cloud database.');
    }
  };

  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    onSaveUser({ ...user, supabaseConnected: Boolean(supabaseUrl && supabaseAnonKey) });
    onShowToast('success', 'Konfigurasi Tersimpan', 'Pengaturan koneksi database Supabase telah disimpan.');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onShowToast('info', 'Schema SQL Disalin', 'Tempel di SQL Editor dashboard Supabase Anda.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Manajemen Akun & Preferensi</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#00e599] font-semibold border-b-2 border-[#00e599]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profil & Modal Akun
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'supabase'
                ? 'text-[#00e599] font-semibold border-b-2 border-[#00e599]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Database Supabase
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'danger'
                ? 'text-rose-400 font-semibold border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kelola Data
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: Profile & Trading Account */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Trader
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Modal Awal (Initial Balance)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Digunakan untuk menghitung kurva ekuitas & persentase ROI secara akurat.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mata Uang Akun
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  >
                    <option value="USD">USD ($ - Dolar Amerika)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - Poundsterling)</option>
                    <option value="IDR">IDR (Rp - Rupiah Indonesia)</option>
                    <option value="JPY">JPY (¥ - Yen Jepang)</option>
                    <option value="AUD">AUD (A$ - Dolar Australia)</option>
                  </select>
                </div>
              </div>

              {/* Risk Management Preferences */}
              <div className="p-4 bg-[#111827]/60 border border-slate-800 rounded-xl space-y-3 mt-2">
                <span className="text-xs font-bold text-slate-200 block">
                  Aturan Disiplin Risiko Akun
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Target Max Risiko per Trade (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 1)}
                      className="w-full font-mono bg-[#090d16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e599]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Batas Kerugian Harian Maksimal ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={maxDailyLoss}
                      onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 0)}
                      className="w-full font-mono bg-[#090d16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e599]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] transition-all cursor-pointer shadow-md shadow-[#00e599]/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Akun</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Supabase Database Configuration */}
          {activeTab === 'supabase' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-3">
                <Database className="w-5 h-5 shrink-0 mt-0.5 text-[#00e599]" />
                <div>
                  <p className="font-bold text-white">Integrasi Cloud Database Supabase</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Anda dapat menghubungkan project Supabase pribadi untuk menyimpan seluruh transaksi secara permanen dengan Row Level Security (RLS). Jika kosong, Jurnal Trading otomatis menggunakan local persistent storage.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full font-mono bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full font-mono bg-[#111827] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isTesting ? 'Menguji...' : 'Tes Koneksi'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSupabase}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] transition-all cursor-pointer shadow-md shadow-[#00e599]/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>
              </div>

              {/* SQL Migration Script Box */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Skrip SQL Supabase (Termasuk RLS)</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-[#00e599] hover:underline font-semibold cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                  </button>
                </div>
                <div className="bg-[#080c14] border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto">
                  <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap">
                    {SUPABASE_SCHEMA_SQL}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Danger Zone / Reset */}
          {activeTab === 'danger' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Muat Data Demo Contoh</h4>
                  <p className="text-[11px] text-slate-400">
                    Isi ulang jurnal Anda dengan 10 transaksi contoh (XAU/USD, EUR/USD, dll.) untuk eksplorasi dashboard.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onResetDemoData();
                    onShowToast('info', 'Data Demo Dimuat', '10 transaksi demo berhasil dimuat.');
                  }}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors shrink-0 ml-4 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Muat Demo</span>
                </button>
              </div>

              <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-300 mb-0.5">Kosongkan Semua Transaksi</h4>
                  <p className="text-[11px] text-slate-400">
                    Menghapus seluruh entri jurnal dari penyimpanan lokal Anda untuk mulai dari lembar kosong.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin mengosongkan seluruh riwayat trading? Tindakan ini tidak dapat dibatalkan.')) {
                      onClearAllData();
                      onShowToast('info', 'Jurnal Dikosongkan', 'Semua transaksi telah dihapus.');
                    }
                  }}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl border border-rose-500/30 transition-colors shrink-0 ml-4 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#090d16] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
