import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Premium() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
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
      const u = JSON.parse(localStorage.getItem('user') || '{}');
     
    } catch (e) {
      
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
        const entry = { email: user.email, plan: planId, since: now, active: true };
       
        const filtered = subs.filter(s => s.email !== user.email);
        filtered.push(entry);
        localStorage.setItem('subscriptions', JSON.stringify(filtered));

       
        try {
          const u = JSON.parse(localStorage.getItem('user')) || {};
          u.premium = true;
          u.premiumPlan = planId;
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

  
  
  useEffect(() => {
    const onSub = () => {
      const raw = localStorage.getItem('subscriptions');
      const subs = raw ? JSON.parse(raw) : [];
      const s = subs.find(x => x.email === user.email && x.active);
      if (s) {
        setMessage(`Active plan: ${s.plan} (since ${new Date(s.since).toLocaleDateString()})`);
      } else {
        
        if (!processing) setMessage(null);
      }
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
    <div className="min-h-screen w-full flex items-center bg-transparent">
      <div className="w-full max-w-7xl mx-auto glass-card p-8 rounded-3xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white min-h-screen flex flex-col">
        <h2 className="text-3xl font-bold mb-3">Go Premium</h2>
        <p className="text-sm text-slate-300 mb-4">Upgrade your account to get faster matchmaking, priority leads, and better visibility. Choose the plan that fits you.</p>

        <div className="flex items-center gap-3 mb-6">
          <div className="text-sm text-slate-300">Billing:</div>
          <div className="inline-flex rounded-md bg-slate-900/40 p-1">
            <button onClick={() => setIsAnnual(false)} className={`px-3 py-1 rounded-md text-sm ${!isAnnual ? 'bg-white/6 text-white' : 'text-slate-300'}`}>Monthly</button>
            <button onClick={() => setIsAnnual(true)} className={`px-3 py-1 rounded-md text-sm ${isAnnual ? 'bg-white/6 text-white' : 'text-slate-300'}`}>Annual</button>
          </div>
          <div className="ml-4 text-xs text-slate-400">Toggle to view monthly or annual pricing.</div>
        </div>

        <div ref={gridRef} className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-auto scroll-smooth" tabIndex={0}>
          {plans.map(plan => (
            <div key={plan.id} data-plan-card tabIndex={0} className="relative overflow-hidden p-6 rounded-2xl border border-white/10 bg-slate-800/60 backdrop-blur-md shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
              {plan.id === 'annual-saver' && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md z-10">Best Value</div>
              )}
              {/* decorative gradient/pattern background */}
              <div className={`absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-linear-to-br ${accentMap[plan.id] || 'from-purple-500/30 to-pink-400/20'}`} />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-white" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-white/90">{iconMap[plan.id]}</div>
                  <h3 className="text-lg font-semibold text-white mb-0">{plan.title}</h3>
                </div>
                <div className="text-yellow-300 font-bold text-2xl mb-3">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</div>
                {plan.description && <div className="text-sm text-slate-400 mb-3">{plan.description}</div>}
              </div>
              <ul className="text-sm text-slate-300 mb-4 space-y-1 min-h-[92px]">
                {plan.benefits.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between w-full">
                {user && user.premium && user.premiumPlan === plan.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-300">Active</span>
                    <button
                      className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
                      onClick={cancelSubscription}
                      disabled={processing}
                    >{processing ? 'Cancelling...' : 'Cancel'}</button>
                  </div>
                ) : (
                  <>
                    <>
                      <button
                        className="px-4 py-2 rounded-md bg-linear-to-r from-yellow-500 to-yellow-400 text-slate-900 font-semibold hover:scale-105 transition-transform"
                        onClick={() => navigate('/premium/checkout', { state: { plan } })}
                        disabled={processing}
                      >
                        Subscribe
                      </button>
                      <button
                        className="ml-2 px-3 py-2 rounded-md bg-transparent border border-white/10 text-white text-sm"
                        onClick={() => saveSubscription(plan.id)}
                        disabled={processing}
                        title="Quick mock subscribe (no payment)"
                      >
                        Quick Mock
                      </button>
                    </>
                    <div className="text-xs text-slate-400">For: YOU</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {message && <div className="mt-4 text-sm text-green-300">{message}</div>}
      </div>
      {/* fixed bottom bar with quick actions */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto bg-slate-800/70 backdrop-blur-md px-4 py-3 rounded-full border border-white/10 shadow-lg">
          <button className="px-4 py-2 rounded-md bg-slate-700 text-white" onClick={() => navigate('/dashboard')}>Back</button>
        </div>
      </div>
    </div>
  );
}
