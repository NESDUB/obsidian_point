import { getUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardHub() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, name, emoji')
    .order('created_at', { ascending: true })

  return (
    <div className="h-full overflow-auto"><div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8 border-b border-ink pb-4">
        <p className="font-mono text-[9px] tracking-[0.28em] text-ink-faint uppercase mb-1">§ 00 · Hub</p>
        <h1 className="text-[28px] font-extrabold tracking-tight uppercase leading-none">Your Spaces</h1>
      </div>

      {spaces && spaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-ink">
          {spaces.map((space, i) => (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className="group border-r border-b border-ink p-5 hover:bg-ink hover:text-bone transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-[9px] text-ink-faint group-hover:text-bone/50 tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="px-1.5 h-4 border border-current font-mono text-[7px] flex items-center uppercase">SPC</div>
              </div>
              <div className="text-2xl mb-2">{space.emoji}</div>
              <h3 className="font-extrabold text-[11px] tracking-[0.18em] uppercase">{space.name}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-ink border-dashed p-12 text-center">
          <p className="font-mono text-[9px] text-ink-faint tracking-widest uppercase">
            No spaces — use the + in the rail to create one
          </p>
        </div>
      )}
    </div></div>
  )
}
