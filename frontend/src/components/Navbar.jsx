import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900">
        <span className="text-indigo-600">📚</span> EduStream
      </Link>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Browse</Link>
        {user && (
          <Link to="/dashboard" className="hover:text-gray-900">
            {user.role === 'instructor' ? 'My Courses' : 'My Learning'}
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-700">{user.name}</span>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;