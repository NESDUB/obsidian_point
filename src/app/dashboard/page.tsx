import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-8 text-black dark:text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-semibold mb-4">Welcome to your Dashboard</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Signed in as: <span className="font-medium text-black dark:text-white">{user.email}</span>
        </p>
        
        <form 
          action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/auth/login')
          }}
        >
          <button 
            type="submit"
            className="px-8 py-4 bg-red-500 text-white rounded-2xl font-semibold transition-all hover:bg-red-600 active:scale-95"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
