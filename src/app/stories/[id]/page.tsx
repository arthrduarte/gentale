'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Story, Scene as SceneType } from '@/types/db'
import { useRouter } from 'next/navigation'
import Scene from '@/components/Scene'
import ContinueStory from '@/components/ContinueStory'
import Image from 'next/image'

const getRandomRotation = () => {
  // Generate a random number between -12 and 12
  return Math.floor(Math.random() * 24) - 12
}

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [story, setStory] = useState<Story | null>(null)
  const [scenes, setScenes] = useState<SceneType[]>([])
  const [sceneRotations, setSceneRotations] = useState<{ left: number; right: number }[]>([])
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

      const rotations = (scenesData || []).map(() => ({
        left: getRandomRotation(),
        right: getRandomRotation()
      }))

      setSceneRotations(rotations)
      setScenes(scenesData || [])
      setIsLoading(false)
    }

    fetchStoryAndScenes()
  }, [id, router])

  const handleContinueStory = async (scene: SceneType) => {
    console.log("[StoryPage] Adding new scene from API:", scene);
    
    setScenes([...scenes, scene])
    setSceneRotations([...sceneRotations, {
      left: getRandomRotation(),
      right: getRandomRotation()
    }])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl" style={{ color: '#F45B69' }}>Loading your tale...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8" style={{ color: '#F45B69' }}>
        {story?.title}
      </h1>
      
      <div className="space-y-8 mb-4">
        {scenes.map((scene, index) => (
          <div key={scene.id} className="flex items-center justify-between gap-4">
            <div 
              className="relative w-64 h-32 flex-shrink-0 rounded-2xl border-2 border-[#F45B69]/20 overflow-hidden transform hover:rotate-0 transition-transform duration-200" 
              style={{ transform: `rotate(${sceneRotations[index]?.left || 0}deg)` }}
            >
              {scene.images[0] ? (
                <Image
                  src={scene.images[0]}
                  alt={`Left illustration for scene ${scene.order}`}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <div className="w-full h-full bg-white/50 flex items-center justify-center text-[#F45B69]/40">
                  Drawing...
                </div>
              )}
            </div>
            <div className="flex-grow max-w-2xl">
              <Scene scene={scene} />
            </div>
            <div 
              className="relative w-64 h-32 flex-shrink-0 rounded-2xl border-2 border-[#F45B69]/20 overflow-hidden transform hover:rotate-0 transition-transform duration-200"
              style={{ transform: `rotate(${sceneRotations[index]?.right || 0}deg)` }}
            >
              {scene.images[1] ? (
                <Image
                  src={scene.images[1]}
                  alt={`Right illustration for scene ${scene.order}`}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <div className="w-full h-full bg-white/50 flex items-center justify-center text-[#F45B69]/40">
                  Drawing...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ContinueStory 
        onContinue={handleContinueStory}
        isLastScene={scenes.length > 0}
        currentScene={scenes[scenes.length - 1]}
        storyId={id}
      />
    </div>
  )
} 