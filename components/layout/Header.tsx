'use client';

import React from 'react';
import { PageTitle } from '@/components/layout/PageTitle';
import { useHeaderActionsContext } from '@/contexts/HeaderActionsContext';
import { GlobalCommandMenu } from '@/components/layout/GlobalCommandMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export function Header() {
    const { actions } = useHeaderActionsContext();

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10 transition-all duration-300 relative">
            <div className="flex items-center">
                <PageTitle />
            </div>

            {/* Centered Search Bar */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-lg">
                    <GlobalCommandMenu />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Injected Actions from Pages (e.g., Kanban) */}
                {actions && (
                    <div className="flex items-center gap-2 pr-4 border-r border-border/40 animate-in fade-in slide-in-from-right-2 duration-300">
                        {actions}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {/* Mobile Search Trigger could go here if needed, but GlobalCommandMenu handles its own responsiveness usually. 
                        For now, we hide it on mobile in the center div and let it be handled or add a mobile trigger if missing. 
                        Actually, GlobalCommandMenu has a responsive button. Let's keep a mobile version on the right if needed, 
                        OR just let the centered one handle responsive logic? 
                        The plan said: "On Mobile: Decide whether to keep it centered... or move it back".
                        Let's render it on the right ONLY for mobile, and center for desktop.
                    */}
                    <div className="md:hidden">
                        <GlobalCommandMenu />
                    </div>

                    <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2 ring-offset-border/40 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="w-4 h-4" />
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
