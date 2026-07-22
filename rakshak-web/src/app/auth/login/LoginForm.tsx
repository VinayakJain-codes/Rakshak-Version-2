'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await login({ email, password })
      console.log('Login res:', res)
      
      if (res && typeof res === 'object' && 'redirectTo' in res && typeof res.redirectTo === 'string') {
        window.location.href = res.redirectTo
        return
      }

      if (res && typeof res === 'object' && 'error' in res) {
        const resError = (res as any).error;
        if (typeof resError === 'string' && resError === '{}') {
           setError('Server returned an empty error object. Please check your credentials.')
        } else {
           setError(typeof resError === 'string' ? resError : JSON.stringify(resError))
        }
        setLoading(false)
        return
      }

      setLoading(false)
    } catch (err) {
      console.error('Login action threw:', err)
      setError(err instanceof Error ? err.message : JSON.stringify(err))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
