import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  student: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Courses', to: '/courses' },
    { label: 'Mark Attendance', to: '/mark-attendance' },
    { label: 'My History', to: '/my-history' },
  ],
  lecturer: [
    { label: 'Dashboard', to: '/lecturer/dashboard' },
    { label: 'My Courses', to: '/lecturer/courses' },
    { label: 'Sessions', to: '/lecturer/sessions' },
    { label: 'Reports', to: '/lecturer/reports' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Faculties', to: '/admin/faculties' },
    { label: 'Departments', to: '/admin/departments' },
    { label: 'Courses', to: '/admin/courses' },
    { label: 'Sessions', to: '/admin/sessions' },
    { label: 'Reports', to: '/admin/reports' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const links = user ? roleLinks[user.role] || [] : [];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-primary-500 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold tracking-wide">
              AMS
            </Link>
            <div className="hidden space-x-4 md:flex">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded px-3 py-2 text-sm font-medium transition hover:bg-primary-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="hidden text-sm sm:inline">{user.fullName || user.email}</span>
                <span className="rounded bg-accent-500 px-2 py-0.5 text-xs font-semibold uppercase text-primary-900">
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium transition hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-primary-600 focus:outline-none md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-primary-400 pb-3 md:hidden">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block rounded px-3 py-2 text-sm font-medium transition hover:bg-primary-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}