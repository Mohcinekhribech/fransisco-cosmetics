/**
 * Client for backend API: categories, product search, orders (incl. guest, COD).
 * Base URL from env: VITE_API_BASE_URL (e.g. http://localhost:8080)
 */

import type { Product } from '../types';
import type {
  ApiCategory,
  ApiPage,
  ApiProductDto,
  OrderDtoRequest,
  OrderDtoResponse,
  PaymentStatus,
  ProductSearchParams,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutErrorResponse,
} from '../types/api';
import { getUploadImageUrl } from '../utils/upload';

const getBaseUrl = (): string => {
  const url = (import.meta.env as any).VITE_API_BASE_URL as string | undefined;
  if (!url) return '';
  return url.replace(/\/$/, '');
};

const api = (path: string, init?: RequestInit): Promise<Response> => {
  const base = getBaseUrl();
  if (!base) return Promise.reject(new Error('VITE_API_BASE_URL is not set'));
  const url = `${base}/api${path}`;
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
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

const postWithErrorHandling = async <T>(
  path: string,
  body: unknown
): Promise<T> => {
  const response = await api(path, { method: 'POST', body: JSON.stringify(body) });
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = 'Failed to place order';
    let errorDetails: string[] = [];

    // Try to parse error response
    try {
      const errorJson = JSON.parse(text) as CheckoutErrorResponse | { message?: string; error?: string };
      if ('errors' in errorJson && Array.isArray(errorJson.errors)) {
        errorDetails = errorJson.errors;
        errorMessage = errorDetails.join(', ');
      } else if ('message' in errorJson) {
        errorMessage = errorJson.message;
      } else if ('error' in errorJson) {
        errorMessage = errorJson.error;
      }
    } catch {
      // If parsing fails, use text as error message
      if (text) {
        errorMessage = text;
      }
    }

    const error = new Error(errorMessage) as Error & { details?: string[]; status?: number };
    error.details = errorDetails.length > 0 ? errorDetails : undefined;
    error.status = response.status;
    throw error;
  }
  return response.json();
};

const put = (path: string): Promise<boolean> =>
  api(path, { method: 'PUT' }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(res.status === 400 ? text || 'Bad request' : `API error: ${res.status}`);
    }
    return res.json();
  });

/** List all categories – GET /api/category */
export const getCategories = (): Promise<ApiCategory[]> => get('/category');

/** Get one category – GET /api/category/{id} */
export const getCategoryById = (id: string): Promise<ApiCategory> => get(`/category/${id}`);

/** Product search – GET /api/product/search?categoryName=...&page=0&size=10 */
export const searchProducts = (params: ProductSearchParams = {}): Promise<ApiPage<ApiProductDto>> => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return get(`/product/search${query ? `?${query}` : ''}`);
};

/** Create order (guest too) – POST /api/orders. Use paymentMethod: "COD", paymentStatus: "COD_PENDING" for Cash on Delivery. */
export const createOrder = (body: OrderDtoRequest): Promise<OrderDtoResponse> =>
  post('/orders', body);

/** Checkout order (guest checkout) – POST /api/orders/checkout */
export const checkoutOrder = (body: CheckoutRequest): Promise<CheckoutResponse> =>
  postWithErrorHandling<CheckoutResponse>('/orders/checkout', body);

/** Get one order – GET /api/orders/{id} */
export const getOrder = (id: string): Promise<OrderDtoResponse> => get(`/orders/${id}`);

/** Update payment status – PUT /api/orders/payment-status/{PaymentStatus}/{orderId} */
export const updatePaymentStatus = (status: PaymentStatus, orderId: string): Promise<boolean> =>
  put(`/orders/payment-status/${status}/${orderId}`);

/** Check if API is configured (base URL set). */
export const isApiConfigured = (): boolean => !!getBaseUrl();

/** Get guest client UUID for placing orders (from env VITE_GUEST_CLIENT_ID). */
export const getGuestClientId = (): string | undefined =>
  (import.meta.env as any).VITE_GUEST_CLIENT_ID as string | undefined;

/** Map API product DTO to app Product (defaults for missing fields). Resolves image URLs via getUploadImageUrl. */
export function mapApiProductToProduct(dto: ApiProductDto): Product {
  const price = dto.finalPrice ?? dto.price ?? 0;
  const medias = dto.productMedias && dto.productMedias.length > 0
    ? dto.productMedias.map((m) => m.mediaName)
    : dto.image
      ? [dto.image]
      : [];
  const image = medias[0] ?? '';
  const gallery = medias;
  const resolve = (v: string) => (v ? getUploadImageUrl(v) : '');
  let categoryName: Product['category'] = 'Skin Care';
  if (typeof dto.categoryName === 'string') {
    categoryName = dto.categoryName as Product['category'];
  } else if (typeof dto.category === 'string') {
    categoryName = dto.category as Product['category'];
  }
  return {
    id: dto.id,
    name: dto.name ?? 'Product',
    category: categoryName,
    price,
    image: resolve(image) || 'https://via.placeholder.com/400x400?text=No+Image',
    gallery: gallery.map(resolve).filter(Boolean),
    description: dto.description ?? '',
    benefits: [],
    usage: '',
    ingredients: '',
    isFeatured: false,
    stockStatus: dto.inStock !== false ? 'In Stock' : 'Low Stock',
  };
}
