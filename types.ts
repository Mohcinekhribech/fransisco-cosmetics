
export type Category = 'Skin Care' | 'Hair Care' | 'Para-pharmacy';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  gallery: string[];
  description: string;
  benefits: string[];
  usage: string;
  ingredients: string;
  isFeatured: boolean;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

export interface OrderDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  items: CartItem[];
  total: number;
  date: string;
}
