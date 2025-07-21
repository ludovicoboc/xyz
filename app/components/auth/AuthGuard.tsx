'use client'

import { useAuth } from '@/app/hooks/useAuth'
import { LoginForm } from './LoginForm'

type AuthGuardProps = {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
}