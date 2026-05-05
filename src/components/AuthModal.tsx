import { useState } from 'react';
import { X, Mail, Lock, Loader2, LogIn, UserPlus, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail;
    const { error } = await fn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (mode === 'signup') {
      setSuccess('Account created! Check your email to confirm, then sign in.');
      setLoading(false);
    } else {
      onClose();
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center text-ink-600 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron to-amber-500 shadow-glow mb-4">
            {mode === 'signin' ? <LogIn className="w-6 h-6 text-white" strokeWidth={2.5} /> : <UserPlus className="w-6 h-6 text-white" strokeWidth={2.5} />}
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink-900">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-ink-400 text-sm mt-1">
            {mode === 'signin' ? 'Sign in to access your saved trips.' : 'Save and revisit your trip plans anytime.'}
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-ink-100 bg-white hover:border-ink-200 hover:bg-ink-50 font-bold text-ink-900 text-sm transition-all mb-4 disabled:opacity-60"
        >
          <Globe className="w-4 h-4" strokeWidth={2} />
          Continue with Google
        </button>

        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-ink-100" />
          <span className="text-xs font-bold text-ink-400 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-ink-100" />
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-medium text-emerald-800">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" strokeWidth={2.2} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-ink-100 bg-white text-sm font-medium focus:outline-none focus:border-saffron focus:ring-4 focus:ring-saffron/10 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" strokeWidth={2.2} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-ink-100 bg-white text-sm font-medium focus:outline-none focus:border-saffron focus:ring-4 focus:ring-saffron/10 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold text-sm hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : null}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-400">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null); }}
            className="font-bold text-saffron hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
