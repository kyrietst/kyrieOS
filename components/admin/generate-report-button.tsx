'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateReportButtonProps {
  clientSlug?: string
}

export function GenerateReportButton({ clientSlug = 'adega-anitas' }: GenerateReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('🔍 Tentando gerar relatório em:', `${apiUrl}/api/ai/generate-report`)

      const response = await fetch(`${apiUrl}/api/ai/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_slug: clientSlug,
          week_end: new Date().toISOString().split('T')[0] 
        }),
      })

      const text = await response.text()
      try {
        const data = JSON.parse(text)
        if (!response.ok || !data.success) {
           throw new Error(data.errors?.[0] || 'Falha na geração')
        }
        
        toast.success("Relatório Gerado!", {
          description: "O relatório foi salvo e está disponível no portal do cliente."
        })
      } catch (jsonError) {
        console.error("Resposta não-JSON recebida:", text)
        throw new Error(`O servidor retornou uma resposta inesperada (não-JSON). Verifique o console. Código: ${response.status}`)
      }

    } catch (error) {
      console.error("Erro completo:", error)
      toast.error("Erro ao gerar relatório", {
        description: String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isLoading}
      className="bg-purple-600 hover:bg-purple-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Gerar Relatório (IA)
        </>
      )}
    </Button>
  )
}
