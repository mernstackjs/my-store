import { useEffect, useState } from 'react';
import { getProductsApi } from '../../api/products';
import { getOrdersApi } from '../../api/orders';

export default function Dashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          getProductsApi({ limit: 1 }),
          getOrdersApi(),
        ]);

        setProductCount(productsData.total);

        const orders = ordersData.orders;
        setOrderCount(orders.length);

        const totalRevenue = orders
          .filter((o) => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + o.totalPrice, 0);
        setRevenue(totalRevenue);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 px-4 py-3 rounded">{error}</div>
    );
  }

  const stats = [
    {
      label: 'Total Products',
      value: productCount ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Total Orders',
      value: orderCount ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Revenue',
      value: `$${(revenue ?? 0).toFixed(2)}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50 text-green-700 border-green-200',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} border rounded-xl p-6 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold uppercase tracking-wide opacity-80">
                {stat.label}
              </span>
              <span className="opacity-60">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Overview</h2>
        <p className="text-gray-500 text-sm">
          Revenue shown is from <strong>paid</strong> orders only. Manage your store using the sidebar navigation.
        </p>
      </div>
    </div>
  );
}
