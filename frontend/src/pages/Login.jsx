import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
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
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-vista-800 to-vista-950 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="text-white">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold">V</div>
          <h1 className="text-4xl font-bold">Vista Data Migration Tool</h1>
          <p className="mt-4 text-lg text-vista-200">
            Securely migrate customer data from legacy banking systems to the new platform.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-2 text-slate-500">Enter your credentials to access the migration portal</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@vistabank.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="font-medium text-slate-700 dark:text-slate-300">Demo accounts</p>
            <p className="mt-2 text-slate-500">Admin: admin@vistabank.com / Admin@123</p>
            <p className="text-slate-500">Operator: operator@vistabank.com / Operator@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
