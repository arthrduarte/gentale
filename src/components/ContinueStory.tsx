'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThumbsUp, ThumbsDown, Wand2 } from 'lucide-react'
import type { Scene as SceneType } from "@/types/db"

interface ContinueStoryProps {
  onContinue: (input: string) => void;
  isLastScene: boolean;
  currentScene?: SceneType;
  storyId: string;
}

export default function ContinueStory({ onContinue, isLastScene, currentScene, storyId }: ContinueStoryProps) {
  const [step, setStep] = useState(isLastScene ? 1 : 0)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const [userInput, setUserInput] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [step])

  const transition = async (nextStep: number) => {
    setIsVisible(false)
    await new Promise(resolve => setTimeout(resolve, 150)) // Match transition duration
    setStep(nextStep)
  }

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type)
    transition(2)
  }

  const handleSuggestion = (suggestion: string) => {
    setUserInput(suggestion)
    transition(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/story/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userInput,
          storyId: storyId,
          feedback: feedback || 'like' // Default to 'like' if somehow feedback is missing
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to continue story')
      }

      const { scene } = await response.json()
      onContinue(userInput)
      setUserInput('')
      transition(1)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 0) {
    return null
  }

  const baseTransitionClasses = "transition-all duration-500 ease-in-out transform"
  const visibilityClasses = isVisible 
    ? "opacity-100 translate-y-0" 
    : "opacity-0 translate-y-4"

  if (step === 1) {
    return (
      <div className={`space-y-4 rounded-2xl max-w-2xl mx-auto p-6 ${baseTransitionClasses} ${visibilityClasses}`}>
        <h3 className="text-sm text-center mb-6" style={{ color: '#F45B69' }}>
          How did you find the last part of the story?
        </h3>
        <div className="flex justify-center gap-8">
          <Button
            variant="ghost"
            className="flex flex-col items-center p-8 gap-2 hover:bg-[#3CBBB1]/50"
            onClick={() => handleFeedback('like')}
          >
            <ThumbsUp className="w-8 h-8" style={{ color: '#3CBBB1' }} />
            <span>I liked it!</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center p-8 gap-2 hover:bg-[#F45B69]/10"
            onClick={() => handleFeedback('dislike')}
          >
            <ThumbsDown className="w-8 h-8" style={{ color: '#F45B69' }} />
            <span>Could be better</span>
          </Button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className={`space-y-6 rounded-2xl max-w-2xl mx-auto ${baseTransitionClasses} ${visibilityClasses}`}>
        <h3 className="text-sm text-center mb-4" style={{ color: '#F45B69' }}>
          Choose a direction for your tale
        </h3>
        <div className="flex justify-between">
          {currentScene?.suggestions?.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-[30%] text-left p-4 h-auto whitespace-normal"
              style={{ borderColor: '#F45B69' }}
              onClick={() => handleSuggestion(suggestion)}
            >
              <Wand2 className="w-5 h-5 mr-3 inline-block" style={{ color: '#F45B69' }} />
              {suggestion}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full text-left p-4 h-auto"
          style={{ borderColor: '#F45B69'}}
          onClick={() => transition(3)}
        >
          I have something else in mind...
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 max-w-2xl mx-auto ${baseTransitionClasses} ${visibilityClasses}`}>
      <Input
        placeholder="How should the story continue?"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="text-xl py-6 px-4 rounded-2xl bg-white focus-visible:border-[#F45B69] transition-all duration-150 ease-in-out"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button 
          type="submit"
          className="bg-[#F45B69] hover:bg-[#F45B69]/90 text-white py-2 px-8 rounded-full text-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Continue the Tale'}
        </Button>
      </div>
    </form>
  )
} 