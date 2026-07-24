import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  student: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Courses', to: '/student/courses' },
    { label: 'Mark Attendance', to: '/student/mark-attendance' },
    { label: 'My History', to: '/student/history' },
    { label: 'Profile', to: '/profile' },
  ],
  lecturer: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Courses', to: '/lecturer/courses' },
    { label: 'Sessions', to: '/lecturer/sessions' },
    { label: 'Reports', to: '/lecturer/reports' },
    { label: 'Profile', to: '/profile' },
  ],
  admin: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Manage Users', to: '/admin/users' },
    { label: 'Manage Departments', to: '/admin/departments' },
    { label: 'Manage Courses', to: '/admin/courses' },
    { label: 'Reports', to: '/admin/reports' },
    { label: 'Profile', to: '/profile' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = user ? roleLinks[user.role] || [] : [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-64 bg-primary-500 text-white shadow-xl">
      <div className="flex h-16 items-center justify-center border-b border-primary-400">
        <NavLink to="/dashboard" className="text-2xl font-bold tracking-wide">
          AMS
        </NavLink>
      </div>
      <nav className="flex flex-col p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-primary-400 p-4">
        <div className="mb-2 text-center text-sm text-primary-100">
          {user?.name}
          <span className="ml-2 rounded bg-accent-500 px-2 py-0.5 text-xs font-semibold text-primary-900">
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full rounded bg-red-600 px-3 py-2 text-sm font-medium transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}