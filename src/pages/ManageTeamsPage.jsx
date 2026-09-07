import { useState } from 'react';
import { ArrowLeft, Check, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ManageTeamsPage({ params, navigate }) {
  const { getFixture, assignTeam, getPlayer } = useApp();
  const fixture = getFixture(params.fixtureId);
  const [saved, setSaved] = useState(false);

  if (!fixture) return null;

  // Players who RSVPed
  const rsvpPlayers = fixture.rsvpIds.map(id => getPlayer(id)).filter(Boolean);

  // Categorise each
  const getTeam = (id) => {
    if (fixture.teams.A.includes(id)) return 'A';
    if (fixture.teams.B.includes(id)) return 'B';
    return null;
  };

  const unassigned = rsvpPlayers.filter(p => getTeam(p.id) === null);
  const teamA = rsvpPlayers.filter(p => getTeam(p.id) === 'A');
  const teamB = rsvpPlayers.filter(p => getTeam(p.id) === 'B');

  const handleAssign = (playerId, team) => {
    setSaved(false);
    if (getTeam(playerId) === team) {
      assignTeam(fixture.id, playerId, null); // remove
    } else {
      assignTeam(fixture.id, playerId, team);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('fixture', { fixtureId: fixture.id }), 800);
  };

  const PlayerCard = ({ player }) => {
    const team = getTeam(player.id);
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr 32px 8px 32px',
        alignItems: 'center',
        gap: 6,
        padding: '8px 0',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {/* ← A button */}
        <button
          onClick={() => handleAssign(player.id, 'A')}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1.5px solid ${team === 'A' ? 'var(--blue)' : 'var(--border)'}`,
            background: team === 'A' ? '#eff6ff' : 'none',
            color: team === 'A' ? 'var(--blue)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 700, fontSize: 13,
          }}
        >A</button>

        {/* Player info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar">{player.initials}</div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{player.name}</span>
        </div>

        {/* VS label */}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>VS</span>

        {/* spacer */}
        <div />

        {/* B → button */}
        <button
          onClick={() => handleAssign(player.id, 'B')}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1.5px solid ${team === 'B' ? '#ef4444' : 'var(--border)'}`,
            background: team === 'B' ? '#fef2f2' : 'none',
            color: team === 'B' ? '#ef4444' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 700, fontSize: 13,
          }}
        >B</button>
      </div>
    );
  };

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('fixture', { fixtureId: fixture.id })}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: 16 }}>Manage Teams</h2>
        <button
          onClick={handleSave}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--green)', fontWeight: 700, fontSize: 15,
          }}
        >
          {saved ? <><Check size={15} /> Saved</> : 'Save'}
        </button>
      </div>

      <div className="page-content">
        {/* Team counters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
          <div style={{
            background: '#eff6ff', borderRadius: 'var(--radius-md)',
            padding: '12px', textAlign: 'center',
            border: '1.5px solid #bfdbfe',
          }}>
            <div style={{ color: 'var(--blue)', fontWeight: 800, fontSize: 22 }}>{teamA.length}</div>
            <div style={{ color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}>Team A</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
            {unassigned.length} left
          </div>
          <div style={{
            background: '#fef2f2', borderRadius: 'var(--radius-md)',
            padding: '12px', textAlign: 'center',
            border: '1.5px solid #fecaca',
          }}>
            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: 22 }}>{teamB.length}</div>
            <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Team B</div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 32px 8px 32px',
          gap: 6, paddingBottom: 4,
          borderBottom: '2px solid var(--border)',
        }}>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>A</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', paddingLeft: 8 }}>Player</div>
          <div />
          <div />
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>B</div>
        </div>

        {/* Player list */}
        {rsvpPlayers.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No players have joined this match yet.</p>
          </div>
        ) : (
          <div>
            {rsvpPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        )}

        {/* Hint */}
        {rsvpPlayers.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '12px', background: 'var(--surface-2)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <Info className="info-icon" size={17} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Tap A or B next to each player to assign them. Tap again to unassign.
            </p>
          </div>
        )}

        {/* Save button */}
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><Check size={17} /> Teams Saved!</> : 'Save Teams'}
        </button>

        <div style={{ height: 16 }} />
      </div>
    </>
  );
}
