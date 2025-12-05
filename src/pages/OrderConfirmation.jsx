import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/order-food');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'creditcard': return 'Credit Card';
      case 'debitcard': return 'Debit Card';
      case 'mastercard': return 'Mastercard';
      case 'googlepay': return 'Google Pay';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#6A0DAD] py-8 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="glass-card rounded-3xl bg-linear-to-r from-slate-800/90 to-slate-900/90 text-white shadow-2xl p-8">
            {/* Success Icon and Message */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">✅</div>
              <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <p className="text-slate-300 text-lg">
                Your order has been confirmed and payment processed successfully.
              </p>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Order ID and Status */}
              <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Order #{order.id}</h3>
                    <p className="text-slate-300">Placed on {new Date(order.orderTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div className="text-right">
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <span className="text-green-300 font-semibold">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Payment Method:</span>
                    <div className="text-white font-medium">{getPaymentMethodDisplay(order.paymentMethod)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Status:</span>
                    <div className="text-green-300 font-medium">{order.paymentStatus}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Estimated Delivery:</span>
                    <div className="text-white font-medium">
                      {new Date(order.estimatedDelivery).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} (45 minutes)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Paid:</span>
                    <div className="text-orange-400 font-bold text-lg">${order.total.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-2">📍 Delivery Address</h4>
                <p className="text-slate-300">{order.deliveryAddress}</p>
                {order.orderNotes && (
                  <>
                    <h4 className="text-lg font-semibold text-white mt-4 mb-2">📝 Special Instructions</h4>
                    <p className="text-slate-300">{order.orderNotes}</p>
                  </>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-4">🛍️ Order Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-sm text-slate-400">Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Delivery Fee:</span>
                      <span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white border-t border-white/20 pt-2">
                      <span>Total:</span>
                      <span className="text-orange-400">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h4 className="font-semibold text-green-300 mb-1">Confirmation Email Sent</h4>
                    <p className="text-sm text-green-200">
                      A detailed receipt and order tracking information has been sent to your email address.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Track Your Order</h4>
                    <p className="text-sm text-blue-200">
                      You can track your order status and delivery progress from your dashboard or through the confirmation email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/order-food')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Order Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}