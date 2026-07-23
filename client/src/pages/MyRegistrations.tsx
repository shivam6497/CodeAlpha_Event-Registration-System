import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Registration {
  _id: string;
  status: 'confirmed' | 'cancelled';
  registeredAt: string;
  event: { _id: string; title: string; date: string; location: string; category: string; };
}

export default function MyRegistrations() {
  const [regs, setRegs]             = useState<Registration[]>([]);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [message, setMessage]       = useState('');

  useEffect(() => {
    api.get('/registrations/my').then(r => setRegs(r.data)).finally(() => setLoading(false));
  }, []);

  const cancel = async (regId: string) => {
    if (!confirm('Cancel this registration?')) return;
    setCancelling(regId);
    try {
      await api.delete(`/registrations/${regId}`);
      setRegs(prev => prev.map(r => r._id === regId ? { ...r, status: 'cancelled' as const } : r));
      setMessage('Registration cancelled successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setMessage((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to cancel.');
    } finally { setCancelling(null); }
  };

  if (loading) return <div className="page"><div className="event-grid">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" />)}</div></div>;

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-title">My Tickets</h1>
        <p className="page-sub">Manage your event registrations</p>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {regs.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">🎟</span><p>No registrations yet. Browse events to get started!</p></div>
      ) : (
        <div className="reg-list">
          {regs.map(reg => (
            <div key={reg._id} className={`reg-card${reg.status === 'cancelled' ? ' cancelled' : ''}`}>
              <div className="reg-card-left">
                <span className={`status-badge ${reg.status}`}>{reg.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}</span>
                <h3 className="reg-event-title">{reg.event.title}</h3>
                <div className="reg-meta">
                  <span>📅 {new Date(reg.event.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  <span>📍 {reg.event.location}</span>
                  <span>🏷 {reg.event.category}</span>
                </div>
                <p className="reg-date">Registered: {new Date(reg.registeredAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              </div>
              {reg.status === 'confirmed' && (
                <button className="btn-danger btn-sm" onClick={() => cancel(reg._id)} disabled={cancelling === reg._id}>
                  {cancelling === reg._id ? <span className="spinner" /> : 'Cancel'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
