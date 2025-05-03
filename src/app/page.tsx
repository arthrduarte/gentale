'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [storyStart, setStoryStart] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
      }
    }
    checkAuth()
  }, [router])

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyStart.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: storyStart
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create story')
      }

      const { story } = await response.json()
      router.push(`/stories/${story.id}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateStory(e)
    }
  }

  return (
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
            onKeyPress={handleKeyPress}
            className="text-xl py-6 px-4 rounded-2xl bg-white focus-visible:border-[#F45B69] transition-all duration-150 ease-in-out"
            disabled={isCreating}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            className="bg-[#F45B69] hover:bg-[#F45B69]/90 text-white py-2 px-8 rounded-full text-md"
            onClick={handleCreateStory}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Begin the Tale'}
          </Button>
        </div>
      </div>
    </div>
  )
}
