
import { NextRequest, NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/notifications/email"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Optional: Check for Admin Role
    // const { data: isAdmin } = await supabase.rpc('is_kyrie_admin', { user_id: user.id })
    // if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { type, recipientEmail, recipientName, data } = body

    if (!recipientEmail) {
        return NextResponse.json({ error: "Missing recipient email" }, { status: 400 })
    }

    let subject = ""
    let html = ""

    switch (type) {
        case 'approval_request':
            subject = `Nova Aprovação: ${data.title}`
            html = emailTemplates.approvalRequest(recipientName, data.title, data.url)
            break
        case 'report_ready':
            subject = `Relatório de ${data.month} Disponível`
            html = emailTemplates.reportReady(recipientName, data.month)
            break
        default:
            return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    const result = await sendEmail({ to: [recipientEmail], subject, html })
    
    // Log notification to DB
    if (result.success) {
         await supabase.from('notifications').insert({
             user_id: user.id, // Or the target user ID if we knew it
             title: subject,
             message: `Email sent to ${recipientEmail}`,
             type: 'info',
             category: 'system'
         })
    }

    return NextResponse.json(result)
}
