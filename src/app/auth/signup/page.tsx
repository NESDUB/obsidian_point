'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, TriangleAlert, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type SignupState = 'idle' | 'loading' | 'success' | 'error'

interface FieldShellProps {
  label: string
  valid: boolean
  error?: string
  children: React.ReactNode
}

function FieldShell({ label, valid, error, children }: FieldShellProps) {
  return (
    <div className="relative">
      <div className="mb-2 flex h-4 items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9A948A]/70">{label}</label>
        <AnimatePresence>
          {valid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="text-[#CFC6B7]/70"
            >
              <Check size={12} strokeWidth={1.7} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative border-b border-[#AFA697]/18 bg-[#111316]/45 px-4 transition-colors focus-within:border-[#F3EFE7]/45 focus-within:bg-[#15171a]/80">
        {children}
        <span className="pointer-events-none absolute bottom-[-1px] left-1/2 h-px w-0 -translate-x-1/2 bg-[#E5DED1] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus:w-full" />
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#C29E8B]/75"
          >
            <TriangleAlert size={11} strokeWidth={1.6} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupState, setSignupState] = useState<SignupState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
  const passwordValid = password.length >= 6
  const canSubmit = emailValid && passwordValid && signupState !== 'loading'

  function sanitizeEmail(value: string) {
    return value.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase()
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setSignupState('loading')

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setSignupState('error')
      setErrorMsg(error.message)
      setTimeout(() => setSignupState('idle'), 4000)
    } else {
      setSignupState('success')
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111316] text-[#ECE8DF] selection:bg-[#ECE8DF] selection:text-[#111316]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.075),transparent_34%),linear-gradient(120deg,#17191d_0%,#101216_45%,#1a1b1d_100%)]" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_right,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="absolute top-10 left-10 z-50">
        <Link
          href="/"
          className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#9A948A] hover:text-[#F3EFE7] transition-colors group"
        >
          <ArrowRight size={12} className="rotate-180 transition-transform group-hover:-translate-x-1" />
          Back to Terminal
        </Link>
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid h-[min(68vh,620px)] min-h-[520px] w-full max-w-[1120px] grid-cols-1 md:grid-cols-[1.05fr_.95fr] overflow-hidden border border-white/[0.075] bg-[#181a1d] shadow-[0_42px_120px_rgba(0,0,0,.56)]"
        >
          <div className="absolute inset-0 border border-black/40 pointer-events-none" />
          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-white/30 via-white/10 to-transparent" />

          {/* Left panel */}
          <aside className="relative hidden border-r border-white/[0.06] p-12 md:flex md:flex-col md:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, letterSpacing: '0.38em' }}
                animate={{ opacity: 1, letterSpacing: '0.64em' }}
                transition={{ duration: 1.15, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-[13px] font-light uppercase tracking-[0.64em] text-[#F3EFE7] indent-[0.64em]"
              >
                Obsidian Point
              </motion.div>
              <div className="mt-8 h-px w-28 bg-gradient-to-r from-[#F3EFE7]/50 to-transparent" />
            </div>

            <div className="relative h-[310px] w-full overflow-hidden border border-white/[0.045] bg-[#15171a]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,.055)_46%,transparent_47%),linear-gradient(45deg,transparent_0%,rgba(255,255,255,.03)_62%,transparent_63%)]" />
              <div className="absolute left-1/2 top-1/2 h-[210px] w-[150px] -translate-x-1/2 -translate-y-1/2">
                <div className="absolute left-0 bottom-0 h-full w-[66px] [clip-path:polygon(100%_0,100%_100%,0_100%,24%_54%)] bg-gradient-to-br from-[#f4efe6]/30 via-[#2c3034] to-[#030405] shadow-[inset_1px_0_0_rgba(255,255,255,.35),inset_-1px_0_0_rgba(255,255,255,.09)]" />
                <div className="absolute right-0 bottom-0 h-full w-[66px] [clip-path:polygon(0_0,100%_100%,0_100%,0_0,76%_54%)] bg-gradient-to-bl from-[#f4efe6]/30 via-[#2c3034] to-[#030405] shadow-[inset_-1px_0_0_rgba(255,255,255,.35),inset_1px_0_0_rgba(255,255,255,.09)]" />
                <div className="absolute left-[70px] top-0 h-full w-[10px] bg-[#101214] shadow-[0_0_18px_rgba(255,255,255,.10)]" />
              </div>
              <div className="absolute inset-x-10 bottom-8 flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-white/20">
                <span>Identity Provisioning</span>
                <span>04</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.24em] text-[#9A948A]/55">
              <span>Node 04</span>
              <span>v1.0</span>
            </div>
          </aside>

          {/* Right panel */}
          <div className="relative flex items-center justify-center px-8 py-12 sm:px-14">
            {/* Success overlay */}
            <AnimatePresence>
              {signupState === 'success' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-6 bg-[#181a1d] p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="text-[#CFC6B7]/70"
                  >
                    <CheckCircle2 size={32} strokeWidth={1.4} />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-sm font-light tracking-[0.5em] uppercase text-[#F3EFE7]">Identity Created</h2>
                    <p className="text-[10px] text-[#9A948A] tracking-[0.2em] uppercase">Check your email to verify your session.</p>
                  </div>
                  <Link
                    href="/auth/login"
                    className="text-[10px] uppercase tracking-[0.2em] text-[#9A948A]/55 hover:text-[#F3EFE7] transition-colors"
                  >
                    Back to login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full max-w-[424px]">
              {/* Mobile logo */}
              <div className="mb-12 md:hidden text-center">
                <h1 className="text-[13px] font-light uppercase tracking-[0.5em] indent-[0.5em] text-[#F3EFE7]">Obsidian Point</h1>
              </div>

              <motion.form
                onSubmit={handleSignup}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <FieldShell
                  label="Email"
                  valid={emailValid && email.length > 0}
                  error={email.length > 4 && !emailValid ? 'Invalid address format' : ''}
                >
                  <input
                    value={email}
                    onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault()
                      setEmail(sanitizeEmail(e.clipboardData.getData('text')))
                    }}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="name@domain.com"
                    autoFocus
                    className="peer w-full bg-transparent px-0 py-4 pr-8 text-[14px] tracking-[0.04em] text-[#F3EFE7] outline-none placeholder:text-[#807970]/35"
                  />
                </FieldShell>

                <FieldShell
                  label="Access Key"
                  valid={passwordValid && password.length > 0}
                  error={password.length > 0 && !passwordValid ? 'Minimum 6 characters' : ''}
                >
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    spellCheck={false}
                    placeholder="••••••••"
                    className="peer w-full bg-transparent px-0 py-4 pr-8 text-[14px] tracking-[0.18em] text-[#F3EFE7] outline-none placeholder:text-[#807970]/35"
                  />
                </FieldShell>

                {/* Error message */}
                <AnimatePresence>
                  {signupState === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#C29E8B]/75"
                    >
                      <TriangleAlert size={11} strokeWidth={1.6} />
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <button
                    disabled={!canSubmit}
                    type="submit"
                    className="group relative flex h-[54px] w-full items-center justify-center overflow-hidden border border-[#D9D0C0]/20 bg-[#D8D1C5] text-[11px] font-semibold uppercase tracking-[0.32em] text-[#161719] transition duration-300 hover:-translate-y-px hover:border-white/50 hover:bg-[#EFEAE2] hover:shadow-[0_14px_34px_rgba(255,255,255,.08)] active:translate-y-0 active:scale-[0.995] disabled:translate-y-0 disabled:border-white/[0.055] disabled:bg-[#222529] disabled:text-[#8D867B]/35 disabled:shadow-none"
                  >
                    <span className="absolute inset-x-0 top-0 h-px bg-white/65 opacity-0 transition group-hover:opacity-100" />
                    {signupState === 'loading' ? (
                      <span className="flex items-center gap-3">
                        <Loader2 size={15} strokeWidth={1.7} className="animate-spin" />
                        Creating Identity
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        Create Credentials
                        <ArrowRight size={14} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link href="/auth/login" className="text-[10px] uppercase tracking-[0.2em] text-[#9A948A]/55 hover:text-[#F3EFE7] transition-colors">
                    Already registered? Sign in
                  </Link>
                </div>
              </motion.form>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
