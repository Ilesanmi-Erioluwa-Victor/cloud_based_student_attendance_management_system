import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import MarkAttendance from './pages/student/MarkAttendance';
import MyAttendanceHistory from './pages/student/MyAttendanceHistory';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import MyAssignedCourses from './pages/lecturer/MyAssignedCourses';
import StartAttendanceSession from './pages/lecturer/StartAttendanceSession';
import CourseAttendanceReport from './pages/lecturer/CourseAttendanceReport';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFaculties from './pages/admin/ManageFaculties';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageCourses from './pages/admin/ManageCourses';
import ManageUsers from './pages/admin/ManageUsers';
import InstitutionReports from './pages/admin/InstitutionReports';
import ManageAcademicSessions from './pages/admin/ManageAcademicSessions';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'lecturer') return <Navigate to="/lecturer/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Layout><StudentDashboard /></Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        <Route path="/courses" element={<ProtectedRoute><Layout><MyCourses /></Layout></ProtectedRoute>} />
        <Route path="/mark-attendance" element={<ProtectedRoute roles={['student']}><Layout><MarkAttendance /></Layout></ProtectedRoute>} />
        <Route path="/my-history" element={<ProtectedRoute roles={['student']}><Layout><MyAttendanceHistory /></Layout></ProtectedRoute>} />

        <Route path="/lecturer/dashboard" element={<ProtectedRoute roles={['lecturer']}><Layout><LecturerDashboard /></Layout></ProtectedRoute>} />
        <Route path="/lecturer/courses" element={<ProtectedRoute roles={['lecturer']}><Layout><MyAssignedCourses /></Layout></ProtectedRoute>} />
        <Route path="/lecturer/sessions" element={<ProtectedRoute roles={['lecturer']}><Layout><StartAttendanceSession /></Layout></ProtectedRoute>} />
        <Route path="/lecturer/start-session/:courseId" element={<ProtectedRoute roles={['lecturer']}><Layout><StartAttendanceSession /></Layout></ProtectedRoute>} />
        <Route path="/lecturer/reports" element={<ProtectedRoute roles={['lecturer']}><Layout><CourseAttendanceReport /></Layout></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/faculties" element={<ProtectedRoute roles={['admin']}><Layout><ManageFaculties /></Layout></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute roles={['admin']}><Layout><ManageDepartments /></Layout></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><Layout><ManageCourses /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Layout><ManageUsers /></Layout></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><Layout><InstitutionReports /></Layout></ProtectedRoute>} />
        <Route path="/admin/sessions" element={<ProtectedRoute roles={['admin']}><Layout><ManageAcademicSessions /></Layout></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
