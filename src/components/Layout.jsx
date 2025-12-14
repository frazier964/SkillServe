import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Portal from "../components/Portal";
import { checkTrialStatus } from "../utils/trialAccess";

export default function Layout({ children }) {
  let initialUser = null;
  try {
    initialUser = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    initialUser = null;
  }

  // If there's no user in localStorage, keep initialUser as null so
  // the header renders public links (Login/Signup) only.

  const [userState, setUserState] = useState(initialUser);
  const role = userState && userState.role ? String(userState.role).toLowerCase() : null;
  const [trialStatus, setTrialStatus] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const getIsMobile = () => {
    try {
      const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
      const uaMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
      const coarse = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      // Force mobile when any signal indicates touch/mobile, or width below 1200px
      return uaMobile || coarse || width < 1200;
    } catch (e) {
      return true;
    }
  };
  const [isMobile, setIsMobile] = useState(true); // default to mobile until measured

  // Force check user state on component mount to catch login updates
  useEffect(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && (!userState || userState.email !== currentUser.email)) {
        setUserState(currentUser);
      }
    } catch (e) {
      // ignore
    }

    // Set initial mobile state and listen for resize
    const checkMobile = () => {
      setIsMobile(getIsMobile());
    };

    // Check immediately on mount
    checkMobile();

    // Handle window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [messages, setMessages] = useState([]);
  const [showMsgPreview, setShowMsgPreview] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const msgAnchorRef = useRef(null);
  const msgDropdownRef = useRef(null);
  const hoverCloseTimer = useRef(null);
  const [msgCoords, setMsgCoords] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('messages');
      setMessages(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error('Failed to load messages in Layout', e);
      setMessages([]);
    }
  }, []);

  // Monitor trial status for real-time updates
  useEffect(() => {
    const checkTrial = () => {
      if (userState && userState.premium) {
        const status = checkTrialStatus();
        setTrialStatus(status);
      } else {
        setTrialStatus(null);
      }
    };

    checkTrial();
    const interval = setInterval(checkTrial, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [userState]);

  // Listen for message and subscription updates so the header badge and premium status update
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('messages');
        setMessages(raw ? JSON.parse(raw) : []);
        // keep user state in sync if updated elsewhere
        try {
          const u = JSON.parse(localStorage.getItem('user'));
          if (u) {
            setUserState(u);
          } else {
            setUserState(null);
          }
        } catch (e) {
          setUserState(null);
        }
      } catch (e) {
        console.error('Failed to refresh messages in Layout', e);
      }
    };

    // Custom events dispatched from other pages when data changes
  window.addEventListener('messagesUpdated', handler);
  window.addEventListener('subscriptionsUpdated', handler);
  window.addEventListener('userUpdated', handler);
    // Also handle cross-tab updates
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('messagesUpdated', handler);
      window.removeEventListener('subscriptionsUpdated', handler);
      window.removeEventListener('userUpdated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);


  
  const navigate = useNavigate();

  const handleLogout = () => {
    try { localStorage.removeItem("user"); } catch (e) {}
    setUserState(null);
    window.dispatchEvent(new Event('userUpdated'));
    alert("Logged out!");
    navigate("/login");
  };

  // compute msg preview position when opened
  useEffect(() => {
    function compute() {
      if (!msgAnchorRef.current) return setMsgCoords(null);
      const rect = msgAnchorRef.current.getBoundingClientRect();
      const margin = 8;
      const width = Math.min(320, window.innerWidth - margin * 2);
      let left = rect.right - width;
      if (left < margin) left = margin;
      if (left + width + margin > window.innerWidth) left = Math.max(margin, window.innerWidth - width - margin);
      const top = Math.min(rect.bottom + 8, window.innerHeight - margin - 40);
      setMsgCoords({ left, top, width });
    }
    if (showMsgPreview) {
      compute();
      window.addEventListener('resize', compute);
      window.addEventListener('scroll', compute, true);
      return () => {
        window.removeEventListener('resize', compute);
        window.removeEventListener('scroll', compute, true);
      };
    } else {
      setMsgCoords(null);
    }
  }, [showMsgPreview]);

  // Search functionality
  const performSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const lowerTerm = term.toLowerCase();

    try {
      // Search jobs
      const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
      jobs.forEach(job => {
        if (job.title?.toLowerCase().includes(lowerTerm) || 
            job.description?.toLowerCase().includes(lowerTerm) ||
            job.category?.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'job',
            title: job.title,
            description: job.description,
            link: '/viewjobs',
            icon: '💼'
          });
        }
      });

      // Search handymen
      const handymen = JSON.parse(localStorage.getItem('handymen')) || [];
      handymen.forEach(handyman => {
        if (handyman.name?.toLowerCase().includes(lowerTerm) || 
            handyman.skills?.toLowerCase().includes(lowerTerm) ||
            handyman.category?.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'handyman',
            title: handyman.name,
            description: handyman.skills || handyman.category,
            link: '/handymen',
            icon: '🔧'
          });
        }
      });

      // Search food items
      const foodItems = [
        'Pizza', 'Burger', 'Pasta', 'Salad', 'Sandwich', 'Tacos', 'Sushi', 'Steak',
        'Chicken', 'Fish', 'Soup', 'Fries', 'Rice', 'Noodles', 'Dessert', 'Coffee',
        'Tea', 'Juice', 'Smoothie', 'Ice Cream', 'Cake', 'Cookies', 'Bread'
      ];
      foodItems.forEach(food => {
        if (food.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'food',
            title: food,
            description: 'Order delicious food',
            link: '/order-food',
            icon: '🍕'
          });
        }
      });

      // Search job categories and skills
      const jobCategories = [
        { name: 'Plumbing', link: '/viewjobs', icon: '🔧' },
        { name: 'Electrical', link: '/viewjobs', icon: '⚡' },
        { name: 'Carpentry', link: '/viewjobs', icon: '🪚' },
        { name: 'Painting', link: '/viewjobs', icon: '🎨' },
        { name: 'Cleaning', link: '/viewjobs', icon: '🧹' },
        { name: 'Gardening', link: '/viewjobs', icon: '🌱' },
        { name: 'Moving', link: '/viewjobs', icon: '📦' },
        { name: 'Tutoring', link: '/viewjobs', icon: '📚' },
        { name: 'Chef', link: '/viewjobs', icon: '👨‍🍳' },
        { name: 'Delivery', link: '/viewjobs', icon: '🚚' },
        { name: 'Cashier', link: '/viewjobs', icon: '💰' }
      ];
      
      jobCategories.forEach(category => {
        if (category.name.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'category',
            title: category.name,
            description: `Find ${category.name.toLowerCase()} jobs`,
            link: category.link,
            icon: category.icon
          });
        }
      });

      // Search pages
      const pages = [
        { name: 'Dashboard', link: '/', icon: '🏠', description: 'Main dashboard' },
        { name: 'Profile', link: '/profile', icon: '👤', description: 'Edit your profile' },
        { name: 'Settings', link: '/settings', icon: '⚙️', description: 'Account settings' },
        { name: 'Premium', link: '/premium', icon: '⭐', description: 'Upgrade to premium' },
        { name: 'Messages', link: '/messages', icon: '💬', description: 'View messages' },
        { name: 'Help', link: '/help', icon: '🆘', description: 'Get help and support' },
        { name: 'Analytics', link: '/analytics', icon: '📊', description: 'View analytics' },
        { name: 'Cashout', link: '/cashout', icon: '💰', description: 'Withdraw earnings' },
        { name: 'Jobs', link: '/viewjobs', icon: '🔍', description: 'Browse available jobs' },
        { name: 'Post Job', link: '/postjob', icon: '✍️', description: 'Create a new job posting' },
        { name: 'Handymen', link: '/handymen', icon: '🔧', description: 'Find skilled handymen' },
        { name: 'Order Food', link: '/order-food', icon: '🍕', description: 'Order delicious food' },
        { name: 'Student Details', link: '/studentdetails', icon: '👨‍🎓', description: 'Student information' },
        { name: 'Availability', link: '/availability', icon: '⏰', description: 'Set your availability' }
      ];
      
      pages.forEach(page => {
        if (page.name.toLowerCase().includes(lowerTerm) || 
            page.description.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'page',
            title: page.name,
            description: page.description,
            link: page.link,
            icon: page.icon
          });
        }
      });

    } catch (e) {
      console.error('Error searching:', e);
    }

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        // Navigate to the first search result when Enter is pressed
        navigate(searchResults[0].link);
        setSearchTerm('');
        setShowSearchResults(false);
      }
    }
  };

  const handleSearchResultClick = (result) => {
    console.log('Search result clicked:', result);
    console.log('Filling search bar with:', result.title);
    
    // Fill the search bar with the clicked result's title
    setSearchTerm(result.title);
    
    // Perform a new search with the filled term
    performSearch(result.title);
    
    // Keep the search results open to show related items
    setShowSearchResults(true);
    
    console.log('Search filled and updated with:', result.title);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-x-hidden">
     
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

  <header className="relative z-20 glass-card m-2 sm:m-4 rounded-xl sm:rounded-2xl border border-white/20 bg-linear-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20">
        <div className="p-3 sm:p-4 flex justify-between items-center gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-700 bg-clip-text text-transparent whitespace-nowrap">
            SkillServe
          </h1>

          {/* Mobile: show ONLY the SkillServe text; hide all other header elements */}
          {isMobile ? null : (
            <>
            {/* Desktop Navigation - render only when not mobile */}
            <nav className="hidden lg:flex gap-4 items-center flex-1 justify-end flex-wrap" style={{ display: isMobile ? 'none' : undefined }}>
            {userState && (
              <Link 
                to="/" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium text-sm"
              >
                Dashboard
              </Link>
            )}

            {/* Search Bar */}
            <div ref={searchRef} className="relative hidden lg:block">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search jobs, handymen, food..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  className="bg-white text-black placeholder-gray-500 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48 text-sm"
                />
                <button 
                  onClick={() => {
                    if (searchResults.length > 0) {
                      // Navigate directly when search button is clicked
                      navigate(searchResults[0].link);
                      setSearchTerm('');
                      setShowSearchResults(false);
                    }
                  }}
                  className="ml-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  🔍
                </button>
              </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <Portal>
                    <div className="fixed z-50 bg-white text-black rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-y-auto" 
                         style={{
                           top: searchRef.current?.getBoundingClientRect().bottom + 8 || 0,
                           left: searchRef.current?.getBoundingClientRect().left || 0
                         }}>
                      <div className="p-3">
                        <div className="text-sm font-semibold text-gray-600 mb-2">Search Results</div>
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Search result div clicked:', result.title);
                              console.log('Current search term before:', searchTerm);
                              handleSearchResultClick(result);
                              console.log('Current search term after:', result.title);
                            }}
                            className="w-full text-left p-3 hover:bg-gray-100 rounded-lg border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{result.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{result.title}</div>
                                <div className="text-sm text-gray-600">{result.description}</div>
                                <div className="text-xs text-purple-600 mt-1 capitalize">{result.type}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Portal>
                )}

                {/* No Results Message */}
                {showSearchResults && searchResults.length === 0 && searchTerm.length > 0 && (
                  <Portal>
                    <div className="fixed z-50 bg-white text-black rounded-lg shadow-xl border border-gray-200 w-80" 
                         style={{
                           top: searchRef.current?.getBoundingClientRect().bottom + 8 || 0,
                           left: searchRef.current?.getBoundingClientRect().left || 0
                         }}>
                      <div className="p-4 text-center text-gray-500">
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="text-sm">No results found for "{searchTerm}"</div>
                      </div>
                    </div>
                  </Portal>
                )}
              </div>

            {userState && role === 'client' && (
              <Link
                to="/handymen"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium text-sm"
              >
                Handymen
              </Link>
            )}
            {userState && role === 'client' && (
              <Link 
                to="/postjob" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium text-sm"
              >
                Post Job
              </Link>
            )}

            
            {/* Premium link - visible to logged in users */}
            {userState && (
              <button onClick={() => navigate('/premium')} className="text-yellow-300 hover:text-yellow-200 transition-colors duration-300 font-medium text-sm px-2 md:px-3 py-1 rounded-md">
                {userState.premium ? `Premium ✓` : `Premium`}
              </button>
            )}
            {!userState && (
              <Link 
                to="/login" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium text-sm"
              >
                Login
              </Link>
            )}
            {!userState && (
              <Link 
                to="/signup" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium text-sm"
              >
                Signup
              </Link>
            )}
            {userState && (
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  onClick={() => setShowSignoutConfirm(true)} 
                  className="bg-linear-to-r from-red-500 to-pink-500 text-white px-2 md:px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            )}
           
            {userState && (
              <div className="relative">
                <Link ref={msgAnchorRef} to="/messages" state={{ messages }} className="relative inline-block" onMouseEnter={() => {
                  if (hoverCloseTimer.current) { clearTimeout(hoverCloseTimer.current); hoverCloseTimer.current = null; }
                  setShowMsgPreview(true);
                }} onMouseLeave={() => {
                  hoverCloseTimer.current = setTimeout(() => setShowMsgPreview(false), 150);
                }}>
                  <span className="text-white/80 hover:text-white transition-colors duration-300 font-medium text-sm">Messages</span>
                  {messages && messages.length > 0 && (
                    <span className="absolute -top-2 -right-6 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{messages.length}</span>
                  )}
                </Link>

                {/* render message preview in a portal so it is not clipped */}
                {showMsgPreview && msgCoords && (
                  <Portal>
                    <div ref={msgDropdownRef} className="fixed z-50" style={{ top: msgCoords.top, left: msgCoords.left, width: msgCoords.width }} onMouseEnter={() => {
                      if (hoverCloseTimer.current) { clearTimeout(hoverCloseTimer.current); hoverCloseTimer.current = null; }
                      setShowMsgPreview(true);
                    }} onMouseLeave={() => {
                      hoverCloseTimer.current = setTimeout(() => setShowMsgPreview(false), 150);
                    }}>
                      <div className="bg-white text-slate-900 rounded-lg p-3 shadow-xl border" role="menu" aria-label="Recent messages">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-slate-900">Recent Messages</strong>
                          <small className="text-slate-500 text-xs">{messages.length} total</small>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {messages.length === 0 && <div className="text-slate-500 text-sm">No messages</div>}
                          {messages.slice(0, 5).map(m => (
                            <button
                              key={m.id}
                              role="menuitem"
                              onClick={() => { navigate('/messages', { state: { messages, openId: m.id } }); setShowMsgPreview(false); }}
                              className="w-full text-left p-2 rounded-md bg-slate-50/80 border hover:bg-slate-100 transition-colors"
                            >
                              <div className="text-slate-900 font-medium text-sm">{m.from} <span className="text-slate-500 text-xs ml-2">{m.role}</span></div>
                              <div className="text-slate-700 text-xs truncate">{m.content}</div>
                              <div className="text-slate-400 text-xs mt-1">{m.time}</div>
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 text-right">
                          <Link to="/messages" state={{ messages }} className="text-sm font-medium text-blue-600">View all →</Link>
                        </div>
                      </div>
                    </div>
                  </Portal>
                )}
              </div>
            )}

            </nav>
            </>
          )}
        </div>
        {/* Mobile Dropdown: fully disabled to show only SkillServe on mobile */}
      </header>

      {/* Trial Warning Banner */}
      {trialStatus && trialStatus.isTrialActive && trialStatus.daysLeft <= 2 && (
        <div className="relative z-20 mx-4 mt-2 mb-4">
          <div className="bg-linear-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-orange-200">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">
                {trialStatus.daysLeft === 0 
                  ? 'Trial expires today!' 
                  : `Trial expires in ${trialStatus.daysLeft} day${trialStatus.daysLeft > 1 ? 's' : ''}!`
                }
              </span>
              <button 
                onClick={() => navigate('/premium')}
                className="ml-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trial Expired Banner */}
      {trialStatus && !trialStatus.hasAccess && trialStatus.reason === 'trial_expired' && (
        <div className="relative z-20 mx-4 mt-2 mb-4">
          <div className="bg-linear-to-r from-red-600/20 to-red-800/20 border border-red-400/30 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-red-200">
              <span className="text-lg">🔒</span>
              <span className="font-medium">
                Free trial ended - Premium features disabled
              </span>
              <button 
                onClick={() => navigate('/premium')}
                className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign-out confirmation modal */}
      {showSignoutConfirm && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSignoutConfirm(false)} />
            <div className="relative bg-white text-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">Sign out</h2>
                <button onClick={() => setShowSignoutConfirm(false)} className="text-slate-500 hover:text-slate-700">✕</button>
              </div>
              <p className="text-sm text-slate-600 mt-2">Are you sure you want to sign out? You will need to sign in again to access your account.</p>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setShowSignoutConfirm(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={() => { 
                    try { localStorage.removeItem('user'); } catch(e) {}
                    setUserState(null);
                    window.dispatchEvent(new Event('userUpdated'));
                    setShowSignoutConfirm(false);
                    navigate('/login');
                 }} className="px-4 py-2 rounded bg-red-600 text-white">Sign out</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
      
      <main className="relative z-10 flex-1 w-full h-full">
        {children}
      </main>
    </div>
  );
}
