'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useTelegram } from './telegram-provider';

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  isInitialized: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isInitialized: false,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useTelegram();

  useEffect(() => {
    if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      setSupabase(client);
      setIsInitialized(true);
    }
  }, [supabase]);

  // Sync Telegram user with Supabase
  useEffect(() => {
    if (supabase && user) {
      const syncUser = async () => {
        const { data, error } = await supabase
          .from('users')
          .upsert({
            telegram_id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            photo_url: user.photo_url,
            coco_balance: 0, // Initial $COCO balance
            last_login: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error syncing user:', error);
        }
      };

      syncUser();
    }
  }, [supabase, user]);

  return (
    <SupabaseContext.Provider value={{ supabase, isInitialized }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);