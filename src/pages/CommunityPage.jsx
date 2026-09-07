import { ArrowLeft, MoreHorizontal, UserPlus, Goal, Building2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/shared';

export function CommunityPage({ navigate }) {
  const { community, communities, players, currentUser, selectCommunity } = useApp();

  if (!community) {
    return (
      <>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('home')}><ArrowLeft size={18} /></button>
          <h2 style={{ fontSize: 16 }}>Community</h2>
          <span style={{ width: 34 }} />
        </div>
        <div className="page-content" style={{ paddingTop: 36 }}>
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ marginBottom: 12 }}><Building2 size={38} /></div>
            <h3>You haven’t joined any communities yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 20 }}>
              Create a community for your group or use an invite code to join one.
            </p>
            <Link className="btn btn-primary" to="/connect">Create or Join a Community</Link>
          </div>
        </div>
        <BottomNav active="community" navigate={navigate} />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: 16 }}>Community</h2>
        <button className="btn-ghost"><MoreHorizontal size={20} /></button>
      </div>

      <div className="page-content">
        <Link className="btn community-action-button" to="/connect">
          <Plus size={17} /> Create or Join Another Community
        </Link>

        {communities.length > 1 && (
          <div className="card" style={{ padding: '16px 20px' }}>
            <div className="section-label" style={{ marginBottom: 8 }}>Your Communities</div>
            {communities.map((item) => (
              <button key={item.id} onClick={() => selectCommunity(item.id)} style={{
                width: '100%', padding: '10px 0', border: 'none', borderBottom: '1px solid var(--border-light)',
                background: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: item.id === community.id ? 700 : 500,
                color: item.id === community.id ? 'var(--green)' : 'var(--text-primary)',
              }}>
                {item.name}{item.id === community.id ? ' · Active' : ''}
              </button>
            ))}
          </div>
        )}

        {/* Community info */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--green-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 24,
            flexShrink: 0,
          }}><Goal size={26} /></div>
          <div>
            <h3 style={{ marginBottom: 2 }}>{community.name}</h3>
            <span className="badge badge-upcoming">Admin</span>
          </div>
        </div>

        {/* Invite code */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Invite Code</div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>
              {community.inviteCode}
            </span>
            <button
              onClick={() => navigator.clipboard?.writeText(community.inviteCode)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontWeight: 600, fontSize: 13 }}
            >
              Copy
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            Share this code with players to let them join your community.
          </p>
        </div>

        {/* Members */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <h4 style={{ marginBottom: 14 }}>Members ({players.length})</h4>
          {players.map((p, i) => (
            <button key={p.id} className="community-member-row" onClick={() => navigate('player-profile', { playerId: p.id })} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < players.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{p.initials}</div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.name}</span>
              {p.isAdmin && (
                <span className="badge badge-upcoming" style={{ fontSize: 10 }}>Admin</span>
              )}
              {currentUser.isAdmin && !p.isAdmin && (
                <MoreHorizontal size={16} color="var(--text-muted)" />
              )}
            </button>
          ))}
        </div>

        {/* Invite button */}
        {currentUser.isAdmin && (
          <button className="btn btn-secondary" style={{ gap: 8 }}>
            <UserPlus size={16} />
            Invite Members
          </button>
        )}

        <div style={{ height: 16 }} />
      </div>

      <BottomNav active="community" navigate={navigate} />
    </>
  );
}
