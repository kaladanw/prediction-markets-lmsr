'use client'

import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const supabase = createClient()

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Error signing in:', error)
    }
  }

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>Sign In</h1>
      <button 
        onClick={signInWithGoogle}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>
    </div>
  )
}