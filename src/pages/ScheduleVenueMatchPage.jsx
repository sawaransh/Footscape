import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../services/api';

const defaultDateTime = () => { const value = new Date(Date.now() + 86400000); value.setMinutes(0, 0, 0); return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export function ScheduleVenueMatchPage({ navigate }) {
  const { currentUser } = useApp();
  const [access, setAccess] = useState('checking');
  const [form, setForm] = useState({ title: 'Open Turf Match', venueName: '', address: '', city: 'Gurugram', dateTime: defaultDateTime(), duration: '60', format: '5v5', sideCapacity: '5', price: '0', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  useEffect(() => {
    let active = true;
    apiRequest('/venues').then(({ canSchedule }) => {
      if (active) setAccess(canSchedule ? 'allowed' : 'denied');
    }).catch(() => {
      if (active) setAccess('error');
    });
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const { match } = await apiRequest('/venues/matches', { method: 'POST', body: JSON.stringify({ ...form, duration: Number(form.duration), sideCapacity: Number(form.sideCapacity), price: Number(form.price), dateTime: new Date(form.dateTime).toISOString() }) });
      navigate(`/venues/matches/${match.id}`);
    } catch (submitError) { setError(submitError.message); }
    finally { setBusy(false); }
  };

  return <>
    <div className="page-header"><button className="back-btn" onClick={() => navigate('venues')}><ArrowLeft size={18} /> Back</button><h2>Schedule a public match</h2><span style={{ width: 50 }} /></div>
    <main className="page-content schedule-venue-content">
      {access === 'checking' ? <div className="venue-empty venue-permission-empty"><MapPin size={24} /><strong>Checking organizer access…</strong></div> : access !== 'allowed' ? <div className="venue-empty venue-permission-empty"><MapPin size={24} /><strong>{access === 'error' ? 'Could not check organizer access' : 'Organizer access required'}</strong><span>{access === 'error' ? 'Please check your connection and try again.' : `Signed in as ${currentUser?.email || 'an unknown account'}. Public matches can currently be scheduled by the approved organizer account.`}</span><button className="btn btn-secondary" onClick={() => navigate('venues')}>Back to venues</button></div> : <>
        <div className="schedule-intro"><span className="venues-eyebrow">OPEN TO EVERYONE</span><h3>Set up the game</h3><p>Players will find this match in Venues and can book a place on either side.</p></div>
        <form className="form-surface schedule-venue-form" onSubmit={submit}>
          <div className="input-group"><label>Match name</label><input className="input-field" required maxLength="100" value={form.title} onChange={set('title')} placeholder="e.g. Friday night 5-a-side" /></div>
          <div className="schedule-form-divider"><MapPin size={16} /> VENUE DETAILS</div>
          <div className="input-group"><label>Venue name</label><input className="input-field" required maxLength="120" value={form.venueName} onChange={set('venueName')} placeholder="e.g. Lakeside Turf" /></div>
          <div className="input-group"><label>Street / sector / address</label><input className="input-field" required maxLength="240" value={form.address} onChange={set('address')} placeholder="Sector, street, or nearby landmark" /></div>
          <div className="input-group"><label>City</label><input className="input-field" required maxLength="80" value={form.city} onChange={set('city')} placeholder="Gurugram" /></div>
          <div className="schedule-form-divider">MATCH DETAILS</div>
          <div className="input-group"><label>Date and start time</label><input className="input-field" type="datetime-local" required min={defaultDateTime()} value={form.dateTime} onChange={set('dateTime')} /></div>
          <div className="schedule-two-col"><div className="input-group"><label>Format</label><select className="input-field" value={form.format} onChange={set('format')}><option>5v5</option><option>6v6</option><option>7v7</option><option>9v9</option><option>11v11</option></select></div><div className="input-group"><label>Duration</label><select className="input-field" value={form.duration} onChange={set('duration')}><option value="45">45 min</option><option value="60">60 min</option><option value="75">75 min</option><option value="90">90 min</option><option value="120">120 min</option></select></div></div>
          <div className="schedule-two-col"><div className="input-group"><label>Players per side</label><input className="input-field" type="number" required min="1" max="22" value={form.sideCapacity} onChange={set('sideCapacity')} /></div><div className="input-group"><label>Price per player (₹)</label><input className="input-field" type="number" required min="0" max="100000" value={form.price} onChange={set('price')} /></div></div>
          <div className="input-group"><label>Match notes (optional)</label><textarea className="input-field" rows="3" maxLength="500" value={form.description} onChange={set('description')} placeholder="What should players bring? Any skill level welcome?" /></div>
          <div className="venue-payment-note">Paid bookings use Razorpay checkout. If payment keys are not configured yet, this match can still be published, but players cannot book paid places until setup is complete.</div>
          {error && <p className="venue-inline-error">{error}</p>}
          <button className="btn btn-primary form-submit-button" disabled={busy}>{busy ? 'Publishing match…' : 'Publish public match'}</button>
        </form>
      </>}
      <div style={{ height: 16 }} />
    </main>
  </>;
}
