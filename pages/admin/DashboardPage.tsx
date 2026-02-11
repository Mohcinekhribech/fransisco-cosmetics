import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getOrdersPageable, getRecentOrders } from '../../services/adminApiClient';
import { getCategories } from '../../services/apiClient';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import type { AdminOrderDtoResponse } from '../../types/admin';

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<AdminOrderDtoResponse[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [products, ordersPage, recent] = await Promise.all([
          getProducts(),
          getOrdersPageable({ page: 0, size: 1000 }),
          getRecentOrders(),
        ]);

        setStats({
          totalProducts: products.length,
          totalOrders: ordersPage.totalElements,
          revenue: ordersPage.content.reduce((sum, order) => sum + order.totalPrice, 0),
        });

        setRecentOrders(recent.slice(0, 10));

        const statusCounts: Record<string, number> = {};
        ordersPage.content.forEach((order) => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        setOrdersByStatus(statusCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentOrdersColumns: Column<AdminOrderDtoResponse>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (order) => (
        <Link
          to={`/admin/orders/${order.id}`}
          className="text-brand-terracotta hover:underline font-mono text-xs"
        >
          {order.id.slice(0, 8)}...
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (order) => (
        <span className="text-sm">
          {order.dateOfCreation
            ? new Date(order.dateOfCreation).toLocaleDateString()
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (order) => (
        <span className="text-sm">
          {order.firstName} {order.lastName}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order) => (
        <span className="font-semibold">{order.totalPrice.toFixed(2)} MAD</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => <StatusBadge status={order.status} type="order" />,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (order) => <StatusBadge status={order.paymentStatus} type="payment" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-brand-charcoal">Dashboard</h1>
        <p className="text-brand-charcoal/60 mt-2">Store overview and recent activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-charcoal/60">Total Products</p>
              <p className="text-3xl font-semibold text-brand-charcoal mt-2">
                {stats.totalProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-terracotta/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-charcoal/60">Total Orders</p>
              <p className="text-3xl font-semibold text-brand-charcoal mt-2">
                {stats.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-charcoal/60">Revenue</p>
              <p className="text-3xl font-semibold text-brand-charcoal mt-2">
                {stats.revenue.toFixed(2)} MAD
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className="p-4 bg-brand-ivory/50 rounded-xl">
              <p className="text-sm text-brand-charcoal/60">{status}</p>
              <p className="text-2xl font-semibold text-brand-charcoal mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-brand-taupe/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-taupe/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-charcoal">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-brand-terracotta hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="p-6">
          <DataTable
            columns={recentOrdersColumns}
            data={recentOrders}
            emptyMessage="No recent orders"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
