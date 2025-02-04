'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramContextType {
  user: TelegramUser | null;
  isReady: boolean;
  expand: () => void;
  close: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isReady: false,
  expand: () => {},
  close: () => {},
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram Web App
      tg.ready();
      setIsReady(true);

      // Get user data if available
      if (tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  const expand = () => {
    window.Telegram?.WebApp.expand();
  };

  const close = () => {
    window.Telegram?.WebApp.close();
  };

  return (
    <TelegramContext.Provider value={{ user, isReady, expand, close }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);