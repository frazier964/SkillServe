import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showEnableAuthLink, setShowEnableAuthLink] = useState(false);
  const [success, setSuccess] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const roleRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    if (!name || !email || !password || !role) {
      setError("Please complete all required fields.");
      setIsLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (passwordScore < 2) {
      setError("Please choose a stronger password.");
      setIsLoading(false);
      return;
    }

    // Save account to localStorage (no Firebase)
    const profile = { 
      name, 
      email, 
      password, 
      role, 
      uid: 'local-' + Date.now(),
      createdAt: new Date().toISOString() 
    };
    
    try { 
      localStorage.setItem("user", JSON.stringify(profile)); 
    } catch (e) {
      setError("Failed to save account. Please try again.");
      setIsLoading(false);
      return;
    }
    
    setSuccess("Account created successfully! Please log in with your new credentials.");
    setTimeout(() => navigate("/login"), 800);
    setIsLoading(false);
  };

  // ---------- Google OAuth PKCE + code flow (client-side demo) ----------
  // Note: exchanging the code for tokens from the browser may be blocked by CORS on some providers.
  // For production, perform the code -> token exchange on a secure server.

  function base64UrlEncode(buffer) {
    // buffer is ArrayBuffer
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function sha256(input) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
  }

  function generateCodeVerifier() {
    // high-entropy random string 64..128 chars
    const array = new Uint8Array(64);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  }

  function decodeJwtPayload(idToken) {
    if (!idToken) return null;
    try {
      const parts = idToken.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(payload);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // Token exchange is performed on the server for reliability and to keep secrets secure.
  // The frontend calls POST `${API_BASE}/exchange` with { code, code_verifier, redirect_uri }.

  async function startGoogleSignIn() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file and add the redirect URI (https://your-app-origin/oauth2callback.html) in Google Cloud Console.');
      return;
    }

    const redirectUri = window.location.origin + '/oauth2callback.html';
    const scope = encodeURIComponent('openid email profile');

    // PKCE setup
    const codeVerifier = generateCodeVerifier();
    const hash = await sha256(codeVerifier);
    const codeChallenge = base64UrlEncode(hash);
    // store verifier to session storage for later
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('pkce_state', state);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&prompt=select_account&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256&state=${encodeURIComponent(state)}`;

    const width = 500, height = 700;
    const left = window.screenX + Math.round((window.outerWidth - width) / 2);
    const top = window.screenY + Math.round((window.outerHeight - height) / 2.5);
    const popup = window.open(authUrl, 'google_oauth', `width=${width},height=${height},left=${left},top=${top}`);
    if (!popup) {
      setError('Popup blocked. Please allow popups for this site.');
      return;
    }

    function receiveMessage(ev) {
      if (ev.origin !== window.location.origin) return;
      if (!ev.data || ev.data.type !== 'oauth2callback') return;
      try {
        // parse ?code=...&state=...
        const search = ev.data.search || '';
        const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
        const code = params.get('code');
        const returnedState = params.get('state');
        if (!code) {
          setError('No authorization code returned from Google.');
          window.removeEventListener('message', receiveMessage);
          // clear PKCE
          sessionStorage.removeItem('pkce_code_verifier');
          sessionStorage.removeItem('pkce_state');
          return;
        }
        const expectedState = sessionStorage.getItem('pkce_state');
        if (!expectedState || expectedState !== returnedState) {
          console.warn('PKCE state mismatch.');
          // continue but warn
        }

        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        if (!codeVerifier) {
          setError('PKCE verifier missing; cannot complete sign-in.');
          window.removeEventListener('message', receiveMessage);
          return;
        }

        // Call server-side exchange endpoint
        (async () => {
          try {
            const resp = await fetch(`${API_BASE}/exchange`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri }),
            });
            if (!resp.ok) {
              const text = await resp.text();
              throw new Error('Server exchange failed: ' + resp.status + ' ' + text);
            }
            const tokenResp = await resp.json();
            const idToken = tokenResp.id_token;
            const payload = decodeJwtPayload(idToken);
            if (payload && payload.email) {
              setName(payload.name || payload.email.split('@')[0]);
              setEmail(payload.email);
              setError('Google provided your name and email. Please choose a role and set a password to complete signup.');
              // focus role selection so user picks role
              setTimeout(() => { roleRef.current?.focus(); }, 50);
            } else {
              setError('Google sign-in succeeded but no profile email found.');
            }
            // clear PKCE storage
            sessionStorage.removeItem('pkce_code_verifier');
            sessionStorage.removeItem('pkce_state');
            window.removeEventListener('message', receiveMessage);
          } catch (err) {
            console.error('Server token exchange error', err);
            setError('Failed to complete sign-in. Check the developer console for details.');
            sessionStorage.removeItem('pkce_code_verifier');
            sessionStorage.removeItem('pkce_state');
            window.removeEventListener('message', receiveMessage);
          }
        })();
      } catch (e) {
        console.error('Failed to process oauth callback', e);
        alert('Google sign-in failed.');
        window.removeEventListener('message', receiveMessage);
      }
    }

    window.addEventListener('message', receiveMessage);
  }



  const evaluatePassword = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    setPasswordScore(score);
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-linear-to-br from-blue-50 via-purple-50 to-pink-100">
        
        {/* Animated background blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>

        <div className="relative w-full max-w-md">
          {/* Main Card */}
          <div className="glass-card p-8 sm:p-10">

            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Join Us
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Create your account and get started in minutes
              </p>
            </div>

            <form onSubmit={handleSignup} noValidate className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-5 py-4 rounded-xl text-sm animate-slideDown flex items-start gap-3 shadow-sm" role="alert">
                  <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {showEnableAuthLink && (
                <div className="mt-3 text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <a
                    href="https://console.firebase.google.com/project/skillserve-d82a8/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Enable Email/Password sign-in in the Firebase Console
                  </a>
                  <button
                    type="button"
                    onClick={() => window.open('https://console.firebase.google.com/project/skillserve-d82a8/authentication/providers', '_blank', 'noopener')}
                    className="mt-2 sm:mt-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 focus:outline-none"
                  >
                    Open Firebase Console
                  </button>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="bg-green-50 border border-green-300 text-green-800 px-5 py-4 rounded-xl text-sm animate-slideDown flex items-start gap-3 shadow-sm" role="alert">
                  <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* Full Name Field */}
              <div className="space-y-2.5">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className={`relative group transition-all duration-300 ${
                  focusedField === 'name' ? 'scale-105' : 'scale-100'
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className={`relative group transition-all duration-300 ${
                  focusedField === 'email' ? 'scale-105' : 'scale-100'
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className={`relative group transition-all duration-300 ${
                  focusedField === 'password' ? 'scale-105' : 'scale-100'
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      evaluatePassword(e.target.value);
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 focus:outline-none text-gray-400 transition-colors duration-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="flex items-center gap-3 mt-3 px-1">
                    <div className="flex gap-1.5 flex-1">
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordScore >= 1 ? "bg-red-500" : "bg-gray-300"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordScore >= 2 ? "bg-amber-500" : "bg-gray-300"}`}></div>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordScore >= 3 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </div>
                    <small className={`text-xs font-medium whitespace-nowrap ${
                      passwordScore === 1 ? 'text-red-600' :
                      passwordScore === 2 ? 'text-amber-600' :
                      passwordScore === 3 ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {passwordScore === 0 && "Enter password"}
                      {passwordScore === 1 && "Weak"}
                      {passwordScore === 2 && "Good"}
                      {passwordScore === 3 && "Strong"}
                    </small>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2.5">
                <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className={`relative group transition-all duration-300 ${
                  focusedField === 'confirm' ? 'scale-105' : 'scale-100'
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'confirm' ? 'text-blue-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  What's your role?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    ref={roleRef}
                    className={`p-4 border-2 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                      role === "client"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/20"
                        : "border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">👤</div>
                    <div className="font-semibold text-sm">Client</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("handyman")}
                    className={`p-4 border-2 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                      role === "handyman"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/20"
                        : "border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">🔧</div>
                    <div className="font-semibold text-sm">Handyman</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform  hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-linear-to-r from-gray-200 via-gray-300 to-transparent"></div>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2">or continue with</span>
                <div className="flex-1 h-px bg-linear-to-l from-gray-200 via-gray-300 to-transparent"></div>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                className="w-full border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 group"
                onClick={startGoogleSignIn}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="group-hover:text-blue-700 transition-colors">Google</span>
              </button>

              {/* Sign In Link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
