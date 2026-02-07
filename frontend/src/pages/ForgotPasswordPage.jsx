import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import EvaluatorNotes from '../components/EvaluatorNotes.jsx'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [sending, setSending] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const onSend = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) return setError('Email is required')

    setSending(true)
    try {
      const res = await api.forgotPassword(trimmedEmail)
      setMessage(res?.message || 'Reset token sent. Check your email.')
    } catch (e) {
      setError(e?.message || 'Failed to send reset token')
    } finally {
      setSending(false)
    }
  }

  const onReset = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) return setError('Email is required')
    if (!token.trim()) return setError('Token is required')
    if (!newPassword) return setError('New password is required')

    setResetting(true)
    try {
      const res = await api.resetPassword(trimmedEmail, token.trim(), newPassword)
      setMessage(res?.message || 'Password reset successful')
      navigate('/login', { replace: true })
    } catch (e) {
      setError(e?.message || 'Password reset failed')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 620 }}>
      <div className="card" style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Forgot password</h2>
          <Link className="muted" to="/login">Back to sign in</Link>
        </div>
        <div className="muted" style={{ marginBottom: 16 }}>
          Request a reset token, then set a new password.
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="card" style={{ padding: 14, borderStyle: 'dashed' }}>
            <h3 style={{ marginTop: 0 }}>1) Send token</h3>
            <form onSubmit={onSend}>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
              <div style={{ marginTop: 12 }}>
                <button className="button" disabled={sending} type="submit">
                  {sending ? 'Sending…' : 'Send token'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 14, borderStyle: 'dashed' }}>
            <h3 style={{ marginTop: 0 }}>2) Reset</h3>
            <form onSubmit={onReset}>
              <label className="label">Token</label>
              <input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the token" />

              <div style={{ marginTop: 12 }}>
                <label className="label">New password</label>
                <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="button" disabled={resetting} type="submit">
                  {resetting ? 'Resetting…' : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}
        {message ? <div style={{ marginTop: 12 }}>{message}</div> : null}
      </div>

      <EvaluatorNotes page="Forgot Password" />
    </div>
  )
}
