"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/utils/supabase/client"
import { ApprovalCard } from "@/components/approvals/approval-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Database } from "@/types/supabase"
import { toast } from "sonner"

type Approval = Database['public']['Tables']['approvals']['Row']

export default function ClientApprovalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [approval, setApproval] = useState<Approval | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  
  // React 19 unwrapping of params
  const { id } = use(params)

  useEffect(() => {
    fetchApproval()
  }, [id])

  const fetchApproval = async () => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setApproval(data)
    } catch (error) {
      console.error('Error fetching approval:', error)
      toast.error("Erro ao carregar aprovação.")
      router.push('/client/approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (approvalId: string) => {
    try {
      const { error } = await supabase
        .from('approvals')
        .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
        })
        .eq('id', approvalId)
      
      if (error) throw error
      
      // Log history
      await supabase.from('approval_history').insert({
          approval_id: approvalId,
          action: 'approved',
          comment: 'Aprovado pelo cliente'
      })

      toast.success("Aprovação realizada com sucesso!")
      fetchApproval()
    } catch (error) {
        console.error("Error approving:", error)
        toast.error("Erro ao aprovar.")
    }
  }

  const handleReject = async (approvalId: string, feedback: string) => {
    try {
        const { error } = await supabase
            .from('approvals')
            .update({ 
                status: 'rejected', 
                feedback: feedback,
                feedback_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', approvalId)
        
        if (error) throw error

        // Log history
        await supabase.from('approval_history').insert({
            approval_id: approvalId,
            action: 'rejected',
            comment: feedback
        })

        toast.success("Solicitação de alterações enviada.")
        fetchApproval()
    } catch (error) {
        console.error("Error rejecting:", error)
        toast.error("Erro ao solicitar alterações.")
    }
  }

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  if (!approval) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
        <Link href="/client/approvals">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Aprovações
        </Link>
      </Button>

      <div>
        <ApprovalCard 
          approval={approval} 
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  )
}
