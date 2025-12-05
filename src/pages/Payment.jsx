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
  const [_mpesaStatus, setMpesaStatus] = useState(null);
  const paypalClientId = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_PAYPAL_CLIENT_ID : undefined;

  function handleChange(e) {
    const { name, value } = e.target;
    setBilling(b => ({ ...b, [name]: value }));
  }

  const emailRe = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  function validate() {
    const next = {};
    if (!billing.fullName || billing.fullName.trim().length < 3) next.fullName = 'Full name is required (min 3 chars)';
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
    // method-specific validation: mpesa only needs phone, others require billing
    if (method === 'mpesa') {
      if (!mpesaPhone || mpesaPhone.replace(/\D/g, '').length < 9) {
        setErrors({ form: 'Enter a valid Kenyan phone number for M-Pesa.' });
        return;
      }
      setShowConfirm(true);
      return;
    }

    if (method === 'crypto') {
      // require a crypto address before proceeding to review
      if (!cryptoAddr || cryptoAddr.trim().length < 8) {
        setErrors({ form: 'Please enter your wallet address for the selected cryptocurrency.' });
        return;
      }
      setShowCryptoModal(true);
      return;
    }

    if (!validate()) return;
    if (method === 'crypto') {
      setShowCryptoModal(true);
      return;
    }
    setShowConfirm(true);
  }

  function pay() {
    setProcessing(true);

    setTimeout(() => {
      try {
        
        const now = new Date().toISOString();
        const entry = { email: billing.email, plan: plan?.id || 'unknown', since: now, active: true, method };
        const raw = localStorage.getItem('subscriptions');
        const subs = raw ? JSON.parse(raw) : [];
        const filtered = subs.filter(s => s.email !== billing.email);
        filtered.push(entry);
        localStorage.setItem('subscriptions', JSON.stringify(filtered));

        
        try {
          const u = JSON.parse(localStorage.getItem('user')) || {};
          u.email = billing.email;
          u.premium = true;
          u.premiumPlan = plan?.id || 'unknown';
          localStorage.setItem('user', JSON.stringify(u));
        } catch (_e) { /* ignore */ }

        window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));

          setProcessing(false);
          setShowConfirm(false);
          navigate('/dashboard');
      } catch (e) {
        console.error(e);
        setProcessing(false);
        setErrors({ form: 'Payment failed, try again' });
      }
    }, 1200);
  }

  
  async function finalizeCryptoPayment(currency) {
    setProcessing(true);
    try {
     
      await new Promise(res => setTimeout(res, 900));
      const now = new Date().toISOString();
      const entry = { email: billing.email || '', plan: plan?.id || `crypto-${currency}`, since: now, active: true, method: `crypto-${currency}`, address: cryptoAddr };
      const raw = localStorage.getItem('subscriptions');
      const subs = raw ? JSON.parse(raw) : [];
      const filtered = subs.filter(s => s.email !== entry.email);
      filtered.push(entry);
      localStorage.setItem('subscriptions', JSON.stringify(filtered));
      try { const u = JSON.parse(localStorage.getItem('user')) || {}; u.email = entry.email; u.premium = true; u.premiumPlan = plan?.id || `crypto-${currency}`; localStorage.setItem('user', JSON.stringify(u)); } catch(e){}
      window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));
      setProcessing(false);
      setShowCryptoModal(false);
        navigate('/dashboard');
    } catch (e) {
      console.error(e);
      setProcessing(false);
      setErrors({ form: 'Crypto payment failed. Try again.' });
    }
  }

  
  useEffect(() => {
    if (method !== 'paypal') return;
    if (!paypalReady) return;
    
    try {
      if (window.paypal && document.getElementById('paypal-button-container')) {
        
        document.getElementById('paypal-button-container').innerHTML = '';
        window.paypal.Buttons({
          createOrder: function(data, actions) {
            const amount = (plan?.price || '').replace(/[^0-9.]/g, '') || '0.00';
            return actions.order.create({
              purchase_units: [{ amount: { value: amount } }]
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
             
              const now = new Date().toISOString();
              const entry = { email: billing.email || (details.payer && details.payer.email_address) || '', plan: plan?.id || 'paypal', since: now, active: true, method: 'paypal', details };
              const raw = localStorage.getItem('subscriptions');
              const subs = raw ? JSON.parse(raw) : [];
              const filtered = subs.filter(s => s.email !== entry.email);
              filtered.push(entry);
              localStorage.setItem('subscriptions', JSON.stringify(filtered));
              try { const u = JSON.parse(localStorage.getItem('user')) || {}; u.email = entry.email; u.premium = true; u.premiumPlan = plan?.id || 'paypal'; localStorage.setItem('user', JSON.stringify(u)); } catch(e){}
              window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));
              navigate('/dashboard');
            });
          },
          onError: function(err) {
            console.error('PayPal Buttons error', err);
            setErrors(e => ({ ...e, paypal: 'PayPal payment failed.' }));
          }
        }).render('#paypal-button-container');
      }
    } catch (e) {
      console.error(e);
    }
 
  }, [paypalReady, method]);

  
  async function mpesaInitiate(phone) {
    setMpesaStatus('initiating');
    try {
      const resp = await fetch('/mpesa/stkpush', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, amount: (plan?.price || '').replace(/[^0-9.]/g, '') || '0' })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        setMpesaStatus(`failed: ${txt}`);
        return;
      }
      const data = await resp.json();
      setMpesaStatus('sent');
      
      if (data && data.success) {
        const now = new Date().toISOString();
        const entry = { email: billing.email || '', plan: plan?.id || 'mpesa', since: now, active: true, method: 'mpesa', details: data };
        const raw = localStorage.getItem('subscriptions');
        const subs = raw ? JSON.parse(raw) : [];
        const filtered = subs.filter(s => s.email !== entry.email);
        filtered.push(entry);
        localStorage.setItem('subscriptions', JSON.stringify(filtered));
        try { const u = JSON.parse(localStorage.getItem('user')) || {}; u.email = entry.email; u.premium = true; u.premiumPlan = plan?.id || 'mpesa'; localStorage.setItem('user', JSON.stringify(u)); } catch(e){}
        window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));
          navigate('/dashboard');
      }
    } catch (e) {
      
      console.error('MPESA call failed, falling back to mock', e);
      setMpesaStatus('mock-success');
      const now = new Date().toISOString();
      const entry = { email: billing.email || '', plan: plan?.id || 'mpesa-mock', since: now, active: true, method: 'mpesa-mock' };
      const raw = localStorage.getItem('subscriptions');
      const subs = raw ? JSON.parse(raw) : [];
      const filtered = subs.filter(s => s.email !== entry.email);
      filtered.push(entry);
      localStorage.setItem('subscriptions', JSON.stringify(filtered));
      try { const u = JSON.parse(localStorage.getItem('user')) || {}; u.email = entry.email; u.premium = true; u.premiumPlan = plan?.id || 'mpesa-mock'; localStorage.setItem('user', JSON.stringify(u)); } catch(e){}
      window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { detail: entry }));
        navigate('/dashboard');
    }
  }

    // --- QR / address helpers ---
    function parseQrPayload(text) {
      if (!text) return null;
      const trimmed = text.trim();
      // common schemes: bitcoin:ADDR, ethereum:0x..., solana:ADDR, or plain addresses
      const lower = trimmed.toLowerCase();
      const schemes = ['bitcoin:', 'ethereum:', 'solana:'];
      for (const s of schemes) {
        if (lower.startsWith(s)) {
          const after = trimmed.slice(s.length);
          return after.split(/[\?\s]/)[0];
        }
      }
      // if it's a URL containing address param e.g. pay?address=...
      try {
        const u = new URL(trimmed);
        const addr = u.searchParams.get('address') || u.searchParams.get('recipient') || u.pathname.split('/').pop();
        if (addr) return addr;
      } catch (e) {
        // not a URL
      }
      // fallback: find 0x... pattern or bc1/1/3 or base58
      const m = trimmed.match(/0x[a-f0-9]{40}/i);
      if (m) return m[0];
      // remove any prefix like bitcoin:, web+bitcoin:
      const maybe = trimmed.replace(/^[a-z0-9+.-]+:/i, '');
      return maybe;
    }

    function validateAddress(currency, addr) {
      if (!addr || !addr.trim()) return { valid: false, error: 'Address is empty' };
      const a = addr.trim();
      if (currency === 'ethereum') {
        if (!/^0x[a-fA-F0-9]{40}$/.test(a)) return { valid: false, error: 'Ethereum addresses must be 0x followed by 40 hex chars' };
        return { valid: true };
      }
      if (currency === 'bitcoin') {
        // basic Bitcoin address validation (legacy, p2sh, bech32)
        if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/i.test(a)) return { valid: true };
        return { valid: false, error: 'Bitcoin address looks invalid (expect 1/3 or bc1 address)' };
      }
      if (currency === 'solana') {
        // base58 typical length 32..44
        if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)) return { valid: true };
        return { valid: false, error: 'Solana address looks invalid (base58, ~32 chars)' };
      }
      return { valid: true };
    }

    async function startCameraScanner() {
      setScanError('');
      try {
        const qrRegionId = 'qr-reader';
        if (scannerRef.current) {
          try { await scannerRef.current.stop(); } catch (e) {}
          try { scannerRef.current.clear(); } catch (e) {}
          scannerRef.current = null;
        }
        const qr = new Html5Qrcode(qrRegionId);
        scannerRef.current = qr;
        setScanning(true);
        await qr.start({ facingMode: { facingMode: 'environment' } }, { fps: 10, qrbox: 250 }, (decoded) => {
          const addr = parseQrPayload(decoded);
          if (addr) {
            setCryptoAddr(addr);
            setQrText(decoded);
            setShowQrScanner(false);
            setScanning(false);
            try { qr.stop(); } catch (e) {}
            try { qr.clear(); } catch (e) {}
          }
        }, (err) => {
          // scan failure callback - ignore
        });
      } catch (e) {
        console.error('QR scanner not available', e);
        setScanError('QR camera scanner unavailable or permission denied.');
      }
    }

    async function stopCameraScanner() {
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (e) {}
        try { scannerRef.current.clear(); } catch (e) {}
        scannerRef.current = null;
      }
      setScanning(false);
    }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-linear-to-r from-slate-800 to-slate-900 text-white shadow-xl">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <p className="text-slate-300">Plan: <strong className="text-white">{plan?.title || 'Custom'}</strong> — <span className="text-yellow-300">{plan?.price || ''}</span></p>

        <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* If M-Pesa is selected we only show the phone input. Other billing fields are not required. */}
            {method === 'crypto' ? (
              <div className="bg-white/3 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Crypto payment</h3>
                <label className="text-xs">Currency</label>
                <div className="flex gap-2 mb-2">
                  {['bitcoin','ethereum','solana'].map(c => (
                    <button key={c} type="button" onClick={() => setCryptoCurrency(c)} className={`px-3 py-2 rounded ${cryptoCurrency===c? 'bg-yellow-500 text-slate-900' : 'bg-white/5 text-white'}`}>{c.charAt(0).toUpperCase()+c.slice(1)}</button>
                  ))}
                </div>
                <label className="text-xs">Wallet address</label>
                <div className="flex gap-2 mb-2">
                  <input value={cryptoAddr} onChange={(e) => setCryptoAddr(e.target.value)} placeholder={`Enter your ${cryptoCurrency} address`} className={`w-full p-2 rounded bg-white/5 ${errors.form ? 'border border-red-500' : ''}`} />
                  <button type="button" className="px-3 py-2 rounded bg-transparent border border-white/10" onClick={() => setShowQrScanner(true)}>Scan QR</button>
                </div>
                {cryptoAddr && (
                  <div className="mb-2 flex items-center gap-3">
                    <div className="text-xs text-slate-400">Preview QR for address</div>
                    <img src={`https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(cryptoAddr)}`} alt="qr" className="w-20 h-20" />
                  </div>
                )}
                <div className="text-xs text-slate-400">After you send the payment to the address above, click Review & Pay and confirm that you have paid.</div>
              </div>
            ) : method !== 'mpesa' ? (
              <div className="bg-white/3 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Billing details</h3>
                <label className="text-xs">Full name <span className="text-red-400">*</span></label>
                <input name="fullName" onChange={handleChange} value={billing.fullName} placeholder="Full name" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.fullName ? 'border border-red-500' : ''}`} />
                {errors.fullName && <div className="text-red-400 text-sm mb-2">{errors.fullName}</div>}

                <label className="text-xs">Address <span className="text-red-400">*</span></label>
                <input name="address" onChange={handleChange} value={billing.address} placeholder="Address" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.address ? 'border border-red-500' : ''}`} />
                {errors.address && <div className="text-red-400 text-sm mb-2">{errors.address}</div>}

                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-xs">City <span className="text-red-400">*</span></label>
                    <input name="city" onChange={handleChange} value={billing.city} placeholder="City" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.city ? 'border border-red-500' : ''}`} />
                    {errors.city && <div className="text-red-400 text-sm mb-2">{errors.city}</div>}
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs">Country <span className="text-red-400">*</span></label>
                    <input name="country" onChange={handleChange} value={billing.country} placeholder="Country" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.country ? 'border border-red-500' : ''}`} />
                    {errors.country && <div className="text-red-400 text-sm mb-2">{errors.country}</div>}
                  </div>
                </div>

                <label className="text-xs">Postal code <span className="text-red-400">*</span></label>
                <input name="postal" onChange={handleChange} value={billing.postal} placeholder="Postal code" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.postal ? 'border border-red-500' : ''}`} />
                {errors.postal && <div className="text-red-400 text-sm mb-2">{errors.postal}</div>}

                <label className="text-xs">Email <span className="text-red-400">*</span></label>
                <input name="email" onChange={handleChange} value={billing.email} placeholder="Email" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.email ? 'border border-red-500' : ''}`} />
                {errors.email && <div className="text-red-400 text-sm mb-2">{errors.email}</div>}
              </div>
            ) : (
              <div className="bg-white/3 p-4 rounded-md">
                <h3 className="font-semibold mb-2">M-Pesa details</h3>
                <label className="text-xs">Kenyan phone number (e.g. 07XXXXXXXX)</label>
                <input value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="07XXXXXXXX" className={`w-full mb-2 p-2 rounded bg-white/5 ${errors.form ? 'border border-red-500' : ''}`} />
                <div className="text-xs text-slate-400">We will use this number to send an M-Pesa STK push for payment.</div>
              </div>
            )}

          <div className="bg-white/3 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Payment method</h3>
            <div className="space-y-2">
              {['mpesa','paypal','mastercard','creditcard','crypto','debitcard','googlepay'].map(m => (
                <label key={m} className="flex items-center gap-3">
                  <input type="radio" name="method" checked={method===m} onChange={() => setMethod(m)} />
                  <span className="capitalize">{m.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Card / Payment details</h4>
              <input placeholder="Card number / Wallet ID" className="w-full mb-2 p-2 rounded bg-white/5" />
              <div className="flex gap-2">
                <input placeholder="Expiry" className="w-1/2 p-2 rounded bg-white/5" />
                <input placeholder="CVC" className="w-1/2 p-2 rounded bg-white/5" />
              </div>
            </div>
          </div>
        </section>

  {errors.form && <div className="mt-4 text-red-400">{errors.form}</div>}

        <div className="mt-6 flex items-center justify-between">
          <button className="px-4 py-2 rounded bg-slate-700" onClick={() => navigate(-1)}>Back</button>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded bg-transparent border border-white/20 text-white" onClick={() => { setBilling({ fullName:'', address:'', city:'', country:'', postal:'', email:billing.email }); setErrors({}); }}>Clear</button>
            <button className="px-4 py-2 rounded bg-yellow-500 text-slate-900 font-semibold" onClick={onReview} disabled={processing}>{processing ? 'Processing...' : `Review & Pay ${plan?.price || ''}`}</button>
          </div>
        </div>
      </div>

      
        {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirm(false)}></div>
          <div className="relative bg-slate-900 rounded-lg p-6 max-w-xl w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Confirm payment</h3>
            <p className="text-slate-300 mb-4">You're about to pay <strong className="text-white">{plan?.price || ''}</strong> for <strong>{plan?.title || 'Plan'}</strong> using <strong className="capitalize">{method}</strong>.</p>

            <div className="bg-white/5 p-3 rounded mb-4">
              {method === 'mpesa' ? (
                <>
                  <div><strong>M-Pesa</strong></div>
                  <div className="text-sm text-slate-300">Phone: {mpesaPhone}</div>
                </>
              ) : method === 'crypto' ? (
                <>
                  <div><strong>Crypto</strong></div>
                  <div className="text-sm text-slate-300">Currency: {cryptoCurrency}</div>
                  <div className="text-sm text-slate-300">Address: {cryptoAddr}</div>
                </>
              ) : (
                <>
                  <div><strong>{billing.fullName}</strong></div>
                  <div className="text-sm text-slate-300">{billing.address}, {billing.city}, {billing.country} {billing.postal}</div>
                  <div className="text-sm text-slate-300">{billing.email}</div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded bg-transparent border border-white/20" onClick={() => setShowConfirm(false)} disabled={processing}>Edit</button>
              <button className="px-4 py-2 rounded bg-green-500 text-slate-900 font-semibold" onClick={method === 'mpesa' ? () => mpesaInitiate(mpesaPhone) : method === 'crypto' ? () => finalizeCryptoPayment(cryptoCurrency) : pay} disabled={processing}>{processing ? 'Processing...' : 'Confirm & Pay'}</button>
            </div>
          </div>
        </div>
      )}

      
      {showCryptoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCryptoModal(false)}></div>
          <div className="relative bg-slate-900 rounded-lg p-6 max-w-xl w-full text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Pay with Crypto</h3>
            <p className="text-slate-300 mb-4">Select a cryptocurrency and follow the instructions to send payment. This is a simulated checkout for testing.</p>

            <div className="flex gap-3 mb-4">
              {['bitcoin','ethereum','solana'].map(c => (
                <button key={c} onClick={() => setCryptoCurrency(c)} className={`px-3 py-2 rounded ${cryptoCurrency===c ? 'bg-yellow-500 text-slate-900' : 'bg-white/5'}`}>{c.charAt(0).toUpperCase()+c.slice(1)}</button>
              ))}
            </div>

            <div className="bg-white/5 p-4 rounded mb-4">
              <div className="text-sm text-slate-300 mb-2">Send {plan?.price} worth to this {cryptoCurrency.toUpperCase()} address:</div>
              <div className="font-mono bg-slate-800 p-3 rounded text-sm">
                {cryptoCurrency === 'bitcoin' ? 'bc1ql2z0qx2xwmg073mxm7u4jcd249rtnlcnz3fsh2' : cryptoCurrency === 'ethereum' ? '0xF4D891Edd0f11853C4AEDC885a853db8BfDD053a' : 'Fz3KnQHffq6LZXQwKk85H72cRovM8Ru8E4fep33knH7E'}
              </div>
              <div className="text-xs text-slate-400 mt-2">After sending payment, click &ldquo;I have paid&rdquo; to finalize (mock)</div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded bg-transparent border border-white/20" onClick={() => setShowCryptoModal(false)} disabled={processing}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-500 text-slate-900 font-semibold" onClick={() => finalizeCryptoPayment(cryptoCurrency)} disabled={processing}>{processing ? 'Processing...' : `I've paid`}</button>
            </div>
          </div>
        </div>
      )}

      {showQrScanner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={async () => { await stopCameraScanner(); setShowQrScanner(false); setScanError(''); }}></div>
          <div className="relative bg-slate-900 rounded-lg p-6 max-w-lg w-full text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Scan or Paste QR</h3>
            <p className="text-sm text-slate-300 mb-3">You can paste the QR payload or use your camera to scan a QR code containing a wallet address.</p>

            <div className="mb-3">
              <label className="text-xs">Paste QR / payment link / address</label>
              <textarea value={qrText} onChange={(e) => setQrText(e.target.value)} rows={3} className="w-full p-2 rounded bg-white/5 text-white" placeholder="Paste raw QR text or URL here"></textarea>
              <div className="flex gap-2 mt-2">
                <button type="button" className="px-3 py-2 rounded bg-transparent border border-white/10" onClick={async () => { try { const t = await navigator.clipboard.readText(); setQrText(t || ''); } catch (e) { setScanError('Clipboard access denied. Paste manually.'); } }}>Paste from clipboard</button>
                <button type="button" className="px-3 py-2 rounded bg-yellow-500 text-slate-900" onClick={() => {
                  const addr = parseQrPayload(qrText);
                  const { valid, error } = validateAddress(cryptoCurrency, addr || '');
                  if (!valid) { setScanError(error); return; }
                  setCryptoAddr(addr);
                  setShowQrScanner(false);
                  setScanError('');
                }}>Use address</button>
                <button type="button" className="px-3 py-2 rounded bg-transparent border border-white/10" onClick={() => { setQrText(''); setScanError(''); }}>Clear</button>
              </div>
              {scanError && <div className="text-red-400 text-sm mt-2">{scanError}</div>}
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-2">Or use your camera to scan a QR code (if supported).</div>
              {!scanning ? (
                <div className="flex gap-2">
                  <button type="button" className="px-3 py-2 rounded bg-green-600" onClick={async () => { await startCameraScanner(); }}>Start camera scan</button>
                  <button type="button" className="px-3 py-2 rounded bg-transparent border border-white/10" onClick={() => { setQrText(''); setScanError(''); }}>Cancel</button>
                </div>
              ) : (
                <div>
                  <div id="qr-reader" style={{ width: '100%' }}></div>
                  <div className="flex gap-2 mt-2">
                    <button type="button" className="px-3 py-2 rounded bg-red-600" onClick={async () => { await stopCameraScanner(); setScanning(false); }}>Stop scan</button>
                    <button type="button" className="px-3 py-2 rounded bg-yellow-500 text-slate-900" onClick={() => { const addr = parseQrPayload(qrText || cryptoAddr); const { valid, error } = validateAddress(cryptoCurrency, addr || ''); if (!valid) { setScanError(error); return; } setCryptoAddr(addr); setShowQrScanner(false); }}>Use scanned</button>
                  </div>
                </div>
              )}
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
