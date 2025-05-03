'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F1DAC4' }}>
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg transition-all duration-150 ease-in-out hover:shadow-xl">
        <div>
          <h2 
            className="mt-6 text-center text-4xl font-bold"
            style={{ color: '#3CBBB1', opacity: '0.9' }}
          >
            {isLogin ? 'Welcome Back!' : 'Join the Adventure'}
          </h2>
          <p className="mt-2 text-center text-lg leading-6" style={{ color: '#000000', opacity: '0.8' }}>
            {isLogin ? 'Time to continue your journey' : 'Start your magical journey with us'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#F45B69', color: 'white' }}>
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 rounded-2xl border-2 border-gray-200 placeholder-gray-400 text-gray-900 transition-all duration-150 focus:outline-none focus:border-[#3CBBB1]"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 rounded-2xl border-2 border-gray-200 placeholder-gray-400 text-gray-900 transition-all duration-150 focus:outline-none focus:border-[#3CBBB1]"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-6 py-3 text-lg font-medium text-white rounded-full transition-all duration-150 ease-in-out"
              style={{ backgroundColor: '#F45B69', boxShadow: '0 4px 6px rgba(244, 91, 105, 0.25)' }}
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <button
            className="text-lg font-medium transition-all duration-150"
            style={{ color: '#3CBBB1' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Join us!"
              : 'Already on board? Sign in!'}
          </button>
        </div>
      </div>
    </div>
  )
} 