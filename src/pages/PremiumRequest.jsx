import { useNavigate } from 'react-router-dom';

export default function PremiumRequest() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white">
        <h2 className="text-2xl font-bold mb-2">Premium</h2>
        <p className="text-sm text-slate-300 mb-4">Premium requests have been removed. To view available premium plans and upgrade, please visit the Premium page.</p>

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded bg-transparent border border-white/10">Back to Dashboard</button>
          <button onClick={() => navigate('/premium')} className="px-4 py-2 rounded bg-yellow-500 text-slate-900 font-semibold">View Plans</button>
        </div>

      </div>
    </div>
  );
}
