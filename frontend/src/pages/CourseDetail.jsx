import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Get course info (from the public courses list, filter client-side for now)
      const coursesRes = await api.get('/courses');
      const foundCourse = coursesRes.data.find((c) => c._id === courseId);
      setCourse(foundCourse);

      // Try fetching lessons — this only succeeds if the student is enrolled
      try {
        const lessonsRes = await api.get(`/enrollments/${courseId}/lessons`);
        setLessons(lessonsRes.data.lessons);
        setProgress(lessonsRes.data.progress);
        setEnrolled(true);
        if (lessonsRes.data.lessons.length > 0) {
          setActiveLesson(lessonsRes.data.lessons[0]);
        }
      } catch {
        setEnrolled(false);
      }
    } catch (err) {
      setError('Failed to load course.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeEnroll = async () => {
    setEnrolling(true);
    setError('');
    try {
      await api.post(`/enrollments/free/${courseId}`);
      await fetchCourseData(); // refresh to show lessons now that we're enrolled
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaidEnroll = async () => {
    setEnrolling(true);
    setError('');
    try {
      const orderRes = await api.post('/payments/create-order', { courseId });
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'EduStream',
        description: course.title,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
            });
            await fetchCourseData();
          } catch {
            setError('Payment verification failed. Please contact support.');
          }
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment.');
    } finally {
      setEnrolling(false);
    }
  };

  const markComplete = async (lessonId) => {
    try {
      const res = await api.patch(`/enrollments/${courseId}/progress/${lessonId}`);
      setProgress(res.data.progress);
    } catch {
      // silently ignore for now — non-critical UI action
    }
  };

  const isLessonComplete = (lessonId) =>
    progress.some((p) => p.lesson === lessonId && p.completed);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!course) return <div className="p-6 text-red-600">Course not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">{course.title}</h2>
      <p className="text-gray-500 mb-1">By {course.instructor?.name}</p>
      <p className="text-gray-700 mb-4">{course.description}</p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!enrolled ? (
        <Card className="p-6 max-w-sm">
          <p className="text-lg font-semibold mb-4">
            {course.price === 0 ? 'Free' : `₹${course.price}`}
          </p>
          <Button
            onClick={course.price === 0 ? handleFreeEnroll : handlePaidEnroll}
            disabled={enrolling}
            className="w-full"
          >
            {enrolling ? 'Processing...' : 'Enroll now'}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            {activeLesson && (
              <div>
                <video
                  key={activeLesson._id}
                  controls
                  className="w-full rounded-xl bg-black aspect-video"
                  src={`http://localhost:5000/api/lessons/stream/${activeLesson._id}?token=${localStorage.getItem('token')}`}
                />
                <p className="font-medium text-gray-900 mt-3">{activeLesson.title}</p>
                <Button
                  variant="secondary"
                  className="mt-2"
                  onClick={() => markComplete(activeLesson._id)}
                  disabled={isLessonComplete(activeLesson._id)}
                >
                  {isLessonComplete(activeLesson._id) ? 'Completed ✓' : 'Mark as complete'}
                </Button>
              </div>
            )}
          </div>

          <Card className="p-4 h-fit">
            <p className="font-medium text-gray-900 mb-3">Lessons</p>
            <div className="space-y-1">
              {lessons.map((lesson) => (
                <button
                  key={lesson._id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    activeLesson?._id === lesson._id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {isLessonComplete(lesson._id) ? '✓ ' : ''}
                  {lesson.title}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;