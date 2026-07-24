import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyAssignedCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data?.courses || res.data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary-700">My Assigned Courses</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500">No courses assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-2 inline-block self-start rounded bg-primary-100 px-3 py-1 text-sm font-bold text-primary-700">
                {course.courseCode}
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-800">{course.courseTitle}</h3>
              <p className="mb-1 text-sm text-gray-500">
                Unit: <span className="font-medium">{course.unit ?? 'N/A'}</span>
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Department: <span className="font-medium">{course.department?.name ?? 'N/A'}</span>
              </p>
              <button
                onClick={() => navigate(`/lecturer/start-session/${course._id}`)}
                className="mt-auto rounded-lg bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                Start Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
