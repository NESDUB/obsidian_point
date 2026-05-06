'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const supabase = createClient()

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
  const canSubmit = emailValid && password.length >= 6 && state !== 'loading'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setState('loading')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setState('error')
      setErrorMsg(error.message)
      setTimeout(() => setState('idle'), 4000)
    } else {
      setState('success')
      setTimeout(() => { window.location.href = '/dashboard' }, 800)
    }
  }

  return (
    <main
      className="fixed inset-0 bg-bone-dim flex flex-col font-sans overflow-hidden select-none"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 15v10M15 20h10' stroke='%23141414' stroke-width='0.8' stroke-opacity='0.12'/></svg>"), url("data:image/svg+xml;utf8,<svg width='3' height='3' xmlns='http://www.w3.org/2000/svg'><rect width='1' height='1' fill='%23141414' fill-opacity='0.08'/></svg>")`,
        backgroundSize: '40px 40px, 3px 3px',
      }}
    >
      {/* Top system bar */}
      <header className="h-[var(--spacing-bar)] border-b border-ink bg-bone-dim flex items-center shrink-0 divide-x divide-ink font-mono text-[8px] tracking-[0.16em] uppercase z-10">
        <div className="w-10 bg-ink text-bone flex items-center justify-center font-bold shrink-0">OP</div>
        <div className="flex-1 flex items-center px-3 gap-2">
          <div className="w-1.5 h-1.5 bg-ink shrink-0" />
          <span className="font-sans font-extrabold text-[10px]">OP-LAB · Desktop OS</span>
        </div>
        <div className="hidden md:flex items-center px-4 gap-6 text-ink-faint text-[7px]">
          <span>System: Stable</span>
          <span>Auth: Required</span>
        </div>
        <div className="px-3 flex items-center gap-2 text-ink-faint text-[7px] shrink-0">
          <div className="w-1.5 h-1.5 bg-ink animate-pulse" />
          <span suppressHydrationWarning>{time}</span>
        </div>
      </header>

      {/* Desktop */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">

        {/* Clock */}
        <div className="text-center">
          <div
            className="font-mono font-bold text-[64px] leading-none tracking-tight text-ink tabular-nums"
            suppressHydrationWarning
          >
            {time || '00:00:00'}
          </div>
          <div
            className="mt-2 font-mono text-[10px] tracking-[0.28em] text-ink-faint uppercase"
            suppressHydrationWarning
          >
            {date || '—'}
          </div>
        </div>

        {/* Login card — looks like a window on the desktop */}
        <div className="w-[340px] bg-paper border border-ink shadow-[0_12px_48px_rgba(0,0,0,0.18)]">

          {/* Card titlebar */}
          <div className="h-7 bg-ink flex items-center px-3 gap-2 shrink-0">
            <div className="w-1.5 h-1.5 bg-bone/40 rounded-full" />
            <span className="font-mono text-[9px] text-bone/60 tracking-widest uppercase">Authenticate · Obsidian Point</span>
          </div>

          {/* User block */}
          <div className="border-b border-ink px-5 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-bone-dim border border-ink flex items-center justify-center shrink-0">
              <span className="font-sans font-black text-[18px] tracking-tight">OP</span>
            </div>
            <div>
              <div className="font-sans font-extrabold text-[11px] tracking-[0.12em] uppercase">Private Node</div>
              <div className="font-mono text-[8px] text-ink-faint tracking-wider mt-0.5">obsidianpoint.co</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col divide-y divide-ink/10">
            {/* Email */}
            <div className="flex items-center h-[var(--spacing-bar)] border-b border-ink">
              <span className="w-14 h-full flex items-center px-3 border-r border-ink font-mono text-[8px] text-ink-faint uppercase tracking-wider shrink-0">User</span>
              <input
                value={email}
                onChange={e => setEmail(e.target.value.replace(/\s/g, '').toLowerCase())}
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="name@domain.com"
                className="flex-1 h-full px-3 bg-transparent outline-none font-mono text-[10px] tracking-wider text-ink placeholder:text-ink/20"
              />
            </div>

            {/* Password */}
            <div className="flex items-center h-[var(--spacing-bar)] border-b border-ink">
              <span className="w-14 h-full flex items-center px-3 border-r border-ink font-mono text-[8px] text-ink-faint uppercase tracking-wider shrink-0">Pass</span>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="flex-1 h-full px-3 bg-transparent outline-none font-mono text-[13px] tracking-[0.2em] text-ink placeholder:text-ink/20"
              />
            </div>

            {/* Error */}
            {state === 'error' && (
              <div className="px-4 py-2 border-b border-ink bg-oxide/10">
                <p className="font-mono text-[8px] text-oxide tracking-widest uppercase">{errorMsg}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`h-10 font-mono text-[9px] tracking-[0.22em] uppercase font-bold transition-colors ${
                state === 'success'
                  ? 'bg-ink text-bone cursor-default'
                  : canSubmit
                  ? 'bg-ink text-bone hover:bg-ink/80'
                  : 'bg-bone-dim text-ink/30 cursor-not-allowed'
              }`}
            >
              {state === 'loading' ? '· authenticating ·'
                : state === 'success' ? '· access granted ·'
                : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Node info */}
        <div className="flex items-center gap-8 font-mono text-[8px] text-ink-faint tracking-[0.2em] uppercase">
          <span>Node · 04</span>
          <span>v1.0.0</span>
          <span>OP-LAB Systems</span>
        </div>
      </div>

      {/* Bottom system bar */}
      <footer className="h-[var(--spacing-bar)] border-t border-ink bg-bone-dim flex items-center shrink-0 px-4 font-mono text-[8px] tracking-[0.16em] uppercase text-ink-faint">
        <span>Obsidian Point · Private Operating Environment</span>
        <div className="ml-auto flex items-center gap-6">
          <span>Kernel: 3.0.1</span>
          <span>Enc: AES-256</span>
        </div>
      </footer>
    </main>
  )
}
