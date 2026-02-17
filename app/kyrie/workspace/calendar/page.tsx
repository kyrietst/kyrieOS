import { Card } from '@/components/ui/card'
// import { BigCalendarWrapper } from '@/components/calendar/BigCalendarWrapper'
import { getCalendarEvents } from '@/actions/calendar'
import { getWorkspaceMembers } from '@/actions/kanban'
import { createClient } from '@/utils/supabase/server'

export default async function StrategicCalendarPage() {
    // 1. Fetch Events
    const start = new Date(new Date().getFullYear(), 0, 1) // Jan 1st
    const end = new Date(new Date().getFullYear(), 11, 31) // Dec 31st
    const events = await getCalendarEvents(start, end)

    // 2. Fetch Members (Resources)
    // We need the organization_id. 
    // Ideally we get this from the user's session or the events themselves.
    // For now, let's extract them from the events like before OR fetch the user's org.
    // Let's try to get the current user's org.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let members: any[] = []

    // Attempt to get profile to find org
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
        if (profile?.organization_id) {
            members = await getWorkspaceMembers(profile.organization_id)
        }
    }

    // Fallback: If no members found (e.g. admin or error), map from events
    if (members.length === 0) {
        const uniqueMembersMap = new Map()
        events.forEach((card: any) => {
            if (card.assigned_to_user) {
                uniqueMembersMap.set(card.assigned_to_user.id, {
                    id: card.assigned_to_user.id,
                    full_name: card.assigned_to_user.full_name || card.assigned_to_user.email,
                    avatar_url: card.assigned_to_user.avatar_url
                })
            }
        })
        members = Array.from(uniqueMembersMap.values())
    }

    // Transform members to Resource format
    const resources = members.map(m => ({
        id: m.id,
        title: m.full_name,
        // avatarUrl? BigCalendar doesn't support custom props on resource header easily without custom component, 
        // but title is enough for now.
    }))

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-background font-sans overflow-hidden">
            <h1 className="text-2xl font-bold mb-4">Master Strategic Calendar</h1>
            <div className="p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
                <p className="text-muted-foreground">O módulo de calendário está em manutenção.</p>
            </div>
        </div>
    )
}
