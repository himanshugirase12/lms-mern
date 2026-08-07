import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-gray-100">
        <span className="text-indigo-600 dark:text-indigo-400">📚</span> EduStream
      </Link>

      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-100">Browse</Link>
        {user && (
          <Link to="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-100">
            {user.role === 'instructor' ? 'My Courses' : 'My Learning'}
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
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