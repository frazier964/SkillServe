import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileView() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user')) || {};
      setUser(u);
    } catch (e) {
      setUser({});
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-white/5 overflow-hidden flex items-center justify-center text-2xl font-bold">
            {user.avatarDataUrl ? <img src={user.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" /> : (user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : (user.email ? user.email.charAt(0).toUpperCase() : 'U'))}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name || (user.email ? user.email.split('@')[0] : 'User')}</h2>
            <div className="text-sm text-slate-300">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'No role set'}</div>
            <div className="mt-2 text-sm text-slate-300">{user.bio || 'No bio provided.'}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => navigate('/profile')} className="px-4 py-2 rounded bg-transparent border border-white/10">Edit</button>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded bg-yellow-500 text-slate-900 font-semibold">Back</button>
        </div>
      </div>
    </div>
  );
}
