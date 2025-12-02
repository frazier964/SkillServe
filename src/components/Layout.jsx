import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Portal from "../components/Portal";

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
  }, []);
  const [messages, setMessages] = useState([]);
  const [showMsgPreview, setShowMsgPreview] = useState(false);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const msgAnchorRef = useRef(null);
  const msgDropdownRef = useRef(null);
  const hoverCloseTimer = useRef(null);
  const [msgCoords, setMsgCoords] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('messages');
      setMessages(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error('Failed to load messages in Layout', e);
      setMessages([]);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
     
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

  <header className="relative z-20 glass-card m-4 rounded-2xl border border-white/20 bg-linear-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-700 bg-clip-text text-transparent">
            SkillServe
          </h1>
          <nav className="flex gap-6 items-center">
            {userState && (
              <Link 
                to="/" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Dashboard
              </Link>
            )}
            
            {userState && role === 'handyman' && (
              <Link
                to="/studentdetails"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Student Details
              </Link>
            )}
            
            {userState && role === 'handyman' && (
              <Link
                to="/viewjobs"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                View Jobs
              </Link>
            )}
            
            {userState && role === 'handyman' && (
              <Link
                to="/analytics"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Analytics
              </Link>
            )}
            
            {userState && role === 'handyman' && (
              <Link
                to="/cashout"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Cashout
              </Link>
            )}
            
            {userState && role === 'client' && (
              <Link
                to="/handymen"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Handymen
              </Link>
            )}
            {userState && role === 'client' && (
              <Link 
                to="/postjob" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Post Job
              </Link>
            )}
            {/* Profile and Settings - visible to all logged in users */}
            {userState && (
              <Link
                to="/profile"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Profile
              </Link>
            )}
            
            {userState && (
              <Link
                to="/settings"
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Settings
              </Link>
            )}
            
            {/* Premium link - visible to logged in users */}
            {userState && (
              <button onClick={() => navigate('/premium')} className="text-yellow-300 hover:text-yellow-200 transition-colors duration-300 font-medium px-3 py-1 rounded-md">
                {userState.premium ? `Premium ✓` : `Go Premium`}
              </button>
            )}
            {!userState && (
              <Link 
                to="/login" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Login
              </Link>
            )}
            {!userState && (
              <Link 
                to="/signup" 
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
              >
                Signup
              </Link>
            )}
            {userState && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSignoutConfirm(true)} 
                  className="bg-linear-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 font-medium"
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
                  <span className="text-white/80 hover:text-white transition-colors duration-300 font-medium">Messages</span>
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
        </div>
      </header>


      
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
      
      <main className="relative z-10 flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
