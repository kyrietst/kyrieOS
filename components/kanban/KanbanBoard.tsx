'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// Placeholder for full Kanban Board (Complex DnD implementation)
// For MVP/First Pass: Basic Column View

export default function KanbanBoard({ 
  initialColumns, 
  initialCards,
  organizationId
}: { 
  initialColumns: any[], 
  initialCards: any[],
  organizationId: string
}) {
  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {initialColumns.map(col => (
        <div key={col.id} className="min-w-[300px] w-[300px] flex flex-col h-full rounded-lg bg-muted/50 border border-border/50">
          <div className="p-3 font-semibold flex items-center justify-between border-b border-border/50">
             <span>{col.name}</span>
             <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
               {initialCards.filter(c => c.column_id === col.id).length}
             </span>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
             {initialCards.filter(c => c.column_id === col.id).map(card => (
               <Card key={card.id} className="cursor-grab hover:border-primary/50">
                 <CardContent className="p-3 space-y-2">
                    <div className="font-medium text-sm leading-tight">{card.title}</div>
                    {card.ice_score && (
                      <div className="text-xs text-muted-foreground flex gap-2">
                        <span>ICE: {Number(card.ice_score).toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {card.labels?.map((l: string) => (
                        <span key={l} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-md">
                          {l}
                        </span>
                      ))}
                    </div>
                 </CardContent>
               </Card>
             ))}
          </div>
          <div className="p-2">
            <button className="w-full text-sm text-muted-foreground hover:text-primary py-1">+ Add Card</button>
          </div>
        </div>
      ))}
      <div className="min-w-[300px] flex items-start justify-center p-4">
        <button className="text-muted-foreground hover:text-primary">+ Add Column</button>
      </div>
    </div>
  )
}
