"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTonConnect } from '@tonconnect/ui-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Trophy, Activity, User } from 'lucide-react';

export default function Home() {
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const { connected, wallet } = useTonConnect();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      setTelegramUser(tg.initDataUnsafe?.user);
    }
  }, []);

  const { data: gameStats } = useQuery({
    queryKey: ['gameStats', telegramUser?.id],
    queryFn: async () => {
      if (!telegramUser?.id) return null;
      const { data } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', telegramUser.id)
        .single();
      return data;
    },
    enabled: !!telegramUser?.id,
  });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <header className="mb-8 text-center">
          <h1 className="gradient-text mb-2 text-4xl font-bold md:text-6xl">
            Coco Gnome
          </h1>
          <p className="text-muted-foreground">
            Play, earn, and connect with the community
          </p>
        </header>

        <Tabs defaultValue="game" className="mx-auto max-w-3xl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="game">
              <Coins className="mr-2 h-4 w-4" />
              Game
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="mt-6 space-y-4">
            <Card className="p-6">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold">Clicker Game</h2>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="stats-card">
                    <p className="text-lg font-medium text-muted-foreground">
                      Clicks
                    </p>
                    <p className="text-3xl font-bold">{gameStats?.clicks || 0}</p>
                  </div>
                  <div className="stats-card">
                    <p className="text-lg font-medium text-muted-foreground">
                      $COCO Earned
                    </p>
                    <p className="text-3xl font-bold">
                      {gameStats?.tokens_earned || 0}
                    </p>
                  </div>
                </div>
                <Button size="lg" className="game-button">
                  Click to Earn $COCO
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Other tab contents will be implemented in subsequent updates */}
          <TabsContent value="leaderboard">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Leaderboard</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Activity</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Profile</h2>
              {telegramUser ? (
                <div>
                  <p>Welcome, {telegramUser.username}!</p>
                  {connected ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Wallet connected: {wallet?.account.address}
                    </p>
                  ) : (
                    <Button className="mt-4">Connect Wallet</Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Please open this app through Telegram
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}