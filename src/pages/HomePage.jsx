import { Bell, ChevronDown, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomNav, FixtureTile } from '../components/shared';


export function HomePage({ navigate }) {
  const { fixtures, currentUser, community, getStatus } = useApp();

  const upcoming = fixtures.filter(f => getStatus(f) === 'upcoming')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const live = fixtures.filter(f => getStatus(f) === 'live');

  const past = fixtures.filter(f => getStatus(f) === 'past')
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  const handleFixture = (id) => navigate('fixture', { fixtureId: id });

  return (
    
    <>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Home</h2>
        <button className="btn-ghost" style={{ padding: 6 }}>
          <Bell size={20} color="var(--text-secondary)" />
        </button>
      </div>

      <div className="page-content" style={{ paddingTop: 12 }}>
        {!community ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>⚽</div>
            <h3>You haven’t joined any communities yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 18 }}>
              You can still use Footscape for pickup games as they become available.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('community')}>Create or Join a Community</button>
          </div>
        ) : (
          <>
        {/* Community selector */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          cursor: 'pointer', width: '100%',
        }} onClick={() => navigate('community')}>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>
            {community.name}
          </span>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </button>

        {/* Admin: Create Fixture CTA */}
        {currentUser.isAdmin && (
          <div
            onClick={() => navigate('create-fixture')}
            style={{
              background: 'linear-gradient(135deg, #3cb563 0%, #2a9149 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 4px 16px rgba(60,181,99,0.3)',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Plus size={24} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Create Fixture</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>
                Only admins can create fixtures
              </div>
            </div>
          </div>
        )}

        {/* Live matches */}
        {live.length > 0 && (
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>🔴 Live now</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {live.map(f => (
                <FixtureTile key={f.id} fixture={f} onPress={handleFixture} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming fixtures */}
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Upcoming Fixtures</div>
          {upcoming.length === 0 ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                No upcoming fixtures.
                {currentUser.isAdmin ? ' Create one above!' : ' Check back soon.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(f => (
                <FixtureTile key={f.id} fixture={f} onPress={handleFixture} />
              ))}
            </div>
          )}
        </div>

        {/* Past matches */}
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Past Matches</div>
          {past.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No past matches yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {past.map(f => (
                <FixtureTile key={f.id} fixture={f} onPress={handleFixture} />
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 8 }} />
          </>
        )}
      </div>

      <BottomNav active="home" navigate={navigate} />
    </>
  );
}
