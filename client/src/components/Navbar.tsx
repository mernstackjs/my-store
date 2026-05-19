import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setClosing(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setClosing(false);
    }, 250);
  };

  const linkClass = (path: string) =>
    `block py-3 px-4 rounded-lg text-base font-medium transition-colors ${
      location.pathname === path
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
    }`;

  const drawerContent = (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div
        className={`absolute inset-0 bg-black/50 ${closing ? '' : ''}`}
        style={{
          animation: closing
            ? 'fadeOut 0.25s ease-out forwards'
            : 'fadeIn 0.25s ease-out',
        }}
        onClick={handleClose}
      />
      <div
        className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col"
        style={{
          animation: closing
            ? 'slideOutRight 0.3s ease-in forwards'
            : 'slideInRight 0.3s ease-out',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-lg text-gray-900">Menu</span>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors tap-highlight"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <Link to="/" onClick={handleClose} className={linkClass('/')}>
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
              </svg>
              Home
            </span>
          </Link>

          <Link to="/cart" onClick={handleClose} className={linkClass('/cart')}>
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Cart
              {totalItems > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/orders" onClick={handleClose} className={linkClass('/orders')}>
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  My Orders
                </span>
              </Link>

              <Link to="/account" onClick={handleClose} className={linkClass('/account')}>
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </span>
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" onClick={handleClose} className={linkClass('/admin')}>
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </span>
            </Link>
          )}
        </div>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 px-3 py-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); handleClose(); }}
                className="w-full text-left flex items-center gap-3 py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={handleClose}
                className="block w-full text-center py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={handleClose}
                className="block w-full text-center py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-gray-900">
            My<span className="text-indigo-600">Store</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>
            Shop
          </Link>
          <Link to="/cart" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${location.pathname === '/cart' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}>
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center badge-pop">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                My Orders
              </Link>
              <Link to="/account" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                Account
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100">
                  Admin
                </Link>
              )}
              <span className="text-sm text-gray-400 pl-2">{user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile right: cart + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors tap-highlight"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center badge-pop">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors tap-highlight"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Render drawer via portal so it escapes all parent stacking contexts */}
      {drawerOpen && createPortal(drawerContent, document.body)}
    </header>
  );
}
