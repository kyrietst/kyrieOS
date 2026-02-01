import { getWikiPages } from '@/actions/wiki'
import WikiList from '@/components/wiki/WikiList'
import { createClient } from '@/utils/supabase/server'

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: org } = await supabase.from('organizations').select('id, name').eq('slug', params.slug).single()
  
  if (!org) return <div>Client not found</div>

  const pages = await getWikiPages(org.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{org.name} › Wiki</h2>
          <p className="text-muted-foreground">Documentação, briefings e processos.</p>
        </div>
      </div>
      
      <WikiList initialPages={pages || []} />
    </div>
  )
}
