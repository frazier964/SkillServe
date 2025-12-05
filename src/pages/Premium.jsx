import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Portal from "../components/Portal";
import { checkTrialStatus } from "../utils/trialAccess";

export default function Premium() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [expiredPlan, setExpiredPlan] = useState(null);
  const [isAnnual, setIsAnnual] = useState(() => {
    try {
      const raw = localStorage.getItem('premiumIsAnnual');
      return raw ? JSON.parse(raw) : false;
    } catch (e) {
      return false;
    }
  });
  const gridRef = useRef(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData) {
        setUserState(userData);
      }
    } catch (_e) {
      setUserState(null);
    }
  }, []);

  // persist billing preference
  useEffect(() => {
    try {
      localStorage.setItem('premiumIsAnnual', JSON.stringify(isAnnual));
    } catch (e) {
      // ignore
    }
  }, [isAnnual]);

  // keyboard navigation for plan cards (arrow keys) and smooth scrolling
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    function getCols() {
      const w = window.innerWidth;
      if (w >= 1024) return 4;
      if (w >= 768) return 3;
      if (w >= 640) return 2;
      return 1;
    }

    function handler(e) {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
      if (!keys.includes(e.key)) return;
      const cards = Array.from(el.querySelectorAll('[data-plan-card]'));
      if (!cards.length) return;
      const active = document.activeElement;
      let idx = cards.indexOf(active);
      if (idx === -1) {
        cards[0].focus();
        return;
      }
      const cols = getCols();
      let next = idx;
      if (e.key === 'ArrowRight') next = Math.min(cards.length - 1, idx + 1);
      if (e.key === 'ArrowLeft') next = Math.max(0, idx - 1);
      if (e.key === 'ArrowDown') next = Math.min(cards.length - 1, idx + cols);
      if (e.key === 'ArrowUp') next = Math.max(0, idx - cols);
      if (next !== idx) {
        e.preventDefault();
        cards[next].focus();
        cards[next].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }

    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [gridRef]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch (e) {
      return {};
    }
  })();

  const plans = [
    {
      id: 'client-basic',
      title: 'Client — FastTrack Basic',
      monthlyPrice: '$2.99 / month',
      annualPrice: '$29.99 / year',
      description: 'Affordable priority listings for occasional clients.',
      role: 'client',
      benefits: [
        'Priority job listings',
        'Faster matches',
      ]
    },
    {
      id: 'client-pro',
      title: 'Client — FastTrack Pro',
      monthlyPrice: '$7.99 / month',
      annualPrice: '$79.99 / year',
      description: 'For power users who want featured placement and support.',
      role: 'client',
      benefits: [
        'Featured in search',
        'Top placement for listings',
        'Dedicated support',
      ]
    },
    {
      id: 'handyman-basic',
      title: 'Handyman — ProBoost Basic',
      monthlyPrice: '$3.99 / month',
      annualPrice: '$39.99 / year',
      description: 'Boost your profile and reach more clients.',
      role: 'handyman',
      benefits: [
        'Priority job invites',
        'Boosted profile',
      ]
    },
    {
      id: 'handyman-pro',
      title: 'Handyman — ProBoost Pro',
      monthlyPrice: '$9.99 / month',
      annualPrice: '$99.99 / year',
      description: 'Top-level visibility and analytics for pros.',
      role: 'handyman',
      benefits: [
        'Premium leads',
        'Higher invite priority',
        'Insights & analytics',
      ]
    },
    {
      id: 'enterprise',
      title: 'Enterprise — Team Boost',
      monthlyPrice: '$29.99 / month',
      annualPrice: '$299.99 / year',
      description: 'Multi-seat plans and account management for teams.',
      role: 'both',
      benefits: [
        'Multiple seats',
        'Priority matching & account manager',
        'Custom SLA',
      ]
    }
  ,
    {
      id: 'student',
      title: 'Student — Learn & Launch',
      monthlyPrice: '$0.99 / month',
      annualPrice: '$9.99 / year',
      description: 'Discounted access for students and learners.',
      role: 'both',
      benefits: [
        'Discounted listings',
        'Access to learning resources',
        'Community support',
      ]
    },
    {
      id: 'nonprofit',
      title: 'Nonprofit — Community Plan',
      monthlyPrice: '$4.99 / month',
      annualPrice: '$49.99 / year',
      description: 'Preferential pricing and support for nonprofits.',
      role: 'both',
      benefits: [
        'Special billing',
        'Priority matching for community projects',
        'Annual impact report',
      ]
    },
    {
      id: 'annual-saver',
      title: 'Annual — Saver (Yearly)',
      monthlyPrice: '$7.99 / month',
      annualPrice: '$79.99 / year',
      description: 'Best value yearly plan with full access.',
      role: 'both',
      benefits: [
        'Save ~30% vs monthly',
        'Priority support',
        'All Pro features unlocked',
      ]
    },
    {
      id: 'agency',
      title: 'Agency — Partner',
      monthlyPrice: '$59.99 / month',
      annualPrice: '$599.99 / year',
      description: 'Agency-grade features, billing, and onboarding.',
      role: 'both',
      benefits: [
        'Multiple seats & billing',
        'Dedicated onboarding',
        'Account manager & SLA',
      ]
    }
  ];

  const accentMap = {
    'client-basic': 'from-blue-500/30 to-indigo-400/20',
    'client-pro': 'from-emerald-400/25 to-green-400/15',
    'handyman-basic': 'from-yellow-400/25 to-orange-400/15',
    'handyman-pro': 'from-pink-500/25 to-rose-400/15',
    'enterprise': 'from-violet-500/25 to-purple-400/15',
    'student': 'from-indigo-400/20 to-blue-400/10',
    'nonprofit': 'from-emerald-300/20 to-teal-300/12',
    'annual-saver': 'from-yellow-400/20 to-amber-400/12',
    'agency': 'from-fuchsia-500/22 to-pink-500/12'
  };

  const iconMap = {
    'client-basic': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 8h12M6 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'client-pro': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 21 12 17.77 7.82 21 9 12.91l-5-3.64 5.91-.99L12 2z" fill="currentColor" />
      </svg>
    ),
    'handyman-basic': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2v4M10 2v4M4 10h16M6 14v6h12v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'handyman-pro': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path d="M14 7l-4 4m0 0l-2 2 4 4 2-2 4-4-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'enterprise': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7h8M8 12h8M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'student': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l8 4-8 4-8-4 8-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M4 10v6a4 4 0 004 4h8a4 4 0 004-4v-6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    'nonprofit': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s-6-4.35-9-7.5C1.5 10.5 5 6 9 6s7.5 3.5 9 7.5c-3 3.15-9 7.5-9 7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    'annual-saver': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'agency': (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  // Function to start a 3-day free trial
  function startFreeTrial(planId) {
    if (!user || !user.email) {
      setMessage('No user logged in. Please login first.');
      return;
    }

    // Check if user already had a trial for this plan
    try {
      const trialsRaw = localStorage.getItem('freeTrials');
      const trials = trialsRaw ? JSON.parse(trialsRaw) : [];
      const existingTrial = trials.find(t => t.email === user.email && t.plan === planId);
      
      if (existingTrial) {
        setMessage('You have already used your free trial for this plan Pay to continue.');
        return;
      }
    } catch (e) {
      console.error('Error checking trials:', e);
    }

    setProcessing(true);
    setMessage(null);

    setTimeout(() => {
      try {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now
        
        // Save trial record
        const trialsRaw = localStorage.getItem('freeTrials');
        const trials = trialsRaw ? JSON.parse(trialsRaw) : [];
        const trialEntry = {
          email: user.email,
          plan: planId,
          startDate: now.toISOString(),
          endDate: trialEnd.toISOString(),
          active: true
        };
        
        const filteredTrials = trials.filter(t => !(t.email === user.email && t.plan === planId));
        filteredTrials.push(trialEntry);
        localStorage.setItem('freeTrials', JSON.stringify(filteredTrials));

        // Save subscription with trial flag
        const raw = localStorage.getItem('subscriptions');
        const subs = raw ? JSON.parse(raw) : [];
        const entry = { 
          email: user.email, 
          plan: planId, 
          since: now.toISOString(),
          active: true,
          isTrial: true,
          trialEnd: trialEnd.toISOString()
        };
       
        const filtered = subs.filter(s => s.email !== user.email);
        filtered.push(entry);
        localStorage.setItem('subscriptions', JSON.stringify(filtered));

        // Update user premium status
        try {
          const u = JSON.parse(localStorage.getItem('user')) || {};
          u.premium = true;
          u.premiumPlan = planId;
          u.isTrial = true;
          u.trialEnd = trialEnd.toISOString();
          localStorage.setItem('user', JSON.stringify(u));
        } catch (e) {
          console.error('Failed to update user premium status', e);
        }

        window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));

        setProcessing(false);
        const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        setMessage(`Free trial started! You have ${daysLeft} days to try ${planId}. Payment will be required after trial ends.`);
        
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (e) {
        console.error(e);
        setProcessing(false);
        setMessage('Failed to start free trial. Try again.');
      }
    }, 900);
  }

  function saveSubscription(planId) {
    if (!user || !user.email) {
      setMessage('No user logged in. Please login first.');
      return;
    }

    setProcessing(true);
    setMessage(null);

    setTimeout(() => {
      try {
        const now = new Date().toISOString();
        
        const raw = localStorage.getItem('subscriptions');
        const subs = raw ? JSON.parse(raw) : [];
        const entry = { 
          email: user.email, 
          plan: planId, 
          since: now, 
          active: true,
          isTrial: false
        };
       
        const filtered = subs.filter(s => s.email !== user.email);
        filtered.push(entry);
        localStorage.setItem('subscriptions', JSON.stringify(filtered));

        // Update user premium status
        try {
          const u = JSON.parse(localStorage.getItem('user')) || {};
          u.premium = true;
          u.premiumPlan = planId;
          u.isTrial = false;
          delete u.trialEnd;
          localStorage.setItem('user', JSON.stringify(u));
        } catch (e) {
          console.error('Failed to update user premium status', e);
        }

        window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));

        setProcessing(false);
        setMessage('Subscription successful — thank you!');
        
        setTimeout(() => navigate('/dashboard'), 900);
      } catch (e) {
        console.error(e);
        setProcessing(false);
        setMessage('Failed to complete subscription. Try again.');
      }
    }, 900);
  }

  function cancelSubscription() {
    if (!user || !user.email) {
      setMessage('No user logged in.');
      return;
    }

    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    setProcessing(true);
    setMessage(null);

    setTimeout(() => {
      try {
        const raw = localStorage.getItem('subscriptions');
        let subs = raw ? JSON.parse(raw) : [];
        
        subs = subs.filter(s => s.email !== user.email);
        localStorage.setItem('subscriptions', JSON.stringify(subs));

       
        try {
          const u = JSON.parse(localStorage.getItem('user')) || {};
          u.premium = false;
          delete u.premiumPlan;
          localStorage.setItem('user', JSON.stringify(u));
        } catch (e) {
          console.error('Failed to update user on cancel', e);
        }

        
        window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: { email: user.email, active: false } }));

        setProcessing(false);
        setMessage('Subscription cancelled.');
      } catch (e) {
        console.error(e);
        setProcessing(false);
        setMessage('Failed to cancel subscription. Try again.');
      }
    }, 700);
  }

  
  
  // Check for trial expiration on component mount and updates
  useEffect(() => {
    const checkAndHandleTrialStatus = () => {
      const status = checkTrialStatus();
      
      if (!status.hasAccess && status.reason === 'trial_expired') {
        setExpiredPlan(status.expiredPlan);
        setShowTrialExpiredModal(true);
        setMessage(`Your free trial has ended. Please subscribe to continue accessing premium features.`);
      } else if (status.hasAccess && status.isTrialActive) {
        setMessage(`Free trial: ${status.subscription.plan} (${status.daysLeft} days remaining)`);
      } else if (status.hasAccess && !status.isTrialActive) {
        setMessage(`Active plan: ${status.subscription.plan} (since ${new Date(status.subscription.since).toLocaleDateString()})`);
      } else {
        if (!processing) setMessage(null);
      }
    };

    const onSub = () => {
      checkAndHandleTrialStatus();
    };

    window.addEventListener('subscriptionsUpdated', onSub);
    window.addEventListener('storage', onSub);
    onSub();
    return () => {
      window.removeEventListener('subscriptionsUpdated', onSub);
      window.removeEventListener('storage', onSub);
    };
  
  }, []);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full h-full glass-card p-6 lg:p-8 bg-linear-to-r from-slate-800/30 to-slate-900/30 text-white min-h-screen flex flex-col backdrop-blur-sm">
        <div className="mb-6">
          <BackButton className="mb-4" />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-linear-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">Go Premium</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">Upgrade your account to get faster matchmaking, priority leads, and better visibility. Choose the plan that fits you.</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="text-sm text-slate-300">Billing:</div>
          <div className="inline-flex rounded-md bg-slate-900/40 p-1">
            <button onClick={() => setIsAnnual(false)} className={`px-3 py-1 rounded-md text-sm ${!isAnnual ? 'bg-white/6 text-white' : 'text-slate-300'}`}>Monthly</button>
            <button onClick={() => setIsAnnual(true)} className={`px-3 py-1 rounded-md text-sm ${isAnnual ? 'bg-white/6 text-white' : 'text-slate-300'}`}>Annual</button>
          </div>
          <div className="ml-4 text-xs text-slate-400">Toggle to view monthly or annual pricing.</div>
        </div>

        <div ref={gridRef} className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-4 lg:px-8 overflow-auto scroll-smooth" tabIndex={0}>
          {plans.map(plan => (
            <div key={plan.id} data-plan-card tabIndex={0} className="relative overflow-hidden p-6 lg:p-8 rounded-3xl border border-white/20 bg-slate-800/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[400px] flex flex-col">
              {plan.id === 'annual-saver' && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md z-10">Best Value</div>
              )}
              {/* decorative gradient/pattern background */}
              <div className={`absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-linear-to-br ${accentMap[plan.id] || 'from-purple-500/30 to-pink-400/20'}`} />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-white" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-white/90 p-2 bg-white/10 rounded-lg">{iconMap[plan.id]}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{plan.title}</h3>
                    <div className="text-yellow-300 font-bold text-3xl mb-2">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</div>
                  </div>
                </div>
                {plan.description && <div className="text-sm text-slate-300 mb-4 leading-relaxed">{plan.description}</div>}
              </div>
              <ul className="text-sm text-slate-300 mb-6 space-y-2 flex-1">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 mt-auto">
                {user && user.premium && user.premiumPlan === plan.id ? (
                  <div className="text-center">
                    <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-3 mb-3">
                      <span className="text-green-300 font-semibold block mb-2">✓ Active Plan</span>
                    </div>
                    <button
                      className="w-full px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
                      onClick={cancelSubscription}
                      disabled={processing}
                    >{processing ? 'Cancelling...' : 'Cancel Subscription'}</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-yellow-500 to-yellow-400 text-slate-900 font-bold hover:scale-105 transition-transform shadow-lg"
                      onClick={() => navigate('/premium/checkout', { state: { plan } })}
                      disabled={processing}
                    >
                      Subscribe Now
                    </button>
                    <button
                      className="w-full px-4 py-2 rounded-lg bg-transparent border border-blue-400/40 text-blue-300 text-sm hover:bg-blue-400/10 transition-colors font-medium"
                      onClick={() => startFreeTrial(plan.id)}
                      disabled={processing}
                      title="Start 3-day free trial (payment required after trial)"
                    >
                      Start 3-Day Free Trial
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {message && <div className="mt-4 text-sm text-green-300">{message}</div>}
      </div>
      
      {/* Trial Expiration Modal */}
      {showTrialExpiredModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowTrialExpiredModal(false)} />
            <div className="relative bg-linear-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 z-10 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-bold mb-2 text-red-400">Trial Expired</h2>
                <p className="text-slate-300 leading-relaxed">
                  Your 3-day free trial for <span className="font-semibold text-white">{expiredPlan}</span> has ended.
                  <br /><br />
                  Subscribe now to continue accessing premium features and maintain your enhanced experience.
                </p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowTrialExpiredModal(false);
                    // Scroll to plans or refresh to show available plans
                    window.location.reload();
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Choose Subscription Plan
                </button>
                
                <button 
                  onClick={() => {
                    setShowTrialExpiredModal(false);
                    navigate('/dashboard');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20 text-center">
                <p className="text-xs text-slate-400">
                  Premium features are now disabled until you subscribe
                </p>
              </div>
            </div>
          </div>
        </Portal>
      )}
      
      {/* fixed bottom bar with quick actions */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto bg-slate-800/70 backdrop-blur-md px-4 py-3 rounded-full border border-white/10 shadow-lg">
          <button className="px-4 py-2 rounded-md bg-slate-700 text-white" onClick={() => navigate('/dashboard')}>Back</button>
        </div>
      </div>
    </div>
  );
}
