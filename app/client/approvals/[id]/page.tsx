"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ApprovalCard } from "@/components/approvals/approval-card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Database } from "@/types/supabase"

type Approval = Database['public']['Tables']['approvals']['Row']

export default function ApprovalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [approval, setApproval] = useState<Approval | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchApproval(params.id as string)
    }
  }, [params.id])

  const fetchApproval = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }
      setApproval(data)
    } catch (error) {
      console.error('Error fetching approval:', error)
      toast.error('Erro ao carregar detalhes da aprovação')
      router.push('/client/approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('approvals')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Aprovação realizada com sucesso!')
      fetchApproval(id) // Refresh data
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Erro ao aprovar o item')
    }
  }

  const handleReject = async (id: string, feedback: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { error } = await supabase
        .from('approvals')
        .update({ 
          status: 'rejected', // Or 'revision' depending on logic, keeping 'rejected' as per PRD/Migration
          feedback: feedback,
          feedback_by: user.id,
          feedback_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Solicitação de ajuste enviada!')
      fetchApproval(id) // Refresh
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Erro ao enviar feedback')
    }
  }

  if (loading) {
    return <div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!approval) {
    return null
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Detalhes da Aprovação</h1>
           <p className="text-muted-foreground text-sm">Visualize os arquivos e tome uma decisão.</p>
        </div>
      </div>

      <ApprovalCard 
        approval={approval}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
