import { ArrowLeft, Share } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/shared';

export function MatchSummaryPage({ params, navigate }) {
  const { getFixture, getScore, getPlayer } = useApp();
  const fixture = getFixture(params.fixtureId);

  if (!fixture) return null;
  const score = getScore(fixture);

  const date = new Date(fixture.dateTime);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const allStats = [
    ...fixture.teams.A.map(id => ({ id, team: 'A', ...fixture.stats[id] })),
    ...fixture.teams.B.map(id => ({ id, team: 'B', ...fixture.stats[id] })),
  ].sort((a, b) => ((b.goals || 0) + (b.assists || 0)) - ((a.goals || 0) + (a.assists || 0)));

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('fixture', { fixtureId: fixture.id })}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: 16 }}>Match Summary</h2>
        <button className="btn-ghost"><Share size={18} /></button>
      </div>

      <div className="page-content">
        {/* Result card */}
        <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <StatusBadge status="completed" />

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center', gap: 16, marginTop: 20, marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🟢</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Team A</div>
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{score.a}</div>
            </div>
            <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>–</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔵</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Team B</div>
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{score.b}</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {dateStr} · {timeStr}
          </p>
          {fixture.venue && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {fixture.venue}</p>
          )}
        </div>

        {/* Stats table */}
        {allStats.length > 0 && (
          <div className="card" style={{ padding: '16px 20px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', marginBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
              <span style={{
                padding: '8px 16px', fontSize: 14, fontWeight: 600,
                color: 'var(--green)', borderBottom: '2px solid var(--green)',
              }}>Overview</span>
            </div>

            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 60px',
              padding: '4px 0', marginBottom: 4,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Player</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Goals</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Assists</span>
            </div>

            {allStats.map(({ id, goals = 0, assists = 0 }) => {
              const player = getPlayer(id);
              if (!player) return null;
              return (
                <div key={id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 60px 60px',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderTop: '1px solid var(--border-light)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar">{player.initials}</div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{player.name}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, textAlign: 'center' }}>{goals}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', color: 'var(--text-secondary)' }}>{assists}</span>
                </div>
              );
            })}
          </div>
        )}

        <button
          className="btn"
          style={{ background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 600 }}
          onClick={() => navigate('home')}
        >
          Back to Home
        </button>

        <div style={{ height: 16 }} />
      </div>
    </>
  );
}
