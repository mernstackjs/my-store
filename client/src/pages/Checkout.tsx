import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import client from '../api/client';
import type { UserAddress } from '../types';

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const savedAddresses = user?.addresses || [];

  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Auto-fill default address on mount
  useEffect(() => {
    const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    if (defaultAddr && !fullName) {
      fillAddress(defaultAddr);
    }
  }, [savedAddresses.length > 0]);

  const fillAddress = (addr: UserAddress) => {
    setFullName(addr.fullName);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country || 'US');
    setPhone(addr.phone || '');
    setSelectedAddressId(addr._id || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !street || !city || !state || !zipCode) {
      setError('Please fill in all required shipping fields');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      await client.post('/orders', {
        orderItems: items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
        })),
        shippingAddress: { fullName, street, city, state, zipCode, country, phone },
        paymentMethod,
      });
      clearCart();
      navigate('/orders');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to place order');
      } else {
        setError('Failed to place order');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-medium text-sm hover:text-indigo-800">
          Continue Shopping
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-sm transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Checkout</h1>

      {/* Mobile step indicator */}
      <div className="md:hidden flex items-center gap-2 mb-6">
        <button
          onClick={() => setStep('shipping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            step === 'shipping'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          <span className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
            1
          </span>
          Shipping
        </button>
        <div className="h-0.5 flex-1 bg-gray-200" />
        <button
          onClick={() => setStep('payment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            step === 'payment'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          <span className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
            2
          </span>
          Payment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Shipping - always visible on desktop, step-based on mobile */}
            <div className={`bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-4 ${step === 'payment' ? 'hidden md:block' : ''}`}>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <span className="hidden md:flex h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center text-xs font-bold">
                  1
                </span>
                Shipping Address
              </h2>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Saved Addresses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr._id || addr.street}
                        type="button"
                        onClick={() => fillAddress(addr)}
                        className={`text-left p-4 rounded-xl border-2 transition-all tap-highlight ${
                          selectedAddressId === addr._id
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-gray-900 text-sm">{addr.fullName}</p>
                          {addr.isDefault && (
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                          {addr.phone && <span className="block text-gray-400 mt-0.5">{addr.phone}</span>}
                        </p>
                        {selectedAddressId === addr._id && (
                          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium mt-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or enter manually</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Street Address *</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={inputClass}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputClass}
                    placeholder="NY"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>ZIP Code *</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={inputClass}
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Phone (optional)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Mobile: continue to payment */}
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="md:hidden w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>

            {/* Payment - step-based on mobile */}
            <div className={`bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-4 ${step === 'shipping' ? 'hidden md:block' : ''}`}>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <span className="hidden md:flex h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center text-xs font-bold">
                  2
                </span>
                Payment Method
              </h2>
              <div className="space-y-2">
                {[
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                  { value: 'stripe', label: 'Stripe', desc: 'Pay securely with credit card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                  { value: 'paypal', label: 'PayPal', desc: 'Pay with your PayPal account', icon: 'M18 9a6 6 0 00-10.65-1.54M18 9a6 6 0 01-2.46 8.08M18 9H6m6-4v13' },
                ].map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all tap-highlight ${
                      paymentMethod === pm.value
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{pm.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                submitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Placing Order...
                </span>
              ) : (
                `Place Order — $${subtotal.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order summary sidebar */}
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product} className="flex gap-3">
                <img
                  src={item.image || ''}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-gray-900 shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
