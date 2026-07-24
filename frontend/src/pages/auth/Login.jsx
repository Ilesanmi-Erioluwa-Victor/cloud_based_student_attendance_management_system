import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="bg-blue-900 rounded-t-lg px-8 py-6">
          <h2 className="text-2xl font-bold text-white text-center">Attendance System</h2>
          <p className="text-blue-200 text-center text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Enter your password" />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-900 hover:text-blue-700">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-900 text-white py-2.5 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="pb-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-900 hover:text-blue-700 font-medium">Register</Link>
        </div>
      </div>
    </div>
  );
}
