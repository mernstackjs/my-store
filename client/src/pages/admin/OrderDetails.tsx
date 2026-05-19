import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getOrderApi, updateOrderStatusApi, updatePaymentStatusApi } from '../../api/orders';
import type { Order } from '../../types';

const orderStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

const statusColors: Record<string, string> = {
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-amber-100 text-amber-700 border-amber-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getOrderApi(id);
      setOrder(data.order);
    } catch {
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      const data = await updateOrderStatusApi(order._id, newStatus);
      setOrder(data.order);
    } catch {
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.paymentStatus) return;
    setUpdatingPayment(true);
    try {
      const data = await updatePaymentStatusApi(order._id, newStatus);
      setOrder(data.order);
    } catch {
      setError('Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchOrder} className="text-gray-900 underline">
          Try again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500 mb-4">Order not found</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-1 text-gray-900 underline"
        >
          &larr; Back to orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/orders')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to orders
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-lg">{order.orderId}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full border ${statusColors[order.orderStatus]}`}>
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
          <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full border ${paymentStatusColors[order.paymentStatus]}`}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.orderItems.map((item, i) => (
                    <tr key={i}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || ''}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg bg-gray-100 object-cover border border-gray-200"
                          />
                          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-sm text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="py-4 text-right text-sm text-gray-600">{item.quantity}</td>
                      <td className="py-4 text-right text-sm font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Price Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Items subtotal</span>
                <span className="text-gray-700">${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-700">${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-700">${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-base">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Customer</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {(order.user.name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{order.user.name}</p>
                <p className="text-xs text-gray-400">{order.user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-gray-400 mt-1">{order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Update Order Status</h2>
            <select
              value={order.orderStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 bg-white"
            >
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {updating && (
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400" />
                Updating...
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Update Payment Status</h2>
            <select
              value={order.paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              disabled={updatingPayment}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 bg-white"
            >
              {paymentStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {updatingPayment && (
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400" />
                Updating...
              </p>
            )}
          </div>

          {order.deliveredAt && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
              <span className="font-medium">Delivered</span> on {new Date(order.deliveredAt).toLocaleString()}
            </div>
          )}
          {order.cancelledAt && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <span className="font-medium">Cancelled</span> on {new Date(order.cancelledAt).toLocaleString()}
              {order.cancellationReason && (
                <p className="mt-1">Reason: {order.cancellationReason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
