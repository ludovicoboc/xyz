'use client'

import { useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Criar conta' : 'Entrar no StayFocus'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Organize sua vida de forma eficiente
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isSignUp ? 'Criar conta' : 'Entrar')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              Entrar com Google
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 text-sm"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}