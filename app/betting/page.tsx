'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/supabase-provider';
import { useTelegram } from '@/context/telegram-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Bet {
  id: string;
  title: string;
  description: string;
  min_amount: number;
  max_amount: number;
  start_time: string;
  end_time: string;
  total_pool?: number;
  user_bet?: number;
}

export default function BettingPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>({});
  const { supabase } = useSupabase();
  const { user } = useTelegram();

  useEffect(() => {
    if (supabase && user) {
      fetchBets();
    }
  }, [supabase, user]);

  const fetchBets = async () => {
    try {
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString());

      if (betsError) throw betsError;

      // Get total pool for each bet
      const betsWithPools = await Promise.all(betsData.map(async (bet) => {
        const { data: participants } = await supabase
          .from('bet_participants')
          .select('amount')
          .eq('bet_id', bet.id);

        const { data: userBet } = await supabase
          .from('bet_participants')
          .select('amount')
          .eq('bet_id', bet.id)
          .eq('user_id', user?.id)
          .single();

        return {
          ...bet,
          total_pool: participants?.reduce((sum, p) => sum + p.amount, 0) || 0,
          user_bet: userBet?.amount
        };
      }));

      setBets(betsWithPools);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (betId: string) => {
    const amount = betAmounts[betId];
    if (!amount) return;

    try {
      const bet = bets.find(b => b.id === betId);
      if (!bet) return;

      if (amount < bet.min_amount || amount > bet.max_amount) {
        throw new Error(`Bet amount must be between ${bet.min_amount} and ${bet.max_amount}`);
      }

      const { error } = await supabase
        .from('bet_participants')
        .insert({
          bet_id: betId,
          user_id: user?.id,
          amount
        });

      if (error) throw error;

      // Update local state
      setBets(bets.map(b => 
        b.id === betId ? { ...b, total_pool: (b.total_pool || 0) + amount, user_bet: amount } : b
      ));

      // Clear bet amount
      setBetAmounts({ ...betAmounts, [betId]: 0 });
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Betting Market</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Betting Market</h1>
      <div className="grid gap-4">
        {bets.map((bet) => (
          <Card key={bet.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{bet.title}</h3>
                <p className="text-muted-foreground mt-2">{bet.description}</p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-primary" />
                    <span>Pool: {bet.total_pool} $COCO</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <span>Ends {formatDistanceToNow(new Date(bet.end_time), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {bet.user_bet ? (
                  <div className="text-lg font-medium">
                    Your bet: {bet.user_bet} $COCO
                  </div>
                ) : (
                  <>
                    <Input
                      type="number"
                      min={bet.min_amount}
                      max={bet.max_amount}
                      value={betAmounts[bet.id] || ''}
                      onChange={(e) => setBetAmounts({
                        ...betAmounts,
                        [bet.id]: parseInt(e.target.value)
                      })}
                      placeholder={`${bet.min_amount}-${bet.max_amount} $COCO`}
                      className="w-40"
                    />
                    <Button
                      onClick={() => placeBet(bet.id)}
                      disabled={!betAmounts[bet.id]}
                    >
                      Place Bet
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}