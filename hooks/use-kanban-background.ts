'use client';

import { useState, useEffect, useCallback } from 'react';

export type KanbanBackgroundType = 'default' | 'kyrie-gradient' | 'blue' | 'gray';

export interface BackgroundPreset {
    id: KanbanBackgroundType;
    label: string;
    className: string;
    previewColor: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
    {
        id: 'default',
        label: 'Padrão (Limpo)',
        className: 'bg-muted/20',
        previewColor: '#f4f4f5'
    },
    {
        id: 'kyrie-gradient',
        label: 'Kyrie Gradient',
        className: 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 backdrop-blur-[2px]',
        previewColor: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)'
    },
    {
        id: 'blue',
        label: 'Azul Sereno',
        className: 'bg-blue-50/50 dark:bg-blue-950/20',
        previewColor: '#3b82f6'
    },
    {
        id: 'gray',
        label: 'Cinza Profissional',
        className: 'bg-zinc-100/50 dark:bg-zinc-900/40',
        previewColor: '#71717a'
    }
];

export function useKanbanBackground(organizationId: string | null) {
    const storageKey = `kyrie_bg_${organizationId || 'master'}`;
    const [background, setBackground] = useState<KanbanBackgroundType>('default');

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(storageKey) as KanbanBackgroundType;
        if (saved && BACKGROUND_PRESETS.find(p => p.id === saved)) {
            setBackground(saved);
        }
    }, [storageKey]);

    const changeBackground = useCallback((type: KanbanBackgroundType) => {
        setBackground(type);
        localStorage.setItem(storageKey, type);
    }, [storageKey]);

    const currentPreset = BACKGROUND_PRESETS.find(p => p.id === background) || BACKGROUND_PRESETS[0];

    return {
        background,
        changeBackground,
        currentPreset,
        presets: BACKGROUND_PRESETS
    };
}
