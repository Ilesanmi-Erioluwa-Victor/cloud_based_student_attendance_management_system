import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

const tabs = ['Course Report', 'Student Report', 'Institution Summary'];

export default function InstitutionReports() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [courseReport, setCourseReport] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [summary, setSummary] = useState(null);

  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchDepartments(), fetchStudents()]).finally(() =>
      setLoading(false),
    );
  }, []);

  const fetchCourses = async () => {
    const res = await api.get('/courses');
    setCourses(res.data?.courses || res.data || []);
  };

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data?.departments || res.data || []);
  };

  const fetchStudents = async () => {
    const res = await api.get('/users', { params: { role: 'student' } });
    setStudents(res.data?.users || res.data || []);
  };

  const fetchCourseReport = async () => {
    if (!selectedCourse) return;
    setReportLoading(true);
    try {
      const res = await api.get(`/reports/course/${selectedCourse}`);
      setCourseReport(res.data);
    } catch (err) {
      setCourseReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchStudentReport = async () => {
    if (!selectedStudent) return;
    setReportLoading(true);
    try {
      const res = await api.get(`/reports/student/${selectedStudent}`);
      setStudentReport(res.data);
    } catch (err) {
      setStudentReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchSummary = async () => {
    setReportLoading(true);
    try {
      const res = await api.get('/reports/institution-summary');
      setSummary(res.data);
    } catch (err) {
      setSummary(null);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 2) fetchSummary();
  }, [activeTab]);

  const filteredStudents = students.filter(
    (s) =>
      !studentSearch ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.matricNo || '').toLowerCase().includes(studentSearch.toLowerCase()),
  );

  if (loading) return <LoadingSpinner />;

  const renderCourseReport = () => (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-600">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">-- Choose a course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode} — {c.courseTitle}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchCourseReport}
          disabled={!selectedCourse || reportLoading}
          className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {reportLoading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {courseReport && (
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <div className="border-b border-gray-100 px-6 py-3">
            <p className="text-lg font-semibold text-gray-800">
              {courseReport.course?.courseCode} — {courseReport.course?.courseTitle}
            </p>
            {courseReport.totalSessions != null && (
              <p className="text-sm text-gray-500">Total Sessions: {courseReport.totalSessions}</p>
            )}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Matric No</th>
                <th className="px-6 py-3">Sessions Attended</th>
                <th className="px-6 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(courseReport.students || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No student data available.
                  </td>
                </tr>
              ) : (
                courseReport.students.map((s, i) => (
                  <tr key={s._id || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{s.matricNo || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.sessionsAttended ?? 0} / {courseReport.totalSessions ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          (s.attendancePercentage ?? 0) >= 75
                            ? 'bg-green-100 text-green-700'
                            : (s.attendancePercentage ?? 0) >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {s.attendancePercentage != null ? `${s.attendancePercentage}%` : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderStudentReport = () => (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="relative min-w-[200px] flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-600">Select Student</label>
          <input
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setShowStudentDropdown(true);
              if (!e.target.value) setSelectedStudent('');
            }}
            onFocus={() => setShowStudentDropdown(true)}
            onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
            placeholder="Search by name or matric number..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          {showStudentDropdown && (
            <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filteredStudents.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-400">No students found</p>
              ) : (
                filteredStudents.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onMouseDown={() => {
                      setSelectedStudent(s._id);
                      setStudentSearch(`${s.firstName} ${s.lastName} (${s.matricNo || ''})`);
                      setShowStudentDropdown(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-primary-50"
                  >
                    {s.firstName} {s.lastName} — {s.matricNo || 'N/A'}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button
          onClick={fetchStudentReport}
          disabled={!selectedStudent || reportLoading}
          className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {reportLoading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {studentReport && (
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <div className="border-b border-gray-100 px-6 py-3">
            <p className="text-lg font-semibold text-gray-800">
              {studentReport.student?.firstName} {studentReport.student?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              Matric: {studentReport.student?.matricNo || 'N/A'} | Overall:{' '}
              {studentReport.overallPercentage != null
                ? `${studentReport.overallPercentage}%`
                : 'N/A'}
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">Sessions Attended</th>
                <th className="px-6 py-3">Total Sessions</th>
                <th className="px-6 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(studentReport.courses || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No course data available.
                  </td>
                </tr>
              ) : (
                studentReport.courses.map((c, i) => (
                  <tr key={c._id || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {c.courseCode} — {c.courseTitle}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.sessionsAttended ?? 0}</td>
                    <td className="px-6 py-4 text-gray-600">{c.totalSessions ?? 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          (c.attendancePercentage ?? 0) >= 75
                            ? 'bg-green-100 text-green-700'
                            : (c.attendancePercentage ?? 0) >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {c.attendancePercentage != null ? `${c.attendancePercentage}%` : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSummary = () =>
    summary ? (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Students</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">{summary.totalStudents ?? 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Lecturers</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">
            {summary.totalLecturers ?? 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Active Courses</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">
            {summary.activeCourses ?? 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-100">
          <p className="text-sm font-medium text-gray-500">Average Attendance</p>
          <p className="mt-1 text-3xl font-bold text-primary-700">
            {summary.averageAttendance != null ? `${summary.averageAttendance}%` : 'N/A'}
          </p>
        </div>
      </div>
    ) : (
      <p className="text-gray-400">No summary data available.</p>
    );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary-700">Institution Reports</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex overflow-x-auto space-x-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === i
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {reportLoading && activeTab !== 2 ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeTab === 0 && renderCourseReport()}
          {activeTab === 1 && renderStudentReport()}
          {activeTab === 2 && renderSummary()}
        </>
      )}
    </div>
  );
}