export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  tags?: string[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  features?: string[];
  specifications?: Record<string, string>;
}

export interface ProductColor {
  id: string;
  name: string;
  value: string;
  available: boolean;
}

export interface ProductSize {
  id: string;
  name: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: number;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'pix';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCVV?: string;
  installments?: number;
}
