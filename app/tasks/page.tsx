'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/supabase-provider';
import { useTelegram } from '@/context/telegram-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  is_completed?: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useTelegram();

  useEffect(() => {
    if (supabase && user) {
      fetchTasks();
    }
  }, [supabase, user]);

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true);

      if (tasksError) throw tasksError;

      const { data: userTasks, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('task_id')
        .eq('user_id', user?.id);

      if (userTasksError) throw userTasksError;

      const completedTaskIds = new Set(userTasks?.map(ut => ut.task_id));
      
      setTasks(tasksData.map(task => ({
        ...task,
        is_completed: completedTaskIds.has(task.id)
      })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user?.id,
          task_id: taskId,
          completed_at: new Date().toISOString(),
          reward_claimed: true
        });

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: true } : task
      ));

      // Update user's COCO balance
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await supabase.rpc('increment_coco_balance', {
          user_telegram_id: user?.id,
          amount: task.reward_amount
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Tasks</h1>
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
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-muted-foreground mt-2">{task.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium">{task.reward_amount} $COCO</span>
                <Button
                  variant={task.is_completed ? "secondary" : "default"}
                  onClick={() => !task.is_completed && completeTask(task.id)}
                  disabled={task.is_completed}
                  className="flex items-center space-x-2"
                >
                  {task.is_completed ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-5 h-5" />
                      <span>Complete</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}