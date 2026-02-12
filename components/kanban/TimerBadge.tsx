'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerBadgeProps {
    startTime: string
    className?: string
    variant?: 'minimal' | 'full'
}

export function TimerBadge({ startTime, className, variant = 'minimal' }: TimerBadgeProps) {
    const [elapsed, setElapsed] = useState('00:00:00')

    useEffect(() => {
        const updateTimer = () => {
            const start = new Date(startTime).getTime()
            const now = new Date().getTime()

            if (isNaN(start)) {
                setElapsed("00:00:00")
                return
            }

            const diff = Math.max(0, Math.floor((now - start) / 1000))

            const hours = Math.floor(diff / 3600)
            const minutes = Math.floor((diff % 3600) / 60)
            const seconds = diff % 60

            const fmt = (n: number) => n.toString().padStart(2, '0')
            setElapsed(`${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`)
        }

        updateTimer() // Initial
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    return (
        <div className={cn(
            "flex items-center gap-1.5 font-mono text-xs font-medium",
            variant === 'minimal' ? "px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "text-lg",
            className
        )}>
            <div className={cn("relative flex h-2 w-2 items-center justify-center", variant === 'full' && "h-4 w-4")}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </div>
            {elapsed}
        </div>
    )
}
