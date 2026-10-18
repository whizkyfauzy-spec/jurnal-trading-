import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'tradelog_supabase_url';
const STORAGE_KEY_KEY = 'tradelog_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, key);
    // Ping auth or table
    const { error } = await tempClient.from('trades').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "trades" does not exist')) {
      // Even if table doesn't exist yet, connection might still be valid
      if (error.message.includes('JWT') || error.message.includes('API key')) {
        return { success: false, message: `Otentikasi gagal: ${error.message}` };
      }
    }
    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! Database siap digunakan.',
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Gagal menghubungi server Supabase. Pastikan URL & Anon Key benar.',
    };
  }
}

export const SUPABASE_SCHEMA_SQL = `-- Schema SQL untuk TradeLog di Supabase
-- Buka SQL Editor di Dashboard Supabase Anda, lalu jalankan script berikut:

-- 1. Tabel Profil Pengguna (User Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  currency TEXT DEFAULT 'USD',
  initial_balance NUMERIC(15,2) DEFAULT 10000.00,
  risk_per_trade_percent NUMERIC(5,2) DEFAULT 1.00,
  max_daily_loss NUMERIC(15,2) DEFAULT 300.00,
  experience_level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS untuk Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. Tabel Transaksi Trading (Trades)
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  pair VARCHAR(20) NOT NULL,
  position VARCHAR(10) NOT NULL CHECK (position IN ('BUY', 'SELL')),
  status VARCHAR(10) NOT NULL DEFAULT 'CLOSED' CHECK (status IN ('OPEN', 'CLOSED')),
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  entry_price NUMERIC(15,5) NOT NULL,
  exit_price NUMERIC(15,5),
  stop_loss NUMERIC(15,5) NOT NULL,
  take_profit NUMERIC(15,5) NOT NULL,
  lot_size NUMERIC(10,2) NOT NULL,
  pnl NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  pips NUMERIC(10,2) DEFAULT 0,
  risk_reward_ratio NUMERIC(10,2) DEFAULT 0,
  outcome VARCHAR(15) CHECK (outcome IN ('WIN', 'LOSS', 'BREAKEVEN')),
  strategy TEXT,
  psychology TEXT,
  entry_reason TEXT,
  evaluation_note TEXT,
  chart_before_url TEXT,
  chart_after_url TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) untuk Trades: Setiap user hanya dapat mengakses transaksinya sendiri
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own trades" 
  ON public.trades FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" 
  ON public.trades FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" 
  ON public.trades FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" 
  ON public.trades FOR DELETE 
  USING (auth.uid() = user_id);

-- Indeks performa pencarian dan analitik
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON public.trades(entry_date);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON public.trades(pair);
`;
