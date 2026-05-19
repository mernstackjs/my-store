import { Link } from 'react-router';
import { useCartStore } from '../stores/cartStore';

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Add items to get started</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Shopping Cart
          <span className="text-base font-normal text-gray-400 ml-2">({items.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.product}
              className="bg-white rounded-2xl shadow-sm p-3 md:p-4 flex gap-3 md:gap-4 items-center"
            >
              <Link to={`/product/${item.product}`} className="shrink-0">
                <img
                  src={item.image || ''}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover bg-gray-100"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.product}`}
                  className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1 hover:text-indigo-600 transition-colors"
                >
                  {item.name}
                </Link>
                <p className="text-indigo-600 font-bold mt-1 text-sm">${item.price.toFixed(2)}</p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => item.quantity > 1 ? updateQuantity(item.product, item.quantity - 1) : removeItem(item.product)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 tap-highlight"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 tap-highlight"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product)}
                    className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors tap-highlight"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0 hidden md:block">
                <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary - desktop */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl mt-6 hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              Proceed to Checkout
            </Link>
            <Link to="/" className="block text-center text-sm text-gray-500 mt-3 hover:text-indigo-600 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile order summary + checkout */}
      <div className="lg:hidden mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({items.length} items)</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl mt-5 hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
