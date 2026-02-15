import { ReactNode } from 'react'
import { X, Search, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    PopoverContent,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface PickerLayoutProps {
    title: string
    onClose: () => void
    children: ReactNode

    // Search Props
    showSearch?: boolean
    searchPlaceholder?: string
    searchValue?: string
    onSearchChange?: (value: string) => void

    // Header Actions
    onBack?: () => void
    backTooltip?: string

    // Footer
    footer?: ReactNode

    // Layout
    className?: string
    contentClassName?: string
    width?: string // default w-80
    loading?: boolean
}

export function PickerLayout({
    title,
    onClose,
    children,
    showSearch = true,
    searchPlaceholder = "Buscar...",
    searchValue = "",
    onSearchChange,
    onBack,
    footer,
    className,
    contentClassName,
    width = "w-80",
    loading = false
}: PickerLayoutProps) {
    return (
        <PopoverContent
            className={cn(
                "p-0 overflow-hidden bg-popover/95 backdrop-blur-xl border-border/50 shadow-xl transition-all duration-200",
                width,
                className
            )}
            align="start"
            sideOffset={8}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30 relative">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-muted absolute left-2"
                        onClick={onBack}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}

                <span className={cn(
                    "text-xs font-semibold text-muted-foreground text-center flex-1",
                    onBack ? "mx-8" : "ml-2 mr-8"
                )}>
                    {title}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-muted absolute right-2"
                    onClick={onClose}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Optional Search Bar */}
            {showSearch && (
                <div className="p-3 pb-0">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-8 pl-8 text-xs bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all"
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <ScrollArea className={cn("h-72", contentClassName)}>
                <div className="p-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            {footer && (
                <div className="p-2 border-t border-border/50 bg-muted/30">
                    {footer}
                </div>
            )}
        </PopoverContent>
    )
}
