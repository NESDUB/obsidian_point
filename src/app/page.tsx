import { getUser } from '@/lib/supabase/auth'
import Link from 'next/link'

export default async function Home() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] font-sans selection:bg-white selection:text-black flex items-center justify-center p-6">
      <div className="relative w-full max-w-[900px] min-h-[506px] bg-[#0A0A0A] border border-[#1A1A1A] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">

        {/* Top Header Rail */}
        <div className="flex items-center justify-center pt-10 pb-5 border-b border-white/[0.03]">
          <h1 className="text-sm font-light tracking-[0.6em] uppercase text-[#E5E5E5]">
            Obsidian Point
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-[380px] space-y-12">

            {user ? (
              <>
                <div className="text-center space-y-3">
                  <p className="text-[10px] text-[#666] font-semibold tracking-[0.15em] uppercase">Session Active</p>
                  <p className="text-xs font-mono text-white/30 tracking-wider">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="w-full bg-white text-black py-4 text-[11px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-opacity duration-300 hover:opacity-90 active:scale-[0.99]"
                >
                  Enter Dashboard
                </Link>
              </>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <p className="text-[10px] text-[#666] font-semibold tracking-[0.15em] uppercase">Terminal Access</p>
                  <p className="text-[11px] text-[#333] tracking-[0.15em] font-mono">Secure // Encrypted // Private</p>
                </div>
                <div className="space-y-4">
                  <Link
                    href="/auth/login"
                    className="w-full bg-white text-black py-4 text-[11px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-opacity duration-300 hover:opacity-90 active:scale-[0.99]"
                  >
                    Initialize Session
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full bg-transparent border border-[#222] text-[#555] py-4 text-[11px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:border-[#444] hover:text-white"
                  >
                    Create Identity
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Footer Rail */}
        <div className="w-full px-10 py-8 flex justify-between items-center opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-[#22C55E] rounded-full" />
            <span className="text-[9px] text-[#888] uppercase tracking-[0.1em]">Terminal Node 04 // End-to-End Encrypted</span>
          </div>
          <div className="text-[9px] text-[#888] uppercase tracking-[0.1em]">
            V.1.0.0-Stable
          </div>
        </div>

      </div>

      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-150 grayscale mix-blend-overlay" style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />
    </div>
  )
}
