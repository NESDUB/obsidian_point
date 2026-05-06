import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import DashboardShell from '@/components/shell/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  return <DashboardShell>{children}</DashboardShell>
}
