import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AuthPage() {
  const { login, signup } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key) => (event) => {
    setError('');
    setForm(prev => ({ ...prev, [key]: event.target.value }));
  };

 
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await (mode === 'login'
      ? login({ email: form.email, password: form.password })
      : signup(form));
    setIsSubmitting(false);

    if (!result.ok) setError(result.message);
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-screen">
      <div className="auth-bg" />

      <div className="auth-content">
        <div className="auth-logo">⚽</div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
            <h1 style={{ color: 'white', fontSize: 38, fontWeight: 800 }}>FOOT</h1>
            <h1 style={{ color: '#3cb563', fontSize: 38, fontWeight: 800 }}>SCAPE</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>
            Organise your football community, one match at a time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-panel">
          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? 'active' : ''}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Login
            </button>
            <button
              type="button"
              className={!isLogin ? 'active' : ''}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Signup
            </button>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={set('name')}
                placeholder="Your full name"
              />
            </div>
          )}

          <div className="input-group">
            <label>Email or username</label>
            <input
              className="input-field"
              value={form.email}
              onChange={set('email')}
              placeholder={isLogin ? 'arjun@example.com' : 'you@example.com'}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder={isLogin ? 'demo123' : 'At least 6 characters'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
            {isSubmitting ? 'Please wait…' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
