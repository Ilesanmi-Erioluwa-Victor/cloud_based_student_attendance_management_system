import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { name: '', startDate: '', endDate: '', isCurrent: false };

export default function ManageAcademicSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/academic-sessions');
      setSessions(res.data?.sessions || res.data || []);
    } catch (err) {
      toast.error('Failed to load academic sessions');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (session) => {
    setEditing(session);
    setForm({
      name: session.name || '',
      startDate: session.startDate ? session.startDate.slice(0, 10) : '',
      endDate: session.endDate ? session.endDate.slice(0, 10) : '',
      isCurrent: session.isCurrent || false,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warn('Session name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/academic-sessions/${editing._id}`, form);
        toast.success('Academic session updated');
      } else {
        await api.post('/academic-sessions', form);
        toast.success('Academic session created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session) => {
    if (!window.confirm(`Delete academic session "${session.name}"?`)) return;
    try {
      await api.delete(`/academic-sessions/${session._id}`);
      toast.success('Academic session deleted');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetCurrent = async (session) => {
    try {
      await api.patch(`/academic-sessions/${session._id}/set-current`);
      toast.success('Current session updated');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-700">Manage Academic Sessions</h1>
        <button
          onClick={openAdd}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          + Add Session
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            {editing ? 'Edit Academic Session' : 'Add New Academic Session'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-600">Session Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. 2024/2025 Academic Session"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">Start Date</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">End Date</label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center sm:col-span-2">
              <input
                name="isCurrent"
                type="checkbox"
                checked={form.isCurrent}
                onChange={handleChange}
                id="isCurrent"
                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="isCurrent" className="ml-2 text-sm text-gray-600">
                Set as current session
              </label>
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

      <div className="overflow-x-auto rounded-lg bg-white shadow-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">End Date</th>
              <th className="px-6 py-3">Current</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No academic sessions found.
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {s.isCurrent ? (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Current
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleSetCurrent(s)}
                        className="mr-2 rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                      >
                        Set Current
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(s)}
                      className="mr-2 rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
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