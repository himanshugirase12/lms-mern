import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Card from '../components/Card';

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Browse courses</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {courses.length} course{courses.length !== 1 ? 's' : ''} available
      </p>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link key={course._id} to={`/courses/${course._id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow h-full">
              <div className="h-24 bg-indigo-50 dark:bg-indigo-950 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                  src={`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📘</span>
                )}
              </div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{course.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  By {course.instructor?.name || 'Unknown instructor'}
                </p>
                <p className="font-medium text-sm">
                  {course.price === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span className="text-blue-700">₹{course.price}</span>
                  )}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;