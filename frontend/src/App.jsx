import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetail from './pages/CourseDetail';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import { useAuth } from './context/AuthContext';

function App() {

  const Dashboard = () => {
    const { user } = useAuth();
    return user?.role === 'instructor' ? <InstructorDashboard /> : <StudentDashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<BrowseCourses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        
        </Routes>
    </div>
  );
}

export default App;