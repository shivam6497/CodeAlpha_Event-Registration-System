import { useState, useEffect, FormEvent } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Event {
  _id: string; title: string; date: string; location: string;
  category: string; capacity: number; registeredCount: number; isActive: boolean;
}

const CATEGORIES = ['Technology', 'Music', 'Sports', 'Business', 'Art', 'Food', 'Other'];
const emptyForm  = { title: '', description: '', location: '', date: '', capacity: '', category: 'Technology', imageUrl: '' };

export default function AdminPanel() {
  const { user }  = useAuth();
  const [events, setEvents]       = useState<Event[]>([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]     = useState('');
  const [isError, setIsError]     = useState(false);
  const [tab, setTab]             = useState<'events' | 'create'>('events');

  const fetchEvents = () => {
    setLoading(true);
    api.get('/events?limit=50').then(r => setEvents(r.data.events)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setMessage(''); setIsError(false);
    try {
      await api.post('/events', { ...form, capacity: Number(form.capacity) });
      setMessage('✅ Event created successfully!');
      setForm(emptyForm);
      fetchEvents();
      setTab('events');
    } catch (err: unknown) {
      setIsError(true);
      setMessage((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create event.');
    } finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this event?')) return;
    try { await api.delete(`/events/${id}`); fetchEvents(); }
    catch { alert('Failed to deactivate.'); }
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Logged in as <strong>{user?.name}</strong> (Admin)</p>
      </div>
      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'events' ? ' active' : ''}`} onClick={() => setTab('events')}>📋 Manage Events</button>
        <button className={`admin-tab${tab === 'create' ? ' active' : ''}`} onClick={() => setTab('create')}>➕ Create Event</button>
      </div>

      {tab === 'create' && (
        <div className="admin-form-card">
          <h2>Create New Event</h2>
          {message && <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>{message}</div>}
          <form onSubmit={handleCreate} className="admin-form">
            <div className="form-row">
              <div className="form-group"><label>Event Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="React Summit 2025" required /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description</label><textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event…" required /></div>
            <div className="form-row">
              <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Mumbai, Maharashtra" required /></div>
              <div className="form-group"><label>Date & Time</label><input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Capacity</label><input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="100" required /></div>
              <div className="form-group"><label>Image URL (optional)</label><input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></div>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Create Event'}</button>
          </form>
        </div>
      )}

      {tab === 'events' && (
        <div className="admin-event-list">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: 80 }} />)
          ) : events.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">📋</span><p>No events yet. Create one!</p></div>
          ) : events.map(ev => (
            <div key={ev._id} className={`admin-event-row${!ev.isActive ? ' inactive' : ''}`}>
              <div className="admin-event-info">
                <span className={`status-dot${ev.isActive ? ' active' : ''}`} />
                <div>
                  <p className="admin-event-title">{ev.title}</p>
                  <p className="admin-event-meta">{ev.category} • {new Date(ev.date).toLocaleDateString('en-IN')} • {ev.location} • {ev.registeredCount}/{ev.capacity} registered</p>
                </div>
              </div>
              {ev.isActive && <button className="btn-danger btn-sm" onClick={() => handleDeactivate(ev._id)}>Deactivate</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
