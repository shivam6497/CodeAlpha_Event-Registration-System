import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="nav-logo-icon">◈</span>
        <span className="nav-logo-text">evently</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Events</Link>
        {user && <Link to="/my-registrations" className="nav-link">My Tickets</Link>}
        {isAdmin && <Link to="/admin" className="nav-link nav-admin">Admin</Link>}
      </div>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="nav-user">👋 {user.name.split(' ')[0]}</span>
            <button className="btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
