import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import Navbar            from './components/Navbar';
import ProtectedRoute    from './components/ProtectedRoute';
import Events            from './pages/Events';
import EventDetail       from './pages/EventDetail';
import Login             from './pages/Login';
import Register          from './pages/Register';
import MyRegistrations   from './pages/MyRegistrations';
import AdminPanel        from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"               element={<Events />} />
          <Route path="/events/:id"     element={<EventDetail />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/my-registrations" element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>} />
          <Route path="/admin"          element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
