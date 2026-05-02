import { getUser } from '@/lib/supabase/auth'
import Link from 'next/link'

export default async function Home() {
  const user = await getUser()

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8 h-screen text-black dark:text-white">
      <main className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-semibold mb-4">obsidian_point</h1>
        
        {user ? (
          <div>
            <p className="text-green-500 mb-8 font-medium italic">✅ Signed in as {user.email}</p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Connected to Supabase + Auth ready
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-10 py-5 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Sign in / Sign up
            </Link>
          </div>
        )}

        <p className="mt-12 text-sm text-zinc-500 font-light">
          Built with Next.js, Vercel & Supabase
        </p>
      </main>
    </div>
  )
}
