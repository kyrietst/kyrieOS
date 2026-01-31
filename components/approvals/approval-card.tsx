"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Database } from "@/types/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, X, Loader2, Download, FileIcon } from "lucide-react"

type Approval = Database['public']['Tables']['approvals']['Row']
type StorageFile = { name: string, url: string, type: string, size: number }

const statusMap: Record<string, { label: string, color: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Aguardando sua aprovação", color: "secondary" },
  approved: { label: "Aprovado", color: "default" },
  rejected: { label: "Solicitado Alterações", color: "destructive" },
  revision: { label: "Em Revisão", color: "secondary" },
  expired: { label: "Expirado", color: "outline" }
}

interface ApprovalCardProps {
  approval: Approval
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string, feedback: string) => Promise<void>
  readonly?: boolean
}

export function ApprovalCard({ approval, onApprove, onReject, readonly = false }: ApprovalCardProps) {
  const [feedback, setFeedback] = useState("")
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null)
  const [rejectMode, setRejectMode] = useState(false)

  const files = (approval.files as unknown as StorageFile[]) || []
  const status = statusMap[approval.status || 'pending']
  const canInteract = !readonly && approval.status === 'pending'

  const handleApprove = async () => {
    if (!onApprove) return
    try {
      setActionLoading("approve")
      await onApprove(approval.id)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    if (!feedback.trim()) return
    try {
      setActionLoading("reject")
      await onReject(approval.id, feedback)
      setRejectMode(false)
    } finally {
      setActionLoading(null)
    }
  }

  const isImage = (file: StorageFile) => file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <Badge variant={status.color as "default" | "secondary" | "destructive" | "outline"} className="mb-2">
            {status.label}
          </Badge>
          <CardTitle className="text-xl">{approval.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enviado em {format(new Date(approval.created_at), "PPP", { locale: ptBR })}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {approval.description && (
          <div className="bg-muted/30 p-4 rounded-md text-sm">
            {approval.description}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden group">
                    {isImage(file) ? (
                        <div className="relative aspect-video bg-black/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={file.url} 
                                alt={file.name} 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center aspect-video bg-muted/20">
                            <FileIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                    <div className="p-3 bg-card border-t flex items-center justify-between">
                        <span className="text-sm truncate max-w-[180px]" title={file.name}>{file.name}</span>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                                <Download className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            ))}
        </div>

        {approval.feedback && (
          <div className="border-l-4 border-destructive bg-destructive/5 p-4 rounded-r-md">
            <h4 className="font-semibold text-destructive mb-1">Feedback do Cliente:</h4>
            <p className="text-sm">{approval.feedback}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t pt-6">
        {canInteract ? (
          <>
            {rejectMode ? (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-2">
                <Textarea 
                  placeholder="Por favor, descreva o que precisa ser ajustado..." 
                  value={feedback}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setRejectMode(false)} disabled={!!actionLoading}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleReject} disabled={!feedback.trim() || !!actionLoading}>
                    {actionLoading === "reject" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Solicitar Alterações
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full flex gap-4">
                <Button 
                    variant="outline" 
                    className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => setRejectMode(true)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Solicitar Ajustes
                </Button>
                <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApprove}
                    disabled={!!actionLoading}
                >
                  {actionLoading === "approve" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Aprovar Agora
                </Button>
              </div>
            )}
          </>
        ) : (
            <div className="w-full text-center text-sm text-muted-foreground italic">
                {approval.status === 'approved' && "Este item já foi aprovado."}
                {approval.status === 'rejected' && "Este item foi devolvido para ajustes."}
            </div>
        )}
      </CardFooter>
    </Card>
  )
}
