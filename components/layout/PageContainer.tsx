'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    scrollable?: boolean;
}

export function PageContainer({
    children,
    className,
    scrollable = true
}: PageContainerProps) {
    return (
        <div className={cn(
            "h-full w-full flex flex-col overflow-hidden bg-muted/20",
            className
        )}>
            <div className={cn(
                "flex-1",
                scrollable ? "overflow-y-auto" : "overflow-hidden"
            )}>
                <div className="p-6 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
