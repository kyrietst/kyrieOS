'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Play, Pause, Square, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  
  const supabase = createClient();

  // Load active timer on mount
  useEffect(() => {
    async function loadActiveTimer() {
        // TODO: Get real user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_running', true)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setEntryId(data.id);
        setDescription(data.task_description || '');
        setIsRunning(true);
        
        // Calculate elapsed time correctly
        const start = new Date(data.start_time).getTime();
        const now = new Date().getTime();
        const alreadyElapsed = data.duration || 0;
        // setElapsed(Math.floor((now - start) / 1000) + alreadyElapsed); // Simplification implies duration stored + current diff
        // Actually, if it's running, duration might not be updated yet, so we count from start
        // But if it was paused and resumed, logic is complex. 
        // For MVP 1.1: Simple start_time based calc
        setElapsed(Math.floor((now - start) / 1000));
      }
    }
    loadActiveTimer();
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

  const toggleTimer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast.error('Você precisa estar logado.');
        return;
    }

    if (!isRunning) {
      // START
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          task_description: description,
          start_time: new Date().toISOString(),
          is_running: true,
          duration: 0
        })
        .select()
        .single();
      
      if (error) {
        toast.error('Erro ao iniciar: ' + error.message);
        return;
      }
      
      setEntryId(data.id);
      setIsRunning(true);
      setElapsed(0);
      toast.success('Cronômetro iniciado!');
    } else {
      // PAUSE (Update duration and stop)
      // For MVP, "Pause" stops the entry. Resume would create new or update?
      // PRD says "Start/Pause". Let's assume Pause = Stop for now to effectively save the session.
      // Or we can just update is_running=false.
      
      if (!entryId) return;

      const { error } = await supabase
        .from('time_entries')
        .update({
            is_running: false,
            end_time: new Date().toISOString(),
            duration: elapsed // Save final seconds
        })
        .eq('id', entryId);

      if (error) {
        toast.error('Erro ao pausar: ' + error.message);
        return;
      }

      setIsRunning(false);
      setEntryId(null);
      setElapsed(0);
      setDescription('');
      toast.success('Tarefa salva!');
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-xl border-t-2 border-primary w-80 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
                <Clock className="w-4 h-4" />
                <span>Kyrie Tracker</span>
            </div>
            <span className="font-mono text-xl tabular-nums">{formatTime(elapsed)}</span>
        </div>
        
        <Input 
            placeholder="No que você está trabalhando?" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
            className="h-8 text-sm"
        />

        <div className="flex justify-end gap-2">
            <Button 
                size="sm" 
                variant={isRunning ? "destructive" : "default"}
                onClick={toggleTimer}
                className="w-full"
            >
                {isRunning ? (
                    <>
                        <Square className="w-4 h-4 mr-2" fill="currentColor" /> Parar
                    </>
                ) : (
                    <>
                        <Play className="w-4 h-4 mr-2" fill="currentColor" /> Iniciar
                    </>
                )}
            </Button>
        </div>
      </div>
    </Card>
  );
}
