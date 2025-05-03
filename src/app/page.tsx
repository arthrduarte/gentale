'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#F1DAC4' }}>
      <div className="text-center max-w-2xl px-8">
        <h1 
          className="text-5xl font-bold mb-6 leading-tight"
          style={{ color: '#3CBBB1', opacity: '0.9' }}
        >
          Welcome to Your Magical Space
        </h1>
        <p className="text-xl mb-12 leading-relaxed" style={{ color: '#000000', opacity: '0.8' }}>
          Your journey continues here. Explore and create something wonderful!
        </p>
        <Button className="bg-[#F45B69] hover:bg-[#F45B69]/90 text-white font-bold py-2 px-4 rounded" onClick={handleSignOut}>
          Farewell for Now
        </Button>
      </div>
    </div>
  )
}
