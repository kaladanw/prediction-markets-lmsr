'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
      <a href="/login" style={{ 
        padding: '8px 16px', 
        backgroundColor: '#4285f4', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '4px' 
      }}>
        Sign In
      </a>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span>Welcome, {user.email}</span>
      <button 
        onClick={signOut}
        style={{ 
          padding: '4px 12px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  )
}