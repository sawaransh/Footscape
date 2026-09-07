import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, MessageSquarePlus, MoreHorizontal, Pause, Play, Send, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCounter } from '../components/shared';

const formatTime = (seconds = 0) => [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((value) => String(value).padStart(2, '0')).join(':');

function LiveTimer({ fixture, getElapsed, isPaused }) {
  const [elapsed, setElapsed] = useState(() => getElapsed(fixture));

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(() => setElapsed(getElapsed(fixture)), 1000);
    return () => clearInterval(timer);
  }, [fixture, getElapsed, isPaused]);

  return <div className="live-timer"><Clock3 size={17} /> {formatTime(elapsed)}</div>;
}

export function LiveMatchPage({ params, navigate }) {
  const { getFixture, updateStat, getScore, getElapsed, getPlayer, currentUser, setTimerPaused, addMatchEvent, endMatch } = useApp();
  const fixture = getFixture(params.fixtureId);
  const [tab, setTab] = useState('stats');
  const [customEvent, setCustomEvent] = useState('');
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [timerBusy, setTimerBusy] = useState(false);
  const [eventError, setEventError] = useState('');

  if (!fixture) return null;
  const score = getScore(fixture);
  const isPaused = Boolean(fixture.timer?.paused);
  const events = [...(fixture.events || [])].sort((a, b) => b.elapsedSeconds - a.elapsedSeconds);

  const saveCustomEvent = async (event) => {
    event.preventDefault();
    if (!customEvent.trim()) return;
    setIsSavingEvent(true);
    setEventError('');
    try { await addMatchEvent(fixture.id, customEvent); setCustomEvent(''); }
    catch (error) { setEventError(error.message || 'Could not add this event.'); }
    finally { setIsSavingEvent(false); }
  };
  const toggleTimer = async () => {
    setTimerBusy(true);
    try { await setTimerPaused(fixture.id, !isPaused); }
    finally { setTimerBusy(false); }
  };

  const StatRow = ({ playerId, team }) => {
    const player = getPlayer(playerId);
    if (!player) return null;
    const stats = fixture.stats[playerId] || { goals: 0, assists: 0 };
    return <div className="live-stat-row">
      <div className="live-player"><div className="avatar">{player.initials}</div><div><div>{player.name}</div><small className={team === 'A' ? 'team-a-text' : 'team-b-text'}>Team {team}</small></div></div>
      <div className="live-stat"><span>Goals</span>{currentUser.isAdmin ? <StatCounter value={stats.goals} onDecrement={() => updateStat(fixture.id, playerId, 'goals', -1)} onIncrement={() => updateStat(fixture.id, playerId, 'goals', 1)} /> : <strong>{stats.goals}</strong>}</div>
      <div className="live-stat"><span>Assists</span>{currentUser.isAdmin ? <StatCounter value={stats.assists} onDecrement={() => updateStat(fixture.id, playerId, 'assists', -1)} onIncrement={() => updateStat(fixture.id, playerId, 'assists', 1)} /> : <strong>{stats.assists}</strong>}</div>
    </div>;
  };

  return <>
    <div className="live-header">
      <div className="live-topbar"><button onClick={() => navigate('fixture', { fixtureId: fixture.id })}><ArrowLeft size={19} /></button><span className="live-badge">LIVE</span><MoreHorizontal size={20} /></div>
      <div className="live-timer-wrap"><LiveTimer key={`${fixture.id}:${fixture.timer?.pausedAt || ''}:${fixture.timer?.pausedDurationSeconds || 0}`} fixture={fixture} getElapsed={getElapsed} isPaused={isPaused} />{isPaused && <span className="timer-paused">PAUSED</span>}</div>
      {currentUser.isAdmin && <button className={`timer-control ${isPaused ? 'resume' : 'pause'}`} onClick={toggleTimer} disabled={timerBusy}>{isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}{timerBusy ? 'Saving…' : isPaused ? 'Resume timer' : 'Pause timer'}</button>}
      <div className="live-score"><div><small>Team A</small><strong>{score.a}</strong></div><span>–</span><div><small>Team B</small><strong>{score.b}</strong></div></div>
    </div>

    <div className="live-tabs">{['stats', 'events'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item === 'stats' ? 'Stats' : `Events${events.length ? ` (${events.length})` : ''}`}</button>)}</div>
    <div className="page-content live-content">
      {tab === 'stats' && <>
        <div className="live-table-heading"><span>Player</span><span>Goals</span><span>Assists</span></div>
        {fixture.teams.A.length === 0 && fixture.teams.B.length === 0 ? <p className="live-empty">Teams have not been assigned yet.</p> : <>{fixture.teams.A.map((id) => <StatRow key={id} playerId={id} team="A" />)}{fixture.teams.B.map((id) => <StatRow key={id} playerId={id} team="B" />)}</>}
      </>}
      {tab === 'events' && <>
        {currentUser.isAdmin && <form className="event-composer" onSubmit={saveCustomEvent}><MessageSquarePlus size={18} /><input value={customEvent} onChange={(event) => setCustomEvent(event.target.value)} maxLength={240} placeholder="Add a match update…" /><button type="submit" disabled={isSavingEvent || !customEvent.trim()} aria-label="Add event"><Send size={16} /></button></form>}
        {eventError && <p className="live-event-error">{eventError}</p>}
        {events.length === 0 ? <div className="live-empty"><Trophy size={25} /><p>No events yet. Goals and admin updates will appear here.</p></div> : <div className="event-list">{events.map((item) => <div className={`event-item ${item.type}`} key={item.id}><span className="event-time">{formatTime(item.elapsedSeconds)}</span><span><strong>{item.type === 'goal' ? 'GOAL' : 'MATCH UPDATE'}</strong><p>{item.message}</p></span></div>)}</div>}
      </>}
      {currentUser.isAdmin && <button className="btn btn-primary live-end-button" onClick={async () => { await endMatch(fixture.id); navigate('summary', { fixtureId: fixture.id }); }}>End Match</button>}
    </div>
  </>;
}
