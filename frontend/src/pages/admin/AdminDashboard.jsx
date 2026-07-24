import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/institution-summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to load institution summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    {
      label: 'Total Students',
      value: summary?.totalStudents ?? 0,
      bg: 'bg-blue-500',
      ring: 'ring-blue-200',
    },
    {
      label: 'Total Lecturers',
      value: summary?.totalLecturers ?? 0,
      bg: 'bg-green-500',
      ring: 'ring-green-200',
    },
    {
      label: 'Active Courses',
      value: summary?.activeCourses ?? 0,
      bg: 'bg-purple-500',
      ring: 'ring-purple-200',
    },
    {
      label: 'Average Attendance',
      value: summary?.averageAttendance != null ? `${summary.averageAttendance}%` : 'N/A',
      bg: 'bg-amber-500',
      ring: 'ring-amber-200',
    },
  ];

  const quickLinks = [
    { label: 'Manage Users', to: '/admin/users', desc: 'View, filter, and toggle user accounts' },
    {
      label: 'Manage Faculties',
      to: '/admin/faculties',
      desc: 'Create and manage faculties',
    },
    {
      label: 'Manage Departments',
      to: '/admin/departments',
      desc: 'Create and manage departments',
    },
    { label: 'Manage Courses', to: '/admin/courses', desc: 'Create and manage courses' },
    { label: 'Reports', to: '/admin/reports', desc: 'View institution reports' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary-700">
        Admin Dashboard — {user?.firstName || 'Admin'}
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-100 transition-shadow hover:shadow-lg"
          >
            <div
              className={`mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full ${card.bg} text-white ring-4 ${card.ring}`}
            >
              <span className="text-xl font-bold">{card.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-700">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <p className="font-semibold text-primary-600">{link.label}</p>
              <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}