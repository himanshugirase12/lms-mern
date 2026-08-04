import { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create course form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [creating, setCreating] = useState(false);

  // Add lesson form state
  const [lessonCourseId, setLessonCourseId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/my-courses');
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load your courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/courses', { title, description, price: Number(price) || 0 });
      setTitle('');
      setDescription('');
      setPrice('');
      setShowCreateForm(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setCreating(false);
    }
  };

  const handleUploadLesson = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', lessonTitle);
    formData.append('video', videoFile);

    try {
      await api.post(`/lessons/${lessonCourseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLessonTitle('');
      setVideoFile(null);
      setLessonCourseId(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload lesson.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">My courses</h2>
          <p className="text-sm text-gray-500">{courses.length} course{courses.length !== 1 ? 's' : ''} created</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ New course'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      {showCreateForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) — leave 0 for free
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create course'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <Card key={course._id} className="p-4">
            <p className="font-medium text-gray-900 mb-1">{course.title}</p>
            <p className="text-xs text-gray-500 mb-2">
              {course.price === 0 ? 'Free' : `₹${course.price}`} &middot; {course.lessons?.length || 0} lessons
            </p>

            {lessonCourseId === course._id ? (
              <form onSubmit={handleUploadLesson} className="space-y-2 mt-3 border-t pt-3">
                <input
                  type="text"
                  placeholder="Lesson title"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  required
                  className="w-full text-sm"
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setLessonCourseId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="secondary"
                className="mt-2"
                onClick={() => setLessonCourseId(course._id)}
              >
                + Add lesson
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InstructorDashboard;