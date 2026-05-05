'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NewSpaceButton from '@/components/spaces/NewSpaceButton'

interface Space { id: string; name: string; emoji: string }

interface Props {
  spaces: Space[]
  userEmail: string
  children: React.ReactNode
}

export default function DashboardShell({ spaces, userEmail, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [time, setTime] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }, [supabase, router])

  // ⌘K launcher
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setLauncherOpen(o => !o)
      }
      if (e.key === 'Escape') setLauncherOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeSpaceId = pathname.match(/\/spaces\/([^/]+)/)?.[1]

  return (
    <div className="fixed inset-0 bg-bone overflow-hidden flex flex-col font-sans select-none">

      {/* ── Top Bar ── */}
      <header className="h-[var(--spacing-bar)] border-b border-ink bg-bone-dim z-30 flex font-mono text-[9px] tracking-[0.16em] uppercase shrink-0">
        <div className="w-[var(--spacing-rail)] bg-ink text-bone flex items-center justify-center font-bold text-[10px] shrink-0">
          OP
        </div>
        <div className="flex items-center px-3 gap-2 border-r border-ink min-w-0">
          <div className="w-[5px] h-[5px] bg-ink shrink-0" />
          <strong className="font-sans text-[10px] tracking-[0.18em] whitespace-nowrap">OP-LAB</strong>
          <span className="text-ink-faint truncate">/ private console</span>
        </div>
        <div className="flex-1 hidden md:flex items-center px-3 border-r border-ink text-ink-faint text-[8px]">
          preview-first workspace
        </div>
        <div className="flex items-center px-3 gap-2 text-ink-faint text-[8px] ml-auto">
          <span className="truncate max-w-[180px]">{userEmail}</span>
          <button
            onClick={signOut}
            className="px-2 h-full flex items-center hover:bg-ink hover:text-bone transition-colors border-l border-ink"
          >
            exit
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Rail (vertical number nav) ── */}
        <nav className="w-[var(--spacing-rail)] border-r border-ink bg-bone-dim flex flex-col shrink-0 z-20">
          {spaces.slice(0, 8).map((space, i) => {
            const idx = String(i + 1).padStart(2, '0')
            const active = activeSpaceId === space.id
            return (
              <Link
                key={space.id}
                href={`/spaces/${space.id}`}
                title={space.name}
                className={`h-[var(--spacing-rail)] border-b border-ink flex items-center justify-center font-mono text-[10px] tracking-wider transition-colors relative ${
                  active ? 'bg-ink text-bone' : 'text-ink-faint hover:bg-ink/5'
                }`}
              >
                {idx}
                {active && <div className="absolute left-0 inset-y-0 w-[3px] bg-bone" />}
              </Link>
            )
          })}
          <div className="flex-1 border-b border-ink" />
          <div className="h-[var(--spacing-rail)] flex items-center justify-center">
            <NewSpaceButton />
          </div>
        </nav>

        {/* ── Sidebar (Registry) ── */}
        {sidebarOpen && (
          <aside className="w-[272px] border-r border-ink bg-paper flex flex-col shrink-0 z-10 overflow-hidden">
            <div className="h-[54px] border-b border-ink bg-ink text-bone flex flex-col justify-center px-3.5 shrink-0">
              <span className="font-mono text-[9px] font-light tracking-[0.18em] opacity-70">registry · private</span>
              <span className="text-[13px] font-extrabold tracking-[0.15em] uppercase">Obsidian Point</span>
            </div>

            <div className="flex-1 bg-bone-soft overflow-y-auto overflow-x-hidden">
              <div className="h-6 flex items-center justify-between px-2.5 border-b border-ink bg-bone-dim font-mono text-[8px] tracking-widest text-ink-faint sticky top-0 z-10 uppercase">
                <span>§ Spaces</span>
                <span>{String(spaces.length).padStart(2, '0')}</span>
              </div>

              {spaces.map((space, i) => {
                const active = activeSpaceId === space.id
                return (
                  <Link
                    key={space.id}
                    href={`/spaces/${space.id}`}
                    className={`w-full h-[42px] grid grid-cols-[34px_1fr_auto] items-center gap-2 px-2.5 border-b border-ink/10 transition-colors ${
                      active ? 'bg-ink text-bone' : 'hover:bg-ink/5 text-ink'
                    }`}
                  >
                    <span className={`font-mono text-[9px] ${active ? 'text-bone/50' : 'text-ink-faint'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold tracking-wider leading-tight truncate uppercase">{space.name}</div>
                      <div className={`text-[8px] font-mono tracking-tighter opacity-60 truncate`}>{space.emoji} space</div>
                    </div>
                    <div className="px-1.5 h-4 border border-current font-mono text-[7px] flex items-center justify-center shrink-0 uppercase">
                      SPC
                    </div>
                  </Link>
                )
              })}

              {spaces.length === 0 && (
                <p className="px-3 py-4 font-mono text-[9px] text-ink-faint tracking-wider uppercase">No spaces yet</p>
              )}
            </div>
          </aside>
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden relative mesh-overlay">
          <div className="absolute inset-0 z-10 overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* ── Launcher (⌘K) ── */}
      {launcherOpen && (
        <div className="fixed inset-x-0 md:inset-x-auto md:left-0 bottom-[var(--spacing-bar)] w-full md:w-[420px] h-[292px] bg-paper border-t border-ink md:border-r border-ink z-40 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <div className="h-[42px] bg-ink text-bone flex flex-col justify-center px-3 border-b border-ink uppercase shrink-0">
            <span className="font-mono text-[8px] font-light tracking-[0.18em] opacity-60">exec handler · thin mode</span>
            <span className="text-[13px] font-extrabold tracking-widest">Command</span>
          </div>
          <div className="h-[var(--spacing-bar)] border-b border-ink flex items-center font-mono text-[8px] tracking-wider uppercase shrink-0">
            <span className="w-[62px] px-2 border-r border-ink h-full flex items-center text-ink-faint">query</span>
            <input autoFocus className="flex-1 px-2 h-full bg-transparent outline-none text-[9px] tracking-widest uppercase" placeholder="type a command…" />
            <span className="px-2 h-full flex items-center text-ink-faint">⌘ k</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {[
              { label: 'Go to Dashboard', action: () => { router.push('/dashboard'); setLauncherOpen(false) } },
              { label: 'Toggle Registry', action: () => { setSidebarOpen(o => !o); setLauncherOpen(false) } },
              { label: 'Sign Out', action: signOut },
            ].map((item, i) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full h-[34px] grid grid-cols-[36px_1fr_auto] items-center px-2.5 border-b border-ink/10 font-mono text-[9px] tracking-widest text-left hover:bg-ink hover:text-bone transition-colors uppercase"
              >
                <span className="opacity-40">{String(i + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
                <span className="opacity-40">↵</span>
              </button>
            ))}
          </div>
          <div className="h-[34px] grid grid-cols-2 border-t border-ink shrink-0 font-mono text-[8px] tracking-[0.12em] uppercase">
            <button className="border-r border-ink hover:bg-ink hover:text-bone transition-colors">registry</button>
            <button className="bg-oxide text-bone hover:opacity-90 transition-opacity" onClick={() => setLauncherOpen(false)}>close</button>
          </div>
        </div>
      )}

      {/* ── Task Bar ── */}
      <footer className="h-[var(--spacing-bar)] bg-bone-dim border-t border-ink z-50 grid grid-cols-[148px_1fr_auto] font-mono text-[8px] tracking-[0.15em] uppercase shrink-0">
        <button
          onClick={() => setLauncherOpen(o => !o)}
          className={`px-2.5 flex items-center justify-between border-r border-ink transition-colors ${
            launcherOpen ? 'bg-oxide text-bone' : 'bg-ink text-bone hover:bg-ink/90'
          }`}
        >
          <span className="text-[9px] font-bold">Launch</span>
          <span className="opacity-60">⌃</span>
        </button>

        <div className="px-2.5 flex items-center gap-4 border-r border-ink overflow-hidden truncate">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`transition-colors ${sidebarOpen ? 'text-ink' : 'text-ink-faint'} hover:text-ink`}
          >
            Registry
          </button>
          <Link href="/dashboard" className="text-ink-faint hover:text-ink transition-colors">Hub</Link>
        </div>

        <div className="px-3 flex items-center gap-2 text-ink-faint">
          <div className="w-1 h-1 bg-ink animate-pulse" />
          <span>{time}</span>
        </div>
      </footer>
    </div>
  )
}
