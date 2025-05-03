import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
}

function createClient() {
    // Create a supabase client on the browser with project's credentials
    return createBrowserClient(
        supabaseUrl!,
        supabaseKey!
    )
}

export const supabase = createClient()