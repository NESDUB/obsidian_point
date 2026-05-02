import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-8 text-black dark:text-white">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-semibold text-center">Create your account</h1>
        
        <form 
          className="space-y-6"
          action={async (formData: FormData) => {
            'use server'
            const supabase = await createClient()
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            
            const { error } = await supabase.auth.signUp({ email, password })
            
            if (error) {
              console.error(error)
              return redirect('/auth/signup?error=Signup failed')
            }
            
            redirect('/auth/login?message=Check your email to confirm')
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
            placeholder="Password (min 6 characters)" 
            required 
            className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
          <button 
            type="submit"
            className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-semibold transition-all hover:opacity-90 active:scale-95"
          >
            Create Account
          </button>
        </form>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
