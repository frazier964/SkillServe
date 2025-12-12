import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function JobApply() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const idx = parseInt(index, 10);
    if (!isNaN(idx) && jobs[idx]) setJob(jobs[idx]);
  }, [index]);

  function submitApplication(e) {
    e.preventDefault();
    if (!name || !contact || !message) {
      setStatus('Please fill all fields');
      return;
    }
    const apps = JSON.parse(localStorage.getItem('applications') || '[]');
    apps.push({ jobIndex: parseInt(index, 10), jobTitle: job?.title || '', applicant: name, contact, message, time: new Date().toISOString() });
    localStorage.setItem('applications', JSON.stringify(apps));
    setStatus('Application submitted — we will notify you.');
    setTimeout(() => navigate('/jobs'), 1200);
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">
          <div className="glass-card p-6 rounded-2xl bg-linear-to-r from-slate-800 to-slate-900 text-white">Job not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-6 rounded-2xl bg-linear-to-br from-white/5 to-white/3 border border-white/10 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-2">Apply for: {job.title}</h1>
          <p className="text-white/80 mb-4">{job.description}</p>
          <div className="mb-4 text-sm text-white/70">Posted by <strong className="text-white">{job.postedBy}</strong> • ${job.price} • {job.status}</div>

          <form onSubmit={submitApplication} className="space-y-4 bg-white/5 p-4 rounded">
            <div>
              <label className="block text-sm font-medium text-white">Your name</label>
              <input className="w-full p-3 rounded bg-white text-black" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Contact (phone or email)</label>
              <input className="w-full p-3 rounded bg-white text-black" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Message</label>
              <textarea rows={5} className="w-full p-3 rounded bg-white text-black" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {status && <div className="text-sm text-yellow-600">{status}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => navigate('/jobs')} className="px-4 py-2 rounded bg-transparent border border-white/10 text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-green-500 text-black font-semibold">Submit Application</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
