import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewSpaceButton from '@/components/spaces/NewSpaceButton'

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
    <div className="flex min-h-screen bg-[#111316] text-[#ECE8DF]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/[0.06] flex flex-col p-5 gap-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 mb-4 group"
        >
          <div className="w-6 h-6 bg-[#ECE8DF] rounded-md flex items-center justify-center shrink-0">
            <span className="text-[#111316] text-[10px] font-bold">OP</span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#9A948A] group-hover:text-[#ECE8DF] transition-colors">
            Obsidian Point
          </span>
        </Link>

        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[9px] uppercase tracking-[0.28em] text-[#9A948A]/60">Spaces</span>
          <NewSpaceButton />
        </div>

        <nav className="flex-1 flex flex-col gap-0.5">
          {spaces?.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#9A948A] hover:text-[#ECE8DF] hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-base leading-none">{space.emoji}</span>
              <span className="truncate">{space.name}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] pt-4 mt-2">
          <p className="px-3 text-[10px] text-[#9A948A]/40 truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
