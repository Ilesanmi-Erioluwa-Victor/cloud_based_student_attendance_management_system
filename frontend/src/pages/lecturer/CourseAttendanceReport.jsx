import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CourseAttendanceReport() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [report, setReport] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [threshold, setThreshold] = useState(75);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data?.courses || res.data || []);
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setReport(null);
      return;
    }
    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await api.get(`/reports/course/${selectedCourseId}`);
        setReport(res.data?.report || res.data);
      } catch (err) {
        toast.error('Failed to load report');
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [selectedCourseId]);

  const sendAlerts = async () => {
    if (!selectedCourseId) return;
    setSending(true);
    try {
      const res = await api.post(`/reports/course/${selectedCourseId}/send-alerts?threshold=${threshold}`);
      const sent = res.data?.sent || res.data?.count || 0;
      toast.success(`${sent} alert(s) sent successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alerts');
    } finally {
      setSending(false);
    }
  };

  if (loadingCourses) return <LoadingSpinner />;

  const students = report?.students || report?.attendance || [];
  const sorted = [...students].sort(
    (a, b) => (a.percentage ?? 0) - (b.percentage ?? 0)
  );

  const getRowColor = (pct) => {
    if (pct >= 75) return 'bg-green-50';
    if (pct >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getBadge = (pct) => {
    if (pct >= 75) return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Eligible</span>;
    return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Not Eligible</span>;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold text-primary-700">Course Attendance Report</h1>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <label className="mb-2 block text-sm font-medium text-gray-700">Select Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="">-- Choose a course --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.courseCode} - {c.courseTitle}
            </option>
          ))}
        </select>
      </div>

      {loadingReport && <LoadingSpinner />}

      {report && !loadingReport && (
        <>
          <div className="mb-6 overflow-x-auto rounded-lg bg-white shadow-md">
            {sorted.length === 0 ? (
              <p className="p-6 text-gray-500">No attendance data available.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs font-medium uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Matric Number</th>
                    <th className="px-6 py-4">Present</th>
                    <th className="px-6 py-4">Absent</th>
                    <th className="px-6 py-4">Percentage</th>
                    <th className="px-6 py-4">Eligible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sorted.map((student, idx) => {
                    const pct = student.percentage ?? 0;
                    return (
                      <tr key={student._id || idx} className={`${getRowColor(pct)} transition-colors`}>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {student.matricNo || student.matricNumber || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{student.present ?? 0}</td>
                        <td className="px-6 py-4 text-gray-700">{student.absent ?? 0}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              pct >= 75
                                ? 'text-green-600'
                                : pct >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">{getBadge(pct)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Send Alerts</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Threshold (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <button
                onClick={sendAlerts}
                disabled={sending}
                className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Alerts'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
