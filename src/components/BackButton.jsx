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
        bg-white/10 hover:bg-white/20 
        text-white border border-white/20 
        rounded-lg transition-all duration-200 
        hover:scale-105 backdrop-blur-sm
        font-medium text-sm
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