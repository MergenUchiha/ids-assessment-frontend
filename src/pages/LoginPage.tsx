import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem('token', access_token);
      navigate('/');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c12] flex items-center justify-center" style={{ fontFamily: "'Courier New', monospace" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl border border-cyan-400/40 flex items-center justify-center bg-cyan-400/5 mx-auto mb-4">
            <span className="text-cyan-400 text-2xl">⬡</span>
          </div>
          <h1 className="text-white font-bold text-xl">
            IDS<span className="text-cyan-400">Lab</span>
          </h1>
          <p className="text-gray-600 text-xs mt-1 tracking-widest">ASSESSMENT PLATFORM</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#0d1117] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-500 tracking-wider block mb-1.5">EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#080c12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-400/40 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 tracking-wider block mb-1.5">PASSWORD</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-[#080c12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-400/40 transition-colors font-mono"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded-lg py-2.5 text-xs tracking-widest hover:bg-cyan-400/20 transition-all disabled:opacity-50">
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
