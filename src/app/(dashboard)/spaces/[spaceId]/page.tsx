import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function SpacePage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .single()

  if (!space) notFound()

  return (
    <div className="p-10">
      <div className="flex items-center gap-3 mb-10">
        <span className="text-4xl">{space.emoji}</span>
        <h1 className="text-3xl font-light tracking-tight text-[#ECE8DF]">{space.name}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
        <Link
          href={`/spaces/${spaceId}/viewer`}
          className="group p-6 border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] rounded-xl transition-all duration-200"
        >
          <div className="text-2xl mb-3">📟</div>
          <h3 className="text-[#ECE8DF] font-medium mb-1">HTML Viewer</h3>
          <p className="text-[#9A948A] text-xs">CodePen-style editor with live preview</p>
        </Link>
      </div>
    </div>
  )
}
