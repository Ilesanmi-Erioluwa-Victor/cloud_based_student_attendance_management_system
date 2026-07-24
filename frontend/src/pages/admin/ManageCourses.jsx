import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  courseCode: '',
  courseTitle: '',
  unit: '',
  department: '',
  level: '',
  semester: 'First',
  lecturer: '',
  academicSession: '',
};

const levels = ['100', '200', '300', '400', '500', '600', '700'];
const semesters = ['First', 'Second'];

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [lecturerSearch, setLecturerSearch] = useState('');
  const [showLecturerDropdown, setShowLecturerDropdown] = useState(false);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchDepartments(), fetchLecturers(), fetchSessions()]).finally(
      () => setLoading(false),
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

  const fetchLecturers = async () => {
    const res = await api.get('/users', { params: { role: 'lecturer' } });
    setLecturers(res.data?.users || res.data || []);
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/academic-sessions');
      setSessions(res.data?.sessions || res.data || []);
    } catch {
      setSessions([]);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setLecturerSearch('');
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      courseCode: course.courseCode || '',
      courseTitle: course.courseTitle || '',
      unit: course.unit || '',
      department: course.department?._id || course.department || '',
      level: course.level || '',
      semester: course.semester || 'First',
      lecturer: course.lecturer?._id || course.lecturer || '',
      academicSession: course.academicSession?._id || course.academicSession || '',
    });
    const lec = course.lecturer;
    setLecturerSearch(
      lec ? `${lec.firstName || ''} ${lec.lastName || ''}`.trim() || lec.email || '' : '',
    );
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectLecturer = (lec) => {
    setForm((prev) => ({ ...prev, lecturer: lec._id }));
    setLecturerSearch(`${lec.firstName || ''} ${lec.lastName || ''}`.trim() || lec.email);
    setShowLecturerDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.courseCode.trim() ||
      !form.courseTitle.trim() ||
      !form.unit ||
      !form.department ||
      !form.level ||
      !form.lecturer
    ) {
      toast.warn('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, unit: Number(form.unit) };
      if (editing) {
        await api.put(`/courses/${editing._id}`, payload);
        toast.success('Course updated');
      } else {
        await api.post('/courses', payload);
        toast.success('Course created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setLecturerSearch('');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete course "${course.courseCode} — ${course.courseTitle}"?`)) return;
    try {
      await api.delete(`/courses/${course._id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setLecturerSearch('');
  };

  const filteredCourses = courses.filter((c) => {
    if (filterDept && (c.department?._id || c.department) !== filterDept) return false;
    if (filterLevel && c.level !== filterLevel) return false;
    if (filterSemester && c.semester !== filterSemester) return false;
    return true;
  });

  const filteredLecturers = lecturers.filter(
    (l) =>
      !lecturerSearch ||
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(lecturerSearch.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(lecturerSearch.toLowerCase()),
  );

  const selectedLecturerName = lecturerSearch;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary-700">Manage Courses</h1>
        <button
          onClick={openAdd}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          + Add Course
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            {editing ? 'Edit Course' : 'Add New Course'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Course Code *</label>
              <input
                name="courseCode"
                value={form.courseCode}
                onChange={handleChange}
                placeholder="e.g. CSC301"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Course Title *</label>
              <input
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Unit *</label>
              <input
                name="unit"
                type="number"
                value={form.unit}
                onChange={handleChange}
                placeholder="e.g. 3"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Department *</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">-- Select --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Level *</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">-- Select --</option>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l} Level
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Semester *</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s} Semester
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-600">Lecturer *</label>
              <input
                value={selectedLecturerName}
                onChange={(e) => {
                  setLecturerSearch(e.target.value);
                  setShowLecturerDropdown(true);
                  if (!e.target.value) setForm((prev) => ({ ...prev, lecturer: '' }));
                }}
                onFocus={() => setShowLecturerDropdown(true)}
                placeholder="Search lecturer..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              {showLecturerDropdown && (
                <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredLecturers.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">No lecturers found</p>
                  ) : (
                    filteredLecturers.map((l) => (
                      <button
                        key={l._id}
                        type="button"
                        onClick={() => selectLecturer(l)}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-primary-50"
                      >
                        {l.firstName} {l.lastName} ({l.email})
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Academic Session
              </label>
              <select
                name="academicSession"
                value={form.academicSession}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">-- Select --</option>
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Department</label>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Level</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">All Levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Semester</label>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Unit</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Lecturer</th>
              <th className="px-6 py-3">Level</th>
              <th className="px-6 py-3">Semester</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{c.courseCode}</td>
                  <td className="px-6 py-4 text-gray-700">{c.courseTitle}</td>
                  <td className="px-6 py-4 text-gray-600">{c.unit ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.department?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.lecturer
                      ? `${c.lecturer.firstName || ''} ${c.lecturer.lastName || ''}`.trim() ||
                        c.lecturer.email
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.level || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{c.semester || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="mr-2 rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}