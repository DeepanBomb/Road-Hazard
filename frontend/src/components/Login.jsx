import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post('https://road-hazard.onrender.com/api/login', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid authorization credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 animate-in fade-in zoom-in-95 duration-500">

        <div className="text-center mb-8 relative pt-10">
          <div className="absolute inset-x-0 -top-16 flex justify-center">
            <div className="bg-slate-900 border-4 border-slate-800 p-3 rounded-full shadow-lg">
              <ShieldCheck className="h-12 w-12 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Authority Portal</h2>
          <p className="text-slate-400 text-sm mt-2">Restricted Command Center Access</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-3 rounded-xl mb-6 text-center text-sm font-medium flex items-center justify-center gap-2">
            <Lock size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Identifier</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl text-slate-200 shadow-inner placeholder-slate-500
              focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Passcode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-900/50 border border-slate-700/80 rounded-xl text-slate-200 shadow-inner placeholder-slate-500
              focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden flex justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-8 border border-indigo-400/80"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-white/20 h-1/2"></div>
            <span className="relative z-10">{loading ? 'Authenticating...' : 'Initialize Session'}</span>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
          <p className="text-xs text-slate-500 font-mono">SYS_ADMIN: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
