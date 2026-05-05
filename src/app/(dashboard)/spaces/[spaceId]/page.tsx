import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function SpacePage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from('spaces')
    .select('id')
    .eq('id', spaceId)
    .single()

  if (!space) notFound()

  redirect(`/spaces/${spaceId}/viewer`)
}
