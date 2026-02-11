/**
 * Admin Dashboard DTOs - matching backend Store Management API
 * Response DTOs for displaying data, Request DTOs for create/update operations
 */

import type { OrderStatus, PaymentStatus, PaymentMethod } from './api';

/** ProductMediaDto - Single product media (image) from backend */
export interface ProductMediaDto {
  id: string;
  mediaName: string;
}

/** ProductDtoResponse - Full product data from backend */
export interface ProductDtoResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryName?: string;
  purchasePrice: number;
  finalPrice: number;
  quantity: number;
  weight: number;
  image?: string;
  gallery?: string[];
  productMedias?: ProductMediaDto[];
  benefits: string[];
  usage: string;
  ingredients: string;
  inStock: boolean;
  tags?: TagDtoResponse[];
  [key: string]: unknown;
}

/** Item for bulk attach product media – POST /api/product-media/all */
export interface ProductMediaAttachItem {
  mediaName: string;
  productId: string;
}

/** ProductDtoRequest - For creating/updating products (backend API body) */
export interface ProductDtoRequest {
  categoryId: string;
  name: string;
  description: string;
  benefits: string;
  howToUse: string;
  purchasePrice: number;
  finalPrice: number;
  quantity: number;
  weight: number;
  tags: string[];
}

/** Form state for product create/edit (includes UI-only fields) */
export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  purchasePrice: number;
  finalPrice: number;
  quantity: number;
  weight: number;
  benefits: string[];
  usage: string;
  ingredients: string;
  inStock: boolean;
}

/** CategoryDtoResponse - Category data */
export interface CategoryDtoResponse {
  id: string;
  name: string;
  image: string;
  description: string;
}

/** CategoryDtoRequest - For creating/updating categories */
export interface CategoryDtoRequest {
  name: string;
  image: string;
  description: string;
}

/** TagDtoResponse - Tag data */
export interface TagDtoResponse {
  id: string;
  name: string;
  description?: string;
}

/** TagDtoRequest - For creating/updating tags */
export interface TagDtoRequest {
  name: string;
  description?: string;
}

/** OrderDtoResponse - Complete order data (extended from api.ts) */
export interface AdminOrderDtoResponse {
  id: string;
  dateOfCreation: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  orderedProducts: Array<{
    id?: string;
    product?: {
      id: string;
      name: string;
      image?: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  promoCode?: string;
  [key: string]: unknown;
}

/** PromoCodeDtoResponse - Promo code data */
export interface PromoCodeDtoResponse {
  id: string;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  maxUses: number;
  currentUses: number;
  influencer?: string;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
  [key: string]: unknown;
}

/** PromoCodeDtoRequest - For creating/updating promo codes */
export interface PromoCodeDtoRequest {
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  maxUses: number;
  influencer?: string;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
}

/** Orders pageable params */
export interface OrdersPageableParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  page?: number;
  size?: number;
  sort?: string;
}

/** Tag IDs array for product tag operations */
export interface TagIdsRequest {
  tagIds: string[];
}
