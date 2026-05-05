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
    <div className="flex flex-col h-full bg-bone">
      <div className="h-[var(--spacing-bar)] flex items-center border-b border-ink bg-bone-dim shrink-0 font-mono text-[8px] tracking-[0.16em] uppercase px-3 gap-2">
        <div className="w-1 h-1 bg-ink shrink-0" />
        <b className="font-sans text-[10px] tracking-widest">File Library</b>
        <span className="text-ink-faint">/ {space.emoji} {space.name}</span>
      </div>
      <div className="flex-1 min-h-0 flex">
        <FileLibrary spaceId={spaceId} />
      </div>
    </div>
  )
}
