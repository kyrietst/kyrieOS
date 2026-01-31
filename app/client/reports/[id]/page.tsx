import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Calendar, Download } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function ReportDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase =  await createClient()
  const resolvedParams = await params
  
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !report) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/client/reports">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
             <Calendar className="w-4 h-4" />
             <span>Gerado em {new Date(report.created_at).toLocaleDateString()}</span>
             <span>•</span>
             <span className="capitalize">{report.status}</span>
          </div>
        </div>
        <div className="ml-auto">
           {/* Placeholder for PDF export */}
           <Button variant="outline" disabled title="Exportação PDF em breve">
             <Download className="w-4 h-4 mr-2" />
             PDF
           </Button>
        </div>
      </div>

      <Card className="bg-card">
        <CardContent className="p-8 pt-8">
            <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                {/* 
                   Basic Markdown Rendering for MVP. 
                   Ideally use 'react-markdown' if available, but for now we sanitize 
                   or just pre-wrap to preserve formatting from Gemini.
                */}
                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                    {report.content_markdown}
                </div>
            </article>
        </CardContent>
      </Card>
    </div>
  )
}
