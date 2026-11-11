import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react';
import { BottomNav } from '../components/shared';
import { apiRequest } from '../services/api';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const timeLabel = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const fullDate = (date) => new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function VenueMatchPage({ navigate, params }) {
  const [match, setMatch] = useState(null);
  const [paymentConfigured, setPaymentConfigured] = useState(false);
  const [side, setSide] = useState('A');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const data = await apiRequest(`/venues/matches/${params.matchId}`);
    setMatch(data.match); setPaymentConfigured(data.paymentConfigured);
  }, [params.matchId]);

  useEffect(() => {
    let active = true;
    apiRequest(`/venues/matches/${params.matchId}`).then((data) => {
      if (active) { setMatch(data.match); setPaymentConfigured(data.paymentConfigured); }
    }).catch((error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.matchId]);

  const book = async () => {
    setBusy(true); setMessage('');
    try {
      const result = await apiRequest(`/venues/matches/${match.id}/bookings`, { method: 'POST', body: JSON.stringify({ side }) });
      if (!result.order) { setMatch(result.match); setMessage(`You're in! Side ${side} is yours.`); return; }
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load secure checkout. Check your connection and try again.');
      const checkout = new window.Razorpay({
        key: result.order.keyId,
        amount: result.order.amount,
        currency: result.order.currency,
        name: 'Footscape',
        description: `${match.title} · Side ${side}`,
        order_id: result.order.id,
        theme: { color: '#54e879' },
        handler: async (payment) => {
          try {
            const verified = await apiRequest(`/venues/matches/${match.id}/bookings/verify`, { method: 'POST', body: JSON.stringify({ bookingId: result.bookingId, ...payment }) });
            setMatch(verified.match); setMessage(`Payment confirmed. You're on Side ${side}!`);
          } catch (error) { setMessage(error.message); await refresh(); }
        },
        modal: { ondismiss: () => { setBusy(false); setMessage('Checkout closed. Your place is held for 15 minutes while you complete payment.'); } },
      });
      checkout.on('payment.failed', (response) => setMessage(response.error?.description || 'Payment did not go through. Try again.'));
      checkout.open();
      return;
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="page-content"><div className="venue-empty">Loading match…</div></div>;
  if (!match) return <><div className="page-header"><button className="back-btn" onClick={() => navigate('venues')}><ArrowLeft size={18} /> Venues</button></div><main className="page-content"><div className="venue-empty"><strong>Match unavailable</strong><span>{message || 'This public match could not be found.'}</span></div></main></>;

  const sideA = match.bookings.filter((booking) => booking.side === 'A');
  const sideB = match.bookings.filter((booking) => booking.side === 'B');
  const joinedIds = [...sideA, ...sideB].map((booking) => booking.userId);
  const confirmed = Boolean(match.myBooking === 'confirmed');
  const started = new Date(match.dateTime) <= new Date();
  const full = sideA.length >= match.sideCapacity && sideB.length >= match.sideCapacity;
  const selectedFull = (side === 'A' ? sideA : sideB).length >= match.sideCapacity;

  return <>
    <div className="page-header"><button className="back-btn" onClick={() => navigate('venues')}><ArrowLeft size={18} /> Venues</button><span className="venue-detail-header-label">PUBLIC MATCH</span><span style={{ width: 50 }} /></div>
    <main className="page-content venue-detail-content">
      <section className="venue-detail-hero"><div className="venue-detail-hero-shade" /><div className="venue-detail-hero-content"><span className="venue-format-pill">{match.format}</span><span className="venue-verified"><ShieldCheck size={14} /> OPEN MATCH</span><h1>{match.title}</h1><p><MapPin size={15} /> {match.venueName} · {match.city}</p></div></section>
      <section className="venue-detail-summary card"><h2>{match.venueName}</h2><p className="venue-detail-address"><MapPin size={15} /> {match.address}, {match.city}</p><div className="venue-detail-chips"><span><CalendarDays size={14} /> {fullDate(match.dateTime)}</span><span><Clock3 size={14} /> {timeLabel(match.dateTime)} · {match.duration} min</span></div><div className="venue-detail-price"><strong>{match.price ? `₹${match.price}` : 'Free'}</strong><span>per player</span><span className="venue-detail-price-sep">·</span><span>{match.format}</span></div>{match.description && <p className="venue-description">{match.description}</p>}</section>

      <section className="venue-side-section"><div className="section-label">CHOOSE YOUR SIDE</div><div className="venue-side-grid">{[['A', sideA], ['B', sideB]].map(([key, players]) => {
        const sideFull = players.length >= match.sideCapacity;
        return <button key={key} className={`venue-side-card ${side === key ? 'selected' : ''} ${sideFull ? 'is-full' : ''}`} disabled={sideFull || confirmed} onClick={() => setSide(key)}>
          <span className="venue-side-title">SIDE {key}</span><strong>{players.length}<small> / {match.sideCapacity}</small></strong><span className="venue-side-bar"><i style={{ width: `${Math.min(players.length / match.sideCapacity * 100, 100)}%` }} /></span><span className="venue-side-availability">{sideFull ? 'FULL' : `${match.sideCapacity - players.length} spots left`}</span>
        </button>;
      })}</div></section>

      <section className="venue-attendees-section"><div className="section-label">PLAYERS JOINED <span>{joinedIds.length} / {match.sideCapacity * 2}</span></div><div className="venue-attendee-card card">{[['A', sideA], ['B', sideB]].map(([key, players]) => <div className="venue-attendee-side" key={key}><strong>Side {key}</strong><div>{players.length ? players.map((player) => <span className="venue-attendee" key={player.id}><i>{player.name.slice(0, 1).toUpperCase()}</i>{player.name}{player.userId === match.createdBy && <small>HOST</small>}</span>) : <span className="venue-attendee-empty">Waiting for players</span>}</div></div>)}</div></section>

      <section className="venue-trust-row"><span><Users size={16} /> {joinedIds.length} players in this game</span><span><ShieldCheck size={16} /> Secure booking</span></section>
      {message && <p className={`venue-booking-message ${message.startsWith("You're in") || message.startsWith('Payment confirmed') ? 'success' : ''}`}>{message}</p>}
      {match.myBooking === 'pending' && <p className="venue-pending-note">Your payment is still pending. Complete checkout again to claim your place.</p>}
      {match.price > 0 && !paymentConfigured && !confirmed && <p className="venue-pending-note">Secure payment checkout is being set up for this app.</p>}
      <button className="venue-book-button" onClick={book} disabled={busy || confirmed || started || full || selectedFull || (match.price > 0 && !paymentConfigured)}>{confirmed ? <><Check size={20} /> YOU'RE BOOKED · SIDE {match.mySide}</> : busy ? 'Opening secure checkout…' : started ? 'MATCH STARTED' : full ? 'MATCH FULL' : selectedFull ? `SIDE ${side} FULL` : match.price ? `BOOK SIDE ${side} · ₹${match.price}` : `JOIN SIDE ${side} · FREE`}</button>
      <p className="venue-payment-caption">{match.price ? 'Secure checkout powered by Razorpay' : 'Your booking is confirmed right away'}</p>
      <div style={{ height: 16 }} />
    </main>
    <BottomNav active="venues" navigate={navigate} />
  </>;
}
