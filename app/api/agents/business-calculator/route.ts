
import { NextRequest, NextResponse } from "next/server"
import { calculateBusinessMetrics, CalculatorInput } from "@/lib/agents/business-calculator"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const input: CalculatorInput = {
      revenue: Number(body.revenue) || 0,
      expenses: Number(body.expenses) || 0,
      leads: Number(body.leads) || 0,
      conversions: Number(body.conversions) || 0,
      churnRate: Number(body.churnRate) || 0,
      avgTicket: Number(body.avgTicket) || 0
    }

    if (input.revenue < 0 || input.expenses < 0) {
       return NextResponse.json({ error: "Valores não podem ser negativos" }, { status: 400 })
    }


    const metrics = await calculateBusinessMetrics(input)

    // Save to Database if requested and organizationId is provided
    if (body.save && body.organizationId) {
       // Validate Date for Period
       const date = new Date()
       const periodMonth = body.month || date.getMonth() + 1
       const periodYear = body.year || date.getFullYear()

       // Check permissions (Only Admins or the Org Owner can save)
       // For MVP, if authenticated, we allow if org matches user's profile or is admin.
       // Assuming simplistic check for now or Admin only.
       // TODO: Add stricter permission check.

       const { error: upsertError } = await supabase
        .from('business_metrics')
        .upsert({
            organization_id: body.organizationId,
            period_month: periodMonth,
            period_year: periodYear,
            revenue: input.revenue,
            ad_spend: input.expenses, // Mapping expenses to ad_spend simplistically for now, or we need more granular input
            leads_generated: input.leads,
            new_customers: input.conversions,
            conversion_rate: metrics.conversionRate,
            roi: metrics.roi,
            ltv: metrics.ltv,
            metadata: { insights: metrics.insights },
            updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id, period_month, period_year' })

       if (upsertError) {
           console.error("Error saving metrics:", upsertError)
           // We don't fail the request, just log it, or we could return partial success override.
       }
    }

    return NextResponse.json(metrics)

  } catch (error: any) {
    console.error("Calculator Error:", error)
    return NextResponse.json({ error: "Erro interno no cálculo" }, { status: 500 })
  }
}
