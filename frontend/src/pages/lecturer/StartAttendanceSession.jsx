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
    const init = async () => {
      try {
        const [coursesRes] = await Promise.all([api.get('/courses')]);
        setCourses(coursesRes.data?.courses || coursesRes.data || []);

        if (paramCourseId) {
          const sessionsRes = await api.get(`/attendance/sessions/course/${paramCourseId}`);
          const active = (sessionsRes.data || []).find((s) => s.isActive);
          if (active) {
            setSession(active);
            setSessionCode(active.sessionCode);
          }
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [paramCourseId]);

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

  const formatDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const totalSec = Math.floor(diff / 1000);
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
      setStudents([]);
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
    if (status === 'Present') return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Present</span>;
    if (status === 'Absent') return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Absent</span>;
    return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Pending</span>;
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;

  const activeCourse = paramCourseId
    ? courses.find((c) => c._id === paramCourseId)
    : courses.find((c) => c._id === selectedCourseId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Session</h1>
        {activeCourse && (
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-700">{activeCourse.courseCode}</p>
            <p>{activeCourse.courseTitle}</p>
          </div>
        )}
      </div>

      {!session && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {activeCourse && (
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Level</p>
                <p className="font-medium text-gray-800">{activeCourse.level ? `${activeCourse.level}L` : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Unit</p>
                <p className="font-medium text-gray-800">{activeCourse.unit ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium text-gray-800">{activeCourse.department?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Semester</p>
                <p className="font-medium text-gray-800">{activeCourse.semester || '—'}</p>
              </div>
            </div>
          )}
          {!paramCourseId && (
            <>
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
            </>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Click start to generate a session code for students</p>
            <button
              onClick={startSession}
              disabled={starting}
              className="rounded-lg bg-green-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {starting ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </div>
      )}

      {session && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="mb-1 text-sm font-medium text-gray-500">Session Code</p>
            <p className="select-all text-6xl font-extrabold tracking-widest text-primary-700">
              {sessionCode}
            </p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div>
                <p className="text-sm text-gray-500">{session.isActive ? 'Duration' : 'Total Duration'}</p>
                <p className="text-2xl font-mono font-bold text-gray-600">
                  {session.isActive ? formatElapsed(elapsed) : formatDuration(session.startTime, session.endTime)}
                </p>
              </div>
              {session.isActive && (
                <div className="border-l border-gray-200 pl-6">
                  <p className="text-sm text-gray-500">{new Date(session.startTime).toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-400">Started</p>
                </div>
              )}
            </div>
            {session.isActive ? (
              <button
                onClick={closeSession}
                disabled={closing}
                className="mt-6 rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {closing ? 'Closing...' : 'Close Session'}
              </button>
            ) : (
              <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 px-6 py-3">
                <p className="text-sm text-gray-500">
                  Ended at {new Date(session.endTime).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {!session.isActive && session.endTime && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
                <p className="text-3xl font-bold text-green-700">{presentCount}</p>
                <p className="mt-1 text-sm font-medium text-green-600">Present</p>
                <p className="text-xs text-green-500">
                  {students.length > 0 ? `${Math.round((presentCount / students.length) * 100)}%` : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-3xl font-bold text-red-700">{absentCount}</p>
                <p className="mt-1 text-sm font-medium text-red-600">Absent</p>
                <p className="text-xs text-red-500">
                  {students.length > 0 ? `${Math.round((absentCount / students.length) * 100)}%` : '—'}
                </p>
              </div>
            </div>
          )}

          {students.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Attendance Records
                  <span className="ml-2 text-sm font-normal text-gray-500">({students.length} students)</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Matric Number</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student, idx) => {
                      const name = student.student?.fullName || student.fullName || '';
                      const matric = student.student?.matricNumber || student.matricNumber || '';
                      return (
                        <tr key={student._id || idx} className="transition-colors hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-400">{idx + 1}</td>
                          <td className="px-6 py-3 font-medium text-gray-800">{name || '—'}</td>
                          <td className="px-6 py-3 text-gray-500">{matric || '—'}</td>
                          <td className="px-6 py-3">{getStatusBadge(student.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
