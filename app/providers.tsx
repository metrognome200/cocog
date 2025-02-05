"use client";

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
    >
      <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </TonConnectUIProvider>
    </ThemeProvider>
  );
}