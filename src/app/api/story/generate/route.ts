import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!)

const generateStoryStart = async (prompt: string) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
        generationConfig: { responseMimeType: "application/json" }
    })

    const storyPrompt = `You are a whimsical and creative storyteller. Write a magical story beginning based on this prompt: "${prompt}"
    The story should be:
    - Written in a enchanting, bedtime story style
    - Use simple words and sentences that a 5 year old would understand
    - Include vivid imagery and sensory details
    - Be family-friendly and engaging
    - End in a way that invites continuation
    - Do not write more than 500 characters
    
    Return the response in this exact JSON format:
    {
      "title": "A whimsical title for the story",
      "story": "The story content",
      "suggestions": ["First suggestion of what could happen next", "Second suggestion of what could happen next", "Third suggestion of what could happen next"]
    }`

    const result = await model.generateContent(storyPrompt)
    const response = await result.response
    console.log(response.text())
    return response.text()
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get request body
        const { prompt } = await request.json()
        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            )
        }

        // Generate story content using Gemini
        const storyContent = await generateStoryStart(prompt)
        if (!storyContent) {
            return NextResponse.json(
                { error: 'Failed to generate story content' },
                { status: 500 }
            )
        }

        const parsedContent = JSON.parse(storyContent)

        // Create a new story with AI-generated title
        const { data: story, error: storyError } = await supabase
            .from('stories')
            .insert({
                user_id: session.user.id,
                title: parsedContent.title,
            })
            .select()
            .single()

        if (storyError) {
            console.error('Error creating story:', storyError)
            return NextResponse.json(
                { error: 'Failed to create story' },
                { status: 500 }
            )
        }

        // Create initial scene with Gemini-generated text and suggestions
        const { data: scene, error: sceneError } = await supabase
            .from('scenes')
            .insert({
                story_id: story.id,
                order: 1,
                input: prompt,
                text: parsedContent.story,
                images: [],
                suggestions: parsedContent.suggestions
            })
            .select()
            .single()

        if (sceneError) {
            console.error('Error creating scene:', sceneError)
            return NextResponse.json(
                { error: 'Failed to create scene' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            story,
            scene
        })

    } catch (error) {
        console.error('Error in story generation:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 