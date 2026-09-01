import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/shared';

export function ProfilePage({ navigate }) {
  const { currentUser, fixtures, getStatus, getScore, logout } = useApp();

  const myMatches = fixtures.filter(f =>
    getStatus(f) === 'past' && f.rsvpIds.includes(currentUser.id)
  );

  const totalGoals = myMatches.reduce((sum, f) => sum + (f.stats[currentUser.id]?.goals || 0), 0);
  const totalAssists = myMatches.reduce((sum, f) => sum + (f.stats[currentUser.id]?.assists || 0), 0);

  return (
    <>
      <div className="page-header" style={{ border: 'none' }}>
        <h2 style={{ fontSize: 18 }}>Profile</h2>
        <button className="btn-ghost" onClick={logout}>
          <LogOut size={20} color="var(--text-secondary)" />
        </button>
      </div>

      <div className="page-content">
        {/* Profile card */}
        <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div className="avatar-xl" style={{ margin: '0 auto 12px' }}>
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <h3>{currentUser.name}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
            {currentUser.username || '@' + currentUser.name.toLowerCase()}
          </p>
          {currentUser.isAdmin && (
            <span className="badge badge-upcoming" style={{ marginTop: 8 }}>Admin</span>
          )}
        </div>

        {/* Season stats */}
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Season Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div className="stat-box">
              <div className="stat-value">{myMatches.length}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalGoals}</div>
              <div className="stat-label">Goals</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalAssists}</div>
              <div className="stat-label">Assists</div>
            </div>
          </div>
        </div>

        {/* Recent matches */}
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Recent Matches</div>
          {myMatches.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No past matches yet.</p>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {myMatches.slice(0, 5).map((f, i) => {
                const score = getScore(f);
                const myGoals = f.stats[currentUser.id]?.goals || 0;
                const myAssists = f.stats[currentUser.id]?.assists || 0;
                const date = new Date(f.dateTime);
                const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return (
                  <div
                    key={f.id}
                    onClick={() => navigate('summary', { fixtureId: f.id })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: i < myMatches.length - 1 ? '1px solid var(--border-light)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>
                        {dateStr} vs {f.title.replace('Match','').trim() || 'Team'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {score.a} – {score.b} · Final
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {myGoals > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                          {myGoals} Goal{myGoals !== 1 ? 's' : ''}
                        </span>
                      )}
                      {myAssists > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block' }}>
                          {myAssists} Assist{myAssists !== 1 ? 's' : ''}
                        </span>
                      )}
                      {myGoals === 0 && myAssists === 0 && (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>0 Goals</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 8 }} />
      </div>

      <BottomNav active="profile" navigate={navigate} />
    </>
  );
}
