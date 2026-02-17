import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, LucideIcon } from "lucide-react"
import { forwardRef } from "react"

interface CardActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: LucideIcon
    label?: string
    active?: boolean
    isLoading?: boolean
    variantTheme?: 'default' | 'destructive' | 'warning'
}

export const CardActionButton = forwardRef<HTMLButtonElement, CardActionButtonProps>(
    ({ className, icon: Icon, label, active, isLoading, variantTheme = 'default', children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variantTheme === 'default' ? "outline" : "secondary"}
                size="sm"
                className={cn(
                    "h-7 px-3 text-xs font-medium border transition-all shadow-sm justify-start gap-2",
                    // Active state (e.g. checkbox checked, or popup open)
                    active
                        ? "bg-primary/10 dark:bg-primary/20 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-background hover:bg-accent text-muted-foreground hover:text-foreground border-input hover:border-accent-foreground/20",
                    // Variants
                    variantTheme === 'destructive' && "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
                    variantTheme === 'warning' && "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin shrink-0" />
                ) : Icon ? (
                    <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                ) : null}
                {label || children}
            </Button>
        )
    }
)
CardActionButton.displayName = "CardActionButton"
