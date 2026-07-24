import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get('/courses');
        setCourses(courseRes.data?.courses || courseRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!courses.length) return;
    const totalStudents = new Set();
    const allSessions = [];
    courses.forEach((c) => {
      (c.students || []).forEach((s) => totalStudents.add(s._id || s));
      (c.sessions || []).forEach((s) => allSessions.push(s));
    });
    setStats({
      courseCount: courses.length,
      studentCount: totalStudents.size,
      sessionCount: allSessions.length,
    });
  }, [courses]);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Assigned Courses', value: stats?.courseCount ?? 0, color: 'bg-blue-500' },
    { label: 'Total Students Taught', value: stats?.studentCount ?? 0, color: 'bg-green-500' },
    { label: 'Recent Sessions', value: stats?.sessionCount ?? 0, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary-700">
        Welcome, {user?.firstName || 'Lecturer'}
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className={`mb-4 inline-block rounded-full ${card.color} p-3 text-white`}>
              <span className="text-xl font-bold">{card.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
      {courses.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Your Courses</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <div key={course._id} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm font-bold text-primary-600">{course.courseCode}</p>
                <p className="text-gray-700">{course.courseTitle}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
