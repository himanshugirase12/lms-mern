import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetail from './pages/CourseDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<BrowseCourses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
      </Routes>
    </div>
  );
}

export default App;