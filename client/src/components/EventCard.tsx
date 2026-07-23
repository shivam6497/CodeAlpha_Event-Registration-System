import { Link } from 'react-router-dom';

interface Event {
  _id: string; title: string; description: string; location: string;
  date: string; capacity: number; registeredCount: number; category: string;
}

const categoryColors: Record<string, string> = {
  Technology: '#7c3aed', Music: '#db2777', Sports: '#059669',
  Business: '#d97706', Art: '#2563eb', Food: '#dc2626', Other: '#6b7280',
};

export default function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.capacity - event.registeredCount;
  const isFull    = spotsLeft <= 0;
  const color     = categoryColors[event.category] || '#7c3aed';
  const pct       = Math.min((event.registeredCount / event.capacity) * 100, 100);

  return (
    <div className="event-card">
      <div className="event-card-banner" style={{ background: `linear-gradient(135deg,${color}33,${color}11)`, borderColor: `${color}44` }}>
        <span className="event-category-badge" style={{ background: `${color}22`, color, borderColor: `${color}44` }}>
          {event.category}
        </span>
        <span className={`event-spots${isFull ? ' full' : spotsLeft <= 5 ? ' low' : ''}`}>
          {isFull ? '🔴 Full' : spotsLeft <= 5 ? `⚠️ ${spotsLeft} left` : `✅ ${spotsLeft} spots`}
        </span>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">{event.description.slice(0, 90)}…</p>
        <div className="event-card-meta">
          <span>📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>📍 {event.location}</span>
        </div>
      </div>
      <div className="event-card-footer">
        <div className="event-capacity-bar">
          <div className="event-capacity-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <Link to={`/events/${event._id}`} className="btn-primary btn-sm">View →</Link>
      </div>
    </div>
  );
}
