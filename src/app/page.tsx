'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

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
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      console.log('Creating story...')
      // Create a new story with user_id
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: session.user.id,
          title: 'A New Tale Begins...',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (storyError || !storyData) {
        console.error('Error creating story:', storyError)
        return
      }
      console.log('Story created:', storyData)

      // Create the first scene
      console.log('Creating first scene...')
      const { data: sceneData, error: sceneError } = await supabase
        .from('scenes')
        .insert({
          story_id: storyData.id,
          order: 1,
          text: "As your words echo through the magical realm, a new chapter unfolds...\n\n" +
                "The ancient wizard contemplates your request, his eyes twinkling with wisdom. " +
                "With a gentle wave of his staff, images begin to materialize in the mystical mist before you...\n\n" +
                "[AI response will appear here, crafting the beginning of your tale...]",
          images: [],
          feedback: storyStart,
        })
        .select()
        .single()

      if (sceneError) {
        console.error('Error creating scene:', sceneError)
        return
      }
      console.log('First scene created:', sceneData)

      // Redirect to the new story page
      router.push(`/stories/${storyData.id}`)
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
      </main>
    </div>
  )
}
