/**
 * API DTOs and types for backend integration.
 * Base URL: {baseUrl}/api
 */

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY'
  | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED' | 'PAYMENT_FAILED'
  | 'REFUSED_BY_CLIENT' | 'REFUSED_BY_SELLER';

export type PaymentStatus =
  | 'PENDING' | 'PAID' | 'PAYMENT_FAILED' | 'REFUND_INITIATED' | 'REFUNDED'
  | 'COD_PENDING' | 'COD_COLLECTED' | 'COD_FAILED';

export type PaymentMethod =
  | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'COD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';

/** GET /api/category */
export interface ApiCategory {
  id: string;
  name: string;
  image: string;
  description: string;
}

/** GET /api/product/search – query params */
export interface ProductSearchParams {
  name?: string;
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  inStock?: boolean;
  tagId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/** Spring Page<T> */
export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Product media item from API */
export interface ApiProductMediaDto {
  id: string;
  mediaName: string;
}

/** Product from search (adjust fields to match your ProductDtoResponse) */
export interface ApiProductDto {
  id: string;
  name: string;
  category?: string;
  categoryName?: string;
  price?: number;
  finalPrice?: number;
  image?: string;
  description?: string;
  inStock?: boolean;
  productMedias?: ApiProductMediaDto[];
  [key: string]: unknown;
}

/** POST /api/orders – ordered product item */
export interface OrderProductItemRequest {
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** POST /api/orders – request body */
export interface OrderDtoRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  clientId: string;
  orderedProducts: OrderProductItemRequest[];
  promoCode?: string;
}

/** Order response (simplified) */
export interface OrderDtoResponse {
  id: string;
  dateOfCreation?: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  orderedProducts?: Array<{
    product?: { id: string; name?: string };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  [key: string]: unknown;
}

// ========== CHECKOUT ENDPOINT TYPES ==========

/** POST /api/orders/checkout – ordered product item */
export interface CheckoutOrderedProduct {
  productId: string;
  quantity: number;
}

/** POST /api/orders/checkout – request body */
export interface CheckoutRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  orderedProducts: CheckoutOrderedProduct[];
  promoCode?: string;
}

/** POST /api/orders/checkout – success response */
export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

/** POST /api/orders/checkout – error response (400 validation errors) */
export interface CheckoutErrorResponse {
  errors: string[];
}
