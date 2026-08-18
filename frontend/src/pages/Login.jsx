import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Mail, Building } from 'lucide-react';

export const Login = () => {
  const { login, registerAdmin } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'register'

  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail]       = useState('');
  const [company, setCompany]   = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(name, password);
      } else {
        await registerAdmin({ name, password, email, company, role: 'ADMIN' });
        setSuccess('Admin account created. You can now sign in.');
        setName(''); setPassword(''); setEmail(''); setCompany('');
        setMode('signin');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="win fade-up" style={{ width: '100%', maxWidth: '390px' }}>
        <div style={{ padding: '40px 32px 32px' }}>

          {/* Icon + heading */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 14px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(255,255,255,0.90)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(100,130,180,0.18), inset 0 1px 0 white'
            }}>
              <ShieldCheck size={26} color="rgba(37,99,235,0.75)" />
            </div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--t1)',
              marginBottom: '4px',
              letterSpacing: '-0.02em'
            }}>
              {mode === 'signin' ? 'Welcome back' : 'Create admin account'}
            </h1>
            <p style={{ fontSize: '0.83rem', color: 'var(--t2)' }}>
              {mode === 'signin'
                ? 'Sign in to your admin workspace'
                : 'Set up your primary administrator account'}
            </p>
          </div>

          {/* Alerts */}
          {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

          {/* Test Credentials */}
          {mode === 'signin' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => { setName('Admin'); setPassword('123'); }}>
                Admin
              </button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => { setName('Manager'); setPassword('123'); }}>
                Manager
              </button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => { setName('Agent'); setPassword('123'); }}>
                Agent
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

            <div className="field">
              <label>Username</label>
              <div className="input-wrap">
                <User size={15} />
                <input className="fi" type="text" required autoComplete="username"
                  placeholder="Enter your username"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={15} />
                <input className="fi" type="password" required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="field">
                  <label>Email</label>
                  <div className="input-wrap">
                    <Mail size={15} />
                    <input className="fi" type="email" required
                      placeholder="admin@company.com"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="field">
                  <label>Company</label>
                  <div className="input-wrap">
                    <Building size={15} />
                    <input className="fi" type="text" required
                      placeholder="Acme Corp"
                      value={company} onChange={e => setCompany(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', marginTop: 6 }}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

          </form>

          {/* Bottom toggle */}
          <div className="divider" style={{ margin: '22px 0 18px' }} />
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--t2)' }}>
            {mode === 'signin' ? "Don't have an admin account?" : 'Already have an account?'}
            {' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'register' : 'signin')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--blue)',
                fontWeight: 600,
                fontSize: '0.82rem',
                fontFamily: 'inherit',
                padding: 0
              }}
            >
              {mode === 'signin' ? 'Register here' : 'Sign in'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};
