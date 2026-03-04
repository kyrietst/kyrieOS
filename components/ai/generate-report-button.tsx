'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, FileText } from 'lucide-react'

export function GenerateReportButton({ clientId }: { clientId: string }) {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<string | null>(null)

    const handleGenerate = async () => {
        setLoading(true)
        setReport(null)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not configured')
            const res = await fetch(`${apiUrl}/api/ai/generate-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientId,
                    week_start: '2026-02-01',
                    week_end: '2026-02-07'
                })
            })

            const data = await res.json()
            if (data.success) {
                setReport(data.report)
            } else {
                alert('Erro ao gerar relatório')
            }
        } catch (e) {
            console.error(e)
            alert('Erro de conexão com a IA')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-900/20"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando com IA...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Relatório Semanal
                    </>
                )}
            </Button>

            {report && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-purple-500/30 bg-purple-950/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-200">
                            <FileText className="w-5 h-5" />
                            Relatório Gerado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap text-muted-foreground">
                            {report}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
