'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Story, Scene as SceneType } from '@/types/db'
import { useRouter } from 'next/navigation'
import Scene from '@/components/Scene'
import ContinueStory from '@/components/ContinueStory'

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [story, setStory] = useState<Story | null>(null)
  const [scenes, setScenes] = useState<SceneType[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
        .eq('id', id)
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
        .eq('story_id', id)
        .order('order', { ascending: true })

      if (scenesError) {
        console.error('Error fetching scenes:', scenesError)
        return
      }

      setScenes(scenesData || [])
      setIsLoading(false)
    }

    fetchStoryAndScenes()
  }, [id, router])

  const handleContinueStory = async (userInput: string) => {
    // Verify session before adding new scene
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    const newScene: Partial<SceneType> = {
      story_id: id,
      order: scenes.length + 1,
      text: "As your words echo through the magical realm, a new chapter unfolds...\n\n" +
            "The ancient wizard contemplates your request, his eyes twinkling with wisdom. " +
            "With a gentle wave of his staff, images begin to materialize in the mystical mist before you...\n\n" +
            "[AI response will appear here, crafting a continuation of your tale...]",
      images: [],
      input: userInput
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
      <h1 className="text-4xl font-bold text-center mb-8" style={{ color: '#F45B69' }}>
        {story?.title}
      </h1>
      
      <div className="space-y-8 mb-4">
        {scenes.map((scene) => (
          <Scene key={scene.id} scene={scene} />
        ))}
      </div>

      <ContinueStory 
        onContinue={handleContinueStory}
        isLastScene={scenes.length > 0}
      />
    </div>
  )
} 