import { useState, useEffect } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

interface Event {
  _id: string; title: string; description: string; location: string;
  date: string; capacity: number; registeredCount: number; category: string;
}

export default function Events() {
  const [events, setEvents]         = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/events/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '9' });
    if (search)   params.append('search', search);
    if (category) params.append('category', category);
    api.get(`/events?${params}`)
      .then(r => { setEvents(r.data.events); setTotalPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, page]);

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-title">Discover Events</h1>
        <p className="page-sub">Find and register for amazing events near you</p>
      </div>
      <div className="filters">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search events…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="category-tabs">
          <button className={`cat-tab${!category ? ' active' : ''}`} onClick={() => { setCategory(''); setPage(1); }}>All</button>
          {categories.map(c => (
            <button key={c} className={`cat-tab${category === c ? ' active' : ''}`} onClick={() => { setCategory(c); setPage(1); }}>{c}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="event-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
      ) : events.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">🎪</span><p>No events found. Try a different search!</p></div>
      ) : (
        <div className="event-grid">{events.map(e => <EventCard key={e._id} event={e} />)}</div>
      )}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>← Prev</button>
          <span className="page-info">{page} / {totalPages}</span>
          <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
