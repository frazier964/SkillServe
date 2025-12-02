import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showEnableAuthLink, setShowEnableAuthLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  // Create demo accounts for testing
  const createDemoAccounts = () => {
    const demoAccounts = [
      {
        name: "John Smith",
        email: "handyman@demo.com", 
        password: "demo123",
        role: "handyman",
        uid: "demo-handyman-001"
      },
      {
        name: "Sarah Johnson", 
        email: "client@demo.com",
        password: "demo123", 
        role: "client",
        uid: "demo-client-001"
      }
    ];

    // Save demo accounts to localStorage for easy login testing
    try {
      localStorage.setItem("demoAccounts", JSON.stringify(demoAccounts));
    } catch (e) {
      console.warn('Failed to save demo accounts', e);
    }
  };

  // Create demo accounts on component mount
  useEffect(() => {
    createDemoAccounts();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Please fill in both email and password.");
      setIsLoading(false);
      return;
    }

    // ALWAYS check demo accounts first - create them if they don't exist
    const demoAccounts = [
      {
        name: "John Smith",
        email: "handyman@demo.com", 
        password: "demo123",
        role: "handyman",
        uid: "demo-handyman-001"
      },
      {
        name: "Sarah Johnson", 
        email: "client@demo.com",
        password: "demo123", 
        role: "client",
        uid: "demo-client-001"
      }
    ];
    
    // Check if this is a demo account
    const demoUser = demoAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (demoUser) {
      // Use demo account directly - no Firebase needed
      const completeUser = {
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        uid: demoUser.uid
      };
      try { 
        localStorage.setItem("user", JSON.stringify(completeUser)); 
        // Broadcast the user update event so Layout component updates
        window.dispatchEvent(new Event('userUpdated'));
      } catch (e) {}
      if (remember) localStorage.setItem("remembered", JSON.stringify({ email }));
      setSuccess(`Welcome back, ${demoUser.name}!`);
      setTimeout(() => navigate("/"), 500);
      setIsLoading(false);
      return;
    }

    // Check localStorage for existing accounts (from signup)
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      // Use stored account
      const completeUser = {
        name: storedUser.name,
        email: storedUser.email,
        role: storedUser.role,
        uid: storedUser.uid || 'local-' + Date.now()
      };
      try { 
        localStorage.setItem("user", JSON.stringify(completeUser)); 
        window.dispatchEvent(new Event('userUpdated'));
      } catch (e) {}
      if (remember) localStorage.setItem("remembered", JSON.stringify({ email }));
      setSuccess(`Welcome back, ${completeUser.name}!`);
      setTimeout(() => navigate("/"), 500);
      setIsLoading(false);
      return;
    }
    // If no match found
    setError("Invalid email or password. Try demo accounts: handyman@demo.com / demo123 or client@demo.com / demo123");
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-100">
        
        {/* Animated background blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-32 left-40 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>

        <div className="relative w-full max-w-md">
          {/* Main Card */}
          <div className="glass-card p-8 sm:p-10">
            
            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} noValidate className="space-y-6">
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
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Enable Email/Password sign-in in the Firebase Console
                  </a>
                  <button
                    type="button"
                    onClick={() => window.open('https://console.firebase.google.com/project/skillserve-d82a8/authentication/providers', '_blank', 'noopener')}
                    className="mt-2 sm:mt-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 focus:outline-none"
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
                      focusedField === 'email' ? 'text-emerald-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field peer"
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
                      focusedField === 'password' ? 'text-emerald-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="input-field pr-12 peer"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-emerald-600 focus:outline-none text-gray-400 transition-colors duration-200"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded-lg focus:ring-emerald-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-700 select-none transition-colors">Remember me</span>
                </label>
                <Link
                  to="/"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-linear-to-r from-gray-200 via-gray-300 to-transparent"></div>
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-2">or continue with</span>
                <div className="flex-1 h-px bg-linear-to-l from-gray-200 via-gray-300 to-transparent"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                className="w-full border-2 border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="group-hover:text-emerald-700 transition-colors">Google</span>
              </button>

              {/* Demo Accounts Info */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">Demo Accounts:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Handyman:</strong> handyman@demo.com / demo123</div>
                  <div><strong>Client:</strong> client@demo.com / demo123</div>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200"
                  >
                    Create one
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
