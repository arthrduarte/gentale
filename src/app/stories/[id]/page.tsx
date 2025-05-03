'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Story, Scene } from '@/types/db'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<Story | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userInput, setUserInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchStoryAndScenes = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      // Fetch story and verify ownership
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', session.user.id)
        .single()

      if (storyError || !storyData) {
        console.error('Error fetching story:', storyError)
        router.push('/')
        return
      }

      setStory(storyData)

      // Fetch scenes
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('story_id', params.id)
        .order('order', { ascending: true })

      if (scenesError) {
        console.error('Error fetching scenes:', scenesError)
        return
      }

      setScenes(scenesData || [])
      setIsLoading(false)
    }

    fetchStoryAndScenes()
  }, [params.id, router])

  const handleContinueStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Verify session before adding new scene
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    const newScene: Partial<Scene> = {
      story_id: params.id,
      order: scenes.length + 1,
      text: "As your words echo through the magical realm, a new chapter unfolds...\n\n" +
            "The ancient wizard contemplates your request, his eyes twinkling with wisdom. " +
            "With a gentle wave of his staff, images begin to materialize in the mystical mist before you...\n\n" +
            "[AI response will appear here, crafting a continuation of your tale...]",
      images: [],
      feedback: userInput
    }

    const { data: sceneData, error } = await supabase
      .from('scenes')
      .insert(newScene)
      .select()
      .single()

    if (error) {
      console.error('Error creating scene:', error)
      return
    }

    setScenes([...scenes, sceneData])
    setUserInput('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl" style={{ color: '#F45B69' }}>Loading your tale...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8" style={{ color: '#F45B69' }}>
        {story?.title}
      </h1>
      
      <div className="space-y-8 mb-8">
        {scenes.map((scene) => (
          <div 
            key={scene.id}
            className="bg-white rounded-2xl p-6 shadow-lg"
            style={{ border: '2px solid rgba(244, 91, 105, 0.2)' }}
          >
            <p className="text-gray-600 mb-4 italic">
              {scene.feedback}
            </p>
            <div className="prose max-w-none" style={{ whiteSpace: 'pre-wrap' }}>
              {scene.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleContinueStory} className="space-y-4">
        <Input
          placeholder="How should the story continue?"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="text-xl py-6 px-4 rounded-2xl bg-white focus-visible:border-[#F45B69] transition-all duration-150 ease-in-out"
        />
        <div className="flex justify-end">
          <Button 
            type="submit"
            className="bg-[#F45B69] hover:bg-[#F45B69]/90 text-white py-2 px-8 rounded-full text-md"
          >
            Continue the Tale
          </Button>
        </div>
      </form>
    </div>
  )
} 