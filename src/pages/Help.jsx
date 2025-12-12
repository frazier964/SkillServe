import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function Help() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isMalicious, setIsMalicious] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      setUser(userData);
      setContact(userData.email || '');
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both subject and message fields.');
      return;
    }

    setSubmitting(true);
    
    try {
      const raw = localStorage.getItem('helpRequests');
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: Date.now().toString(),
        subject: subject.trim(),
        message: message.trim(),
        contact: contact.trim(),
        category: category || 'General',
        isMalicious: !!isMalicious,
        user: user ? { name: user.name, email: user.email, role: user.role } : null,
        time: new Date().toISOString(),
        status: 'Open'
      };
      
      list.unshift(entry);
      localStorage.setItem('helpRequests', JSON.stringify(list));
      window.dispatchEvent(new Event('helpRequestsUpdated'));
      
      setSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (e) {
      console.error('Failed to save help request', e);
      alert('Failed to submit help request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setContact(user?.email || '');
    setCategory('');
    setIsMalicious(false);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#6A0DAD] py-12">
          <div className="max-w-2xl mx-auto p-6">
            <div className="glass-card p-8 rounded-2xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-4">Help Request Submitted!</h2>
              <p className="text-slate-300 mb-6">
                Thank you for reaching out. We've received your help request and will follow up with you shortly.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                You will be redirected to the dashboard automatically, or you can click the button below.
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-lg bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#6A0DAD] py-6 sm:py-12">
        <div className="max-w-2xl mx-auto p-3 sm:p-6">
          <div className="glass-card p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white">
            <div className="mb-6">
              <BackButton className="mb-4" />
            </div>
            <div className="mb-4 sm:mb-6 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🆘</div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Help & Support</h1>
              <p className="text-sm sm:text-base text-slate-300">
                Need assistance? Report an issue or ask for help below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Issue Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Account Problem">Account Problem</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Question">General Question</option>
                  <option value="Safety Concern">Safety Concern</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject <span className="text-red-400">*</span></label>
                <input 
                  type="text"
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Brief summary of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message <span className="text-red-400">*</span></label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows={6} 
                  placeholder="Provide as much detail as possible about your issue, including steps to reproduce if it's a bug, or specific questions you have."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <input 
                  type="email"
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Your email address for follow-up"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input 
                  id="malicious" 
                  type="checkbox" 
                  checked={isMalicious} 
                  onChange={(e) => setIsMalicious(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-white/20 rounded bg-white/10"
                />
                <label htmlFor="malicious" className="text-sm text-slate-300">
                  This is a report of malicious, abusive, or inappropriate behavior
                </label>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button 
                  type="button" 
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 rounded-lg bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
                
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-6 py-3 rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-all duration-200"
                  >
                    Reset Form
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={submitting || !subject.trim() || !message.trim()}
                    className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Help Request'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}