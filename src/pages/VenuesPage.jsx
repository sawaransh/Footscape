import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, MapPin, Plus, Search, Users } from 'lucide-react';
import { BottomNav } from '../components/shared';
import { apiRequest } from '../services/api';

const timeLabel = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

export function VenuesPage({ navigate }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [venues, setVenues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [canSchedule, setCanSchedule] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (city.trim()) params.set('city', city.trim());
        const [venueData, matchData] = await Promise.all([
          apiRequest(`/venues?${params}`),
          apiRequest(`/venues/matches?${params}`),
        ]);
        if (active) { setVenues(venueData.venues); setCanSchedule(venueData.canSchedule); setMatches(matchData.matches); setError(''); }
      } catch (loadError) { if (active) setError(loadError.message); }
    }, 180);
    return () => { active = false; clearTimeout(timer); };
  }, [query, city]);

  const cities = useMemo(() => [...new Set(venues.map((venue) => venue.city))].sort(), [venues]);

  return <>
    <div className="page-header venues-header">
      <div><span className="venues-eyebrow">PLAY OUTSIDE YOUR CREW</span><h2>Venues</h2></div>
      {canSchedule && <button className="btn btn-primary venues-create" onClick={() => navigate('/venues/schedule')}><Plus size={16} /> Schedule</button>}
    </div>
    <main className="page-content venues-content">
      <section className="venues-hero">
        <div><span className="eyebrow">FIND YOUR NEXT GAME</span><h3>Good games.<br /><em>New faces.</em></h3><p>Find a pitch, pick a side, and join the lineup.</p></div>
        <MapPin size={32} />
      </section>
      <label className="venue-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search venues, matches, or areas" /></label>
      <div className="venue-filter-row">
        <label className="venue-city-select"><MapPin size={15} /><select value={city} onChange={(event) => setCity(event.target.value)}><option value="">All cities</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <span>{matches.length} upcoming {matches.length === 1 ? 'match' : 'matches'}</span>
      </div>

      <section className="venue-section">
        <div className="section-label">UPCOMING MATCHES</div>
        {matches.length ? <div className="venue-match-list">{matches.map((match) => {
          const countA = match.bookings.filter((booking) => booking.side === 'A').length;
          const countB = match.bookings.filter((booking) => booking.side === 'B').length;
          return <button className="venue-match-card" key={match.id} onClick={() => navigate(`/venues/matches/${match.id}`)}>
            <div className="venue-date-block"><strong>{new Date(match.dateTime).getDate()}</strong><span>{new Date(match.dateTime).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span></div>
            <div className="venue-match-info"><div className="venue-match-title-row"><h3>{match.title}</h3><span className="venue-open-badge">OPEN</span></div>
              <p><MapPin size={13} /> {match.venueName} · {match.city}</p>
              <div className="venue-match-meta"><span><Clock3 size={13} /> {timeLabel(match.dateTime)} · {match.duration} min</span><span><Users size={13} /> {countA + countB}/{match.sideCapacity * 2}</span></div>
              <div className="venue-match-bottom"><strong>{match.price ? `₹${match.price} / player` : 'Free to play'}</strong><span>Side A {countA}/{match.sideCapacity} · Side B {countB}/{match.sideCapacity} <ArrowRight size={14} /></span></div>
            </div>
          </button>;
        })}</div> : <div className="venue-empty"><CalendarDays size={22} /><strong>No public matches yet</strong><span>{canSchedule ? 'Schedule the first one and it will appear here.' : 'Check back soon for games around you.'}</span></div>}
      </section>

      <section className="venue-section">
        <div className="section-label">PITCHES & VENUES <span>{venues.length}</span></div>
        {error && <p className="venue-inline-error">{error}</p>}
        {venues.length ? <div className="venue-directory">{venues.map((venue) => <button className="venue-directory-card" key={venue.id} onClick={() => setQuery(venue.name)}>
          <div className="venue-place-icon"><MapPin size={18} /></div><div className="venue-directory-info"><strong>{venue.name}</strong><span>{venue.address}, {venue.city}</span><small>{venue.upcomingCount ? `${venue.upcomingCount} upcoming ${venue.upcomingCount === 1 ? 'match' : 'matches'}` : 'No upcoming matches'}</small></div><ArrowRight size={16} />
        </button>)}</div> : !error && <p className="venue-directory-empty">Venues will show here as public games are scheduled.</p>}
      </section>
      <div style={{ height: 8 }} />
    </main>
    <BottomNav active="venues" navigate={navigate} />
  </>;
}
