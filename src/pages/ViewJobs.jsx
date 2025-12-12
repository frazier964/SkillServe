import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Portal from '../components/Portal';
import BackButton from '../components/BackButton';

const JOB_CATEGORIES = [
  { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Fix pipes, install fixtures, water systems' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Electrical work, wiring, installations' },
  { id: 'web-developer', name: 'Web Developer', icon: '💻', description: 'Website development, design, maintenance' },
  { id: 'engineer', name: 'Engineer', icon: '🏗️', description: 'Structural, civil, mechanical engineering' },
  { id: 'secretary', name: 'Secretary', icon: '📋', description: 'Administrative, clerical, office support' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪵', description: 'Woodwork, furniture, construction' },
  { id: 'painter', name: 'Painter', icon: '🎨', description: 'Interior/exterior painting, finishing' },
  { id: 'landscaper', name: 'Landscaper', icon: '🌿', description: 'Garden design, lawn care, landscaping' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔩', description: 'Auto repair, vehicle maintenance' },
  { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Residential/commercial cleaning services' },
  { id: 'chef', name: 'Chef/Cook', icon: '👨‍🍳', description: 'Catering, cooking, meal preparation' },
  { id: 'delivery', name: 'Delivery Driver', icon: '🚗', description: 'Food delivery, package delivery, courier services' },
  { id: 'cashier', name: 'Cashier', icon: '💳', description: 'Point of sale, customer service, transactions' },
  { id: 'tutor', name: 'Tutor', icon: '📚', description: 'Education, teaching, academic support' },
];

export default function ViewJobs() {
  const navigate = useNavigate();
  const [userState, setUserState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({ message: '', hourlyRate: '' });

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserState(user);

      // Check if user is handyman
      if (user && String(user.role).toLowerCase() !== 'handyman') {
        alert('Only handymen can view available jobs');
        navigate('/dashboard');
        return;
      }
    } catch (e) {
      setUserState(null);
    }

    // Load jobs from localStorage
    try {
      const savedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      setJobs(savedJobs);
    } catch (e) {
      setJobs([]);
    }
  }, [navigate]);

  const filteredJobs = selectedCategory === 'all' 
    ? jobs 
    : jobs.filter(job => job.category?.toLowerCase() === selectedCategory);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setApplicationData({ message: '', hourlyRate: '' });
    setShowApplyModal(true);
  };

  const handleSubmitApplication = () => {
    if (!applicationData.message.trim()) {
      alert('Please write a message about your qualifications');
      return;
    }
    if (!applicationData.hourlyRate) {
      alert('Please enter your hourly rate');
      return;
    }

    const application = {
      id: Date.now().toString(),
      jobTitle: selectedJob.title,
      handymanName: userState.name || userState.email,
      handymanEmail: userState.email,
      message: applicationData.message,
      hourlyRate: applicationData.hourlyRate,
      appliedAt: new Date().toLocaleString(),
      status: 'pending',
    };

    try {
      const applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
      applications.push(application);
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      alert(`Applied to "${selectedJob.title}" successfully!`);
      setShowApplyModal(false);
      setSelectedJob(null);
      setApplicationData({ message: '', hourlyRate: '' });
    } catch (e) {
      console.error('Failed to save application', e);
      alert('Failed to submit application');
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-6">
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-linear-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-white/20 mb-6 sm:mb-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Available Jobs 💼</h1>
            <p className="text-white/70 text-sm sm:text-lg">Browse and apply for jobs in your field</p>
          </div>
        </div>

        {/* Job Categories Filter */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 text-center font-semibold min-h-[80px] sm:min-h-0 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
              <span className="text-xs sm:text-base">All Jobs</span>
            </button>
            {JOB_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 text-center min-h-[80px] sm:min-h-0 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{category.icon}</div>
                <div className="font-semibold text-xs sm:text-sm">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="glass-card p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'All Posted Jobs' : `Jobs in ${JOB_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
          </h2>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <p className="text-gray-700 text-lg mb-2">No jobs in this category</p>
              <p className="text-gray-600 text-sm">Check back soon or browse other categories!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredJobs.map((job, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {job.category || 'General'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{job.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-green-700 font-semibold">Budget: ${job.price || 'TBD'}</span>
                        <span className="text-gray-600">Posted by: {job.postedBy}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {job.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowApplyModal(false)} />
              <div className="relative bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Apply for Job</h2>
                  <button onClick={() => setShowApplyModal(false)} className="text-white/70 hover:text-white text-2xl">✕</button>
                </div>

                <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-white/70 text-xs">Job Title</p>
                  <p className="text-white font-semibold">{selectedJob.title}</p>
                </div>

                <div className="space-y-4">
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-white font-semibold mb-2">Your Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={applicationData.hourlyRate}
                      onChange={(e) => setApplicationData({ ...applicationData, hourlyRate: e.target.value })}
                      placeholder="Enter your hourly rate"
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Message ({applicationData.message.length} / 500)
                    </label>
                    <textarea
                      value={applicationData.message}
                      onChange={(e) => setApplicationData({ ...applicationData, message: e.target.value.slice(0, 500) })}
                      placeholder="Tell the client about your experience and why you're a good fit for this job..."
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all resize-none h-32"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </Layout>
  );
}
