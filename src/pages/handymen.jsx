import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Portal from '../components/Portal';



const sampleHandymen = [
  {
    id: 1,
    name: 'Kwame Mensah',
    rating: 4.7,
    reviews: 124,
    skills: ['plumbing', 'electrical', 'tiling'],
    hourly: 18,
    location: 'Accra',
  },
  {
    id: 2,
    name: 'Aisha Bello',
    rating: 4.9,
    reviews: 210,
    skills: ['painting', 'carpentry', 'drywall'],
    hourly: 22,
    location: 'Lagos',
  },
  {
    id: 3,
    name: 'John Doe',
    rating: 4.2,
    reviews: 58,
    skills: ['landscaping', 'gardening', 'fencing'],
    hourly: 15,
    location: 'Kumasi',
  },
  {
    id: 4,
    name: 'Maria Gonzales',
    rating: 4.5,
    reviews: 89,
    skills: ['electrical', 'appliance repair'],
    hourly: 20,
    location: 'Accra',
  },
];

function computeCompatibility(handyman, requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return Math.round(handyman.rating * 20); 
  const matches = requiredSkills.filter((s) => handyman.skills.includes(s.toLowerCase()));
 
  const matchScore = (matches.length / requiredSkills.length) * 70;
  const ratingScore = (handyman.rating / 5) * 30;
  return Math.round(matchScore + ratingScore);
}

