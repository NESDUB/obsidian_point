import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import CodeStudio from '@/components/studio/CodeStudio'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  // Get or create a default workspace (hidden from user — just a storage bucket)
  let { data: space } = await supabase
    .from('spaces')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!space) {
    const { data: created } = await supabase
      .from('spaces')
      .insert({ name: 'default', emoji: '🖥️', user_id: user.id })
      .select('id')
      .single()
    space = created
  }

  if (!space) redirect('/auth/login')

  return <CodeStudio spaceId={space.id} />
}
