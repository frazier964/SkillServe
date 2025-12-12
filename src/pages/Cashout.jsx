import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getDisplayName } from "../utils/user";
import BackButton from "../components/BackButton";

export default function Cashout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [balance, setBalance] = useState(0);
  const [method, setMethod] = useState('mpesa');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cryptoAddr, setCryptoAddr] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user')) || {};
    setUser(u);
    const saved = JSON.parse(localStorage.getItem('jobs')) || [];
    setJobs(saved);
    const bal = saved.reduce((s, j) => s + (parseFloat(j.price) || 0), 0);
    setBalance(bal);
    setAmount(bal ? bal.toString() : '0');
    setPaypalEmail(u.email || '');
  }, []);

  function validateAmount() {
    const a = parseFloat(amount) || 0;
    if (a <= 0) return 'Enter an amount greater than 0';
    if (a > balance) return 'Amount exceeds available balance';
    return null;
  }

  async function doMpesaPayout() {
    const err = validateAmount();
    if (err) { setStatus(err); return; }
    if (!phone || phone.length < 9) { setStatus('Enter a valid phone number'); return; }
    setProcessing(true); setStatus('initiating mpesa payout...');
    try {
      // In a real app, call server to initiate payout. Here we mock success.
      await new Promise(r => setTimeout(r, 1000));
      const entry = { id: Date.now(), method: 'mpesa', phone, amount: parseFloat(amount), time: new Date().toISOString(), status: 'sent' };
      const raw = JSON.parse(localStorage.getItem('cashouts') || '[]');
      raw.push(entry); localStorage.setItem('cashouts', JSON.stringify(raw));
  setProcessing(false); setStatus('Mpesa payout queued (mock).');
  navigate('/dashboard');
    } catch (e) {
      console.error(e); setProcessing(false); setStatus('Mpesa payout failed');
    }
  }

  async function doPaypalPayout() {
    const err = validateAmount();
    if (err) { setStatus(err); return; }
    if (!paypalEmail) { setStatus('Enter your PayPal email'); return; }
    setProcessing(true); setStatus('initiating PayPal payout...');
    try {
      await new Promise(r => setTimeout(r, 1000));
      const entry = { id: Date.now(), method: 'paypal', paypalEmail, amount: parseFloat(amount), time: new Date().toISOString(), status: 'sent' };
      const raw = JSON.parse(localStorage.getItem('cashouts') || '[]');
      raw.push(entry); localStorage.setItem('cashouts', JSON.stringify(raw));
  setProcessing(false); setStatus('PayPal payout queued (mock).');
  navigate('/dashboard');
    } catch (e) {
      console.error(e); setProcessing(false); setStatus('PayPal payout failed');
    }
  }

  async function doCryptoPayout() {
    const err = validateAmount();
    if (err) { setStatus(err); return; }
    if (!cryptoAddr) { setStatus('Enter your wallet address'); return; }
    setProcessing(true); setStatus('Preparing crypto transfer...');
    try {
      await new Promise(r => setTimeout(r, 1000));
      const entry = { id: Date.now(), method: 'crypto', address: cryptoAddr, amount: parseFloat(amount), time: new Date().toISOString(), status: 'pending' };
      const raw = JSON.parse(localStorage.getItem('cashouts') || '[]');
      raw.push(entry); localStorage.setItem('cashouts', JSON.stringify(raw));
  setProcessing(false); setStatus('Crypto withdrawal queued (mock).');
  navigate('/dashboard');
    } catch (e) {
      console.error(e); setProcessing(false); setStatus('Crypto payout failed');
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (method === 'mpesa') return doMpesaPayout();
    if (method === 'paypal') return doPaypalPayout();
    return doCryptoPayout();
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-3 sm:p-6">
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-linear-to-r from-slate-800 to-slate-900 text-white shadow-xl">
          <div className="mb-4 sm:mb-6">
            <BackButton />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Cash out your earnings</h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1">Available balance: <strong className="text-white">${balance.toFixed(2)}</strong></p>

          <form onSubmit={onSubmit} className="mt-4 sm:mt-6 grid grid-cols-1 gap-4">
            <label className="text-sm text-slate-300">Amount to withdraw</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="p-3 rounded bg-white/5 text-white min-h-[44px]" />

            <label className="text-sm text-slate-300">Withdrawal method</label>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {['mpesa','paypal','crypto'].map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)} className={`px-4 py-3 sm:py-2 rounded min-h-[44px] ${method===m? 'bg-yellow-500 text-slate-900' : 'bg-white/5 text-white'}`}>{m.toUpperCase()}</button>
              ))}
            </div>

            {method === 'mpesa' && (
              <div>
                <label className="text-sm text-slate-300 block mb-2">Mpesa Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" className="p-3 rounded bg-white/5 text-white w-full min-h-[44px]" />
              </div>
            )}

            {method === 'paypal' && (
              <div>
                <label className="text-sm text-slate-300 block mb-2">PayPal email</label>
                <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="you@paypal.com" className="p-3 rounded bg-white/5 text-white w-full min-h-[44px]" />
              </div>
            )}

            {method === 'crypto' && (
              <div>
                <label className="text-sm text-slate-300 block mb-2">Wallet address</label>
                <input value={cryptoAddr} onChange={(e) => setCryptoAddr(e.target.value)} placeholder="Your BTC/ETH/SOL address" className="p-3 rounded bg-white/5 text-white w-full min-h-[44px]" />
                <div className="text-xs text-slate-400 mt-2">After submitting, our team will process the crypto transfer (mock).</div>
              </div>
            )}

            {status && <div className="text-sm text-yellow-300">{status}</div>}

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-3 sm:py-2 rounded bg-transparent border border-white/20 min-h-[44px]">Cancel</button>
              <button type="submit" disabled={processing} className="px-4 py-3 sm:py-2 rounded bg-yellow-500 text-slate-900 font-semibold min-h-[44px]">{processing ? 'Processing...' : 'Request Payout'}</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
