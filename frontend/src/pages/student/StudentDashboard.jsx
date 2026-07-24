import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    api.get(`/reports/student/${user._id}`).then((res) => setReports(res.data)).catch(() => {});
    api.get('/enrollments/my-courses').then((res) => {
      setEnrolledCount(Array.isArray(res.data) ? res.data.length : 0);
    }).catch(() => {});
  }, [user]);

  const overall = reports.length
    ? (reports.reduce((sum, r) => sum + (r.percentage || 0), 0) / reports.length).toFixed(1)
    : 0;

  const badgeClass = (pct) => {
    if (pct == null) return 'bg-gray-100 text-gray-600';
    if (pct >= 75) return 'bg-green-100 text-green-700';
    if (pct >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.fullName || 'Student'}</h1>
            <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            {user?.level && <p><span className="font-medium">Level:</span> {user.level}L</p>}
            {user?.matricNumber && <p><span className="font-medium">Matric:</span> {user.matricNumber}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{enrolledCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{overall}%</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Sessions Attended</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">
            {reports.reduce((sum, r) => sum + (r.sessionsPresent || 0), 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/courses')}
          className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          My Courses
        </button>
        <button
          onClick={() => navigate('/mark-attendance')}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          Mark Attendance
        </button>
        <button
          onClick={() => navigate('/my-history')}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Attendance History
        </button>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Per-Course Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Course Code</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Sessions</th>
                <th className="px-6 py-3">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.course?.courseCode}</td>
                  <td className="px-6 py-4 text-gray-600">{r.course?.courseTitle}</td>
                  <td className="px-6 py-4 text-gray-600">{r.sessionsPresent || 0} / {r.totalSessions || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(r.percentage)}`}>
                      {r.percentage != null ? `${r.percentage}%` : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {!reports.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No course data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}