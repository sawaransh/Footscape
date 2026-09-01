import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CreateJoinCommunity({ navigate }) {
  const { createCommunity, joinCommunity, logout, currentUser } = useApp();
  const [mode, setMode] = useState('create');
  const [communityName, setCommunityName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await (mode === 'create'
      ? createCommunity(communityName)
      : joinCommunity(inviteCode));
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError('');
    navigate('home');
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d1f0f',
      minHeight: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background pitch graphic */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(ellipse at 50% 110%, rgba(60,181,99,0.25) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 60%, rgba(60,181,99,0.08) 0%, transparent 80%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Pitch lines */}
      <svg style={{ position: 'absolute', bottom: 0, width: '100%', opacity: 0.12 }}
        viewBox="0 0 430 300" fill="none">
        <ellipse cx="215" cy="240" rx="150" ry="80" stroke="#3cb563" strokeWidth="1.5"/>
        <line x1="215" y1="160" x2="215" y2="300" stroke="#3cb563" strokeWidth="1"/>
        <rect x="40" y="200" width="350" height="100" stroke="#3cb563" strokeWidth="1"/>
        <rect x="120" y="230" width="190" height="70" stroke="#3cb563" strokeWidth="1"/>
      </svg>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 32px 40px', gap: 0, position: 'relative',
      }}>
        <button
          className="btn-ghost"
          onClick={logout}
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <LogOut size={16} /> Logout
        </button>
        <button
          className="btn-ghost"
          onClick={() => navigate('home')}
          style={{ position: 'absolute', top: 14, left: 16, color: 'rgba(255,255,255,0.7)' }}
        >
          Skip for now
        </button>

        {/* Logo mark */}
        <div style={{
          width: 72, height: 72, borderRadius: '20px',
          background: 'rgba(60,181,99,0.15)',
          border: '1.5px solid rgba(60,181,99,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, fontSize: 32,
        }}>
          ⚽
        </div>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, justifyContent: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 42, letterSpacing: '-1px', fontWeight: 800 }}>
              PITCH
            </h1>
            <h1 style={{ color: '#3cb563', fontSize: 42, letterSpacing: '-1px', fontWeight: 800 }}>
              &nbsp;TRACKER
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>
            Welcome, <span style={{ color: 'rgba(255,255,255,0.85)' }}>{currentUser?.name}</span>.
            <br />
            Create your crew or join one.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="auth-tabs" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' }}>
            <button
              type="button"
              className={mode === 'create' ? 'active' : ''}
              onClick={() => { setMode('create'); setError(''); }}
            >
              Create
            </button>
            <button
              type="button"
              className={mode === 'join' ? 'active' : ''}
              onClick={() => { setMode('join'); setError(''); }}
            >
              Join
            </button>
          </div>

          {mode === 'create' ? (
            <input
              className="input-field"
              value={communityName}
              onChange={(event) => { setError(''); setCommunityName(event.target.value); }}
              placeholder="Community name"
            />
          ) : (
            <input
              className="input-field"
              value={inviteCode}
              onChange={(event) => { setError(''); setInviteCode(event.target.value); }}
              placeholder="Invite code, e.g. SFC-2024"
              style={{ textTransform: 'uppercase' }}
            />
          )}

          {error && <p className="form-error" style={{ color: '#fecaca' }}>{error}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
            style={{ fontSize: 16, padding: '16px' }}
          >
            {isSubmitting ? 'Please wait…' : mode === 'create' ? 'Create Community' : 'Join Community'}
          </button>
        </form>
      </div>
    </div>
  );
}
