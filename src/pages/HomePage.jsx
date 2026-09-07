import { Bell, BellRing, CheckCheck, ChevronDown, Plus, Goal, Radio } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav, FixtureTile } from '../components/shared';


export function HomePage({ navigate }) {
  const { fixtures, currentUser, community, communities, selectCommunity, getStatus, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [showCommunities, setShowCommunities] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const upcoming = fixtures.filter(f => getStatus(f) === 'upcoming')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const live = fixtures.filter(f => getStatus(f) === 'live');

  const past = fixtures.filter(f => getStatus(f) === 'past')
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  const handleFixture = (id) => navigate('fixture', { fixtureId: id });
  const openNotification = async (notification) => {
    if (!notification.read) await markNotificationRead(notification.id);
    setShowNotifications(false);
    if (notification.communityId && notification.communityId !== community?.id) await selectCommunity(notification.communityId);
    if (notification.fixtureId) navigate('fixture', { fixtureId: notification.fixtureId });
  };

  return (
    
    <>
      {/* Header */}
      <div className="home-header" style={{
        padding: '16px 20px 12px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <img
          className="home-brand-logo"
          src="/brand/footscape-title.png"
          alt="Footscape"
        />
        <button className="btn-ghost notification-trigger" style={{ padding: 6 }} onClick={() => setShowNotifications((open) => !open)} aria-label="View notifications" aria-expanded={showNotifications}>
          {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
          {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
      </div>

      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-panel-header"><div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}</small></div>{unreadCount > 0 && <button onClick={() => markAllNotificationsRead()}><CheckCheck size={16} /> Mark all read</button>}</div>
          {notifications.length === 0 ? <p className="notification-empty">New fixtures and match reminders will appear here.</p> : <div className="notification-list">
            {notifications.map((notification) => <button className={`notification-item ${notification.read ? '' : 'is-unread'}`} key={notification.id} onClick={() => openNotification(notification)}>
              <span className="notification-dot" aria-hidden="true" />
              <span><strong>{notification.title}</strong><small>{notification.message}</small></span>
            </button>)}
          </div>}
        </div>
      )}

      <div className="page-content home-content" style={{ paddingTop: 12 }}>
        {!community ? (
          <div className="card" style={{ padding: 28, textAlign: 'center' }}>
            <div className="empty-state-icon"><Goal size={38} /></div>
            <h3>You haven’t joined any communities yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 18 }}>
              You can still use Footscape for pickup games as they become available.
            </p>
            <Link className="btn btn-primary" to="/connect">Create or Join a Community</Link>
          </div>
        ) : (
          <>
        <div className="home-welcome">
          <span className="eyebrow">PLAY · TRACK · BELONG</span>
          <h3>Good players.<br /><em>Better company.</em></h3>
          <span className="home-welcome-mark"><Goal size={40} /></span>
        </div>
        {/* Community selector */}
        <button className="community-switcher" type="button" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          cursor: 'pointer', width: '100%',
        }} onClick={() => setShowCommunities((isOpen) => !isOpen)}>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>
            {community.name}
          </span>
          <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: showCommunities ? 'rotate(180deg)' : 'none' }} />
        </button>
        {showCommunities && (
          <div className="card community-menu" style={{ marginTop: 8, padding: '8px 14px' }}>
            {communities.map((item) => (
              <button className={`community-menu-item ${item.id === community.id ? 'is-active' : ''}`} key={item.id} type="button" onClick={async () => {
                await selectCommunity(item.id);
                setShowCommunities(false);
              }}>
                {item.name}{item.id === community.id ? ' · Active' : ''}
              </button>
            ))}
            <Link className="community-menu-add" to="/connect">
              <Plus size={15} /> Create or Join Another Community
            </Link>
          </div>
        )}

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
            <div className="section-label live-section-label" style={{ marginBottom: 8 }}><Radio size={13} /> Live now</div>
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
