import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState(null);
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('jobs')) || [];
    setJobs(saved);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get('filter') || 'all';
    const s = params.get('sort') || null;
    setFilter(f);
    setSort(s);

    let list = jobs.slice();
    if (f === 'active') list = list.filter(j => j.status !== 'completed');
    if (f === 'completed') list = list.filter(j => j.status === 'completed');

    if (s === 'earnings') {
      list = list.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    }

    
    const minF = parseFloat(priceMinFilter);
    const maxF = parseFloat(priceMaxFilter);
    if (!isNaN(minF) || !isNaN(maxF)) {
      list = list.filter(j => {
        const p = parseFloat(String(j.price).replace(/[^0-9.]/g, '')) || 0;
        if (!isNaN(minF) && p < minF) return false;
        if (!isNaN(maxF) && p > maxF) return false;
        return true;
      });
    }

    setFiltered(list);
  }, [location.search, jobs, priceMinFilter, priceMaxFilter]);

  function handleDelete(index) {
    if (!confirm('Remove this job?')) return;
    setJobs(prev => {
      const next = prev.filter((_, i) => i !== index);
      try { localStorage.setItem('jobs', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }

  function setFilterAndNavigate(f) {
    const params = new URLSearchParams(location.search);
    params.set('filter', f);
    navigate({ pathname: '/jobs', search: params.toString() });
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Jobs</h1>
            <p className="text-white/70 text-sm sm:text-base">Browse job postings. Use filters to narrow results.</p>
          </div>
          <div>
            <Link to="/" className="text-sm text-white/60 hover:text-white">← Back to dashboard</Link>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={() => setFilterAndNavigate('all')} className={`px-3 py-2 rounded ${filter==='all' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'}`}>All</button>
          <button onClick={() => setFilterAndNavigate('active')} className={`px-3 py-2 rounded ${filter==='active' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'}`}>Active</button>
          <button onClick={() => setFilterAndNavigate('completed')} className={`px-3 py-2 rounded ${filter==='completed' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'}`}>Completed</button>
          <div className="relative">
            <button onClick={() => { const p = new URLSearchParams(location.search); p.set('sort', 'earnings'); navigate({ pathname: '/jobs', search: p.toString() }); setShowPriceRange(v => !v); }} className={`px-3 py-2 rounded ${sort==='earnings' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'}`}>Sort by price</button>

            {showPriceRange && (
              <div className="mt-2 p-3 bg-white/5 rounded shadow-md border border-white/10 w-full sm:w-72">
                <div className="text-sm text-white/80 mb-2">Price range (min / max)</div>
                <div className="flex gap-2">
                  <input value={priceMinFilter} onChange={(e) => setPriceMinFilter(e.target.value)} placeholder="min" className="p-2 rounded w-1/2 bg-white/10 text-white min-h-[44px]" />
                  <input value={priceMaxFilter} onChange={(e) => setPriceMaxFilter(e.target.value)} placeholder="max" className="p-2 rounded w-1/2 bg-white/10 text-white min-h-[44px]" />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => { setPriceMinFilter(''); setPriceMaxFilter(''); }} className="px-3 py-1 rounded bg-transparent border border-white/10 text-white text-sm">Clear</button>
                  <button onClick={() => { setShowPriceRange(false); }} className="px-3 py-1 rounded bg-white/10 text-white text-sm">Apply</button>
                </div>
                <div className="mt-2 text-xs text-white/60">Current data range: {(() => {
                  const vals = jobs.map(j => parseFloat(String(j.price).replace(/[^0-9.]/g, '')) || 0).filter(v => !isNaN(v));
                  if (vals.length === 0) return 'N/A';
                  const mn = Math.min(...vals); const mx = Math.max(...vals);
                  return `$${mn} — $${mx}`;
                })()}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {filtered.length === 0 && (
            <div className="text-white/70">No jobs match this filter.</div>
          )}

          {filtered.map((job, i) => (
            <div key={i} className="bg-linear-to-r from-white/5 to-white/3 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:scale-105 transform-gpu transition-all duration-200 shadow-sm" role="button" tabIndex={0} onClick={() => navigate(`/jobs/${i}`)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/jobs/${i}`); }} aria-label={`Open job ${job.title}`}>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg">{job.title}</h3>
                <p className="text-white/80 text-sm line-clamp-3">{job.description}</p>
                <div className="mt-2 text-sm text-white/60">by {job.postedBy} • ${job.price} • {job.status}</div>
              </div>
              <div className="flex sm:flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                <button onClick={(ev) => { ev.stopPropagation(); handleDelete(i); }} className="px-3 py-2 rounded bg-red-600 text-white w-full sm:w-auto">Remove</button>
                <button onClick={(ev) => { ev.stopPropagation(); navigate(`/jobs/${i}`); }} className="px-3 py-2 rounded bg-blue-500 text-white w-full sm:w-auto">Apply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
