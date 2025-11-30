import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getDisplayName } from "../utils/user";
import { Link } from "react-router-dom";

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [followersMap, setFollowersMap] = useState({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState('all'); // all | followed
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    // derive creators from jobs in localStorage (same logic as Dashboard seeding)
    const savedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const creatorNames = Array.from(new Set(savedJobs.map(j => j.postedBy)));
    const seededCreators = creatorNames.map(name => {
      const initials = name.split(' ').map(n => n[0]).slice(0,2).join('');
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6C5CE7&color=ffffff&rounded=true&size=128`;
      return { name, bio: `Service provider — ${name}`, avatar: initials, avatarUrl };
    });
    setCreators(seededCreators);

    try {
      const savedFollowers = JSON.parse(localStorage.getItem('followers')) || {};
      setFollowersMap(savedFollowers);
    } catch (e) {
      setFollowersMap({});
    }
  }, []);

  function toggleFollow(creatorName) {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const followerName = getDisplayName(user) || user.email || 'Anonymous';
    const next = { ...followersMap };
    const setFor = new Set(next[creatorName] || []);
    if (setFor.has(followerName)) setFor.delete(followerName); else setFor.add(followerName);
    next[creatorName] = Array.from(setFor);
    setFollowersMap(next);
    try {
      localStorage.setItem('followers', JSON.stringify(next));
      // broadcast change so other components can update
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('subscriptionsUpdated'));
    } catch (e) {
      console.error('Failed to persist followers', e);
    }
  }

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  let filtered = creators
    .map(c => ({ ...c, followers: (followersMap[c.name] || []).length }))
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.bio.toLowerCase().includes(query.toLowerCase()));

  if (filter === 'followed') {
    const me = getDisplayName(currentUser) || currentUser.name || currentUser.email || '';
    filtered = filtered.filter(c => (followersMap[c.name] || []).includes(me));
  }

  filtered = filtered.sort((a, b) => b.followers - a.followers);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Creators</h1>
            <p className="text-white/70">Browse and follow providers you like. More followers = more promotion.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-white/60 hover:text-white">← Back to dashboard</Link>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search creators..." className="w-full md:w-80 p-3 rounded-lg bg-white/5 border border-white/10 text-white" />
          <div className="flex items-center gap-2">
            <button onClick={() => { setFilter('all'); setPage(1); }} className={`px-3 py-2 rounded ${filter==='all' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'}`}>All</button>
            <button onClick={() => { setFilter('followed'); setPage(1); }} className={`px-3 py-2 rounded ${filter==='followed' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/60'}`}>Followed</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paged.map((c, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-4">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">{c.avatar}</div>
                )}
                <div className="flex-1">
                  <div className="text-white font-semibold">{c.name}</div>
                  <div className="text-slate-300 text-sm">{c.bio}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-300">{(followersMap[c.name] || []).length} followers</div>
                <button onClick={() => toggleFollow(c.name)} className="px-3 py-1 rounded bg-yellow-500 text-slate-900 font-medium hover:scale-105 transition-transform">
                  {(followersMap[c.name] || []).includes(currentUser.name) ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-white/70">No creators match your search.</div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1} className="px-3 py-2 rounded bg-white/5 text-white/60 disabled:opacity-50">Prev</button>
          <div className="text-white/70">Page {page} of {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages} className="px-3 py-2 rounded bg-white/5 text-white/60 disabled:opacity-50">Next</button>
        </div>
      </div>
    </Layout>
  );
}
