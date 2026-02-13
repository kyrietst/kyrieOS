'use client';

import { MoreHorizontal, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useKanbanBackground, KanbanBackgroundType } from '@/hooks/use-kanban-background';

interface KanbanPageOptionsProps {
    organizationId: string | null;
}

export function KanbanPageOptions({ organizationId }: KanbanPageOptionsProps) {
    const { background, changeBackground, presets } = useKanbanBackground(organizationId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Opções do Board</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span>Visual do Board</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                        <DropdownMenuLabel>Alterar Plano de Fundo</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {presets.map((preset) => (
                            <DropdownMenuItem
                                key={preset.id}
                                onClick={() => changeBackground(preset.id)}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full border border-border"
                                        style={{ background: preset.previewColor }}
                                    />
                                    <span>{preset.label}</span>
                                </div>
                                {background === preset.id && (
                                    <Check className="h-3 w-3 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
                    Configurações Adicionais em breve...
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
