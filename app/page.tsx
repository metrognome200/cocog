'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/context/telegram-provider';
import { useSupabase } from '@/context/supabase-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HomeIcon as GnomeIcon, ListTodo, Coins, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, isReady, expand } = useTelegram();
  const { supabase, isInitialized } = useSupabase();

  useEffect(() => {
    if (isReady) {
      expand();
    }
  }, [isReady, expand]);

  if (!isReady || !isInitialized) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="h-12 bg-accent/10 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-accent/10 rounded-lg animate-pulse" />
          <div className="h-48 bg-accent/10 rounded-lg animate-pulse" />
        </div>
        <div className="h-48 bg-accent/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 space-y-6 animate-in fade-in-50">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GnomeIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Coco Gnome</h1>
        </div>
        {user && (
          <div className="flex items-center space-x-2">
            <img
              src={user.photo_url}
              alt={user.first_name}
              className="w-8 h-8 rounded-full ring-2 ring-primary/20"
            />
            <span className="font-medium">{user.first_name}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/tasks" className="block">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-accent/10">
            <div className="flex items-center space-x-3">
              <ListTodo className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Tasks</h2>
            </div>
            <p className="text-muted-foreground">
              Complete tasks to earn $COCO tokens
            </p>
            <Button className="w-full">View Tasks</Button>
          </Card>
        </Link>

        <Link href="/betting" className="block">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-accent/10">
            <div className="flex items-center space-x-3">
              <Coins className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Betting</h2>
            </div>
            <p className="text-muted-foreground">
              Place bets with your $COCO tokens
            </p>
            <Button className="w-full">Place Bets</Button>
          </Card>
        </Link>
      </div>

      <Link href="/leaderboard" className="block">
        <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-accent/10">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Leaderboard</h2>
          </div>
          <p className="text-muted-foreground">
            Top players ranked by $COCO earnings
          </p>
          <Button className="w-full">View Leaderboard</Button>
        </Card>
      </Link>
    </main>
  );
}