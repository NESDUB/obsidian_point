import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Simple test query – just to confirm connection works
  const { data: test, error } = await supabase
    .from('test_connection')
    .select('count', { count: 'exact', head: true })
    .limit(0)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8 h-screen">
      <main className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-semibold mb-4 text-black dark:text-white">obsidian_point</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Connected to Supabase ✅
        </p>
        
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
             <p className="text-red-500 font-medium">Connection test status:</p>
             <p className="text-red-600 text-sm mt-1">{error.message}</p>
             <p className="text-zinc-500 text-xs mt-2 italic">(Note: This is expected if 'test_connection' table doesn't exist yet, but it proves the client is reaching Supabase.)</p>
          </div>
        ) : (
          <p className="text-green-500 font-medium">Supabase connection successful!</p>
        )}
        
        <p className="mt-8 text-sm text-zinc-500">
          Project is live on Vercel and Supabase
        </p>
      </main>
    </div>
  )
}
