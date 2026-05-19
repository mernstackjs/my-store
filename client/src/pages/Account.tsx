import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { UserAddress } from '../types';

export default function Account() {
  const { user, updateProfile, logout } = useAuthStore();

  const [tab, setTab] = useState<'profile' | 'addresses'>('profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form
  const emptyAddress: UserAddress = {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    isDefault: false,
  };
  const [addressForm, setAddressForm] = useState<UserAddress>(emptyAddress);
  const [editingAddrIdx, setEditingAddrIdx] = useState<number | null>(null);
  const [addressMsg, setAddressMsg] = useState('');
  const [addressError, setAddressError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');

    if (!name.trim()) {
      setProfileError('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined });
      setProfileMsg('Profile updated successfully');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch {
      setProfileError('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddressError('');
    setAddressMsg('');

    if (!addressForm.fullName || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      setAddressError('Please fill in all required address fields');
      return;
    }

    setSavingAddress(true);
    try {
      await updateProfile({
        address: {
          ...addressForm,
          isDefault: user?.addresses?.length === 0 ? true : addressForm.isDefault,
        },
      });
      setAddressForm(emptyAddress);
      setEditingAddrIdx(null);
      setAddressMsg('Address saved successfully');
      setTimeout(() => setAddressMsg(''), 3000);
    } catch {
      setAddressError('Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (idx: number) => {
    const addr = user?.addresses?.[idx];
    if (!addr) return;
    setAddressForm({
      fullName: addr.fullName,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country || 'US',
      phone: addr.phone || '',
      isDefault: addr.isDefault || false,
    });
    setEditingAddrIdx(idx);
    setTab('addresses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setAddressForm(emptyAddress);
    setEditingAddrIdx(null);
    setAddressError('');
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-sm transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">My Account</h1>

      {/* Mobile tabs */}
      <div className="flex md:hidden bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'profile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab('addresses')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'addresses'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          Addresses
          {user.addresses && user.addresses.length > 0 && (
            <span className="ml-1.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full px-2 py-0.5">
              {user.addresses.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* User info card */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-2">
              <button
                onClick={() => setTab('profile')}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  tab === 'profile'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => setTab('addresses')}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  tab === 'addresses'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Addresses
                {user.addresses && user.addresses.length > 0 && (
                  <span className="ml-auto bg-gray-100 text-gray-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {user.addresses.length}
                  </span>
                )}
              </button>
            </nav>

            <div className="p-2 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick info */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Account Info</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium capitalize text-gray-900">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member since</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Addresses</span>
                <span className="font-medium text-gray-900">{user.addresses?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2">
          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 animate-fade-in-up">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Profile Details</h2>

              {profileMsg && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {profileMsg}
                </div>
              )}

              {profileError && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{profileError}</div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Addresses tab */}
          {tab === 'addresses' && (
            <div className="space-y-6">
              {/* Saved addresses */}
              {user.addresses && user.addresses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 animate-fade-in-up">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={addr._id || idx}
                        className={`relative border-2 rounded-xl p-4 ${
                          addr.isDefault ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <p className="font-semibold text-gray-900 text-sm">{addr.fullName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zipCode}<br />
                          {addr.country}
                        </p>
                        {addr.phone && (
                          <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                        )}
                        <button
                          onClick={() => handleEditAddress(idx)}
                          className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add / Edit Address form */}
              <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                  {editingAddrIdx !== null ? 'Edit Address' : 'Add New Address'}
                </h2>

                {addressMsg && (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {addressMsg}
                  </div>
                )}

                {addressError && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{addressError}</div>
                )}

                <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className={inputClass}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className={inputClass}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className={inputClass}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>ZIP Code *</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      className={inputClass}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Phone (optional)</label>
                    <input
                      type="tel"
                      value={addressForm.phone || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className={inputClass}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="accent-indigo-600 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">Set as default address</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {savingAddress ? 'Saving...' : editingAddrIdx !== null ? 'Update Address' : 'Add Address'}
                    </button>
                    {editingAddrIdx !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 rounded-xl font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
