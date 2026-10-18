import React, { useState } from 'react';
import { X, User, Lock, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { UserAccount } from '../types/trade';
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onLoginSuccess: (user: UserAccount) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onShowToast,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isCloud = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isCloud) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          if (isRegister) {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { name: name || email.split('@')[0] },
              },
            });
            if (error) throw error;
            onShowToast('success', 'Registrasi Berhasil', 'Akun Supabase Anda telah dibuat.');
            if (data.user) {
              onLoginSuccess({
                ...currentUser,
                id: data.user.id,
                email: data.user.email || email,
                name: name || email.split('@')[0],
              });
              onClose();
            }
          } else {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
            onShowToast('success', 'Login Berhasil', `Selamat datang kembali, ${data.user?.email}`);
            if (data.user) {
              onLoginSuccess({
                ...currentUser,
                id: data.user.id,
                email: data.user.email || email,
                name: data.user.user_metadata?.name || email.split('@')[0],
              });
              onClose();
            }
          }
        } catch (err: any) {
          onShowToast('error', 'Gagal Otentikasi', err.message || 'Periksa email & password.');
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    // Local / Default Instant Authentication
    setTimeout(() => {
      setLoading(false);
      const userObj: UserAccount = {
        ...currentUser,
        id: `usr_${Math.random().toString(36).slice(2, 8)}`,
        name: name || (isRegister ? 'Trader Baru' : email ? email.split('@')[0] : 'Trader'),
        email: email || 'trader@example.com',
      };
      onLoginSuccess(userObj);
      onShowToast(
        'success',
        isRegister ? 'Pendaftaran Sukses' : 'Masuk Berhasil',
        `Jurnal pribadi aktif untuk ${userObj.name}`
      );
      onClose();
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess({
      ...currentUser,
      id: 'demo-user-1',
      name: 'Alex Pratama',
      email: 'alex.trader@tradelog.app',
      experienceLevel: 'Professional',
      initialBalance: 10000,
    });
    onShowToast('success', 'Masuk Akun Demo', 'Masuk sebagai Alex Pratama (Trader Demo)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d16]">
          <h2 className="text-base font-bold text-white">
            {isRegister ? 'Buat Akun Jurnal Baru' : 'Masuk ke Jurnal Trading'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current profile info */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <img
              src="/src/assets/images/avatar_trader_1792334364626.jpg"
              alt="Trader Avatar"
              className="w-11 h-11 rounded-full object-cover border border-[#00e599]/30"
            />
            <div className="text-xs">
              <p className="font-bold text-white">{currentUser.name}</p>
              <p className="text-slate-400">{currentUser.email}</p>
              <p className="text-[10px] text-[#00e599] mt-0.5">
                Akun Aktif saat ini · Saldo Awal: ${currentUser.initialBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ryan Pratama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="trader@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00e599]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-[#00e599] rounded-xl hover:bg-[#10f2a7] active:scale-98 transition-all cursor-pointer shadow-md shadow-[#00e599]/20 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar Akun Baru' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Switch Mode & Quick Demo */}
          <div className="pt-4 border-t border-slate-800 space-y-3 text-center text-xs">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-slate-400 hover:text-white"
            >
              {isRegister
                ? 'Sudah punya akun? Masuk disini'
                : 'Belum punya akun? Registrasi gratis'}
            </button>

            <div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
              >
                Masuk Cepat sebagai Trader Contoh (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
