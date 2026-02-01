'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus } from 'lucide-react'

// Placeholder for Wiki List
export default function WikiList({ initialPages }: { initialPages: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-muted/50">
         <Plus className="w-8 h-8 text-muted-foreground mb-2" />
         <span className="font-medium text-muted-foreground">Nova Página</span>
      </Card>
      
      {initialPages.map(page => (
        <Card key={page.id} className="hover:border-primary/50 cursor-pointer transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
               {page.icon && <span className="mr-2">{page.icon}</span>}
               {page.title}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              /{page.slug}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
               Atualizado {new Date(page.updated_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
