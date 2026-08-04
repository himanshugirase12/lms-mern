import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Card from '../components/Card';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        setEnrollments(res.data);
      } catch (err) {
        setError('Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">My learning</h2>
      <p className="text-sm text-gray-500 mb-6">
        {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
      </p>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/" className="text-indigo-600 font-medium hover:underline">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <Link key={enrollment._id} to={`/courses/${enrollment.course._id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow h-full">
                <div className="h-20 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">📘</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{enrollment.course.title}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {enrollment.completedCount} of {enrollment.totalLessons} lessons
                </p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${enrollment.percentComplete}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {enrollment.percentComplete}% complete
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;