import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Portal from "../components/Portal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [creators, setCreators] = useState([]); 
  const [followersMap, setFollowersMap] = useState({}); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    earnings: 0
  });

  const loadJobsAndData = () => {
    const savedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
    
    const demoJobs = savedJobs.length > 0 ? savedJobs : [
      {
        title: "Kitchen Plumbing Repair",
        description: "Fix leaking kitchen sink and replace faucet. Experience with modern fixtures required.",
        price: "180",
        postedBy: "Sarah Johnson",
        status: "active",
        category: "plumber"
      },
      {
        title: "Bathroom Tile Installation",
        description: "Install ceramic tiles in master bathroom (12x8 ft). Materials provided.",
        price: "450",
        postedBy: "Michael Chen",
        status: "completed",
        category: "carpenter"
      },
      {
        title: "Electrical Outlet Installation",
        description: "Install 3 new electrical outlets in living room. Must be licensed electrician.",
        price: "220",
        postedBy: "David Wilson",
        status: "active",
        category: "electrician"
      },
      {
        title: "Garden Fence Repair",
        description: "Repair wooden fence panels and repaint. Approximately 20ft section.",
        price: "320",
        postedBy: "Lisa Rodriguez",
        status: "completed",
        category: "carpenter"
      },
      {
        title: "Ceiling Fan Installation",
        description: "Install ceiling fan in bedroom. Wiring already in place, just need mounting.",
        price: "95",
        postedBy: "James Miller",
        status: "active",
        category: "electrician"
      },
      {
        title: "Driveway Pressure Washing",
        description: "Power wash concrete driveway and front walkway. Remove oil stains.",
        price: "120",
        postedBy: "Amanda Davis",
        status: "active",
        category: "cleaner"
      },
      {
        title: "Kitchen Cabinet Door Repair",
        description: "Fix loose cabinet doors and adjust hinges. 8 doors total.",
        price: "85",
        postedBy: "Robert Taylor",
        status: "completed",
        category: "carpenter"
      },
      {
        title: "Bathroom Toilet Installation",
        description: "Remove old toilet and install new one. Toilet provided by homeowner.",
        price: "150",
        postedBy: "Maria Garcia",
        status: "active",
        category: "plumber"
      },
      {
        title: "Window Screen Replacement",
        description: "Replace torn screens on 4 windows. Measure and install new mesh.",
        price: "160",
        postedBy: "Kevin Brown",
        status: "active",
        category: "carpenter"
      },
      {
        title: "Deck Staining",
        description: "Clean and stain wooden deck (16x12 ft). Stain color to be chosen.",
        price: "380",
        postedBy: "Jennifer White",
        status: "completed",
        category: "painter"
      },
      {
        title: "Garbage Disposal Installation",
        description: "Install new garbage disposal unit under kitchen sink. Unit provided.",
        price: "130",
        postedBy: "Thomas Anderson",
        status: "active",
        category: "plumber"
      },
      {
        title: "Gutter Cleaning & Repair",
        description: "Clean gutters and repair 2 loose sections. Two-story house.",
        price: "200",
        postedBy: "Rachel Green",
        status: "active",
        category: "cleaner"
      },
      {
        title: "Interior Door Installation",
        description: "Hang 2 new interior doors with hardware. Doors and frames provided.",
        price: "240",
        postedBy: "Christopher Lee",
        status: "completed",
        category: "carpenter"
      },
      {
        title: "Shower Head Replacement",
        description: "Replace old shower head with rainfall style head. Easy access.",
        price: "65",
        postedBy: "Emily Johnson",
        status: "active",
        category: "plumber"
      },
      {
        title: "Garage Door Opener Repair",
        description: "Fix garage door opener - remote not working, manual operation OK.",
        price: "140",
        postedBy: "Daniel Martinez",
        status: "active",
        category: "mechanic"
      }
    ];
    
    setJobs(demoJobs);
    
    setStats({
      totalJobs: demoJobs.length,
      activeJobs: demoJobs.filter(job => job.status !== 'completed').length,
      completedJobs: demoJobs.filter(job => job.status === 'completed').length,
      earnings: demoJobs.reduce((sum, job) => sum + (parseFloat(job.price) || 0), 0)
    });

    const demoNotifications = [
      { id: 1, title: 'New message from Sarah', body: 'Client: Kitchen plumbing job ready to start', time: '2h', read: false },
      { id: 2, title: 'Job application', body: 'Mike applied to your Electrical Outlet Installation job', time: '1d', read: false },
      { id: 3, title: 'Job completed', body: 'Bathroom Tile Installation marked as completed', time: '3h', read: false },
      { id: 4, title: 'New message from David', body: 'Client: Can you start the electrical work tomorrow?', time: '5h', read: true },
    ];
    const demoMessages = [
      { id: 1, from: 'Aisha Bello', role: 'client', content: 'Hi, are you available this weekend?', time: '2h' },
      { id: 2, from: 'Kwame Mensah', role: 'handyman', content: 'I can start the tiling on Monday.', time: '1d' },
    ];
    setNotifications(demoNotifications);
    
    try {
      if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify(demoMessages));
      }
    } catch (e) {
      console.error('Failed to seed messages to localStorage', e);
    }

    try {
      const savedFollowers = JSON.parse(localStorage.getItem('followers')) || {};
      setFollowersMap(savedFollowers);
    } catch (e) {
      setFollowersMap({});
    }

    const creatorNames = Array.from(new Set(demoJobs.map(j => j.postedBy)));
    const seededCreators = creatorNames.map(name => {
      const initials = name.split(' ').map(n => n[0]).slice(0,2).join('');
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6C5CE7&color=ffffff&rounded=true&size=128`;
      return { name, bio: `Service provider — ${name}`, avatar: initials, avatarUrl };
    });
    setCreators(seededCreators);
  };

  useEffect(() => {
    // Protect this route: require a signed-in user (either localStorage or Firebase)
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    console.log('Dashboard useEffect - stored user:', stored);
    if (stored && (stored.email || stored.uid || stored.name)) {
      setUser(stored);
      loadJobsAndData();
      return;
    }

    // If no stored profile, redirect to login
    console.log('Dashboard - no user found, redirecting to login');
    navigate('/login');
  }, [navigate]);

  // Listen for user updates from login
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log('Dashboard - userUpdated event received');
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored && (stored.email || stored.uid || stored.name)) {
        console.log('Dashboard - setting user from event:', stored);
        setUser(stored);
        loadJobsAndData();
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const profileBtnRef = useRef(null);
  const notifBtnRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [notifCoords, setNotifCoords] = useState(null);
  const [profileCoords, setProfileCoords] = useState(null);

  // close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e) {
      // If click is on profile area or profile dropdown, keep it open
      if (profileRef.current && profileRef.current.contains(e.target)) return;
      if (profileDropdownRef.current && profileDropdownRef.current.contains(e.target)) return;
      // If click is on notification button or notification dropdown, keep it
      if (notifBtnRef.current && notifBtnRef.current.contains(e.target)) return;
      if (notifDropdownRef.current && notifDropdownRef.current.contains(e.target)) return;

      setShowProfileMenu(false);
      setShowNotifications(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    }
    window.addEventListener('click', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // compute dropdown coordinates for portal rendering
  function computeCoords(anchorRect, desiredWidth = 384, align = 'right') {
    if (!anchorRect) return null;
    const margin = 8;
    const width = Math.min(desiredWidth, Math.max(160, window.innerWidth - margin * 2));
    // Try to open to the right (align right edge of menu with anchor right)
    let left = anchorRect.right - width;
    // If opening to the right would overflow the viewport on the left, clamp
    if (left < margin) left = margin;
    // If opening to the right overflows the viewport on the right, try open-left fallback
    if (left + width + margin > window.innerWidth) {
      // open-left: align left edge of menu with anchor left or anchor.right - width
      const tryLeft = anchorRect.left + anchorRect.width - width;
      left = Math.max(margin, Math.min(tryLeft, window.innerWidth - width - margin));
    }
    // final clamp
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

    // compute vertical position: prefer below the anchor but ensure it fits
    const spaceBelow = window.innerHeight - anchorRect.bottom - margin;
    const spaceAbove = anchorRect.top - margin;
    let top;
    if (spaceBelow >= 160 || spaceBelow >= spaceAbove) {
      // place below
      top = Math.min(anchorRect.bottom + 8, window.innerHeight - margin - 40);
    } else {
      // place above
      top = Math.max(margin, anchorRect.top - 8 - 200);
    }
    return { left, top, width };
  }

  // keyboard navigation helpers for portal menus
  function focusFirstMenuItem(dropdownRef) {
    try {
      if (!dropdownRef || !dropdownRef.current) return;
      const items = dropdownRef.current.querySelectorAll('[role="menuitem"]');
      if (items && items.length) {
        items[0].focus();
      } else {
        dropdownRef.current.focus();
      }
    } catch (e) {
      // ignore
    }
  }

  function handleMenuKeyDown(e, dropdownRef, onClose) {
    const key = e.key;
    if (!dropdownRef || !dropdownRef.current) return;
    const items = Array.from(dropdownRef.current.querySelectorAll('[role="menuitem"]'));
    const active = document.activeElement;
    const idx = items.indexOf(active);
    if (key === 'ArrowDown') {
      e.preventDefault();
      const next = items[idx + 1] || items[0];
      next && next.focus();
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[idx - 1] || items[items.length - 1];
      prev && prev.focus();
    } else if (key === 'Escape') {
      e.preventDefault();
      onClose && onClose();
    } else if (key === 'Enter' || key === ' ') {
      // let the focused element handle activation
      return;
    }
  }

  useEffect(() => {
    function updateNotifPos() {
      if (notifBtnRef.current && showNotifications) {
        const rect = notifBtnRef.current.getBoundingClientRect();
        setNotifCoords(computeCoords(rect, 384, 'right'));
      }
    }
    function updateProfilePos() {
      if (profileBtnRef.current && showProfileMenu) {
        const rect = profileBtnRef.current.getBoundingClientRect();
        setProfileCoords(computeCoords(rect, 176, 'right'));
      }
    }
    updateNotifPos();
    updateProfilePos();
    window.addEventListener('resize', updateNotifPos);
    window.addEventListener('scroll', updateNotifPos, true);
    window.addEventListener('resize', updateProfilePos);
    window.addEventListener('scroll', updateProfilePos, true);
    return () => {
      window.removeEventListener('resize', updateNotifPos);
      window.removeEventListener('scroll', updateNotifPos, true);
      window.removeEventListener('resize', updateProfilePos);
      window.removeEventListener('scroll', updateProfilePos, true);
    };
  }, [showNotifications, showProfileMenu]);

  // focus first item when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      // slight delay ensures portal node is mounted
      setTimeout(() => focusFirstMenuItem(notifDropdownRef), 0);
    }
  }, [showNotifications]);

  useEffect(() => {
    if (showProfileMenu) {
      setTimeout(() => focusFirstMenuItem(profileDropdownRef), 0);
    }
  }, [showProfileMenu]);

  
  useEffect(() => {
    try {
      localStorage.setItem('jobs', JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to persist jobs', e);
    }

    setStats({
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status !== 'completed').length,
      completedJobs: jobs.filter(job => job.status === 'completed').length,
      earnings: jobs.reduce((sum, job) => sum + (parseFloat(job.price) || 0), 0)
    });
  }, [jobs]);

  
  useEffect(() => {
    try {
      localStorage.setItem('followers', JSON.stringify(followersMap));
    } catch (e) {
      console.error('Failed to persist followers map', e);
    }
  }, [followersMap]);
  

  function handleDeleteJob(index) {
    if (!confirm('Remove this job? This action cannot be undone.')) return;
    setJobs(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
  }

  

  const StatCard = ({ title, value, icon, color, bgColor, onClick, titleClass }) => (
    <div className={`glass-card p-6 rounded-2xl ${bgColor} border border-white/20 hover:scale-105 transition-all duration-300`}>
      <button onClick={onClick} className="w-full text-left focus:outline-none cursor-pointer" aria-label={title}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${titleClass || 'text-white/70 text-sm font-medium'}`}>{title}</p>
            <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} bg-white/10`}>
            {icon}
          </div>
        </div>
        {/* dropdowns intentionally rendered at root via Portal (moved out of header) */}
      </button>
    </div>
  );

  const recentActivities = [
    { action: "New job posted", time: "2 hours ago", type: "success" },
    { action: "Application received", time: "4 hours ago", type: "info" },
    { action: "Job completed", time: "1 day ago", type: "success" },
    { action: "Payment received", time: "2 days ago", type: "success" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  function toggleNotifications() {
    setShowNotifications(v => !v);
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markMessageRead(id) {
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  function toggleFollow(creatorName) {
    if (!user) { alert('Please log in to follow creators'); return; }
    const followerName = user.name || user.email || 'Anonymous';
    setFollowersMap(prev => {
      const next = { ...prev };
      const list = new Set(next[creatorName] || []);
      if (list.has(followerName)) {
        list.delete(followerName);
      } else {
        list.add(followerName);
      }
      next[creatorName] = Array.from(list);
      return next;
    });
  }

  
  const displayedJobs = jobs.slice().sort((a, b) => {
    const fa = (followersMap[a.postedBy] || []).length || 0;
    const fb = (followersMap[b.postedBy] || []).length || 0;
    return fb - fa; 
  });

  // Debug: Check localStorage directly
  const debugUser = localStorage.getItem('user');
  console.log('Dashboard - localStorage user:', debugUser);
  console.log('Dashboard - user state:', user);

  // Debug: Check if user is loaded
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">
            Loading user data...
            <br />
            <small>Debug: localStorage has {debugUser ? 'user data' : 'no user data'}</small>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8">

        <div className="glass-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-teal-600/20 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              {/* Compute a friendly first name to display: prefer explicit name, then displayName, then email local-part */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">{
                (() => {
                  if (!user) return 'Welcome back';
                  const rawName = user.name || user.displayName || (user.email ? user.email.split('@')[0] : '');
                  const first = rawName ? String(rawName).split(' ')[0] : '';
                  const tidy = first ? (first.charAt(0).toUpperCase() + first.slice(1)) : '';
                  return `Welcome back${tidy ? `, ${tidy}` : ''}`;
                })()
              }</h1>
              <p className="text-white/70 text-sm sm:text-base md:text-lg">Here's what's happening with your projects today.</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-white/70">Your followers</div>
              <div className="text-lg sm:text-xl font-bold">{(user && followersMap && followersMap[user.name] ? followersMap[user.name].length : 0)}</div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button ref={notifBtnRef} aria-haspopup="true" aria-expanded={showNotifications} onClick={(e) => { e.stopPropagation(); toggleNotifications(); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full shadow-md">{unreadCount}</span>
                )}
                {/* notifications dropdown will render into a portal to avoid stacking contexts */}
              </div>

              <div className="relative" ref={profileRef}>
                <button ref={profileBtnRef} aria-haspopup="true" aria-expanded={showProfileMenu} onClick={(e) => { e.stopPropagation(); setShowProfileMenu(v => !v); }} className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold focus:outline-none">
                  {user && (user.avatarDataUrl ? <img src={user.avatarDataUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" /> : (user.name ? user.name.split(' ').map((n) => n[0]).slice(0,2).join('') : (user.email ? user.email.charAt(0).toUpperCase() : 'U')))}
                </button>
                {/* profile menu will render into a portal to avoid stacking contexts */}
              </div>
              {/* portal-mounted dropdowns (notifications + profile) */}
              {showNotifications && notifCoords && (
                <Portal>
                  <div ref={notifDropdownRef} className="fixed z-9999" style={{ top: notifCoords.top, left: notifCoords.left, width: notifCoords.width }}>
                    <div className="bg-white text-slate-900 rounded-lg p-3 shadow-xl border" role="menu" aria-label="Notifications" tabIndex={-1} onKeyDown={(e) => handleMenuKeyDown(e, notifDropdownRef, () => setShowNotifications(false))}>
                      <div className="flex items-center justify-between mb-3">
                        <strong className="text-slate-900">Notifications</strong>
                        <button role="menuitem" onClick={markAllRead} className="text-sm text-slate-500">Mark all read</button>
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-3">
                        {notifications.length === 0 && <div className="text-slate-500 text-sm">No notifications</div>}
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-3 rounded-md ${n.read ? 'bg-slate-100' : 'bg-slate-50'} border`}>
                            <div className="text-slate-900 text-sm font-medium">{n.title}</div>
                            <div className="text-slate-600 text-xs">{n.body}</div>
                            <div className="text-slate-400 text-xs mt-1">{n.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Portal>
              )}

              {showProfileMenu && profileCoords && (
                <Portal>
                  <div ref={profileDropdownRef} className="fixed z-9999" style={{ top: profileCoords.top, left: profileCoords.left, width: profileCoords.width }}>
                    <div className="bg-white text-slate-900 rounded-lg p-2 shadow-xl border" role="menu" aria-label="Profile menu" tabIndex={-1} onKeyDown={(e) => handleMenuKeyDown(e, profileDropdownRef, () => setShowProfileMenu(false))}>
                      <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">Edit profile</button>
                      <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/profile/view'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">View profile</button>
                      <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">Settings</button>
                      <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/premium'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100">Premium</button>
                      <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/help'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-green-600 font-medium">🆘 Help & Support</button>
                      <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/order-food'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-orange-600 font-medium">🍕 Order Food</button>
                      {user?.role === 'handyman' && (
                        <>
                          <div className="border-t my-1" />
                          <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/messages'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-blue-600 font-medium">💬 Messages</button>
                          <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/cashout'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-emerald-600 font-medium">💰 Cashout</button>
                          <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/analytics'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-purple-600 font-medium">📊 Analytics</button>
                          <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/viewjobs'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-indigo-600 font-medium">🔍 View Jobs</button>
                          <button role="menuitem" onClick={() => { setShowProfileMenu(false); navigate('/studentdetails'); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-teal-600 font-medium">👨‍🎓 Student Details</button>
                        </>
                      )}
                      <div className="border-t my-1" />
                      <button role="menuitem" onClick={() => { localStorage.removeItem('user'); window.dispatchEvent(new CustomEvent('userUpdated')); navigate('/login'); }} className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-slate-100">Logout</button>
                    </div>
                  </div>
                </Portal>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            color="text-white"
            bgColor="bg-linear-to-br from-blue-600/20 to-blue-800/20"
            icon={(
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            onClick={() => navigate('/jobs?filter=all')}
          />

          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            color="text-white"
            bgColor="bg-green-900"
            titleClass="text-white"
            icon={(
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            onClick={() => navigate('/jobs?filter=active')}
          />

          <StatCard
            title="Completed"
            value={stats.completedJobs}
            color="text-white"
            bgColor="bg-purple-900"
            titleClass="text-white"
            icon={(
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            onClick={() => navigate('/jobs?filter=completed')}
          />

          <StatCard
            title="Earnings"
            value={`$${stats.earnings.toFixed(2)}`}
            color="text-white"
            bgColor="bg-rose-900"
            titleClass="text-white"
            icon={(
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            )}
            onClick={() => navigate('/cashout')}
          />
        </div>

        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">Creators to follow</h2>
            <Link to="/creators" className="text-sm text-white/60 hover:text-white transition-colors">See all →</Link>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {creators.map((c, idx) => {
              const count = (followersMap[c.name] || []).length || 0;
              const following = user && (followersMap[c.name] || []).includes(user.name || user.email);
              return (
                <div key={c.name || idx} className="min-w-[160px] sm:min-w-[200px] flex-shrink-0 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center gap-2">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">{c.avatar}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{c.name}</div>
                      <div className="text-white/60 text-xs truncate">{c.bio}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-white/60">{count} followers</div>
                    <button onClick={() => toggleFollow(c.name)} className={`px-2 py-1 rounded text-xs font-medium ${following ? 'bg-white/20 text-white' : 'bg-yellow-500 text-black'}`}>
                      {following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {user && String(user.role).toLowerCase() === 'handyman' ? 'Available Jobs' : 'Recent Jobs'}
                </h2>
                {user && String(user.role).toLowerCase() === 'client' && (
                  <Link to="/postjob" className="bg-linear-to-r from-purple-500 to-pink-500 text-black px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 font-medium">Post New Job</Link>
                )}
              </div>

              {user && String(user.role).toLowerCase() === 'handyman' ? (
                // Handymen view: available jobs to apply to
                jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                      </svg>
                    </div>
                    <p className="text-white/70 text-lg mb-4">No jobs available yet</p>
                    <p className="text-white/50 text-sm">Check back soon for new job opportunities!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {jobs.slice(0, 5).map((job, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0">
                          <div className="flex-1 w-full sm:w-auto">
                            <h3 className="font-bold text-white text-base sm:text-lg mb-1">{job.title}</h3>
                            <p className="text-white/70 text-xs sm:text-sm mb-2 line-clamp-2">{job.description}</p>
                            <div className="flex items-center gap-3 text-xs sm:text-sm">
                              <span className="text-green-400 font-semibold">${job.price}</span>
                              <span className="text-white/80">by {job.postedBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{job.status || 'Active'}</span>
                            <button onClick={() => alert('Apply feature coming soon! Contact the client through Messages.')} className="px-3 py-1 rounded-md bg-green-600/80 text-white text-xs sm:text-sm hover:bg-green-600 whitespace-nowrap">Apply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Clients view: posted jobs
                jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                      </svg>
                    </div>
                    <p className="text-white/70 text-lg mb-4">No jobs available yet</p>
                    <Link to="/postjob" className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-500 to-teal-500 text-black rounded-lg hover:scale-105 transition-all duration-300">Create Your First Job
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto" data-section="recent-jobs">
                    {displayedJobs.slice(0, 5).map((job, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0">
                          <div className="flex-1 w-full sm:w-auto">
                            <h3 className="font-bold text-white text-base sm:text-lg mb-1">{job.title}</h3>
                            <p className="text-white/70 text-xs sm:text-sm mb-2 line-clamp-2">{job.description}</p>
                            <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
                              <span className="text-green-400 font-semibold">${job.price}</span>
                              <span className="text-white/80">by {job.postedBy}
                                {((followersMap[job.postedBy] || []).length || 0) >= 3 && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-300 rounded">Promoted</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{job.status || 'Active'}</span>
                            <button onClick={() => handleDeleteJob(i)} className="px-3 py-1 rounded-md bg-red-600/80 text-white text-xs sm:text-sm hover:bg-red-600 whitespace-nowrap">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-600/10 to-teal-600/10 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.type === 'success' ? 'bg-green-400' : activity.type === 'info' ? 'bg-blue-400' : 'bg-yellow-400'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-xs sm:text-sm">{activity.action}</p>
                    <p className="text-white/60 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <button 
                onClick={() => navigate('/activities')}
                className="w-full text-center text-black font-medium hover:text-gray-700 text-sm transition-colors duration-300 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
              >
                View all activities →
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-indigo-600/10 border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {user && String(user.role).toLowerCase() === 'client' && (
              <Link to="/postjob" className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2 sm:p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm sm:text-base">Post a Job</h3>
                  <p className="text-white/60 text-xs sm:text-sm">Create a new job posting</p>
                </div>
              </Link>
            )}

            {user && String(user.role).toLowerCase() === 'handyman' && (
              <Link to="/viewjobs" className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-black">View Jobs</h3>
                  <p className="text-black/60 text-sm">Browse & apply for available jobs</p>
                </div>
              </Link>
            )}



            {/* Rate Clients button for handymen - positioned next to Settings */}
            {user && String(user.role).toLowerCase() === 'handyman' && (
              <button onClick={() => navigate('/clientratings')} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-black">Rate Clients</h3>
                  <p className="text-black/60 text-sm">Rate your client experiences</p>
                </div>
              </button>
            )}

            {/* Availability button for handymen */}
            {user && String(user.role).toLowerCase() === 'handyman' && (
              <button onClick={() => navigate('/availability')} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <div className="p-3 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-black">Availability</h3>
                  <p className="text-black/60 text-sm">Set your working hours</p>
                </div>
              </button>
            )}

            <Link to="/settings" className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black">Settings</h3>
                <p className="text-black/60 text-sm">Manage your account</p>
              </div>
            </Link>

            <button onClick={() => navigate('/analytics')} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black">View Analytics</h3>
                <p className="text-black/60 text-sm">Check your performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
