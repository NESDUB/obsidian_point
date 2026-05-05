import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FileLibrary from '@/components/library/FileLibrary'

export default async function LibraryPage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from('spaces')
    .select('id, name, emoji')
    .eq('id', spaceId)
    .single()

  if (!space) notFound()

  return (
    <div className="flex flex-col h-screen bg-[#111316]">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.06] shrink-0">
        <span>{space.emoji}</span>
        <span className="text-[10px] uppercase tracking-[0.28em] text-[#9A948A]/60">{space.name} / Library</span>
      </div>
      <div className="flex-1 min-h-0">
        <FileLibrary spaceId={spaceId} />
      </div>
    </div>
  )
}
