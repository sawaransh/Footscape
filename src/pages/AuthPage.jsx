import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn, MailCheck, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AuthPage() {
  const { requestLoginOtp, requestSignupOtp, verifyOtp } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [verification, setVerification] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === 'login';
  const set = (key) => (event) => { setError(''); setForm((previous) => ({ ...previous, [key]: event.target.value })); };

  const requestCode = async (event) => {
    event.preventDefault(); setIsSubmitting(true); setError('');
    const result = isLogin ? await requestLoginOtp({ email: form.email, password: form.password }) : await requestSignupOtp(form);
    setIsSubmitting(false);
    if (!result.ok) { setError(result.message); return; }
    setVerification({ id: result.verificationId, email: result.email, mode }); setCode('');
  };
  const confirmCode = async (event) => {
    event.preventDefault(); setIsSubmitting(true); setError('');
    const result = await verifyOtp(verification.id, code);
    setIsSubmitting(false);
    if (!result.ok) { setError(result.message); return; }
    if (result.isNewUser) navigate('/connect');
  };
  const changeMode = (nextMode) => { setMode(nextMode); setError(''); setVerification(null); };

  return <div className="auth-screen"><div className="auth-bg" /><div className="auth-content">
    <div className="auth-brand"><img className="auth-brand-logo" src="/brand/footscape-title.png" alt="Footscape" /></div>
    {!verification ? <form onSubmit={requestCode} className="auth-panel">
      <div className={`auth-tabs ${isLogin ? 'is-login' : 'is-signup'}`}><span className="auth-tab-indicator" aria-hidden="true" />
        <button type="button" className={isLogin ? 'active' : ''} onClick={() => changeMode('login')}>Login</button>
        <button type="button" className={!isLogin ? 'active' : ''} onClick={() => changeMode('signup')}>Signup</button>
      </div>
      <div key={mode} className="auth-mode-content">
        {!isLogin && <div className="input-group"><label>Name</label><input className="input-field" value={form.name} onChange={set('name')} placeholder="Enter your Name" autoComplete="name" /></div>}
        <div className="input-group"><label>Email or username</label><input className="input-field" value={form.email} onChange={set('email')} placeholder={isLogin ? 'cristiano@realmadrid.com' : 'messi@barcelona.com'} autoComplete="email" /></div>
        <div className="input-group"><label>Password</label><div className="password-control"><input className="input-field" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder={isLogin ? 'Enter a Password' : 'At least 6 characters'} autoComplete={isLogin ? 'current-password' : 'new-password'} /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}{isSubmitting ? 'Sending code…' : isLogin ? 'Continue with email code' : 'Create account with email code'}</button>
      </div>
    </form> : <form className="auth-panel otp-panel" onSubmit={confirmCode}>
      <button className="otp-back" type="button" onClick={() => { setVerification(null); setError(''); }}><ArrowLeft size={16} /> Back</button>
      <div className="otp-icon"><MailCheck size={26} /></div>
      <div className="otp-copy"><h2>Check your email</h2><p>We sent a six-digit code to <strong>{verification.email}</strong>. It expires in 10 minutes.</p></div>
      <div className="input-group"><label>Verification code</label><div className="otp-input-wrap"><KeyRound size={18} /><input className="input-field otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength="6" value={code} onChange={(event) => { setError(''); setCode(event.target.value.replace(/\D/g, '')); }} placeholder="000000" autoFocus /></div></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={isSubmitting || code.length !== 6}>{isSubmitting ? 'Verifying…' : 'Verify and continue'}</button>
      <button className="otp-resend" type="button" onClick={requestCode} disabled={isSubmitting}>Didn’t receive it? Send a new code</button>
    </form>}
  </div></div>;
}
