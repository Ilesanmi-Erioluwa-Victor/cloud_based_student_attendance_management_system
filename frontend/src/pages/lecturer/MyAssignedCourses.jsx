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

  const totalUnits = courses.reduce((s, c) => s + (c.unit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Assigned Courses</h1>
        <div className="flex gap-6 text-sm text-gray-500">
          <span><span className="font-semibold text-gray-700">{courses.length}</span> Courses</span>
          <span><span className="font-semibold text-gray-700">{totalUnits}</span> Total Units</span>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400">No courses assigned yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Course Code</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course._id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                      {course.courseCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{course.courseTitle}</td>
                  <td className="px-6 py-4 text-gray-600">{course.level ? `${course.level}L` : '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{course.unit ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{course.department?.name || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/lecturer/start-session/${course._id}`)}
                      className="rounded-lg bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
                    >
                      Start Session
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
