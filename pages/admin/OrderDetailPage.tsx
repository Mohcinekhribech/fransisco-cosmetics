import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../../services/apiClient';
import { updateOrderStatus, updatePaymentStatus, getUploadImageUrl } from '../../services/adminApiClient';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmModal from '../../components/admin/ConfirmModal';
import type { AdminOrderDtoResponse } from '../../types/admin';
import type { OrderStatus, PaymentStatus } from '../../types/api';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrderDtoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    open: boolean;
    type: 'order' | 'payment';
    newStatus: OrderStatus | PaymentStatus;
  }>({ open: false, type: 'order', newStatus: 'PENDING' });

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrder(id!);
      setOrder(data as AdminOrderDtoResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (type: 'order' | 'payment', newStatus: OrderStatus | PaymentStatus) => {
    setStatusChangeConfirm({ open: true, type, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!order || !id) return;
    try {
      setUpdating(true);
      setError(null);

      if (statusChangeConfirm.type === 'order') {
        await updateOrderStatus(statusChangeConfirm.newStatus as OrderStatus, id);
      } else {
        await updatePaymentStatus(statusChangeConfirm.newStatus as PaymentStatus, id);
      }

      setStatusChangeConfirm({ open: false, type: 'order', newStatus: 'PENDING' });
      fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800">
        <p className="font-semibold">Error loading order</p>
        <p className="text-sm mt-1">{error || 'Order not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-brand-charcoal/60 hover:text-brand-charcoal mb-2"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-serif text-brand-charcoal">Order Details</h1>
          <p className="text-brand-charcoal/60 mt-2">Order ID: {order.id}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10">
            <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-brand-charcoal/60">Order Date</p>
                <p className="font-medium text-brand-charcoal">
                  {order.dateOfCreation
                    ? new Date(order.dateOfCreation).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-charcoal/60">Order Status</p>
                <div className="mt-1">
                  <StatusBadge status={order.status} type="order" />
                </div>
              </div>
              <div>
                <p className="text-sm text-brand-charcoal/60">Payment Status</p>
                <div className="mt-1">
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
              </div>
              <div>
                <p className="text-sm text-brand-charcoal/60">Payment Method</p>
                <p className="font-medium text-brand-charcoal">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10">
            <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-brand-charcoal/60">Name</p>
                <p className="font-medium text-brand-charcoal">
                  {order.firstName} {order.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-charcoal/60">Email</p>
                <p className="font-medium text-brand-charcoal">{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-brand-charcoal/60">Phone</p>
                <p className="font-medium text-brand-charcoal">{order.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10">
            <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Delivery Address</h2>
            <p className="text-brand-charcoal">
              {order.address}
              <br />
              {order.city}, {order.zipCode}
              <br />
              {order.country}
            </p>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10">
            <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Ordered Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-ivory/50 border-b border-brand-taupe/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brand-charcoal uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brand-charcoal uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brand-charcoal uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brand-charcoal uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-taupe/10">
                  {order.orderedProducts?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.product?.image && (
                            <img
                              src={getUploadImageUrl(item.product.image)}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <span className="font-medium text-brand-charcoal">
                            {item.product?.name || 'Product'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-charcoal">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-brand-charcoal">
                        {item.unitPrice.toFixed(2)} MAD
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-charcoal">
                        {item.totalPrice.toFixed(2)} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Totals */}
          <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10">
            <h2 className="text-xl font-semibold text-brand-charcoal mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-brand-charcoal/60">
                <span>Subtotal</span>
                <span>{order.totalPrice.toFixed(2)} MAD</span>
              </div>
              {order.promoCode && (
                <div className="flex justify-between text-sm text-brand-charcoal/60">
                  <span>Promo Code</span>
                  <span>{order.promoCode}</span>
                </div>
              )}
              <div className="border-t border-brand-taupe/10 pt-2 flex justify-between font-semibold text-brand-charcoal">
                <span>Total</span>
                <span>{order.totalPrice.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Status Updates */}
          <div className="bg-white rounded-2xl p-6 border border-brand-taupe/10 space-y-4">
            <h2 className="text-xl font-semibold text-brand-charcoal">Update Status</h2>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">
                Order Status
              </label>
              <select
                value={order.status}
                onChange={(e) =>
                  handleStatusChange('order', e.target.value as OrderStatus)
                }
                disabled={updating}
                className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 disabled:opacity-50"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">
                Payment Status
              </label>
              <select
                value={order.paymentStatus}
                onChange={(e) =>
                  handleStatusChange('payment', e.target.value as PaymentStatus)
                }
                disabled={updating}
                className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 disabled:opacity-50"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={statusChangeConfirm.open}
        title={`Update ${statusChangeConfirm.type === 'order' ? 'Order' : 'Payment'} Status`}
        message={`Are you sure you want to change the ${statusChangeConfirm.type} status to "${statusChangeConfirm.newStatus}"?`}
        confirmLabel="Update"
        cancelLabel="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={() =>
          setStatusChangeConfirm({ open: false, type: 'order', newStatus: 'PENDING' })
        }
      />
    </div>
  );
};

export default OrderDetailPage;
