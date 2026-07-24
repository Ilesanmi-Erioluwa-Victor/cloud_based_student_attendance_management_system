import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get('/courses');
        const allCourses = courseRes.data?.courses || courseRes.data || [];
        setCourses(allCourses);

        const allSessions = [];
        await Promise.allSettled(
          allCourses.map(async (course) => {
            const res = await api.get(`/attendance/sessions/course/${course._id}`);
            const courseSessions = (res.data || []).map((s) => ({
              ...s,
              courseCode: course.courseCode,
              courseTitle: course.courseTitle,
            }));
            allSessions.push(...courseSessions);
          })
        );
        allSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setSessions(allSessions);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalUnits = courses.reduce((sum, c) => sum + (c.unit || 0), 0);
  const deptCourses = {};
  courses.forEach((c) => {
    const dept = c.department?.name || 'Uncategorised';
    if (!deptCourses[dept]) deptCourses[dept] = [];
    deptCourses[dept].push(c);
  });

  const stats = [
    { label: 'Courses', value: courses.length, icon: '📚' },
    { label: 'Total Units', value: totalUnits, icon: '🎓' },
    { label: 'Departments', value: Object.keys(deptCourses).length, icon: '🏛️' },
    { label: 'Sessions', value: sessions.length, icon: '📋' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-primary-600 p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.fullName || 'Lecturer'}</h1>
            <p className="mt-2 text-primary-100">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-primary-200">
              {user?.staffId && <span>Staff ID: {user.staffId}</span>}
              {user?.department?.name && <span>Department: {user.department.name}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-800">{s.value}</p>
              </div>
              <span className="text-3xl opacity-80">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/lecturer/courses')}
          className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          My Courses
        </button>
        <button
          onClick={() => navigate('/lecturer/sessions')}
          className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Start Session
        </button>
        <button
          onClick={() => navigate('/lecturer/reports')}
          className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          View Reports
        </button>
      </div>

      {courses.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-800">Assigned Courses ({courses.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex flex-wrap items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-2">
                    <span className="rounded-md bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                      {course.courseCode}
                    </span>
                    <span className="truncate font-medium text-gray-800">{course.courseTitle}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.department?.name && `${course.department.name}  ·  `}
                    {course.unit && `${course.unit} Unit${course.unit > 1 ? 's' : ''}  ·  `}
                    {course.level && `${course.level}L`}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/lecturer/start-session/${course._id}`)}
                  className="shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Start Session
                </button>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="px-6 py-8 text-center text-gray-400">No courses assigned yet.</p>
            )}
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-800">Session History ({sessions.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Present / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.slice(0, 20).map((s) => {
                  const duration = s.endTime
                    ? Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000)
                    : null;
                  return (
                    <tr key={s._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{s.courseCode}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{s.sessionCode}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(s.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {duration != null ? `${duration} min` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {s.isActive ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Active</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">Closed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {s.totalPresent != null ? `${s.totalPresent} / ${s.totalPresent + s.totalAbsent}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
