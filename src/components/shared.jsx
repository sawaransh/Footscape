import { Home, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Bottom Navigation ──────────────────────────────────────────
export function BottomNav({ active, navigate }) {
  const items = [
    { key: 'home',     label: 'Home',     Icon: Home },
    { key: 'community', label: 'Community', Icon: Calendar },
    { key: 'profile',  label: 'Profile',  Icon: User },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`nav-item ${active === key ? 'active' : ''}`}
          onClick={() => navigate(key)}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Avatar helpers ─────────────────────────────────────────────
export function Avatar({ initials, size = 'sm' }) {
  return (
    <div className={`avatar ${size === 'lg' ? 'avatar-lg' : ''}`}>
      {initials}
    </div>
  );
}

export function AvatarStack({ playerIds, max = 5 }) {
  const { getPlayer } = useApp();
  const shown = playerIds.slice(0, max);
  const extra = playerIds.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map(id => {
        const p = getPlayer(id);
        return p ? <Avatar key={id} initials={p.initials} /> : null;
      })}
      {extra > 0 && (
        <div className="avatar" style={{ background: '#e5e7eb', color: '#6b7280' }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    live:      { cls: 'badge-live',     label: '● LIVE' },
    upcoming:  { cls: 'badge-upcoming', label: 'Upcoming' },
    past:      { cls: 'badge-past',     label: 'Past' },
    completed: { cls: 'badge-completed',label: 'Completed' },
  };
  const { cls, label } = map[status] || map.past;
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Fixture Tile ───────────────────────────────────────────────
export function FixtureTile({ fixture, onPress }) {
  const { getStatus, getScore } = useApp();
  const status = getStatus(fixture);
  const score = getScore(fixture);

  const date = new Date(fixture.dateTime);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div
      className="card"
      onClick={() => onPress(fixture.id)}
      style={{ padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <StatusBadge status={status} />
          <h4 style={{ marginTop: 6, marginBottom: 4 }}>{fixture.title}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              📅 {dateStr} · {timeStr}
            </span>
            {fixture.venue && (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                📍 {fixture.venue}
              </span>
            )}
          </div>
        </div>
        {status !== 'upcoming' && (fixture.teams.A.length > 0) && (
          <div style={{ textAlign: 'center', marginLeft: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              {score.a} – {score.b}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>A vs B</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AvatarStack playerIds={fixture.rsvpIds} max={5} />
          {fixture.rsvpIds.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              {fixture.rsvpIds.length} Joined
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>›</span>
      </div>
    </div>
  );
}

// ── Player Row (for team builder & stats) ─────────────────────
export function PlayerRow({ player, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <div className="avatar">{player.initials}</div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{player.name}</span>
      {children}
    </div>
  );
}

// ── Stat Counter ───────────────────────────────────────────────
export function StatCounter({ value, onDecrement, onIncrement, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={onDecrement}
        disabled={disabled || value === 0}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '1.5px solid var(--border)',
          background: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600,
          color: (disabled || value === 0) ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
      >−</button>
      <span style={{ minWidth: 20, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={disabled}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '1.5px solid var(--border)',
          background: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600,
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        }}
      >+</button>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <h3 style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 240 }}>{subtitle}</p>
      {action}
    </div>
  );
}
