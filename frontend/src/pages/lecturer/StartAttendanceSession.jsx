import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function StartAttendanceSession() {
  const { courseId: paramCourseId } = useParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(paramCourseId || '');
  const [session, setSession] = useState(null);
  const [sessionCode, setSessionCode] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [students, setStudents] = useState([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data?.courses || res.data || []);
      } catch (err) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (session && session.startTime && session.isActive) {
      startTimeRef.current = new Date(session.startTime).getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [session]);

  const formatElapsed = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startSession = useCallback(async () => {
    if (!selectedCourseId) {
      toast.warn('Please select a course');
      return;
    }
    setStarting(true);
    try {
      const res = await api.post('/attendance/sessions', { courseId: selectedCourseId });
      const data = res.data?.session || res.data;
      setSession(data);
      setSessionCode(data.sessionCode);
      setStudents(data.students || []);
      toast.success('Session started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    } finally {
      setStarting(false);
    }
  }, [selectedCourseId]);

  const closeSession = useCallback(async () => {
    if (!session?._id) return;
    setClosing(true);
    try {
      const res = await api.patch(`/attendance/sessions/${session._id}/close`);
      const updated = res.data?.session || res.data;
      setSession(updated);
      setStudents(res.data?.students || updated.students || []);
      clearInterval(timerRef.current);
      toast.success('Session closed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close session');
    } finally {
      setClosing(false);
    }
  }, [session]);

  if (loading) return <LoadingSpinner />;

  const getStatusBadge = (status) => {
    if (status === 'present') return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Present</span>;
    if (status === 'absent') return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Absent</span>;
    return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Pending</span>;
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-primary-700">Attendance Session</h1>

      {!session && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <label className="mb-2 block text-sm font-medium text-gray-700">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
          >
            <option value="">-- Choose a course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode} - {c.courseTitle}
              </option>
            ))}
          </select>
          <button
            onClick={startSession}
            disabled={starting}
            className="rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {starting ? 'Starting...' : 'Start Session'}
          </button>
        </div>
      )}

      {session && (
        <>
          <div className="mb-6 rounded-lg bg-white p-8 text-center shadow-lg">
            <p className="mb-2 text-sm font-medium text-gray-500">Session Code</p>
            <p className="select-all text-6xl font-extrabold tracking-widest text-primary-700">
              {sessionCode}
            </p>
            <p className="mt-4 text-3xl font-mono font-bold text-gray-600">
              {formatElapsed(elapsed)}
            </p>
            {session.isActive && (
              <button
                onClick={closeSession}
                disabled={closing}
                className="mt-6 rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {closing ? 'Closing...' : 'Close Session'}
              </button>
            )}
          </div>

          {!session.isActive && session.endTime && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                <p className="text-sm text-green-600">Present</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{absentCount}</p>
                <p className="text-sm text-red-600">Absent</p>
              </div>
            </div>
          )}

          {students.length > 0 && (
            <div className="rounded-lg bg-white shadow-md">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-700">Enrolled Students</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {students.map((student, idx) => (
                  <div key={student._id || idx} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{student.matricNo || student.matricNumber || ''}</p>
                    </div>
                    {getStatusBadge(student.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
