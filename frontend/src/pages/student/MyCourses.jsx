import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';

export default function MyCourses() {
  const [enrolled, setEnrolled] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/enrollments/my-courses').then((res) => setEnrolled(res.data)).catch(() => {});
    api.get('/courses').then((res) => setAvailableCourses(res.data)).catch(() => {});
    api.get('/academic-sessions').then((res) => setSessions(res.data)).catch(() => {});
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!courseId || !academicSession) {
      toast.warning('Please select a course and academic session.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/enrollments', { courseId, academicSession });
      toast.success('Enrolled successfully!');
      setCourseId('');
      setAcademicSession('');
      const res = await api.get('/enrollments/my-courses');
      setEnrolled(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>

      <section className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">My Enrolled Courses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Course Code</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Units</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrolled.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{e.course?.code || e.courseCode}</td>
                  <td className="px-6 py-4 text-gray-600">{e.course?.title || e.courseTitle}</td>
                  <td className="px-6 py-4 text-gray-600">{e.course?.units ?? e.units ?? '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {e.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
              {!enrolled.length && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No enrolled courses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Enroll in a Course</h2>
        </div>
        <form onSubmit={handleEnroll} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">-- Select a course --</option>
              {availableCourses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Academic Session</label>
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">-- Select session --</option>
              {sessions.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {submitting ? 'Enrolling...' : 'Enroll'}
          </button>
        </form>
      </section>
    </div>
  );
}