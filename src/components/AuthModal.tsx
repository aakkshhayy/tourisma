import { useState, useRef } from 'react';
import { X, Mail, Lock, Loader2, LogIn, UserPlus, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

type Screen = 'signin' | 'signup' | 'verify';

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [screen, setScreen] = useState<Screen>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    if (screen === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) { setError(error); setLoading(false); }
      else onClose();
    } else {
      const { error, confirmed } = await signUpWithEmail(email, password);
      if (error) { setError(error); setLoading(false); }
      else if (confirmed) onClose(); // email confirmation disabled — signed in immediately
      else { setLoading(false); setScreen('verify'); }
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) { setError(error.message); setLoading(false); }
    else onClose();
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) { setError(error); setLoading(false); }
  };

  const reset = (s: Screen) => {
    setScreen(s);
    setError(null);
    setOtp(['', '', '', '', '', '']);
  };

  // OTP verification screen
  if (screen === 'verify') {
    const filled = otp.every(d => d !== '');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center text-ink-600 transition-colors">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-soft mb-4">
              <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Check your email</h2>
            <p className="text-ink-400 text-sm mt-2">
              We sent a 6-digit code to<br />
              <span className="font-bold text-ink-900">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-medium text-rose-800 text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-extrabold rounded-2xl border-2 focus:outline-none transition-all
                  ${digit ? 'border-saffron bg-saffron/5 text-ink-900' : 'border-ink-100 bg-white text-ink-900'}
                  focus:border-saffron focus:ring-4 focus:ring-saffron/10`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={!filled || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold text-sm hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />}
            Verify & sign in
          </button>

          <p className="mt-4 text-center text-xs text-ink-400">
            Wrong email?{' '}
            <button onClick={() => reset('signup')} className="font-bold text-saffron hover:underline">
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Sign in / Sign up screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center text-ink-600 transition-colors">
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron to-amber-500 shadow-glow mb-4">
            {screen === 'signin' ? <LogIn className="w-6 h-6 text-white" strokeWidth={2.5} /> : <UserPlus className="w-6 h-6 text-white" strokeWidth={2.5} />}
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink-900">
            {screen === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-ink-400 text-sm mt-1">
            {screen === 'signin' ? 'Sign in to access your saved trips.' : 'Save and revisit your trip plans anytime.'}
          </p>
        </div>

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
              placeholder="Password (min 6 characters)"
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
            {screen === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-400">
          {screen === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => reset(screen === 'signin' ? 'signup' : 'signin')}
            className="font-bold text-saffron hover:underline"
          >
            {screen === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
