import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function getErrorMessage(code) {
  const map = {
    'auth/user-not-found':        'No account found with this email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/email-already-in-use':  'This email is already registered.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/invalid-email':         'Invalid email address.',
    'auth/invalid-credential':    'Incorrect email or password.',
    'auth/popup-closed-by-user':  'Sign-in popup was closed.',
    'auth/too-many-requests':     'Too many attempts. Try again later.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}

export default function AuthModal({ open, onClose }) {
  const { signIn, signUp, signInGoogle } = useAuth()

  const [mode, setMode]         = useState('signin') // 'signin' | 'signup'
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (!open) return null

  function switchMode(m) {
    setMode(m)
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, name.trim() || email.split('@')[0])
      }
      onClose()
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInGoogle()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-2xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {mode === 'signin'
                  ? 'Sign in to sync your likes across devices'
                  : 'Free forever — no credit card needed'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-dark-card transition-colors mt-0.5"
            >
              <X size={15} />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-3">

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white text-black font-medium text-sm hover:bg-zinc-100 active:scale-[.98] transition-all disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-dark-border" />
              <span className="text-xs text-zinc-600">or continue with email</span>
              <div className="flex-1 h-px bg-dark-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {mode === 'signup' && (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Display name"
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoComplete="email"
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 active:scale-[.98] transition-all disabled:opacity-50"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
            
            <p className="text-center text-xs text-zinc-500 pt-1">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-white hover:underline font-medium"
              >
                {mode === 'signin' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}