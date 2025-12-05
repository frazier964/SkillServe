import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function Activities() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user')) || {};
      setUser(u);
    } catch (e) {
      console.error('Failed to load user:', e);
    }
  }, []);

  useEffect(() => {
    // Generate comprehensive activity data
    const generateActivities = () => {
      const activityTypes = [
        { type: 'job_posted', action: 'Posted new job', icon: '📝', color: 'bg-blue-500/20 text-blue-400' },
        { type: 'job_applied', action: 'Applied to job', icon: '📄', color: 'bg-green-500/20 text-green-400' },
        { type: 'job_completed', action: 'Completed job', icon: '✅', color: 'bg-green-500/20 text-green-400' },
        { type: 'payment_received', action: 'Payment received', icon: '💰', color: 'bg-green-500/20 text-green-400' },
        { type: 'message_received', action: 'New message received', icon: '💬', color: 'bg-purple-500/20 text-purple-400' },
        { type: 'profile_updated', action: 'Profile updated', icon: '👤', color: 'bg-indigo-500/20 text-indigo-400' },
        { type: 'premium_upgraded', action: 'Upgraded to Premium', icon: '⭐', color: 'bg-yellow-500/20 text-yellow-400' },
        { type: 'review_received', action: 'Received review', icon: '⭐', color: 'bg-orange-500/20 text-orange-400' },
        { type: 'job_cancelled', action: 'Job cancelled', icon: '❌', color: 'bg-red-500/20 text-red-400' },
        { type: 'withdrawal', action: 'Earnings withdrawn', icon: '🏦', color: 'bg-cyan-500/20 text-cyan-400' },
        { type: 'account_verified', action: 'Account verified', icon: '✓', color: 'bg-emerald-500/20 text-emerald-400' },
        { type: 'notification_read', action: 'Notifications checked', icon: '🔔', color: 'bg-gray-500/20 text-gray-400' }
      ];

      const jobTitles = [
        'Kitchen Plumbing Repair', 'Bathroom Tile Installation', 'Electrical Outlet Installation',
        'Garden Fence Repair', 'Ceiling Fan Installation', 'Driveway Pressure Washing',
        'Cabinet Door Repair', 'Toilet Installation', 'Window Screen Replacement',
        'Deck Staining', 'Garbage Disposal Installation', 'Gutter Cleaning'
      ];

      const clients = [
        'Sarah Johnson', 'Michael Chen', 'David Wilson', 'Lisa Rodriguez',
        'James Miller', 'Amanda Davis', 'Robert Taylor', 'Maria Garcia'
      ];

      const generateRandomActivities = () => {
        const activities = [];
        const now = new Date();
        
        for (let i = 0; i < 50; i++) {
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          const hoursAgo = Math.floor(Math.random() * (24 * 7)); // Within last week
          const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
          
          let description = activityType.action;
          let details = '';
          
          // Add contextual details based on activity type
          switch (activityType.type) {
            case 'job_posted':
            case 'job_applied':
            case 'job_completed':
              const job = jobTitles[Math.floor(Math.random() * jobTitles.length)];
              details = `"${job}"`;
              break;
            case 'payment_received':
            case 'withdrawal':
              const amount = (Math.random() * 500 + 50).toFixed(2);
              details = `$${amount}`;
              break;
            case 'message_received':
              const client = clients[Math.floor(Math.random() * clients.length)];
              details = `from ${client}`;
              break;
            case 'review_received':
              const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0 stars
              details = `${rating}/5.0 stars`;
              break;
            default:
              details = '';
          }

          activities.push({
            id: i + 1,
            type: activityType.type,
            action: description,
            details,
            icon: activityType.icon,
            color: activityType.color,
            timestamp,
            timeAgo: getTimeAgo(timestamp)
          });
        }
        
        return activities.sort((a, b) => b.timestamp - a.timestamp);
      };

      return generateRandomActivities();
    };

    const allActivities = generateActivities();
    setActivities(allActivities);
  }, []);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type.includes(filter);
  });

  const activityCounts = {
    all: activities.length,
    job: activities.filter(a => a.type.includes('job')).length,
    payment: activities.filter(a => a.type.includes('payment') || a.type.includes('withdrawal')).length,
    message: activities.filter(a => a.type.includes('message')).length,
    profile: activities.filter(a => a.type.includes('profile') || a.type.includes('premium') || a.type.includes('account')).length
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#6A0DAD] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="glass-card p-8 rounded-3xl bg-linear-to-r from-slate-800/90 to-slate-900/90 text-white shadow-2xl">
            <div className="mb-8">
              <BackButton className="mb-6" />
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  📊 Activity Timeline
                </h1>
                <p className="text-slate-300 text-lg mb-6">
                  Complete history of your account activities and interactions
                </p>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400">{activityCounts.all}</div>
                <div className="text-sm text-slate-300">Total Activities</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-400">{activityCounts.job}</div>
                <div className="text-sm text-slate-300">Job Activities</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-yellow-400">{activityCounts.payment}</div>
                <div className="text-sm text-slate-300">Payments</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-400">{activityCounts.message}</div>
                <div className="text-sm text-slate-300">Messages</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-indigo-400">{activityCounts.profile}</div>
                <div className="text-sm text-slate-300">Profile Updates</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {[
                { key: 'all', label: 'All Activities', icon: '📋' },
                { key: 'job', label: 'Jobs', icon: '💼' },
                { key: 'payment', label: 'Payments', icon: '💰' },
                { key: 'message', label: 'Messages', icon: '💬' },
                { key: 'profile', label: 'Profile', icon: '👤' }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    filter === filterOption.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <span>{filterOption.icon}</span>
                  <span className="font-medium">{filterOption.label}</span>
                  <span className="text-xs opacity-75">({activityCounts[filterOption.key]})</span>
                </button>
              ))}
            </div>

            {/* Activities Timeline */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No Activities Found</h3>
                  <p className="text-slate-400">No activities match the current filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activity.color} shrink-0`}>
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {activity.action}
                              {activity.details && (
                                <span className="text-slate-300 ml-2">{activity.details}</span>
                              )}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              {activity.timestamp.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-slate-400 text-sm ml-4 shrink-0">
                            {activity.timeAgo}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  // Clear activities and regenerate
                  window.location.reload();
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Refresh Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}