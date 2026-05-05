'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const EMOJIS = ['📦', '🧪', '🤖', '📟', '🔬', '🎨', '⚡', '🌊', '🔮', '🛸']

export default function NewSpaceButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function create() {
    if (!name.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('spaces').insert({ name: name.trim(), emoji, user_id: user!.id })
    setOpen(false)
    setName('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[#9A948A]/60 hover:text-[#ECE8DF] transition-colors text-lg leading-none"
        aria-label="New space"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#181a1d] border border-white/[0.1] rounded-2xl p-6 w-80 shadow-2xl">
            <h2 className="text-[#ECE8DF] font-medium mb-4">New Space</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-1.5 rounded-lg transition-colors ${emoji === e ? 'bg-white/20' : 'hover:bg-white/10'}`}
                >
                  {e}
                </button>
              ))}
            </div>

            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="Space name"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2.5 text-[#ECE8DF] text-sm placeholder:text-[#9A948A]/50 outline-none focus:border-white/30 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 text-sm text-[#9A948A] hover:text-[#ECE8DF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={!name.trim() || loading}
                className="flex-1 py-2 bg-[#ECE8DF] text-[#111316] text-sm font-medium rounded-lg disabled:opacity-40 transition-opacity"
              >
                {loading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
