'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type LoginState = 'idle' | 'validating' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState<LoginState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setLoginState('error')
      setErrorMsg(error.toUpperCase())
    }
    const message = searchParams.get('message')
    if (message) {
       // Could show a notification here
    }
  }, [searchParams])

  // Simple validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsEmailValid(emailRegex.test(email))
  }, [email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailValid || password.length < 6) return

    setLoginState('loading')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setLoginState('error')
      setErrorMsg(error.message.toUpperCase())
      setTimeout(() => setLoginState('idle'), 4000)
    } else {
      setLoginState('success')
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] font-sans selection:bg-white selection:text-black flex items-center justify-center p-6">
      {/* 16:9 MacBook Pro Perspective Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[900px] h-auto min-h-[506px] bg-[#0A0A0A] border border-[#1A1A1A] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      >
        {/* Top Header Rail */}
        <div className="flex items-center justify-center pt-10 pb-5 border-b border-white/[0.03]">
          <motion.h1 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.6em", opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-sm font-light tracking-[0.6em] uppercase text-[#E5E5E5]"
          >
            Obsidian Point
          </motion.h1>
        </div>

        {/* Brand Focus */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">
          <motion.div 
            className="w-full max-w-[380px] space-y-12 z-10"
            animate={loginState === 'success' ? { scale: 0.95, opacity: 0 } : {}}
          >
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Identity Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-[#666] font-semibold tracking-[0.15em] uppercase">Identity / Email</label>
                </div>
                <div className="group relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    spellCheck="false"
                    className="w-full bg-[#000] border border-[#222] px-4 py-3.5 text-sm font-mono tracking-wider focus:outline-none focus:border-[#444] transition-all duration-300 placeholder:text-white/10"
                    required
                    autoFocus
                  />
                  <AnimatePresence>
                    {isEmailValid && email.length > 0 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      >
                        <CheckCircle2 size={12} strokeWidth={1.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-[#666] font-semibold tracking-[0.15em] uppercase">Access Key / Password</label>
                  <button type="button" className="text-[9px] text-[#888] tracking-[0.1em] uppercase hover:text-white transition-colors">Forgot?</button>
                </div>
                <div className="group relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#000] border border-[#222] px-4 py-3.5 text-sm font-mono tracking-wider focus:outline-none focus:border-[#444] transition-all duration-300 placeholder:text-white/10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 space-y-6">
                <button
                  type="submit"
                  disabled={loginState === 'loading' || !isEmailValid || password.length < 6}
                  className="w-full bg-white text-black py-4 text-[11px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-opacity duration-300 hover:opacity-90 active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {loginState === 'loading' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <span>Initialize Session</span>
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-[9px] text-[#888] opacity-60 tracking-[0.1em] uppercase">Enterprise SSO Integration Active</span>
                </div>
              </div>
            </form>

            <div className="text-center">
              <Link href="/auth/signup" className="text-[10px] text-[#666] hover:text-white transition-colors uppercase tracking-widest">
                Create new identity / Sign up
              </Link>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {loginState === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/5 border-l border-red-500/50 p-3 flex items-center gap-3"
                >
                  <AlertCircle size={12} className="text-red-500/70" />
                  <span className="text-[9px] text-red-500/60 font-mono tracking-widest uppercase">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Success Overlay */}
          <AnimatePresence>
            {loginState === 'success' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-6 bg-[#0A0A0A]"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white" />
                </motion.div>
                <div className="text-center space-y-1">
                  <h2 className="text-sm font-light tracking-[0.5em] uppercase text-white">Access Granted</h2>
                  <p className="text-[9px] text-[#666] tracking-[0.2em] uppercase">Decrypting terminal session...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Rail */}
        <div className="relative bottom-0 w-full px-10 py-8 flex justify-between items-center opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-[#22C55E] rounded-full" />
            <span className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Terminal Node 04 // End-to-End Encrypted</span>
          </div>
          <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">
            V.1.0.0-Stable
          </div>
        </div>
      </motion.div>

      {/* Extreme Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-150 grayscale mix-blend-overlay" style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />
    </div>
  )
}
