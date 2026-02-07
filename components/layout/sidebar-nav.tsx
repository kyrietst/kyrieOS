'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Inbox,
    LayoutDashboard,
    Sparkles,
    Users,
    ChevronDown,
    KanbanSquare,
    Book,
    FileCheck,
    LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'

interface SidebarNavProps {
    unreadInboxCount: number
    clients: any[] // Replace with proper type if available
}

export function SidebarNav({ unreadInboxCount, clients }: SidebarNavProps) {
    const pathname = usePathname()

    // Helper to check if link is active
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

    return (
        <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

                {/* Workspace Section */}
                <div className="px-3 mb-2 mt-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</span>
                    <Separator className="mt-1 bg-border/40" />
                </div>

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                        isActive('/kyrie/inbox') && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    asChild
                >
                    <Link href="/kyrie/inbox">
                        <Inbox className="w-4 h-4" />
                        Inbox
                        {unreadInboxCount > 0 && (
                            <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadInboxCount}
                            </span>
                        )}
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                        isActive('/kyrie/dashboard') && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    asChild
                >
                    <Link href="/kyrie/dashboard">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                        isActive('/kyrie/workspace/kanban') && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    asChild
                >
                    <Link href="/kyrie/workspace/kanban">
                        <KanbanSquare className="w-4 h-4" />
                        Kanban Geral
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                        isActive('/kyrie/ai') && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    asChild
                >
                    <Link href="/kyrie/ai">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Kyrie AI
                    </Link>
                </Button>

                {/* Clients Section */}
                <div className="px-3 mb-2 mt-6">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clientes</span>
                    <Separator className="mt-1 bg-border/40" />
                </div>

                <Collapsible defaultOpen className="space-y-1">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent group">
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4" />
                                Meus Clientes
                            </div>
                            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-4 border-l ml-3 border-border/50">
                        {clients?.map((client) => (
                            <Collapsible key={client.id} defaultOpen={isActive(`/kyrie/clients/${client.slug}`)}>
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-between h-8 text-sm gap-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 group/sub px-2",
                                            isActive(`/kyrie/clients/${client.slug}`) && "text-foreground font-medium"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Avatar className="h-5 w-5 rounded-md">
                                                <AvatarImage src={client.logo_url} alt={client.name} className="object-cover" />
                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary rounded-md">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{client.name}</span>
                                        </div>
                                        <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]/sub:rotate-180 opacity-50 flex-shrink-0" />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 pl-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary pl-9",
                                            isActive(`/kyrie/clients/${client.slug}/kanban`) && "text-primary font-medium bg-sidebar-accent/50"
                                        )}
                                        asChild
                                    >
                                        <Link href={`/kyrie/clients/${client.slug}/kanban`}>
                                            <KanbanSquare className="w-3 h-3 mr-2" />
                                            Kanban
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary pl-9",
                                            isActive(`/kyrie/clients/${client.slug}/wiki`) && "text-primary font-medium bg-sidebar-accent/50"
                                        )}
                                        asChild
                                    >
                                        <Link href={`/kyrie/clients/${client.slug}/wiki`}>
                                            <Book className="w-3 h-3 mr-2" />
                                            Wiki
                                        </Link>
                                    </Button>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-primary mt-2" asChild>
                            <Link href="/kyrie/clients">
                                + Ver todos
                            </Link>
                        </Button>
                    </CollapsibleContent>
                </Collapsible>

                {/* Operacional Section */}
                <div className="px-3 mb-2 mt-6">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operacional</span>
                    <Separator className="mt-1 bg-border/40" />
                </div>

                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                        isActive('/kyrie/approvals') && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    asChild
                >
                    <Link href="/kyrie/approvals">
                        <FileCheck className="w-4 h-4" />
                        Aprovações
                    </Link>
                </Button>

            </nav>

            <div className="p-4 border-t border-border/40">
                <form action="/auth/signout" method="post">
                    <Button variant="outline" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive/50" type="submit">
                        <LogOut className="w-4 h-4" />
                        Sair do Sistema
                    </Button>
                </form>
            </div>
        </div>
    )
}
