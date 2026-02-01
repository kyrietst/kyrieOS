'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Archive } from 'lucide-react'
import { markAsRead, archiveItem } from '@/actions/inbox'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function InboxList({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id)
      setItems(items.map(i => i.id === id ? { ...i, is_read: true } : i))
      toast.success('Marcado como lido')
    } catch {
      toast.error('Erro ao marcar como lido')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveItem(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Arquivado')
    } catch {
      toast.error('Erro ao arquivar')
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className={cn(
            "p-4 border rounded-lg bg-card text-card-foreground flex gap-4 transition-colors",
            !item.is_read && "bg-muted/30 border-primary/20"
          )}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
               <Badge variant={item.is_read ? "secondary" : "default"}>
                {item.item_type}
               </Badge>
               <span className="text-xs text-muted-foreground">
                 {new Date(item.created_at).toLocaleDateString()}
               </span>
            </div>
            <h3 className={cn("font-semibold", !item.is_read && "text-primary")}>
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {!item.is_read && (
              <Button size="icon" variant="ghost" onClick={() => handleMarkRead(item.id)} title="Marcar como lido">
                <Check className="w-4 h-4 text-green-500" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => handleArchive(item.id)} title="Arquivar">
              <Archive className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
         <div className="text-center py-10 text-muted-foreground">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
             <Check className="w-6 h-6" />
           </div>
           <p>Tudo limpo! Nenhuma notificação pendente.</p>
         </div>
      )}
    </div>
  )
}
