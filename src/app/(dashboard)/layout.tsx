import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/shell/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, name, emoji')
    .order('created_at', { ascending: true })

  return (
    <DashboardShell spaces={spaces ?? []} userEmail={user.email ?? ''}>
      {children}
    </DashboardShell>
  )
}
