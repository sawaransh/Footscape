import { ArrowLeft, MoreHorizontal, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarStack, StatusBadge } from '../components/shared';

export function FixtureDetailPage({ params, navigate }) {
  const { getFixture, getStatus, getScore, toggleRsvp, currentUser, getPlayer } = useApp();
  const fixture = getFixture(params.fixtureId);

  if (!fixture) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Fixture not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('home')} style={{ marginTop: 16, maxWidth: 200 }}>
          Go home
        </button>
      </div>
    );
  }

  const status = getStatus(fixture);
  const score = getScore(fixture);
  const isRsvped = fixture.rsvpIds.includes(currentUser.id);

  const date = new Date(fixture.dateTime);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleLiveMatch = () => navigate('live', { fixtureId: fixture.id });
  const handleManageTeams = () => navigate('manage-teams', { fixtureId: fixture.id });

  const teamAssigned = fixture.teams.A.length > 0 || fixture.teams.B.length > 0;

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: 16 }}>Fixture Details</h2>
        <button className="btn-ghost"><MoreHorizontal size={20} /></button>
      </div>

      <div className="page-content">
        {/* Status + Title */}
        <div className="card" style={{ padding: '20px' }}>
          <StatusBadge status={status} />
          <h2 style={{ marginTop: 10, marginBottom: 12 }}>{fixture.title}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              📅 {dateStr} · {timeStr}
            </span>
            {fixture.venue && (
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                📍 {fixture.venue}
              </span>
            )}
            {fixture.description && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                {fixture.description}
              </p>
            )}
          </div>

          {/* Score if not upcoming */}
          {status !== 'upcoming' && teamAssigned && (
            <div style={{
              marginTop: 16, padding: '14px',
              background: status === 'live' ? '#0d1f0f' : 'var(--surface-2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: status === 'live' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginBottom: 4 }}>Team A</div>
                <span style={{ fontSize: 36, fontWeight: 800, color: status === 'live' ? 'white' : 'var(--text-primary)' }}>{score.a}</span>
              </div>
              <span style={{ fontSize: 20, color: status === 'live' ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)' }}>–</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: status === 'live' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginBottom: 4 }}>Team B</div>
                <span style={{ fontSize: 36, fontWeight: 800, color: status === 'live' ? 'white' : 'var(--text-primary)' }}>{score.b}</span>
              </div>
            </div>
          )}
        </div>

        {/* Players Joined */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h4>Players Joined ({fixture.rsvpIds.length})</h4>
          </div>

          {fixture.rsvpIds.length > 0 ? (
            <AvatarStack playerIds={fixture.rsvpIds} max={8} />
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No players joined yet.</p>
          )}

          {/* RSVP button for members */}
          {(status === 'upcoming' || status === 'live') && (
            <div style={{ marginTop: 14 }}>
              {!currentUser.isAdmin && (
                <button
                  className={`btn ${isRsvped ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => toggleRsvp(fixture.id)}
                  style={{ maxWidth: '100%' }}
                >
                  {isRsvped ? '✓ Joined — Tap to leave' : 'Join Match'}
                </button>
              )}
            </div>
          )}

          {/* Manage teams — admin */}
          {currentUser.isAdmin && (
            <button
              className="btn"
              onClick={handleManageTeams}
              style={{
                marginTop: 12, background: 'var(--green-light)',
                color: 'var(--green-dark)', fontWeight: 600,
              }}
            >
              Manage Teams
            </button>
          )}
        </div>

        {/* Activity */}
        {fixture.rsvpIds.length > 0 && (
          <div className="card" style={{ padding: '16px 20px' }}>
            <h4 style={{ marginBottom: 12 }}>Activity</h4>
            {fixture.rsvpIds.slice(0, 3).map((id, i) => {
              const p = getPlayer(id);
              const mins = ['2h ago', '3h ago', '5h ago'][i] || 'Recently';
              return p ? (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div className="avatar">{p.initials}</div>
                  <span style={{ flex: 1, fontSize: 14 }}>
                    <strong>{p.name}</strong> joined the match
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mins}</span>
                </div>
              ) : null;
            })}
            {fixture.rsvpIds.length > 3 && (
              <button className="btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: 13, color: 'var(--green)' }}>
                View all activity
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {status === 'live' && currentUser.isAdmin && (
            <button className="btn btn-primary" onClick={handleLiveMatch}>
              📊 Manage Live Match
            </button>
          )}
          {status === 'past' && (
            <button
              className="btn"
              onClick={() => navigate('summary', { fixtureId: fixture.id })}
              style={{ background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 600 }}
            >
              View Match Summary
            </button>
          )}
          <button className="btn btn-secondary" style={{ gap: 8 }}>
            <Share2 size={16} /> Share Fixture
          </button>
        </div>

        <div style={{ height: 16 }} />
      </div>
    </>
  );
}
