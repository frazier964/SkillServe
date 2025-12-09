import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useLocation, useNavigate } from "react-router-dom";

export default function Payment() {
  const { state } = useLocation();
  const plan = state?.plan;
  const navigate = useNavigate();

  const [billing, setBilling] = useState({
    fullName: '',
    address: '',
    city: '',
    country: '',
    postal: '',
    email: (JSON.parse(localStorage.getItem('user') || '{}') || {}).email || ''
  });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [cryptoCurrency, setCryptoCurrency] = useState('bitcoin');
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [cryptoAddr, setCryptoAddr] = useState('');
  const [scanning, setScanning] = useState(false);
  const [qrText, setQrText] = useState('');
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef(null);
  const [paypalReady, setPaypalReady] = useState(false);

  // M-Pesa simulation states
  const [_mpesaStatus, _setMpesaStatus] = useState('');
  const [_mpesaTimer, _setMpesaTimer] = useState(null);
  
  // Environment variables
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateForm() {
    const next = {};
    if (!billing.fullName || billing.fullName.trim().length < 2) next.fullName = 'Full name required';
    if (!billing.address || billing.address.trim().length < 5) next.address = 'Address is required';
    if (!billing.email || !emailRe.test(billing.email)) next.email = 'Valid email is required';
    if (!billing.city) next.city = 'City required';
    if (!billing.country) next.country = 'Country required';
    if (!billing.postal || billing.postal.length < 3) next.postal = 'Postal code required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  useEffect(() => {
    if (billing.email) {
      setErrors(err => ({ ...err, email: emailRe.test(billing.email) ? undefined : 'Valid email is required' }));
    }
  }, [billing.email]);

  useEffect(() => {
    if (method !== 'paypal') return;
    if (!paypalClientId) return;
    if (window.paypal) { setPaypalReady(true); return; }
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
    s.async = true;
    s.onload = () => setPaypalReady(true);
    s.onerror = () => setErrors(e => ({ ...e, paypal: 'Failed to load PayPal SDK. Check VITE_PAYPAL_CLIENT_ID.' }));
    document.body.appendChild(s);
  }, [method, paypalClientId]);

  function onReview() {
    if (method === 'mpesa') {
      if (!mpesaPhone || mpesaPhone.replace(/\D/g, '').length < 9) {
        setErrors({ form: 'Enter a valid Kenyan phone number for M-Pesa.' });
        return;
      }
      if (!billing.email) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email) {
          setBilling(prev => ({ ...prev, email: user.email }));
        } else {
          setErrors({ form: 'Email is required for M-Pesa payment confirmation.' });
          return;
        }
      }
      setErrors({});
      setShowConfirm(true);
      return;
    }
    
    if (!validateForm()) return;
    setShowConfirm(true);
  }

  function handleConfirmPayment() {
    setShowConfirm(false);
    setProcessing(true);
    setErrors({});

    if (method === 'mpesa') {
      simulateMpesaPayment();
    } else if (method === 'paypal' && window.paypal) {
      handlePaypalPayment();
    } else if (method === 'crypto') {
      handleCryptoPayment();
    } else {
      handleCardPayment();
    }
  }

  function simulateMpesaPayment() {
    _setMpesaStatus('initiating');
    
    setTimeout(() => {
      _setMpesaStatus('sent');
      setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
          _setMpesaStatus('success');
          completePayment('M-Pesa payment completed successfully!');
        } else {
          _setMpesaStatus('failed');
          setProcessing(false);
          setErrors({ form: 'M-Pesa payment failed. Please try again.' });
        }
      }, 8000);
    }, 2000);
  }

  function handlePaypalPayment() {
    if (!window.paypal || !paypalReady) {
      setErrors({ form: 'PayPal is not ready. Please refresh and try again.' });
      setProcessing(false);
      return;
    }

    try {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: (plan?.price || '$0').replace(/[^0-9.]/g, '') || '0' }
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(() => {
            completePayment('PayPal payment completed successfully!');
          });
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          setErrors({ form: 'PayPal payment failed. Please try again.' });
          setProcessing(false);
        }
      }).render('#paypal-button-container');
    } catch (error) {
      setErrors({ form: 'Failed to initialize PayPal. Please try again.' });
      setProcessing(false);
    }
  }

  function handleCryptoPayment() {
    setTimeout(() => {
      completePayment('Cryptocurrency payment completed successfully!');
    }, 3000);
  }

  function handleCardPayment() {
    setTimeout(() => {
      completePayment('Card payment completed successfully!');
    }, 2000);
  }

  function completePayment(message) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.isPremium = true;
    localStorage.setItem('user', JSON.stringify(user));
    
    setProcessing(false);
    alert(message);
    navigate('/dashboard');
  }

  // QR Scanner Functions
  async function startCameraScanner() {
    if (scanning) return;
    try {
      setScanning(true);
      setScanError('');
      const html5QrCode = new Html5Qrcode("qr-scanner");
      scannerRef.current = html5QrCode;
      
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setScanError('No camera found on this device.');
        return;
      }
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setQrText(decodedText);
          setCryptoAddr(decodedText);
          stopCameraScanner();
        },
        (errorMessage) => {
          // Ignore frequent scan errors
        }
      );
    } catch (err) {
      setScanError('Failed to start camera: ' + err.message);
      setScanning(false);
    }
  }

  async function stopCameraScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      setScanning(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: "1s"}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: "2s"}}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="backdrop-blur-sm bg-white/10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Premium Checkout</h1>
                <p className="text-white/80">Complete your subscription to unlock premium features</p>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold text-lg">{plan?.title || 'Custom Plan'}</div>
                <div className="text-yellow-300 font-bold text-2xl">{plan?.price || ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            
            {/* Payment Method Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Choose Payment Method</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'mpesa', label: 'M-Pesa', icon: '📱' },
                  { id: 'card', label: 'Credit Card', icon: '💳' },
                  { id: 'paypal', label: 'PayPal', icon: '🏦' },
                  { id: 'crypto', label: 'Crypto', icon: '₿' }
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setMethod(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      method === option.id
                        ? 'border-yellow-500 bg-yellow-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Payment Method Forms */}
              <div className="space-y-6">
                {method === 'mpesa' && (
                  <div className="p-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      📱 M-Pesa Payment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="254712345678"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                        <p className="text-white/60 text-sm mt-1">Enter your M-Pesa registered phone number</p>
                      </div>
                      
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Email for Receipt</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={billing.email}
                          onChange={(e) => setBilling(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>

                      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                        <h4 className="text-green-300 font-semibold mb-2">How it works:</h4>
                        <ol className="text-green-200 text-sm space-y-1">
                          <li>1. Click "Review & Pay" to confirm</li>
                          <li>2. You'll receive an STK push on your phone</li>
                          <li>3. Enter your M-Pesa PIN to complete payment</li>
                          <li>4. Get instant access to premium features</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {method === 'card' && (
                  <div className="p-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      💳 Credit Card
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Card Number</label>
                        <input placeholder="1234 5678 9012 3456" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/90 font-medium mb-2">Expiry</label>
                          <input placeholder="MM/YY" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div>
                          <label className="block text-white/90 font-medium mb-2">CVV</label>
                          <input placeholder="123" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {method === 'paypal' && (
                  <div className="p-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      🏦 PayPal
                    </h3>
                    {!paypalClientId ? (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-300 text-sm">PayPal is not configured. Please contact support.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white/80 mb-4">Click "Review & Pay" to continue with PayPal checkout.</p>
                        <div id="paypal-button-container" className="hidden"></div>
                      </div>
                    )}
                  </div>
                )}

                {method === 'crypto' && (
                  <div className="p-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      ₿ Cryptocurrency
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Currency</label>
                        <select 
                          value={cryptoCurrency} 
                          onChange={(e) => setCryptoCurrency(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        >
                          <option value="bitcoin" style={{backgroundColor: '#1e293b'}}>Bitcoin (BTC)</option>
                          <option value="ethereum" style={{backgroundColor: '#1e293b'}}>Ethereum (ETH)</option>
                          <option value="usdt" style={{backgroundColor: '#1e293b'}}>Tether (USDT)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Wallet Address</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter or scan wallet address"
                            value={cryptoAddr}
                            onChange={(e) => setCryptoAddr(e.target.value)}
                            className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          />
                          <button
                            onClick={() => setShowQrScanner(true)}
                            className="px-4 py-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 transition-all"
                          >
                            📷 Scan
                          </button>
                        </div>
                      </div>

                      <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                        <h4 className="text-orange-300 font-semibold mb-2">Payment Instructions:</h4>
                        <ol className="text-orange-200 text-sm space-y-1">
                          <li>1. Send payment to the provided address</li>
                          <li>2. Wait for blockchain confirmation</li>
                          <li>3. Your account will be upgraded automatically</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Information - Only show for non-M-Pesa methods */}
              {method !== 'mpesa' && (
                <div className="space-y-6">
                  <div className="p-6 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Billing Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Full Name</label>
                        <input
                          value={billing.fullName}
                          onChange={(e) => setBilling(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-white/90 font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          value={billing.email}
                          onChange={(e) => setBilling(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-white/90 font-medium mb-2">Address</label>
                        <input
                          value={billing.address}
                          onChange={(e) => setBilling(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="123 Main Street"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/90 font-medium mb-2">City</label>
                          <input
                            value={billing.city}
                            onChange={(e) => setBilling(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Nairobi"
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          />
                          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-white/90 font-medium mb-2">Country</label>
                          <input
                            value={billing.country}
                            onChange={(e) => setBilling(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="Kenya"
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          />
                          {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/90 font-medium mb-2">Postal Code</label>
                        <input
                          value={billing.postal}
                          onChange={(e) => setBilling(prev => ({ ...prev, postal: e.target.value }))}
                          placeholder="00100"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                        {errors.postal && <p className="text-red-400 text-sm mt-1">{errors.postal}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {errors.form && <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">{errors.form}</div>}

            <div className="mt-8 flex items-center justify-between p-6 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
              <button className="px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-200 flex items-center gap-2" onClick={() => navigate(-1)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 rounded-xl bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200" onClick={() => { setBilling({ fullName:'', address:'', city:'', country:'', postal:'', email:billing.email }); setErrors({}); }}>Clear Form</button>
                <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" onClick={onReview} disabled={processing}>
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : `Review & Pay ${plan?.price || ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirm(false)}></div>
          <div className="relative bg-slate-900 rounded-lg p-6 max-w-xl w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Confirm payment</h3>
            <p className="text-slate-300 mb-4">You're about to pay <strong className="text-white">{plan?.price || ''}</strong> for <strong>{plan?.title || 'Plan'}</strong> using <strong className="capitalize">{method}</strong>.</p>

            <div className="bg-white/5 p-3 rounded mb-4">
              {method === 'mpesa' ? (
                <>
                  <div className="flex items-center gap-2">
                    <strong>M-Pesa Payment</strong>
                    {_mpesaStatus && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        _mpesaStatus === 'initiating' ? 'bg-yellow-500/20 text-yellow-300' :
                        _mpesaStatus === 'sent' ? 'bg-blue-500/20 text-blue-300' :
                        _mpesaStatus === 'failed' ? 'bg-red-500/20 text-red-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {_mpesaStatus}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-300">Phone: {mpesaPhone}</div>
                  <div className="text-sm text-slate-300">Amount: {plan?.price}</div>
                  {processing && (
                    <div className="text-xs text-blue-300 mt-2">
                      {_mpesaStatus === 'initiating' ? 'Sending STK push to your phone...' :
                       _mpesaStatus === 'sent' ? 'Please check your phone and enter M-Pesa PIN...' :
                       'Processing payment...'}
                    </div>
                  )}
                </>
              ) : method === 'crypto' ? (
                <>
                  <strong>Cryptocurrency Payment</strong>
                  <div className="text-sm text-slate-300">Currency: {cryptoCurrency.toUpperCase()}</div>
                  <div className="text-sm text-slate-300">Amount: {plan?.price}</div>
                </>
              ) : (
                <>
                  <strong>{method === 'paypal' ? 'PayPal' : 'Card'} Payment</strong>
                  <div className="text-sm text-slate-300">Email: {billing.email}</div>
                  <div className="text-sm text-slate-300">Amount: {plan?.price}</div>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={processing}
                className="px-4 py-2 rounded bg-transparent border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={processing}
                className="px-6 py-2 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-semibold hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => { stopCameraScanner(); setShowQrScanner(false); }}></div>
          <div className="relative bg-slate-900 rounded-lg p-6 max-w-md w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Scan QR Code</h3>
            
            <div className="mb-4">
              <div id="qr-scanner" className="w-full h-64 bg-black rounded-lg overflow-hidden">
                {!scanning && (
                  <div className="w-full h-full flex items-center justify-center">
                    <button
                      onClick={startCameraScanner}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
              {scanError && <div className="text-red-400 text-sm mt-2">{scanError}</div>}
            </div>

            <div className="mt-4 text-right">
              <button type="button" className="px-4 py-2 rounded bg-transparent border border-white/10" onClick={async () => { await stopCameraScanner(); setShowQrScanner(false); setScanError(''); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}