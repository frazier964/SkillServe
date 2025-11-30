import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Protects routes: shows children only when there's an authenticated user
export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // First check localStorage for quick access
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (stored && (stored.uid || stored.email || stored.name)) {
      setAuthed(true);
      setChecking(false);
      return;
    }
    
    // If no localStorage user, check Firebase
    try {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!mounted) return;
        if (user) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
        setChecking(false);
      });
      return () => { mounted = false; unsub(); };
    } catch (e) {
      // If auth check fails, rely on localStorage check
      console.warn('Auth check failed', e);
      setAuthed(!!(stored && (stored.uid || stored.email || stored.name)));
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}
