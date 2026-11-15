
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type UserRole = 'senior' | 'caregiver' | 'family'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (
    fullName: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signIn: (
    email: string,
    password: string
  ) => Promise<string | null>
  signOut: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) {
        if (error) console.error('Session error:', error.message)
        setSession(data?.session ?? null)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp: AuthContextType['signUp'] = async (
    fullName,
    email,
    password,
    role
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      return { error: error.message, needsEmailConfirmation: false }
    }

    return {
      error: null,
      needsEmailConfirmation: !data.session,
    }
  }

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return error?.message ?? null
  }

  const signOut: AuthContextType['signOut'] = async () => {
    const { error } = await supabase.auth.signOut()
    return error?.message ?? null
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