export default function Handymen() {
  const [handymen] = useState(sampleHandymen);
  const [querySkills, setQuerySkills] = useState('electrical');
  const [sortBy, setSortBy] = useState('compatibility');
  const [selected, setSelected] = useState(null);
  const [userState, setUserState] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ score: 5, review: '' });
  const [reviews, setReviews] = useState({});
  const navigate = useNavigate();

  // Load user state and reviews from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserState(user);
    } catch (e) {
      setUserState(null);
    }
    try {
      const savedReviews = JSON.parse(localStorage.getItem('handymenReviews')) || {};
      setReviews(savedReviews);
    } catch (e) {
      setReviews({});
    }
  }, []);

  const requiredSkills = useMemo(() => {
    return querySkills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  }, [querySkills]);

  const withScore = useMemo(() => {
    return handymen.map((h) => ({ ...h, compatibility: computeCompatibility(h, requiredSkills) }));
  }, [handymen, requiredSkills]);

  const sorted = useMemo(() => {
    return [...withScore].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'hourly') return a.hourly - b.hourly;
      
      return b.compatibility - a.compatibility;
    });
  }, [withScore, sortBy]);

  // Check if user is a client
  const isClient = userState && String(userState.role).toLowerCase() === 'client';

  // Get reviews for a specific handyman
  const getHandymanReviews = (handymanId) => {
    return reviews[handymanId] || [];
  };

  // Submit a review
  const handleSubmitReview = () => {
    if (!selected || !isClient) {
      alert('Only clients can leave reviews');
      return;
    }
    if (!ratingData.review.trim()) {
      alert('Please write a review');
      return;
    }
    const newReview = {
      id: Date.now().toString(),
      clientName: userState.name || userState.email,
      clientEmail: userState.email,
      score: ratingData.score,
      review: ratingData.review,
      date: new Date().toLocaleDateString(),
    };
    const handymanId = selected.id;
    const updatedReviews = { ...reviews };
    if (!updatedReviews[handymanId]) updatedReviews[handymanId] = [];
    updatedReviews[handymanId].unshift(newReview);
    setReviews(updatedReviews);
    try {
      localStorage.setItem('handymenReviews', JSON.stringify(updatedReviews));
    } catch (e) {
      console.error('Failed to save review', e);
    }
    setRatingData({ score: 5, review: '' });
    setShowRatingModal(false);
    alert('Review submitted successfully!');
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back</button>
            <h2 className="text-2xl font-semibold mb-0 text-black">Handymen</h2>
          </div>
  <p className="text-sm text-amber-400 mb-4">Search handymen by skills (comma separated). Clients can view and compare handymen here.</p>

        <div className="flex gap-3 items-center mb-4">
        <input
          value={querySkills}
          onChange={(e) => setQuerySkills(e.target.value)}
          className="input-field bg-white/5 text-white placeholder-white/60 border-white/20"
          placeholder="e.g. electrical, plumbing"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm text-black/70">Sort</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field bg-white text-slate-900 border-white/20 px-3 py-2 rounded-md"
            style={{ minWidth: 180 }}
          >
            <option value="compatibility" >Compatibility — best match first </option>
            <option value="rating">Rating — highest first</option>
            <option value="hourly">Hourly rate — lowest first</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {sorted.map((h) => (
            <div key={h.id} className="glass-card p-4 mb-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-semibold text-lg text-black">{h.name.split(' ').map(n => n[0]).slice(0,2).join('')}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                          <div className="font-semibold text-black">{h.name}</div>
                          <div className="text-sm text-black/60">{h.location} • {h.skills.join(', ')}</div>
                    </div>
                    <div className="text-right">
                          <div className="font-semibold text-black">{h.rating.toFixed(1)} ★</div>
                          <div className="text-sm text-black/60">{h.reviews} reviews</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-black/70">Hourly: ${h.hourly}</div>
                    <div>
                          <div className="text-sm text-black/70">Compatibility: <strong className="text-black">{h.compatibility}%</strong></div>
                      <button onClick={() => setSelected(h)} className="mt-2 btn-secondary">View details</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-2 text-white">Details</h3>
            {!selected && <div className="text-sm text-white/60">Select a handyman to see more details and compatibility breakdown.</div>}
            {selected && (
              <div>
                <div className="mb-2 font-semibold text-white">{selected.name}</div>
                <div className="text-sm text-white/70">Location: {selected.location}</div>
                <div className="text-sm text-white/70">Skills: {selected.skills.join(', ')}</div>
                <div className="text-sm text-white/70">Rating: {selected.rating} ({selected.reviews} reviews)</div>
                <div className="mt-3">
                  <h4 className="font-medium">Compatibility breakdown</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {requiredSkills.map((s, i) => (
                      <li key={i} className="text-white/70">{s} — {selected.skills.includes(s) ? 'Match' : 'No match'}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-white/70">Overall compatibility: <strong className="text-white">{computeCompatibility(selected, requiredSkills)}%</strong></div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => alert('Contact flow not implemented in this demo')} className="btn-primary">Contact</button>
                    {isClient && (
                      <button onClick={() => setShowRatingModal(true)} className="btn-secondary">Leave Review</button>
                    )}
                  </div>
                </div>

                {/* Display reviews for this handyman */}
                <div className="mt-4">
                  <h4 className="font-medium text-white mb-2">Reviews ({getHandymanReviews(selected.id).length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getHandymanReviews(selected.id).length === 0 ? (
                      <div className="text-sm text-white/60">No reviews yet. Be the first to review!</div>
                    ) : (
                      getHandymanReviews(selected.id).map((rev) => (
                        <div key={rev.id} className="bg-white/5 rounded-md p-2 border border-white/10">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium text-white">{rev.clientName}</div>
                            <div className="text-yellow-400 text-xs">{rev.score} ★</div>
                          </div>
                          <div className="text-xs text-white/60">{rev.date}</div>
                          <div className="text-sm text-white/80 mt-1">{rev.review}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-white/60">
            Note: Compatibility is a heuristic for quick filtering — consider interviewing or reviewing full profiles before hiring.
          </div>
        </div>
      </div>

      {/* Rating and Review Modal */}
      {showRatingModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowRatingModal(false)} />
            <div className="relative bg-white text-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold">Rate {selected?.name}</h2>
                <button onClick={() => setShowRatingModal(false)} className="text-slate-500 hover:text-slate-700">✕</button>
              </div>
              
              <div className="space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRatingData({ ...ratingData, score: star })}
                        className={`text-2xl transition-colors ${
                          star <= ratingData.score ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{ratingData.score} out of 5 stars</div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                  <textarea
                    value={ratingData.review}
                    onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Share your experience working with this handyman..."
                  />
                  <div className="text-xs text-slate-500 mt-1">{ratingData.review.length} / 500 characters</div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Review
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
