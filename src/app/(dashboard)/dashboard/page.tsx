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
    <div className="p-10 max-w-4xl">
      <h1 className="text-3xl font-light tracking-tight text-[#ECE8DF] mb-1">
        Your Spaces
      </h1>
      <p className="text-[#9A948A] text-sm mb-10">Private workspace</p>

      {spaces && spaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              className="group p-6 border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] rounded-xl transition-all duration-200"
            >
              <div className="text-3xl mb-4">{space.emoji}</div>
              <h3 className="text-[#ECE8DF] font-medium">{space.name}</h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-white/[0.1] rounded-xl p-12 text-center">
          <p className="text-[#9A948A] text-sm">No spaces yet. Use the + button in the sidebar to create one.</p>
        </div>
      )}
    </div>
  )
}
