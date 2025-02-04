import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { TelegramProvider } from '@/context/telegram-provider';
import { SupabaseProvider } from '@/context/supabase-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coco Gnome',
  description: 'Complete tasks, place bets, earn $COCO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <TelegramProvider>
            <SupabaseProvider>
              {children}
              <Toaster />
            </SupabaseProvider>
          </TelegramProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}