import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function MyAttendanceHistory() {
  const [allRecords, setAllRecords] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/attendance/my-history').then((res) => {
      setAllRecords(res.data);
      const unique = [...new Set((res.data || []).map((r) => r.course?.code || r.courseCode).filter(Boolean))];
      setCourses(unique);
    }).catch(() => {});
  }, []);

  const filtered = courseFilter
    ? allRecords.filter((r) => (r.course?.code || r.courseCode) === courseFilter)
    : allRecords;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance History</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="courseFilter" className="text-sm font-medium text-gray-600">Filter by course:</label>
          <select
            id="courseFilter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Course Code</th>
                <th className="px-6 py-3">Course Title</th>
                <th className="px-6 py-3">Session Code</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.course?.code || r.courseCode || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{r.course?.title || r.courseTitle || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{r.sessionCode || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.createdAt ? new Date(r.createdAt).toLocaleTimeString() : '-'}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}