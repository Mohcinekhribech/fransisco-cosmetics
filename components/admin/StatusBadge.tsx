import React from 'react';
import type { OrderStatus, PaymentStatus } from '../../types/api';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type: 'order' | 'payment';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getStatusColor = (): string => {
    if (type === 'order') {
      switch (status) {
        case 'PENDING':
          return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'CONFIRMED':
          return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'PROCESSING':
          return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'SHIPPED':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'OUT_FOR_DELIVERY':
          return 'bg-teal-100 text-teal-800 border-teal-300';
        case 'DELIVERED':
          return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'CANCELLED':
        case 'REFUSED_BY_CLIENT':
        case 'REFUSED_BY_SELLER':
          return 'bg-red-100 text-red-800 border-red-300';
        case 'RETURNED':
        case 'REFUNDED':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        case 'PAYMENT_FAILED':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        default:
          return 'bg-brand-taupe/20 text-brand-charcoal border-brand-taupe/40';
      }
    } else {
      switch (status) {
        case 'PENDING':
        case 'COD_PENDING':
          return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'PAID':
        case 'COD_COLLECTED':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'PAYMENT_FAILED':
        case 'COD_FAILED':
          return 'bg-red-100 text-red-800 border-red-300';
        case 'REFUND_INITIATED':
          return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'REFUNDED':
          return 'bg-gray-100 text-gray-800 border-gray-300';
        default:
          return 'bg-brand-taupe/20 text-brand-charcoal border-brand-taupe/40';
      }
    }
  };

  const formatStatus = (s: string): string => {
    return s
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusColor()}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
