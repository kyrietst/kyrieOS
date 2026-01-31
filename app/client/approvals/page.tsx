"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { ApprovalCard } from "@/components/approvals/approval-card"
import { Loader2 } from "lucide-react"
import { Database } from "@/types/supabase"

type Approval = Database['public']['Tables']['approvals']['Row']

export default function ClientApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // We need to get the user's organization first.
      // But we can rely on RLS if the policy uses get_user_org_id.
      // Let's just select * from approvals. RLS should filter it.
      
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApprovals(data || [])
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suas Aprovações</h1>
        <p className="text-muted-foreground">
          Revise e aprove os materiais enviados pela nossa equipe.
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">Você não tem aprovações pendentes ou históricas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {approvals.map((approval) => (
            // Using ApprovalCard in a simplified way or creating a specific list item?
            // Let's use ApprovalCard but in "summary" mode via linking?
            // Actually reusing the card is fine, but maybe we want a "View Details" button wrapper.
            // For now, let's render the full card with "View Details" logic or just the card content.
            // The card has actionable buttons.
            <div key={approval.id} className="relative">
                <ApprovalCard 
                    approval={approval} 
                    readonly 
                />
                <a href={`/client/approvals/${approval.id}`} className="absolute inset-0 z-10" aria-label="Ver detalhes">
                    <span className="sr-only">Ver detalhes</span>
                </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
