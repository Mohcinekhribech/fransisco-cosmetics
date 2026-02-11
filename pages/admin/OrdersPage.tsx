import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersPageable, updateOrderStatus, updatePaymentStatus } from '../../services/adminApiClient';
import DataTable, { Column } from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import type { AdminOrderDtoResponse, OrdersPageableParams } from '../../types/admin';
import type { OrderStatus, PaymentStatus, PaymentMethod } from '../../types/api';
import type { ApiPage } from '../../types/api';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrderDtoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState<OrdersPageableParams>({
    page: 0,
    size: 20,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const pageData = await getOrdersPageable(filters);
      setOrders(pageData.content);
      setPage(pageData.number);
      setTotalElements(pageData.totalElements);
      setTotalPages(pageData.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OrdersPageableParams, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 0,
    }));
  };

  const columns: Column<AdminOrderDtoResponse>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (order) => (
        <span className="font-mono text-xs text-brand-charcoal">{order.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (order) => (
        <span className="text-sm text-brand-charcoal">
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
        <div>
          <p className="text-sm font-medium text-brand-charcoal">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-xs text-brand-charcoal/50">{order.email}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order) => (
        <span className="font-semibold text-brand-charcoal">{order.totalPrice.toFixed(2)} MAD</span>
      ),
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (order) => <StatusBadge status={order.status} type="order" />,
    },
    {
      key: 'payment',
      header: 'Payment Status',
      render: (order) => <StatusBadge status={order.paymentStatus} type="payment" />,
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (order) => (
        <span className="text-sm text-brand-charcoal">{order.paymentMethod}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${order.id}`)}
          className="px-3 py-1.5 text-xs font-medium text-brand-terracotta bg-brand-terracotta/10 rounded-lg hover:bg-brand-terracotta/20 transition-colors"
        >
          View
        </button>
      ),
    },
  ];

  const orderStatuses: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
    'PAYMENT_FAILED',
    'REFUSED_BY_CLIENT',
    'REFUSED_BY_SELLER',
  ];

  const paymentStatuses: PaymentStatus[] = [
    'PENDING',
    'PAID',
    'PAYMENT_FAILED',
    'REFUND_INITIATED',
    'REFUNDED',
    'COD_PENDING',
    'COD_COLLECTED',
    'COD_FAILED',
  ];

  const paymentMethods: PaymentMethod[] = [
    'CREDIT_CARD',
    'DEBIT_CARD',
    'PAYPAL',
    'COD',
    'BANK_TRANSFER',
    'MOBILE_PAYMENT',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-brand-charcoal">Orders</h1>
        <p className="text-brand-charcoal/60 mt-2">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-brand-taupe/10 flex flex-wrap gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          className="px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
        >
          <option value="">All Order Statuses</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.paymentStatus || ''}
          onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
          className="px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
        >
          <option value="">All Payment Statuses</option>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.paymentMethod || ''}
          onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
          className="px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
        >
          <option value="">All Payment Methods</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        {(filters.status || filters.paymentStatus || filters.paymentMethod) && (
          <button
            type="button"
            onClick={() => setFilters({ page: 0, size: 20 })}
            className="px-4 py-2 text-sm text-brand-charcoal/60 hover:text-brand-charcoal"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found"
        onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
        pagination={{
          page,
          size,
          totalElements,
          totalPages,
          onPageChange: (newPage) => setFilters((prev) => ({ ...prev, page: newPage })),
        }}
      />
    </div>
  );
};

export default OrdersPage;
