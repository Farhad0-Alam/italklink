import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: any;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const { data: cartData, isLoading: cartLoading, refetch: refetchCart } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const res = await apiRequest('/api/cart', { method: 'GET' });
      return res.data;
    },
  });

  useEffect(() => {
    if (cartData) {
      setItems(cartData.items || []);
      setTotal(cartData.total || 0);
    }
  }, [cartData]);

  const addToCartMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      apiRequest('/api/cart/add', { method: 'POST', body: data }),
    onSuccess: () => refetchCart(),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: string) =>
      apiRequest(`/api/cart/remove/${productId}`, { method: 'DELETE' }),
    onSuccess: () => refetchCart(),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      apiRequest(`/api/cart/update/${data.productId}`, { method: 'PATCH', body: { quantity: data.quantity } }),
    onSuccess: () => refetchCart(),
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest('/api/cart/clear', { method: 'DELETE' }),
    onSuccess: () => refetchCart(),
  });

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount: items.length,
        isLoading: cartLoading,
        addToCart: (productId, quantity = 1) => addToCartMutation.mutateAsync({ productId, quantity }),
        removeFromCart: (productId) => removeFromCartMutation.mutateAsync(productId),
        updateQuantity: (productId, quantity) => updateQuantityMutation.mutateAsync({ productId, quantity }),
        clearCart: () => clearCartMutation.mutateAsync(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
