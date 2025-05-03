'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [storyStart, setStoryStart] = useState('')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F1DAC4]">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-64">
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          <div className="text-center w-full max-w-3xl">
            <div className="relative w-48 h-48 mx-auto mb-8">
              <Image
                src="/merlin.png"
                alt="Merlin the Wizard"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
            
            <div className="mx-auto mb-8">
              <Input
                placeholder="Describe how your story should start..."
                value={storyStart}
                onChange={(e) => setStoryStart(e.target.value)}
                className="text-xl py-6 px-4 rounded-2xl bg-white focus-visible:border-[#F45B69] transition-all duration-150 ease-in-out"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                className="bg-[#F45B69] hover:bg-[#F45B69]/90 text-white py-2 px-8 rounded-full text-md"
              >
                Begin the Tale
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
