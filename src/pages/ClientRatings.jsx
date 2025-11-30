import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Portal from '../components/Portal';

export default function ClientRatings() {
  const navigate = useNavigate();
  const [userState, setUserState] = useState(null);
  const [clients, setClients] = useState([]);
  const [ratings, setRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [ratingData, setRatingData] = useState({ paymentRating: 5, interactionRating: 5, review: '' });

  // Load user, clients, and ratings
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserState(user);

      // Check if user is handyman
      if (user && String(user.role).toLowerCase() !== 'handyman') {
        alert('Only handymen can rate clients');
        navigate('/dashboard');
        return;
      }
    } catch (e) {
      setUserState(null);
    }

    // Load all clients (those who posted jobs)
    try {
      const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
      const uniqueClients = [...new Set(jobs.map(job => job.postedBy))];
      setClients(uniqueClients);
    } catch (e) {
      setClients([]);
    }

    // Load client ratings
    try {
      const savedRatings = JSON.parse(localStorage.getItem('clientRatings')) || {};
      setRatings(savedRatings);
    } catch (e) {
      setRatings({});
    }
  }, [navigate]);

  // Get ratings for a specific client
  const getClientRatings = (clientName) => {
    return ratings[clientName] || [];
  };

  // Submit a rating
  const handleSubmitRating = () => {
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }
    if (!userState) {
      alert('You must be logged in to rate clients');
      return;
    }
    if (ratingData.review.trim().length === 0) {
      alert('Please write a review');
      return;
    }

    const newRating = {
      id: Date.now().toString(),
      handymanName: userState.name || userState.email,
      handymanEmail: userState.email,
      paymentRating: ratingData.paymentRating,
      interactionRating: ratingData.interactionRating,
      review: ratingData.review,
      date: new Date().toLocaleDateString(),
    };

    const updatedRatings = { ...ratings };
    if (!updatedRatings[selectedClient]) updatedRatings[selectedClient] = [];
    updatedRatings[selectedClient].unshift(newRating);
    setRatings(updatedRatings);

    try {
      localStorage.setItem('clientRatings', JSON.stringify(updatedRatings));
    } catch (e) {
      console.error('Failed to save rating', e);
    }

    setRatingData({ paymentRating: 5, interactionRating: 5, review: '' });
    setShowRatingModal(false);
    setSelectedClient(null);
    alert('Rating submitted successfully!');
  };

  const isHandyman = userState && String(userState.role).toLowerCase() === 'handyman';

  if (!isHandyman) {
    return (
      <Layout>
        <div className="w-full max-w-2xl mx-auto p-6">
          <div className="glass-card p-8 rounded-2xl bg-linear-to-br from-red-600/20 to-pink-600/20 border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-white/70">Only handymen can rate clients. If you are a handyman, please make sure your role is set correctly in your profile.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Back to Dashboard</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white transition-colors">← Back to Dashboard</button>
        </div>

        <div className="glass-card p-8 rounded-3xl bg-linear-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-white/20 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Rate Clients ⭐</h1>
            <p className="text-white/70 text-lg">Share your experience working with clients. Rate their payment times and interaction quality.</p>
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl bg-linear-to-br from-amber-600/10 to-orange-600/10 border border-white/20">
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No clients to rate yet</p>
              <p className="text-white/50 text-sm mt-2">Once you work with clients who post jobs, you'll be able to rate them here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clients.map((clientName, idx) => {
              const clientRatings = getClientRatings(clientName);
              const avgPaymentRating = clientRatings.length > 0
                ? (clientRatings.reduce((sum, r) => sum + r.paymentRating, 0) / clientRatings.length).toFixed(1)
                : 'N/A';
              const avgInteractionRating = clientRatings.length > 0
                ? (clientRatings.reduce((sum, r) => sum + r.interactionRating, 0) / clientRatings.length).toFixed(1)
                : 'N/A';

              return (
                <div key={idx} className="glass-card p-6 rounded-2xl bg-linear-to-br from-slate-800/40 to-slate-900/40 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{clientName}</h3>
                      <p className="text-white/50 text-sm mt-1">Total ratings: {clientRatings.length}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedClient(clientName);
                        setShowRatingModal(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Add Rating
                    </button>
                  </div>

                  {clientRatings.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 p-3 rounded-lg">
                          <p className="text-white/70 text-xs font-medium">Payment Rating</p>
                          <p className="text-yellow-400 text-lg font-bold mt-1">{avgPaymentRating}/5</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                          <p className="text-white/70 text-xs font-medium">Interaction Rating</p>
                          <p className="text-yellow-400 text-lg font-bold mt-1">{avgInteractionRating}/5</p>
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        <p className="text-white/50 text-xs font-medium mb-2">Recent Ratings:</p>
                        <div className="space-y-2">
                          {clientRatings.slice(0, 3).map((rating) => (
                            <div key={rating.id} className="bg-white/5 p-2 rounded text-sm border border-white/10">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-white font-medium">{rating.handymanName}</p>
                                  <p className="text-white/50 text-xs">Payment: ⭐{rating.paymentRating} | Interaction: ⭐{rating.interactionRating}</p>
                                </div>
                                <p className="text-white/40 text-xs">{rating.date}</p>
                              </div>
                              <p className="text-white/70 text-xs mt-1">{rating.review}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/50 text-sm text-center py-6">No ratings yet. Be the first to rate this client!</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedClient && (
          <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowRatingModal(false)} />
              <div className="relative bg-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Rate {selectedClient}</h2>
                  <button onClick={() => setShowRatingModal(false)} className="text-white/70 hover:text-white text-2xl">✕</button>
                </div>

                <div className="space-y-5">
                  {/* Payment Rating */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Payment Reliability: {ratingData.paymentRating} ⭐
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={`payment-${star}`}
                          onClick={() => setRatingData({ ...ratingData, paymentRating: star })}
                          className={`text-3xl transition-all duration-200 ${
                            star <= ratingData.paymentRating
                              ? 'text-yellow-400 scale-110'
                              : 'text-white/20 hover:text-white/40'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-white/50 text-xs mt-1">Rate how reliably the client pays for completed work</p>
                  </div>

                  {/* Interaction Rating */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Interaction Quality: {ratingData.interactionRating} ⭐
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={`interaction-${star}`}
                          onClick={() => setRatingData({ ...ratingData, interactionRating: star })}
                          className={`text-3xl transition-all duration-200 ${
                            star <= ratingData.interactionRating
                              ? 'text-yellow-400 scale-110'
                              : 'text-white/20 hover:text-white/40'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-white/50 text-xs mt-1">Rate how easy and professional the client is to work with</p>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Review ({ratingData.review.length} / 500 characters)
                    </label>
                    <textarea
                      value={ratingData.review}
                      onChange={(e) => setRatingData({ ...ratingData, review: e.target.value.slice(0, 500) })}
                      placeholder="Share details about your experience working with this client..."
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 resize-none h-32"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
                  >
                    Submit Rating
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
