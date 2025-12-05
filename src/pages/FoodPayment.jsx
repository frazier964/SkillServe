import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function FoodPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderData } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentData, setPaymentData] = useState({
    mpesa: { phone: '' },
    creditcard: { number: '', expiry: '', cvv: '', name: '' },
    debitcard: { number: '', expiry: '', cvv: '', name: '' },
    mastercard: { number: '', expiry: '', cvv: '', name: '' },
    paypal: { email: '' },
    googlepay: { email: '' },
    crypto: { currency: 'bitcoin', address: '', amount: '' }
  });
  const [processing, setProcessing] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({});

  useEffect(() => {
    if (!orderData) {
      navigate('/order-food');
    }
  }, [orderData, navigate]);

  const updatePaymentData = (method, field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  const validatePaymentData = () => {
    const errors = {};
    const data = paymentData[paymentMethod];

    switch (paymentMethod) {
      case 'mpesa':
        if (!data.phone || data.phone.replace(/\D/g, '').length < 9) {
          errors.phone = 'Enter a valid Kenyan phone number';
        }
        break;
      case 'creditcard':
      case 'debitcard':
      case 'mastercard':
        if (!data.number || data.number.replace(/\s/g, '').length < 13) {
          errors.number = 'Enter a valid card number';
        }
        if (!data.expiry || !/^\d{2}\/\d{2}$/.test(data.expiry)) {
          errors.expiry = 'Enter expiry as MM/YY';
        }
        if (!data.cvv || data.cvv.length < 3) {
          errors.cvv = 'Enter valid CVV';
        }
        if (!data.name || data.name.length < 2) {
          errors.name = 'Enter cardholder name';
        }
        break;
      case 'paypal':
      case 'googlepay':
        if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
          errors.email = 'Enter a valid email address';
        }
        break;
      case 'crypto':
        if (!data.address || data.address.length < 10) {
          errors.address = 'Enter a valid wallet address';
        }
        break;
    }
    
    return errors;
  };

  const handlePaymentSubmit = () => {
    setPaymentErrors({});
    
    const errors = validatePaymentData();
    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const order = {
        ...orderData,
        id: 'ORD-' + Date.now(),
        paymentMethod,
        paymentDetails: paymentData[paymentMethod],
        orderTime: new Date().toISOString(),
        status: 'Payment Processed',
        paymentStatus: 'Completed',
        estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString()
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      existingOrders.unshift(order);
      localStorage.setItem('foodOrders', JSON.stringify(existingOrders));

      setProcessing(false);
      navigate('/order-confirmation', { state: { order } });
    }, 3000);
  };

  if (!orderData) {
    return null;
  }

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
      `}</style>
      <Layout>
        <div className="min-h-screen bg-[#6A0DAD] py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <BackButton />
            </div>
            
            <div className="glass-card rounded-3xl bg-linear-to-r from-slate-800/90 to-slate-900/90 text-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/10">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    💳 Complete Your Payment
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Total Amount: <span className="text-2xl font-bold text-orange-400">${orderData.total.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row">
                {/* Payment Methods Sidebar */}
                <div className="lg:w-1/3 p-8 border-r border-white/10">
                  <h3 className="text-xl font-semibold mb-6">Payment Methods</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
                      { id: 'paypal', name: 'PayPal', icon: '🌐' },
                      { id: 'creditcard', name: 'Credit Card', icon: '💳' },
                      { id: 'debitcard', name: 'Debit Card', icon: '💳' },
                      { id: 'mastercard', name: 'Mastercard', icon: '💳' },
                      { id: 'googlepay', name: 'Google Pay', icon: '📱' },
                      { id: 'crypto', name: 'Cryptocurrency', icon: '₿' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${
                          paymentMethod === method.id
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Form */}
                <div className="lg:w-2/3 p-8">
                  <div className="max-h-96 overflow-y-scroll custom-scrollbar space-y-6">
                    {/* M-Pesa Payment Form */}
                    {paymentMethod === 'mpesa' && (
                      <div className="space-y-4">
                        <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                          <h4 className="font-semibold text-green-300 mb-2">📱 M-Pesa Payment</h4>
                          <p className="text-sm text-green-200">Enter your M-Pesa registered phone number</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="07XXXXXXXX or +254XXXXXXX"
                            value={paymentData.mpesa.phone}
                            onChange={(e) => updatePaymentData('mpesa', 'phone', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.phone ? 'border-red-500' : 'border-slate-600'}`}
                          />
                          {paymentErrors.phone && <p className="text-red-400 text-sm mt-1">{paymentErrors.phone}</p>}
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                          <p className="text-sm text-blue-200">
                            💡 You will receive an STK push notification on your phone to complete the payment.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Card Payment Forms */}
                    {(['creditcard', 'debitcard', 'mastercard'].includes(paymentMethod)) && (
                      <div className="space-y-4">
                        <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                          <h4 className="font-semibold text-blue-300 mb-2">💳 Card Payment</h4>
                          <p className="text-sm text-blue-200">Enter your card details securely</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={paymentData[paymentMethod].name}
                            onChange={(e) => updatePaymentData(paymentMethod, 'name', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.name ? 'border-red-500' : 'border-slate-600'}`}
                          />
                          {paymentErrors.name && <p className="text-red-400 text-sm mt-1">{paymentErrors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={paymentData[paymentMethod].number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              updatePaymentData(paymentMethod, 'number', value);
                            }}
                            maxLength="19"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.number ? 'border-red-500' : 'border-slate-600'}`}
                          />
                          {paymentErrors.number && <p className="text-red-400 text-sm mt-1">{paymentErrors.number}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={paymentData[paymentMethod].expiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                }
                                updatePaymentData(paymentMethod, 'expiry', value);
                              }}
                              maxLength="5"
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.expiry ? 'border-red-500' : 'border-slate-600'}`}
                            />
                            {paymentErrors.expiry && <p className="text-red-400 text-sm mt-1">{paymentErrors.expiry}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              value={paymentData[paymentMethod].cvv}
                              onChange={(e) => updatePaymentData(paymentMethod, 'cvv', e.target.value.replace(/\D/g, ''))}
                              maxLength="4"
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.cvv ? 'border-red-500' : 'border-slate-600'}`}
                            />
                            {paymentErrors.cvv && <p className="text-red-400 text-sm mt-1">{paymentErrors.cvv}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal Payment Form */}
                    {paymentMethod === 'paypal' && (
                      <div className="space-y-4">
                        <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                          <h4 className="font-semibold text-blue-300 mb-2">🌐 PayPal Payment</h4>
                          <p className="text-sm text-blue-200">Pay securely with your PayPal account</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">PayPal Email</label>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={paymentData.paypal.email}
                            onChange={(e) => updatePaymentData('paypal', 'email', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.email ? 'border-red-500' : 'border-slate-600'}`}
                          />
                          {paymentErrors.email && <p className="text-red-400 text-sm mt-1">{paymentErrors.email}</p>}
                        </div>
                        <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                          <p className="text-sm text-yellow-200">
                            🔒 You will be redirected to PayPal to complete your payment securely.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Google Pay Form */}
                    {paymentMethod === 'googlepay' && (
                      <div className="space-y-4">
                        <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/30">
                          <h4 className="font-semibold text-red-300 mb-2">📱 Google Pay</h4>
                          <p className="text-sm text-red-200">Pay with your Google account</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Google Account Email</label>
                          <input
                            type="email"
                            placeholder="your@gmail.com"
                            value={paymentData.googlepay.email}
                            onChange={(e) => updatePaymentData('googlepay', 'email', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.email ? 'border-red-500' : 'border-slate-600'}`}
                          />
                          {paymentErrors.email && <p className="text-red-400 text-sm mt-1">{paymentErrors.email}</p>}
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30">
                          <p className="text-sm text-green-200">
                            📱 You will be prompted to authorize payment through Google Pay.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Crypto Payment Form */}
                    {paymentMethod === 'crypto' && (
                      <div className="space-y-4">
                        <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-500/30">
                          <h4 className="font-semibold text-yellow-300 mb-2">₿ Cryptocurrency Payment</h4>
                          <p className="text-sm text-yellow-200">Pay with Bitcoin, Ethereum, or other cryptocurrencies</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                          <select
                            value={paymentData.crypto.currency}
                            onChange={(e) => updatePaymentData('crypto', 'currency', e.target.value)}
                            className="w-full p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white"
                          >
                            <option value="bitcoin">Bitcoin (BTC)</option>
                            <option value="ethereum">Ethereum (ETH)</option>
                            <option value="solana">Solana (SOL)</option>
                            <option value="usdc">USD Coin (USDC)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Your Wallet Address</label>
                          <input
                            type="text"
                            placeholder="Enter your wallet address"
                            value={paymentData.crypto.address}
                            onChange={(e) => updatePaymentData('crypto', 'address', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-slate-400 ${paymentErrors.address ? 'border-red-500' : 'border-slate-600'}`}
                          />
                          {paymentErrors.address && <p className="text-red-400 text-sm mt-1">{paymentErrors.address}</p>}
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                          <p className="text-sm text-blue-200">
                            🔗 Send ${orderData.total.toFixed(2)} worth of {paymentData.crypto.currency.toUpperCase()} to our wallet address. Transaction confirmation may take a few minutes.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary & Actions */}
              <div className="p-8 border-t border-white/10 bg-white/5">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  <div className="bg-white/10 p-4 rounded-lg flex-1">
                    <h4 className="font-semibold text-white mb-2">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Items ({orderData.items.length}):</span>
                        <span className="text-white">${orderData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Delivery Fee:</span>
                        <span className="text-white">${orderData.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-orange-400">${orderData.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/order-food')}
                      className="px-6 py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={processing}
                      className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white rounded-lg font-bold transition-colors"
                    >
                      {processing ? 'Processing Payment...' : `Pay $${orderData.total.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}