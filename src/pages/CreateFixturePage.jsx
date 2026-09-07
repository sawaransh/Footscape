import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CreateFixturePage({ navigate }) {
  const { createFixture } = useApp();

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '',
    date: today,
    time: '19:00',
    venue: '',
    description: '',
    duration: '90',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Match name is required'); return; }
    if (!form.date) { setError('Date is required'); return; }
    if (!form.time) { setError('Start time is required'); return; }
    setError('');
    setIsSubmitting(true);
    const id = await createFixture(form);
    setIsSubmitting(false);
    if (!id) { setError('Could not create this fixture. Please try again.'); return; }
    navigate('fixture', { fixtureId: id });
  };

  return (
    <>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Create Fixture</h2>
        <div style={{ width: 60 }} />
      </div>

      <div className="page-content create-fixture-content">
        <div className="form-surface" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Match name */}
          <div className="input-group">
            <label>Match Name</label>
            <input
              className="input-field"
              placeholder="e.g. Sunday League Match"
              value={form.title}
              onChange={set('title')}
            />
          </div>

          {/* Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label>Date</label>
              <input
                className="input-field"
                type="date"
                value={form.date}
                min={today}
                onChange={set('date')}
              />
            </div>
            <div className="input-group">
              <label>Start Time</label>
              <input
                className="input-field"
                type="time"
                value={form.time}
                onChange={set('time')}
              />
            </div>
          </div>

          {/* Venue */}
          <div className="input-group">
            <label>Location</label>
            <input
              className="input-field"
              placeholder="e.g. Greenfield Turf"
              value={form.venue}
              onChange={set('venue')}
            />
          </div>

          {/* Duration */}
          <div className="input-group">
            <label>Match Duration</label>
            <select className="input-field" value={form.duration} onChange={set('duration')}>
              <option value="60">60 minutes</option>
              <option value="75">75 minutes</option>
              <option value="90">90 minutes</option>
              <option value="105">105 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          {/* Description */}
          <div className="input-group">
            <label>Description (Optional)</label>
            <textarea
              className="input-field"
              placeholder="Add any notes..."
              value={form.description}
              onChange={set('description')}
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 500 }}>{error}</p>
          )}

          <button className="btn btn-primary form-submit-button" onClick={handleSubmit} disabled={isSubmitting}
            style={{ marginTop: 4, padding: '16px' }}>
            {isSubmitting ? 'Creating Fixture…' : 'Create Fixture'}
          </button>
        </div>
        <div style={{ height: 16 }} />
      </div>
    </>
  );
}
