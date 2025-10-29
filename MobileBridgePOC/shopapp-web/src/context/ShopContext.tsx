import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types/index';

// Define CartItem here to avoid import issues
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: string[];
  couponCode: string;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getCartTotal: () => number;
  getProductDiscount: () => number;
  getCouponDiscount: () => number;
  getShippingCost: () => number;
  getFinalTotal: () => number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Valid coupon codes with their discount percentages
const VALID_COUPONS: Record<string, number> = {
  'DESCONTO10': 10,
  'PRIMEIRACOMPRA': 15,
  'BLACKFRIDAY': 20
};

const FREE_SHIPPING_THRESHOLD = 200; // R$ 200 for free shipping
const SHIPPING_COST = 15; // R$ 15 shipping fee

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');

  // Notify native app when cart changes
  useEffect(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    console.log('ShopApp: Cart changed, count:', cartCount, 'items:', cart.length);
    console.log('ShopApp: window.ReactNativeWebView exists?', typeof window !== 'undefined' && !!(window as any).ReactNativeWebView);

    // Check if we're running in a WebView with Mobile Bridge
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      try {
        const message = {
          type: 'cartUpdated',
          data: {
            count: cartCount,
            items: cart.length
          }
        };
        console.log('ShopApp: Sending message to native:', message);
        (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
        console.log('ShopApp: Message sent successfully!');
      } catch (error) {
        console.error('ShopApp: Error notifying native app:', error);
      }
    } else {
      console.log('ShopApp: ReactNativeWebView not available, running in browser');
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    setCart(prev => {
      const existing = prev.find(item =>
        item.productId === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
      );

      if (existing) {
        return prev.map(item =>
          item.productId === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { productId: product.id, product, quantity, selectedColor, selectedSize }];
    });
  };

  const removeFromCart = (productId: string, selectedColor?: string, selectedSize?: string) => {
    setCart(prev => prev.filter(item =>
      !(item.productId === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedSize);
      return;
    }
    setCart(prev => prev.map(item =>
      item.productId === productId &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const clearWishlist = () => setWishlist([]);

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string): boolean => {
    const upperCode = code.toUpperCase();
    if (VALID_COUPONS[upperCode]) {
      setCouponCode(upperCode);
      return true;
    }
    return false;
  };

  const removeCoupon = () => setCouponCode('');

  // Calculate subtotal (sum of all products with their individual discounts applied)
  const getCartTotal = (): number => {
    return cart.reduce((total, item) => {
      const productPrice = item.product.price;
      const productDiscount = item.product.discount || 0;
      const finalPrice = productPrice * (1 - productDiscount / 100);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  // Calculate total product discounts
  const getProductDiscount = (): number => {
    return cart.reduce((total, item) => {
      const productPrice = item.product.price;
      const productDiscount = item.product.discount || 0;
      const discountAmount = productPrice * (productDiscount / 100) * item.quantity;
      return total + discountAmount;
    }, 0);
  };

  // Calculate coupon discount (applied to subtotal after product discounts)
  const getCouponDiscount = (): number => {
    if (!couponCode || !VALID_COUPONS[couponCode]) return 0;
    const subtotal = getCartTotal();
    return subtotal * (VALID_COUPONS[couponCode] / 100);
  };

  // Calculate shipping cost
  const getShippingCost = (): number => {
    const subtotal = getCartTotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };

  // Calculate final total
  const getFinalTotal = (): number => {
    const subtotal = getCartTotal();
    const couponDiscount = getCouponDiscount();
    const shipping = getShippingCost();
    return subtotal - couponDiscount + shipping;
  };

  return (
    <ShopContext.Provider value={{
      cart,
      wishlist,
      couponCode,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      clearWishlist,
      isInWishlist,
      applyCoupon,
      removeCoupon,
      getCartTotal,
      getProductDiscount,
      getCouponDiscount,
      getShippingCost,
      getFinalTotal
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
}
