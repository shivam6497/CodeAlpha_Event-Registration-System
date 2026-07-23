import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Event {
  _id: string; title: string; description: string; location: string;
  date: string; capacity: number; registeredCount: number; category: string;
  organizer: { name: string; email: string };
}

export default function EventDetail() {
  const { id }   = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent]           = useState<Event | null>(null);
  const [loading, setLoading]       = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [message, setMessage]       = useState('');
  const [isError, setIsError]       = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data))
      .catch(() => setMessage('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegLoading(true); setMessage(''); setIsError(false);
    try {
      const { data } = await api.post('/registrations', { eventId: id });
      setMessage(data.message);
      setEvent(prev => prev ? { ...prev, registeredCount: prev.registeredCount + 1 } : prev);
    } catch (err: unknown) {
      setIsError(true);
      setMessage((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed.');
    } finally { setRegLoading(false); }
  };

  if (loading) return <div className="page"><div className="skeleton-card" style={{ height: 400 }} /></div>;
  if (!event)  return <div className="page"><div className="empty-state"><span className="empty-icon">🎪</span><p>{message || 'Event not found.'}</p></div></div>;

  const spotsLeft = event.capacity - event.registeredCount;
  const pct       = Math.min((event.registeredCount / event.capacity) * 100, 100);

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Events</button>
      <div className="detail-card">
        <div className="detail-header">
          <span className="event-category-badge">{event.category}</span>
          <h1 className="detail-title">{event.title}</h1>
          <p className="detail-organizer">Organized by <strong>{event.organizer.name}</strong></p>
        </div>
        <div className="detail-meta-grid">
          <div className="detail-meta-item"><span className="meta-icon">📅</span><div><p className="meta-label">Date & Time</p><p className="meta-value">{new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p></div></div>
          <div className="detail-meta-item"><span className="meta-icon">📍</span><div><p className="meta-label">Location</p><p className="meta-value">{event.location}</p></div></div>
          <div className="detail-meta-item"><span className="meta-icon">👥</span><div><p className="meta-label">Capacity</p><p className="meta-value">{event.registeredCount} / {event.capacity} registered</p></div></div>
          <div className="detail-meta-item"><span className="meta-icon">🎟</span><div><p className="meta-label">Availability</p><p className="meta-value">{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}</p></div></div>
        </div>
        <div className="capacity-bar-wrap">
          <div className="capacity-bar-bg"><div className="capacity-bar-fill" style={{ width: `${pct}%` }} /></div>
          <span className="capacity-pct">{Math.round(pct)}% full</span>
        </div>
        <div className="detail-description">
          <h2>About this Event</h2>
          <p>{event.description}</p>
        </div>
        {message && <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>{message}</div>}
        <button className="btn-primary btn-lg" onClick={handleRegister} disabled={regLoading || spotsLeft <= 0}>
          {regLoading ? <span className="spinner" /> : spotsLeft <= 0 ? 'Event Full' : user ? '🎟 Register Now' : '🔐 Login to Register'}
        </button>
      </div>
    </div>
  );
}
