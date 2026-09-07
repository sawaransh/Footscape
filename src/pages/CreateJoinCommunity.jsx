import { useState } from 'react';
import { LogOut, Plus, UsersRound } from 'lucide-react';
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
    <div className="community-onboarding">
      <div className="community-onboarding-glow" />

      {/* Content */}
      <div className="community-onboarding-content">
        <button
          className="btn-ghost"
          onClick={logout}
          style={{ position: 'absolute', top: 14, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <LogOut size={16} /> Logout
        </button>
        <button
          className="btn-ghost"
          onClick={() => navigate('home')}
          style={{ position: 'absolute', top: 14, left: 16 }}
        >
          Skip for now
        </button>

        <div className="community-onboarding-brand">
          <img src="/brand/footscape-title.png" alt="Footscape" />
          <p>
            Welcome, <span style={{ color: 'rgba(255,255,255,0.85)' }}>{currentUser?.name}</span>.
            <br />
            Create your crew or join one.
          </p>
        </div>

        <form className="community-onboarding-form" onSubmit={handleSubmit}>
          <div className={`auth-tabs ${mode === 'create' ? 'is-login' : 'is-signup'}`}>
            <span className="auth-tab-indicator" aria-hidden="true" />
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
            {mode === 'create' ? <Plus size={18} /> : <UsersRound size={18} />}
            {isSubmitting ? 'Please wait…' : mode === 'create' ? 'Create Community' : 'Join Community'}
          </button>
        </form>
      </div>
    </div>
  );
}
