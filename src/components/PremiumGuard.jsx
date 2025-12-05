import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requiresPremiumAccess } from '../utils/trialAccess';
import Portal from './Portal';

// Higher-Order Component to protect premium features
export default function PremiumGuard({ children, feature = 'this feature', fallback = null, showModal = true }) {
  const navigate = useNavigate();
  const [accessStatus, setAccessStatus] = useState(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    const status = requiresPremiumAccess(feature);
    setAccessStatus(status);
    
    if (!status.allowed && showModal) {
      setShowAccessDenied(true);
    }
  }, [feature, showModal]);

  // If access check is still loading
  if (accessStatus === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Checking access...</div>
      </div>
    );
  }

  // If access is denied and we have a custom fallback
  if (!accessStatus.allowed && fallback) {
    return fallback;
  }

  // If access is denied and no custom fallback, show default blocked content
  if (!accessStatus.allowed && !showModal) {
    return (
      <div className="glass-card p-8 rounded-2xl bg-linear-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 text-white text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
        <p className="text-slate-300 mb-4">{accessStatus.message}</p>
        <button
          onClick={() => navigate('/premium')}
          className="px-6 py-2 bg-linear-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  return (
    <>
      {accessStatus.allowed && children}
      
      {/* Access Denied Modal */}
      {showAccessDenied && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative bg-linear-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 z-10 border border-white/20">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold mb-2 text-yellow-400">Premium Required</h2>
                <p className="text-slate-300 leading-relaxed">
                  {accessStatus.message}
                </p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowAccessDenied(false);
                    navigate('/premium');
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Upgrade to Premium
                </button>
                
                <button 
                  onClick={() => setShowAccessDenied(false)}
                  className="w-full px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Continue Without Premium
                </button>
              </div>
              
              {accessStatus.isTrialActive && (
                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-300 text-center">
                    🆓 Trial: {accessStatus.daysLeft} days remaining
                  </p>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

// Hook version for easier use in functional components
export function usePremiumAccess(feature = 'premium features') {
  const [accessStatus, setAccessStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const status = requiresPremiumAccess(feature);
    setAccessStatus(status);
  }, [feature]);

  const requestAccess = () => {
    navigate('/premium');
  };

  return {
    ...accessStatus,
    requestAccess,
    isLoading: accessStatus === null
  };
}