import { Outlet, Link, useLocation } from 'react-router';
import Navbar from './Navbar';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

export default function CustomerLayout() {
  const location = useLocation();
  const totalItems = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const { isAuthenticated } = useAuthStore();

  // Hide bottom nav on auth pages and checkout
  const hideBottomNav = ['/login', '/register', '/checkout'].includes(location.pathname);

  const tabClass = (path: string) =>
    `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors tap-highlight ${
      location.pathname === path
        ? 'text-indigo-600'
        : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {/* Bottom mobile navigation */}
      {!hideBottomNav && (
        <nav className="md:hidden sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 pb-safe z-40">
          <div className="flex items-center justify-around h-16 px-2">
            <Link to="/" className={tabClass('/')}>
              <svg className="w-6 h-6" fill={location.pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname === '/' ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
              </svg>
              <span className="text-[10px] font-medium">Shop</span>
            </Link>

            <Link to="/cart" className={tabClass('/cart')}>
              <div className="relative">
                <svg className="w-6 h-6" fill={location.pathname === '/cart' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname === '/cart' ? 0 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Cart</span>
            </Link>

            <Link to={isAuthenticated ? '/orders' : '/login'} className={tabClass('/orders')}>
              <svg className="w-6 h-6" fill={location.pathname === '/orders' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname === '/orders' ? 0 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-[10px] font-medium">Orders</span>
            </Link>

            <Link to={isAuthenticated ? '/account' : '/login'} className={tabClass('/account')}>
              <svg className="w-6 h-6" fill={location.pathname === '/account' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={location.pathname === '/account' ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-medium">
                {isAuthenticated ? 'Account' : 'Sign In'}
              </span>
            </Link>
          </div>
        </nav>
      )}

      {/* Desktop footer */}
      <footer className="hidden md:block bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} My Store. All rights reserved.
      </footer>
    </div>
  );
}
