import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {

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

        // Create a new story
        const { data: story, error: storyError } = await supabase
            .from('stories')
            .insert({
                user_id: session.user.id,
                title: prompt.split('.')[0].substring(0, 100), // Use first sentence as title, max 100 chars
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

        // Create initial scene
        const initialText = "As your words echo through the magical realm, a new chapter unfolds...\n\n" +
            "The ancient wizard contemplates your request, his eyes twinkling with wisdom. " +
            "With a gentle wave of his staff, images begin to materialize in the mystical mist before you...\n\n" +
            "[AI response will appear here, crafting the beginning of your tale...]"

        const { data: scene, error: sceneError } = await supabase
            .from('scenes')
            .insert({
                story_id: story.id,
                order: 1,
                input: prompt,
                text: initialText,
                images: []
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