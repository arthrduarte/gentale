import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!)

const generateContinuation = async (prompt: string, previousScenes: any[], feedback: string) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
        generationConfig: { responseMimeType: "application/json" }
    })

    // Create a context string from previous scenes
    const context = previousScenes
        .map(scene => `Scene ${scene.order}: ${scene.text}`)
        .join('\n\n')

    const storyPrompt = `You are continuing a whimsical children's story. Here's what happened so far:

${context}

The reader ${feedback === 'like' ? 'loved' : 'thought we could improve'} the last scene.

Now, continue the story based on this new direction: "${prompt}"

Requirements:
- Match the whimsical and child-friendly tone of previous scenes
- Use simple words a 5 year old would understand
- Include vivid imagery and sensory details
- Keep the story engaging and magical
- Do not write more than 500 characters
- End in a way that invites continuation

Return the response in this exact JSON format:
{
    "story": "The continuation of the story",
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
        const { prompt, storyId, feedback } = await request.json()
        if (!prompt?.trim() || !storyId || !feedback) {
            return NextResponse.json(
                { error: 'Prompt, storyId, and feedback are required' },
                { status: 400 }
            )
        }

        // Get previous scenes
        const { data: previousScenes, error: scenesError } = await supabase
            .from('scenes')
            .select('*')
            .eq('story_id', storyId)
            .order('order', { ascending: true })

        if (scenesError) {
            console.error('Error fetching scenes:', scenesError)
            return NextResponse.json(
                { error: 'Failed to fetch previous scenes' },
                { status: 500 }
            )
        }

        // Generate continuation using Gemini
        const continuationContent = await generateContinuation(prompt, previousScenes, feedback)
        if (!continuationContent) {
            return NextResponse.json(
                { error: 'Failed to generate continuation' },
                { status: 500 }
            )
        }

        const parsedContent = JSON.parse(continuationContent)

        // Create new scene
        const { data: scene, error: sceneError } = await supabase
            .from('scenes')
            .insert({
                story_id: storyId,
                order: (previousScenes?.length || 0) + 1,
                input: prompt,
                text: parsedContent.story,
                images: [],
                suggestions: parsedContent.suggestions,
                feedback: feedback
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

        return NextResponse.json({ scene })

    } catch (error) {
        console.error('Error in story continuation:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 