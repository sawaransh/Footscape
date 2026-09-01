import { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCounter } from '../components/shared';

export function LiveMatchPage({ params, navigate }) {
  const { getFixture, updateStat, getScore, getElapsed, getPlayer, currentUser, endMatch } = useApp();
  const fixture = getFixture(params.fixtureId);
  const [, setTimerTick] = useState(0);
  const [tab, setTab] = useState('stats');

  // Tick elapsed time every 30s
  useEffect(() => {
    const timer = setInterval(() => setTimerTick(tick => tick + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!fixture) return null;

  const score = getScore(fixture);
  const elapsed = getElapsed(fixture);

  const StatRow = ({ playerId, team }) => {
    const player = getPlayer(playerId);
    if (!player) return null;
    const stats = fixture.stats[playerId] || { goals: 0, assists: 0 };
    const isAdmin = currentUser.isAdmin;

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid var(--border-light)',
        gap: 8,
      }}>
        {/* Player */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar">{player.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{player.name}</div>
            <div style={{ fontSize: 11, color: team === 'A' ? 'var(--blue)' : '#ef4444', fontWeight: 600 }}>
              Team {team}
            </div>
          </div>
        </div>

        {/* Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Goals</span>
          {isAdmin ? (
            <StatCounter
              value={stats.goals}
              onDecrement={() => updateStat(fixture.id, playerId, 'goals', -1)}
              onIncrement={() => updateStat(fixture.id, playerId, 'goals', 1)}
            />
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700 }}>{stats.goals}</span>
          )}
        </div>

        {/* Assists */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assists</span>
          {isAdmin ? (
            <StatCounter
              value={stats.assists}
              onDecrement={() => updateStat(fixture.id, playerId, 'assists', -1)}
              onIncrement={() => updateStat(fixture.id, playerId, 'assists', 1)}
            />
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700 }}>{stats.assists}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Dark header */}
      <div style={{
        background: '#0d1f0f',
        padding: '16px 20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={() => navigate('fixture', { fixtureId: fixture.id })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={18} />
          </button>
          <span style={{
            background: '#ef4444', color: 'white',
            padding: '4px 12px', borderRadius: 20,
            fontSize: 11, fontWeight: 800, letterSpacing: 1,
          }}>LIVE</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#3cb563', fontVariantNumeric: 'tabular-nums' }}>
            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
          </div>
        </div>

        {/* Score */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', gap: 16,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Team A</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1 }}>{score.a}</div>
          </div>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>–</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Team B</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1 }}>{score.b}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {['stats', 'events'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '13px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
              color: tab === t ? 'var(--green)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--green)' : '2px solid transparent',
              textTransform: 'capitalize',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="page-content" style={{ paddingTop: 8 }}>
        {tab === 'stats' && (
          <>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              padding: '6px 0', borderBottom: '2px solid var(--border)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Player</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase' }}>Goals</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase' }}>Assists</span>
            </div>

            {fixture.teams.A.length === 0 && fixture.teams.B.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 24 }}>
                Teams not assigned yet.{' '}
                {currentUser.isAdmin && (
                  <span
                    style={{ color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => navigate('manage-teams', { fixtureId: fixture.id })}
                  >
                    Manage teams →
                  </span>
                )}
              </p>
            ) : (
              <>
                {fixture.teams.A.map(id => <StatRow key={id} playerId={id} team="A" />)}
                {fixture.teams.B.map(id => <StatRow key={id} playerId={id} team="B" />)}
              </>
            )}
          </>
        )}

        {tab === 'events' && (
          <div style={{ padding: '16px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Match events will appear here.</p>
          </div>
        )}

        {/* End match button */}
        {currentUser.isAdmin && (
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={async () => {
              await endMatch(fixture.id);
              navigate('summary', { fixtureId: fixture.id });
            }}
          >
            End Match
          </button>
        )}

        <div style={{ height: 16 }} />
      </div>
    </>
  );
}
