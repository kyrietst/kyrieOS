'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  start_time: string;
  duration: number;
  task_description: string;
  project_id?: string;
}

export function GlobalTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [entryId, setEntryId] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Cast to any to avoid type errors with 'kanban_time_entries' until types are regenerated
  const supabase = createClient() as any;

  // Load active timer on mount
  useEffect(() => {
    async function loadActiveTimer() {
      // Use server action to get active timer (consistent with other components)
      try {
        // We need a server action or client-side query. 
        // Client side query to 'kanban_time_entries'
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('kanban_time_entries')
          .select(`
                    *,
                    kanban_cards (
                        title
                    )
                `)
          .eq('user_id', user.id)
          .is('end_time', null)
          .maybeSingle();

        if (data) {
          setEntryId(data.id);
          // @ts-ignore - Supabase types might not be perfectly inferred yet
          setDescription((data.kanban_cards?.title as string) || 'Tarefa sem título');
          setIsRunning(true);

          const start = new Date(data.start_time).getTime();
          const now = new Date().getTime();
          setElapsed(Math.floor((now - start) / 1000));
        }
      } catch (e) {
        console.error("Error loading timer", e)
      }
    }
    loadActiveTimer();

    // Poll for external changes (e.g. started via Card)
    // In a real app we'd use Realtime Subscription, but polling is safer for MVP
    const pollInterval = setInterval(loadActiveTimer, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStop = async () => {
    // ONLY STOP allowed from Dock
    if (!entryId) return;

    // We can use the server action stopTimer() for consistency
    // But since we are client-side here and have ID, we can also use direct update if preferred.
    // Let's use direct update to match previous pattern, BUT targeting 'kanban_time_entries'

    const { error } = await supabase
      .from('kanban_time_entries')
      .update({
        end_time: new Date().toISOString(),
        duration: elapsed
      })
      .eq('id', entryId);

    if (error) {
      toast.error('Erro ao parar: ' + error.message);
      return;
    }

    setIsRunning(false);
    setEntryId(null);
    setElapsed(0);
    setDescription('');
    toast.success('Tarefa parada');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Hide if not running
  if (!isRunning) return null;

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-xl border-t-2 border-primary w-80 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Kyrie Tracker</span>
          </div>
          <span className="font-mono text-xl tabular-nums">{formatTime(elapsed)}</span>
        </div>

        <div className="text-sm font-medium text-muted-foreground truncate" title={description}>
          {description}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleStop}
            className="w-full"
          >
            <Square className="w-4 h-4 mr-2" fill="currentColor" /> Parar
          </Button>
        </div>
      </div>
    </Card>
  );
}
