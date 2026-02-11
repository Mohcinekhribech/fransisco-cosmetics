/**
 * Admin API Client - Store Management API endpoints
 * Base URL from env: VITE_API_BASE_URL (e.g. http://localhost:9090)
 * Includes token injection and automatic token refresh on 401
 */

import { getAccessToken } from './authApiClient';
import { getUploadImageUrl } from '../utils/upload';
import type {
  ProductDtoResponse,
  ProductDtoRequest,
  CategoryDtoResponse,
  CategoryDtoRequest,
  TagDtoResponse,
  TagDtoRequest,
  AdminOrderDtoResponse,
  PromoCodeDtoResponse,
  PromoCodeDtoRequest,
  OrdersPageableParams,
  TagIdsRequest,
  ProductMediaAttachItem,
} from '../types/admin';
import type { OrderStatus, PaymentStatus, ApiPage } from '../types/api';

/** Re-export for consistent image display across admin and storefront */
export { getUploadImageUrl };

const getBaseUrl = (): string => {
  const url = (import.meta.env as any).VITE_API_BASE_URL as string | undefined;
  if (!url) return '';
  return url.replace(/\/$/, '');
};

// Global refresh callback - set by AuthContext
let refreshTokenCallback: (() => Promise<string | null>) | null = null;
let logoutCallback: (() => Promise<void>) | null = null;

export const setRefreshTokenCallback = (callback: () => Promise<string | null>) => {
  refreshTokenCallback = callback;
};

export const setLogoutCallback = (callback: () => Promise<void>) => {
  logoutCallback = callback;
};

const api = async (path: string, init?: RequestInit, retryOn401 = true): Promise<Response> => {
  const base = getBaseUrl();
  if (!base) return Promise.reject(new Error('VITE_API_BASE_URL is not set'));
  const url = `${base}/api${path}`;

  const accessToken = getAccessToken();

  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && retryOn401 && refreshTokenCallback) {
    try {
      const newToken = await refreshTokenCallback();
      if (newToken) {
        // Retry original request with new token
        const retryHeaders: HeadersInit = {
          ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json', Accept: 'application/json' }),
          ...init?.headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(url, {
          ...init,
          headers: retryHeaders,
        });
        return retryResponse;
      } else {
        // Refresh failed, logout
        if (logoutCallback) {
          await logoutCallback();
        }
        throw new Error('Session expired. Please login again.');
      }
    } catch (error) {
      // Refresh failed, logout
      if (logoutCallback) {
        await logoutCallback();
      }
      throw error;
    }
  }

  // Handle 403 Forbidden - try refresh then retry once (some backends return 403 for expired token)
  if (response.status === 403 && retryOn401 && refreshTokenCallback) {
    try {
      const newToken = await refreshTokenCallback();
      if (newToken) {
        const retryHeaders: HeadersInit = {
          ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json', Accept: 'application/json' }),
          ...init?.headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(url, {
          ...init,
          headers: retryHeaders,
        });
        if (retryResponse.status === 403) {
          throw new Error(
            'Access forbidden (403). Check DevTools → Network for the failed request (URL, Request/Response headers).'
          );
        }
        return retryResponse;
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Access forbidden (403)')) throw err;
    }
  }

  if (response.status === 403) {
    throw new Error(
      'Access forbidden (403). Check DevTools → Network for the failed request (URL, Request/Response headers).'
    );
  }

  return response;
};

const get = <T>(path: string): Promise<T> =>
  api(path).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
    }
    return res.json();
  });

const post = <T>(path: string, body: unknown): Promise<T> =>
  api(path, { method: 'POST', body: JSON.stringify(body) }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
    }
    return res.json();
  });

const put = <T>(path: string, body?: unknown): Promise<T> =>
  api(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
    }
    return res.json();
  });

const del = (path: string): Promise<void> =>
  api(path, { method: 'DELETE' }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
    }
  });

// ========== PRODUCTS ==========

/** Get all products – GET /api/product */
export const getProducts = (): Promise<ProductDtoResponse[]> => get('/product');

/** Get one product – GET /api/product/{id} */
export const getProduct = (id: string): Promise<ProductDtoResponse> => get(`/product/${id}`);

/** Create product – POST /api/product */
export const createProduct = (body: ProductDtoRequest): Promise<ProductDtoResponse> =>
  post('/product', body);

/** Update product – PUT /api/product/{id} */
export const updateProduct = (id: string, body: ProductDtoRequest): Promise<ProductDtoResponse> =>
  put(`/product/${id}`, body);

/** Delete product – DELETE /api/product/{id} */
export const deleteProduct = (id: string): Promise<void> => del(`/product/${id}`);

/** Add tags to product – PUT /api/product/{productId}/tags */
export const addTagsToProduct = (productId: string, tagIds: string[]): Promise<void> =>
  put(`/product/${productId}/tags`, { tagIds });

