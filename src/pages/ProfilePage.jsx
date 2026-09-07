import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/shared';

export function ProfilePage({ navigate, params = {} }) {
  const { currentUser, fixtures: currentFixtures, getPlayer, getStatus, getScore, logout, loadPlayerProfile } = useApp();
  const playerId = params.playerId || currentUser.id;
  const isOwnProfile = playerId === currentUser.id;
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const localProfile = useMemo(() => {
    const player = isOwnProfile ? currentUser : getPlayer(playerId);
    if (!player) return null;
    const fixtures = currentFixtures.filter((fixture) => getStatus(fixture) === 'past' && fixture.rsvpIds.includes(playerId));
    return {
      player,
      fixtures,
      stats: fixtures.reduce((totals, fixture) => ({
        matches: totals.matches + 1,
        goals: totals.goals + (fixture.stats[playerId]?.goals || 0),
        assists: totals.assists + (fixture.stats[playerId]?.assists || 0),
      }), { matches: 0, goals: 0, assists: 0 }),
    };
  }, [currentFixtures, currentUser, getPlayer, getStatus, isOwnProfile, playerId]);

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
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Season Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div className="stat-box"><div className="stat-value">{stats.matches}</div><div className="stat-label">Matches</div></div>
            <div className="stat-box"><div className="stat-value">{stats.goals}</div><div className="stat-label">Goals</div></div>
            <div className="stat-box"><div className="stat-value">{stats.assists}</div><div className="stat-label">Assists</div></div>
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
