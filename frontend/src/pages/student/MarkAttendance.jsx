import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';

export default function MarkAttendance() {
  const [sessionCode, setSessionCode] = useState('');
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/attendance/my-history').then((res) => setHistory(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      toast.warning('Please enter a session code.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/attendance/mark', { sessionCode: sessionCode.trim() });
      toast.success('Attendance marked successfully!');
      setSessionCode('');
      const res = await api.get('/api/attendance/my-history');
      setHistory(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center rounded-lg bg-white py-16 shadow">
        <label htmlFor="sessionCode" className="mb-4 text-lg font-medium text-gray-700">
          Enter Session Code
        </label>
        <input
          id="sessionCode"
          type="text"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          placeholder="e.g. CS101-2025-001"
          className="w-full max-w-md rounded-md border border-gray-300 px-4 py-3 text-center text-lg shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-md bg-primary-500 px-8 py-3 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
        >
          {submitting ? 'Marking...' : 'Mark Attendance'}
        </button>
      </form>

      <section className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Course Code</th>
                <th className="px-6 py-3">Course Title</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{h.date ? new Date(h.date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{h.course?.code || h.courseCode || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{h.course?.title || h.courseTitle || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      h.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {h.status || '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {!history.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No attendance history yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}