/** Remove tags from product – PUT /api/product/{productId}/tags/remove */
export const removeTagsFromProduct = (productId: string, tagIds: string[]): Promise<void> =>
  put(`/product/${productId}/tags/remove`, { tagIds });

// ========== UPLOAD ==========

/** Upload images – POST /api/upload/images (multipart, field "images"). Returns array of filenames. */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const res = await api('/upload/images', { method: 'POST', body: formData });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
  }
  return res.json();
};

// ========== PRODUCT MEDIA ==========

/** Attach multiple media to a product – POST /api/product-media/all */
export const attachProductMediaAll = (items: ProductMediaAttachItem[]): Promise<unknown> =>
  post('/product-media/all', items);

/** Create one product media – POST /api/product-media */
export const createProductMedia = (item: ProductMediaAttachItem): Promise<unknown> =>
  post('/product-media', item);

/** Update product media – PUT /api/product-media/{mediaId} */
export const updateProductMedia = (
  mediaId: string,
  body: { mediaName?: string; productId?: string }
): Promise<unknown> => put(`/product-media/${mediaId}`, body);

/** Delete product media – DELETE /api/product-media/{mediaId} */
export const deleteProductMedia = (mediaId: string): Promise<void> =>
  del(`/product-media/${mediaId}`);

// ========== CATEGORIES ==========

/** Create category – POST /api/category */
export const createCategory = (body: CategoryDtoRequest): Promise<CategoryDtoResponse> =>
  post('/category', body);

/** Update category – PUT /api/category/{id} */
export const updateCategory = (id: string, body: CategoryDtoRequest): Promise<CategoryDtoResponse> =>
  put(`/category/${id}`, body);

/** Delete category – DELETE /api/category/{id} */
export const deleteCategory = (id: string): Promise<void> => del(`/category/${id}`);

// Note: getCategories() and getCategoryById() exist in apiClient.ts

// ========== TAGS ==========

/** Get all tags – GET /api/tags */
export const getTags = (): Promise<TagDtoResponse[]> => get('/tags');

/** Get one tag – GET /api/tags/{id} */
export const getTag = (id: string): Promise<TagDtoResponse> => get(`/tags/${id}`);

/** Create tag – POST /api/tags */
export const createTag = (body: TagDtoRequest): Promise<TagDtoResponse> => post('/tags', body);

/** Update tag – PUT /api/tags/{id} */
export const updateTag = (id: string, body: TagDtoRequest): Promise<TagDtoResponse> =>
  put(`/tags/${id}`, body);

/** Delete tag – DELETE /api/tags/{id} */
export const deleteTag = (id: string): Promise<void> => del(`/tags/${id}`);

// ========== ORDERS ==========

/** Get all orders – GET /api/orders */
export const getOrders = (): Promise<AdminOrderDtoResponse[]> => get('/orders');

/** Get orders (pageable) – GET /api/orders/pageable */
export const getOrdersPageable = (params: OrdersPageableParams = {}): Promise<ApiPage<AdminOrderDtoResponse>> => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return get(`/orders/pageable${query ? `?${query}` : ''}`);
};

/** Get recent orders – GET /api/orders/recent */
export const getRecentOrders = (): Promise<AdminOrderDtoResponse[]> => get('/orders/recent');

/** Update order status – PUT /api/orders/status/{orderStatus}/{orderId} */
export const updateOrderStatus = (status: OrderStatus, orderId: string): Promise<boolean> =>
  put(`/orders/status/${status}/${orderId}`);

/** Update payment status – PUT /api/orders/payment-status/{paymentStatus}/{orderId} */
export const updatePaymentStatus = (status: PaymentStatus, orderId: string): Promise<boolean> =>
  put(`/orders/payment-status/${status}/${orderId}`);

// Note: getOrder(id) exists in apiClient.ts but returns OrderDtoResponse - we'll use it and cast if needed

// ========== PROMO CODES ==========

/** Get all promo codes – GET /api/promo-codes */
export const getPromoCodes = (): Promise<PromoCodeDtoResponse[]> => get('/promo-codes');

/** Get one promo code – GET /api/promo-codes/{id} */
export const getPromoCode = (id: string): Promise<PromoCodeDtoResponse> => get(`/promo-codes/${id}`);

/** Create promo code – POST /api/promo-codes */
export const createPromoCode = (body: PromoCodeDtoRequest): Promise<PromoCodeDtoResponse> =>
  post('/promo-codes', body);

/** Update promo code – PUT /api/promo-codes/{id} */
export const updatePromoCode = (id: string, body: PromoCodeDtoRequest): Promise<PromoCodeDtoResponse> =>
  put(`/promo-codes/${id}`, body);

/** Delete promo code – DELETE /api/promo-codes/{id} */
export const deletePromoCode = (id: string): Promise<void> => del(`/promo-codes/${id}`);

/** Validate promo code – GET /api/promo-codes/validate?code=... */
export const validatePromoCode = (code: string): Promise<{ valid: boolean; message?: string }> =>
  get(`/promo-codes/validate?code=${encodeURIComponent(code)}`);
