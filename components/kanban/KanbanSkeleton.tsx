import { Skeleton } from "@/components/ui/skeleton"

export function KanbanSkeleton() {
    return (
        <div className="flex-1 flex gap-4 overflow-x-auto p-4 items-start h-full glass-scrollbar">
            {/* Generate 4 skeleton columns */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col w-[320px] min-w-[320px] shrink-0 h-full max-h-full rounded-xl border border-border/40 bg-secondary/30 overflow-hidden">
                    {/* Column Header */}
                    <div className="flex items-center justify-between p-3 border-b border-border/10">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                    </div>

                    {/* Cards Area */}
                    <div className="flex-1 p-2 space-y-2 overflow-y-hidden">
                        {/* Random number of cards per column skeleton */}
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="w-full bg-card rounded-lg p-3 space-y-2 border border-border/50 shadow-sm opacity-60">
                                {/* Card Header (Title) */}
                                <div className="flex justify-between items-start gap-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                </div>

                                {/* Tags/Meta */}
                                <div className="flex gap-1 pt-1">
                                    <Skeleton className="h-3 w-12 rounded-sm" />
                                </div>

                                {/* Footer (Avatar + ID) */}
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Column Footer */}
                    <div className="p-2 mt-auto">
                        <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    )
}
