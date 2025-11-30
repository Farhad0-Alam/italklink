import { Link } from 'wouter';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart">
      <button
        className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        data-testid="button-cart-icon"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span
            className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
            data-testid="text-cart-count"
          >
            {itemCount}
          </span>
        )}
      </button>
    </Link>
  );
}
