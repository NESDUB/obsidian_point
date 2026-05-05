import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const TOOLS = [
  { slug: 'viewer', label: 'HTML Viewer', meta: 'codepen / live preview', type: 'RUN' },
  { slug: 'library', label: 'File Library', meta: 'registry / html files', type: 'LIB' },
]

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
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8 border-b border-ink pb-4">
        <p className="font-mono text-[9px] tracking-[0.28em] text-ink-faint uppercase mb-1">
          {space.emoji} · Space
        </p>
        <h1 className="text-[28px] font-extrabold tracking-tight uppercase leading-none">{space.name}</h1>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-ink">
        {TOOLS.map((tool, i) => (
          <Link
            key={tool.slug}
            href={`/spaces/${spaceId}/${tool.slug}`}
            className="group border-r border-b border-ink p-5 hover:bg-ink hover:text-bone transition-colors"
          >
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono text-[9px] text-ink-faint group-hover:text-bone/50 tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="px-1.5 h-4 border border-current font-mono text-[7px] flex items-center uppercase">
                {tool.type}
              </div>
            </div>
            <h3 className="font-extrabold text-[11px] tracking-[0.18em] uppercase mb-1">{tool.label}</h3>
            <p className="font-mono text-[8px] text-ink-faint group-hover:text-bone/50 tracking-tighter">{tool.meta}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
