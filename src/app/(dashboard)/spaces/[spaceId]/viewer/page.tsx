import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CodeStudio from '@/components/studio/CodeStudio'

export default async function ViewerPage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from('spaces')
    .select('id, name, emoji')
    .eq('id', spaceId)
    .single()

  if (!space) notFound()

  return (
    <div className="h-full">
      <CodeStudio spaceId={spaceId} spaceName={space.name} spaceEmoji={space.emoji} />
    </div>
  )
}
