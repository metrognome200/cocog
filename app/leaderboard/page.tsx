'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/supabase-provider';
import { Card } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardUser {
  username: string;
  first_name: string;
  photo_url: string;
  coco_balance: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    if (supabase) {
      fetchLeaderboard();
    }
  }, [supabase]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, first_name, photo_url, coco_balance')
        .order('coco_balance', { ascending: false })
        .limit(50);

      if (error) throw error;

      setUsers(data.map((user, index) => ({
        ...user,
        rank: index + 1
      })));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-medium">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      <div className="grid gap-2">
        {users.map((user) => (
          <Card 
            key={user.rank}
            className={`p-4 hover:shadow-lg transition-shadow ${
              user.rank <= 3 ? 'bg-gradient-to-r from-background to-accent/10' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 flex justify-center">
                {getRankIcon(user.rank)}
              </div>
              <div className="flex items-center space-x-3 flex-1">
                <img
                  src={user.photo_url || 'https://via.placeholder.com/40'}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <span className="font-medium">
                    {user.username || user.first_name}
                  </span>
                </div>
              </div>
              <div className="text-lg font-semibold">
                {user.coco_balance.toLocaleString()} $COCO
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}