import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  const currencyMap = {
    'usd': { symbol: '$', name: 'US Dollar' },
    'eur': { symbol: '€', name: 'Euro' },
    'gbp': { symbol: '£', name: 'British Pound' },
    'cad': { symbol: 'C$', name: 'Canadian Dollar' },
  };

  const currencyData = currencyMap[currency.toLowerCase() as keyof typeof currencyMap];
  const symbol = currencyData?.symbol || '$';
  
  return `${symbol}${(amount / 100).toFixed(2)}`;
}
