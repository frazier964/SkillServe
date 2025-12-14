import { useNavigate } from 'react-router-dom';

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to dashboard if no history
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700
        text-black border border-yellow-400 
        rounded-lg transition-all duration-200 
        hover:scale-105 shadow-lg shadow-yellow-500/50
        font-semibold text-sm
        ${className}
      `}
      title="Go back to previous page"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      Back
    </button>
  );
}