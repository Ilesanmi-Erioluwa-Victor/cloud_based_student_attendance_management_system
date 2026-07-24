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
    api.get(`/api/reports/student/${user.id}`).then((res) => setReports(res.data)).catch(() => {});
    api.get('/enrollments/my-courses').then((res) => {
      setEnrolledCount(Array.isArray(res.data) ? res.data.length : 0);
    }).catch(() => {});
  }, [user]);

  const overall = reports.length
    ? (reports.reduce((sum, r) => sum + (r.attendancePercentage || 0), 0) / reports.length).toFixed(1)
    : 0;

  const badgeClass = (pct) => {
    if (pct == null) return 'bg-gray-100 text-gray-600';
    if (pct >= 75) return 'bg-green-100 text-green-700';
    if (pct >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{enrolledCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{overall}%</p>
        </div>
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
                <th className="px-6 py-3">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.courseCode || r.course?.code}</td>
                  <td className="px-6 py-4 text-gray-600">{r.courseTitle || r.course?.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(r.attendancePercentage)}`}>
                      {r.attendancePercentage != null ? `${r.attendancePercentage}%` : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {!reports.length && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No course data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}