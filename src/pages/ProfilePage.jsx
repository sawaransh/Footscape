import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/shared';

function calculateLocalStats(fixtures, playerId, getScore) {
  const stats = { appearances: 0, wins: 0, draws: 0, losses: 0, goals: 0, assists: 0, goalContributions: 0, goalsPerMatch: 0, winRate: 0 };

  fixtures.forEach((fixture) => {
    if (fixture.status !== 'completed') return;
    const team = fixture.teams.A.includes(playerId) ? 'A' : fixture.teams.B.includes(playerId) ? 'B' : null;
    if (!team) return;
    const score = getScore(fixture);
    const playerStats = fixture.stats[playerId] || { goals: 0, assists: 0 };
    stats.appearances += 1;
    stats.goals += playerStats.goals;
    stats.assists += playerStats.assists;
    if (score.a === score.b) stats.draws += 1;
    else if ((team === 'A' && score.a > score.b) || (team === 'B' && score.b > score.a)) stats.wins += 1;
    else stats.losses += 1;
  });

  stats.goalContributions = stats.goals + stats.assists;
  stats.goalsPerMatch = stats.appearances ? Number((stats.goals / stats.appearances).toFixed(2)) : 0;
  stats.winRate = stats.appearances ? Math.round((stats.wins / stats.appearances) * 1000) / 10 : 0;
  return stats;
}

export function ProfilePage({ navigate, params = {} }) {
  const { currentUser, fixtures: currentFixtures, getPlayer, getScore, logout, loadPlayerProfile, theme, toggleTheme } = useApp();
  const playerId = params.playerId || currentUser.id;
  const isOwnProfile = playerId === currentUser.id;
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const localProfile = useMemo(() => {
    const player = isOwnProfile ? currentUser : getPlayer(playerId);
    if (!player) return null;
    const fixtures = currentFixtures.filter((fixture) => fixture.status === 'completed' && (fixture.teams.A.includes(playerId) || fixture.teams.B.includes(playerId)));
    return {
      player,
      fixtures,
      stats: calculateLocalStats(fixtures, playerId, getScore),
    };
  }, [currentFixtures, currentUser, getPlayer, getScore, isOwnProfile, playerId]);

  useEffect(() => {
    let active = true;
    loadPlayerProfile(playerId).then((data) => {
      if (active) { setError(''); setProfile(data); }
    }).catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [loadPlayerProfile, playerId]);

  if (error && !localProfile) return <><div className="page-header"><button className="back-btn" onClick={() => navigate('community')}><ArrowLeft size={18} /> Back</button><h2>Profile</h2><span style={{ width: 48 }} /></div><div className="page-content"><p className="form-error">{error}</p></div><BottomNav active={isOwnProfile ? 'profile' : ''} navigate={navigate} /></>;
  if ((!profile || profile.player.id !== playerId) && !localProfile) return <div className="page-content" style={{ paddingTop: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile…</div>;

  const { player, stats, fixtures } = profile?.player.id === playerId ? profile : localProfile;
  return (
    <>
      <div className="page-header" style={{ border: 'none' }}>
        {isOwnProfile ? <span style={{ width: 34 }} /> : <button className="back-btn" onClick={() => navigate('community')}><ArrowLeft size={18} /></button>}
        <h2 style={{ fontSize: 16 }}>Profile - {player.name}</h2>
        {isOwnProfile ? <button className="btn-ghost" onClick={logout} aria-label="Log out"><LogOut size={20} color="var(--text-secondary)" /></button> : <span style={{ width: 34 }} />}
      </div>
      <div className="page-content profile-content">
        <div className="card profile-hero" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div className="avatar-xl" style={{ margin: '0 auto 12px' }}>{player.initials}</div>
          <h3>{player.name}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{player.username || '@' + player.name.toLowerCase()}</p>
          {isOwnProfile && currentUser.isAdmin && <span className="badge badge-upcoming" style={{ marginTop: 8 }}>Admin</span>}
        </div>
        {isOwnProfile && <div className="card profile-theme-card">
          <div className="profile-theme-copy">
            <span className="profile-theme-icon">{theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}</span>
            <span><strong>Light theme</strong><small>{theme === 'light' ? 'Bright background enabled' : 'Switch to a bright background'}</small></span>
          </div>
          <button className={`theme-switch ${theme === 'light' ? 'is-on' : ''}`} type="button" role="switch" aria-checked={theme === 'light'} aria-label="Toggle light theme" onClick={toggleTheme}>
            <span />
          </button>
        </div>}
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Season Stats</div>
          <div className="profile-stat-grid profile-stat-grid-primary">
            <div className="stat-box"><div className="stat-value">{stats.appearances}</div><div className="stat-label">Appearances</div></div>
            <div className="stat-box"><div className="stat-value">{stats.goalContributions}</div><div className="stat-label">Goal Contributions</div></div>
            <div className="stat-box"><div className="stat-value">{stats.winRate}%</div><div className="stat-label">Win Rate</div></div>
          </div>
          <div className="card profile-stat-detail-card">
            <div className="profile-record"><span>Record</span><strong>{stats.wins}W <i>·</i> {stats.draws}D <i>·</i> {stats.losses}L</strong></div>
            <div className="profile-stat-grid">
              <div><span>Goals</span><strong>{stats.goals}</strong></div>
              <div><span>Assists</span><strong>{stats.assists}</strong></div>
              <div><span>Goals / Match</span><strong>{stats.goalsPerMatch}</strong></div>
              <div><span>Matches Won</span><strong>{stats.wins}</strong></div>
            </div>
          </div>
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Recent Matches</div>
          {fixtures.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No past matches yet.</p> : <div className="card" style={{ overflow: 'hidden' }}>
            {fixtures.map((fixture) => {
              const score = getScore(fixture);
              const goals = fixture.stats[player.id]?.goals || 0;
              const assists = fixture.stats[player.id]?.assists || 0;
              const date = new Date(fixture.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return <button key={fixture.id} className="profile-match-row" onClick={() => navigate('summary', { fixtureId: fixture.id })}><span><strong>{date} · {fixture.title}</strong><small>{score.a} – {score.b} · Final</small></span><span className="profile-match-contribution">{goals}G · {assists}A</span></button>;
            })}
          </div>}
        </div>
      </div>
      <BottomNav active={isOwnProfile ? 'profile' : ''} navigate={navigate} />
    </>
  );
}
