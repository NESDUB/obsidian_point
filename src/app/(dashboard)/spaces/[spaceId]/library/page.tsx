import { redirect } from 'next/navigation'

export default async function LibraryPage({ params }: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await params
  redirect(`/spaces/${spaceId}/viewer`)
}
