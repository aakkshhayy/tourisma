import { useState, useRef } from 'react';
import { X, Mail, Lock, Loader2, LogIn, UserPlus, ShieldCheck, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

type Tab = 'email' | 'phone';
type EmailScreen = 'signin' | 'signup';

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [tab, setTab] = useState<Tab>('email');

  // Email state
  const [emailScreen, setEmailScreen] = useState<EmailScreen>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone state
  const [phone, setPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');

  // Shared OTP state (used for both email verify + phone verify)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetOtp = () => setOtp(['', '', '', '', '', '']);

  // ── OTP input helpers ──────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  const OtpBoxes = () => (
    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => { otpRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoFocus={i === 0}
          onChange={e => handleOtpChange(i, e.target.value)}
          onKeyDown={e => handleOtpKeyDown(i, e)}
          className={`w-11 h-13 text-center text-xl font-extrabold rounded-2xl border-2 focus:outline-none transition-all
            ${digit ? 'border-saffron bg-saffron/5 text-ink-900' : 'border-ink-100 bg-white text-ink-900'}
            focus:border-saffron focus:ring-4 focus:ring-saffron/10`}
          style={{ height: '52px' }}
        />
      ))}
    </div>
  );

  // ── Email submit ───────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    if (emailScreen === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) { setError(error); setLoading(false); }
      else onClose();
    } else {
      const { error, confirmed } = await signUpWithEmail(email, password);
      if (error) { setError(error); setLoading(false); }
      else if (confirmed) onClose();
      else { setLoading(false); setEmailScreen('signin'); /* switch to verify-by-link message */ setError(null); }
    }
  };

  // ── Email OTP verify (when confirmation is on) ─────────────
  const handleEmailVerify = async () => {
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) { setError(error.message); setLoading(false); }
    else onClose();
  };

  // ── Phone send OTP ─────────────────────────────────────────
  const handlePhoneSend = async () => {
    const fullPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    if (fullPhone.length < 10) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) { setError(error.message); setLoading(false); }
    else { resetOtp(); setPhoneStep('otp'); setLoading(false); }
  };

  // ── Phone verify OTP ───────────────────────────────────────
  const handlePhoneVerify = async () => {
    const token = otp.join('');
    const fullPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token, type: 'sms' });
    if (error) { setError(error.message); setLoading(false); }
    else onClose();
  };

  const switchTab = (t: Tab) => {
    setTab(t); setError(null); resetOtp();
    setPhoneStep('input'); setEmailScreen('signin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ink-50 hover:bg-ink-100 flex items-center justify-center text-ink-600 transition-colors">
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron to-amber-500 shadow-glow mb-4">
            <LogIn className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Sign in to Tourisma</h2>
          <p className="text-ink-400 text-sm mt-1">Save and revisit your trip plans anytime.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-ink-50 rounded-2xl p-1 mb-6">
          <button
            onClick={() => switchTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tab === 'email' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-400 hover:text-ink-700'}`}
          >
            <Mail className="w-4 h-4" strokeWidth={2.2} />
            Email
          </button>
          <button
            onClick={() => switchTab('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tab === 'phone' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-400 hover:text-ink-700'}`}
          >
            <Phone className="w-4 h-4" strokeWidth={2.2} />
            Phone
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* ── EMAIL TAB ── */}
        {tab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : (
                emailScreen === 'signin' ? <LogIn className="w-4 h-4" strokeWidth={2.5} /> : <UserPlus className="w-4 h-4" strokeWidth={2.5} />
              )}
              {emailScreen === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <p className="text-center text-sm text-ink-400 pt-1">
              {emailScreen === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setEmailScreen(emailScreen === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="font-bold text-saffron hover:underline"
              >
                {emailScreen === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        )}

        {/* ── PHONE TAB ── */}
        {tab === 'phone' && phoneStep === 'input' && (
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-sm font-bold text-ink-900">🇮🇳 +91</span>
                <div className="w-px h-4 bg-ink-200" />
              </div>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-24 pr-4 py-3.5 rounded-2xl border-2 border-ink-100 bg-white text-sm font-medium focus:outline-none focus:border-saffron focus:ring-4 focus:ring-saffron/10 transition-all tracking-widest"
              />
            </div>
            <button
              onClick={handlePhoneSend}
              disabled={loading || phone.length < 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold text-sm hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />}
              Send OTP
            </button>
          </div>
        )}

        {tab === 'phone' && phoneStep === 'otp' && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-ink-400">OTP sent to</p>
              <p className="font-bold text-ink-900">+91 {phone}</p>
              <button onClick={() => { setPhoneStep('input'); resetOtp(); setError(null); }} className="text-xs text-saffron font-bold hover:underline mt-1">
                Change number
              </button>
            </div>
            <OtpBoxes />
            <button
              onClick={handlePhoneVerify}
              disabled={loading || otp.some(d => !d)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold text-sm hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />}
              Verify & sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
