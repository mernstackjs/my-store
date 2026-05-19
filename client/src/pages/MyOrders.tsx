import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyOrdersApi } from '../api/orders';
import type { Order } from '../types';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  shipped: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyOrdersApi();
      setOrders(data.orders);
    } catch {
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">My Orders</h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between mb-3">
                <div className="h-4 w-32 rounded shimmer" />
                <div className="h-6 w-20 rounded-full shimmer" />
              </div>
              <div className="flex gap-2">
                <div className="h-12 w-12 rounded-lg shimmer" />
                <div className="h-12 w-12 rounded-lg shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Start shopping to see your orders here</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.orderStatus] || statusConfig.processing;
            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Order header */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-500">#{order.orderId}</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-4">
                    {order.orderItems.slice(0, 4).map((item, i) => (
                      <div key={i} className="relative">
                        <img
                          src={item.image || ''}
                          alt={item.name}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover bg-gray-100 border-2 border-white shadow-sm"
                        />
                        {i === 3 && order.orderItems.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+{order.orderItems.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
