import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  users: {
    id: string;
    telegram_id: string;
    username: string;
    wallet_address: string | null;
    created_at: string;
    last_login: string;
  };
  game_stats: {
    id: string;
    user_id: string;
    clicks: number;
    tokens_earned: number;
    last_played: string;
  };
  transactions: {
    id: string;
    user_id: string;
    type: 'earn' | 'spend' | 'transfer';
    amount: number;
    created_at: string;
  };
};