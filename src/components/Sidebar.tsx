import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Story } from '@/types/db'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    const fetchStories = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stories:', error)
        return
      }

      setStories(data || [])
    }

    fetchStories()
  }, [])

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ 
        backgroundColor: '#F1DAC4',
        borderRight: '2px solid rgba(60, 187, 177, 0.2)'
      }}
    >
      <div className="p-4 border-b-2" style={{ borderColor: 'rgba(60, 187, 177, 0.2)' }}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <a href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Merlin the Wizard" width={32} height={32} />
                <h1 className="text-2xl font-bold" style={{ color: '#F45B69' }}>Gentale</h1>
              </a>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-[#F45B69]/10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" style={{ color: '#F45B69' }} />
            ) : (
              <ChevronLeft className="h-4 w-4" style={{ color: '#F45B69' }} />
            )}
          </Button>
        </div>
      </div>

      <div className="py-4">
        {stories.length > 0 ? (
          <div className="space-y-2">
            {stories.map((story) => (
              <Link 
                key={story.id} 
                href={`/stories/${story.id}`}
                className={`flex items-center px-4 py-2 hover:bg-[#F45B69]/10 transition-colors duration-150 ${
                  isCollapsed ? 'justify-center' : 'space-x-3'
                }`}
              >
                <BookOpen 
                  className="h-5 w-5 flex-shrink-0"
                  style={{ color: '#F45B69' }}
                />
                {!isCollapsed && (
                  <span 
                    className="truncate text-sm"
                    style={{ color: '#000000', opacity: 0.9 }}
                  >
                    {story.title}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 text-center">
            {!isCollapsed && (
              <p className="text-sm" style={{ color: '#000000', opacity: 0.6 }}>
                No stories yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 