import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-8 text-black dark:text-white">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-semibold text-center">Sign in to obsidian_point</h1>
        
        <form 
          className="space-y-6"
          action={async (formData: FormData) => {
            'use server'
            const supabase = await createClient()
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            
            if (error) {
              console.error(error)
              return redirect('/auth/login?error=Invalid credentials')
            }
            
            redirect('/dashboard')
          }}
        >
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
            className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
          <button 
            type="submit"
            className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-semibold transition-all hover:opacity-90 active:scale-95"
          >
            Sign In
          </button>
        </form>

        <div className="text-center">
          <Link href="/auth/signup" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
