import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: 'usd',
  apiVersion: '2024-06-20' as const,
};

// Validate Stripe configuration
export function validateStripeConfig() {
  const requiredKeys = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY', 
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  const missing = requiredKeys.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✓ Stripe configuration validated successfully');
  return true;
}

// Supported currencies for international payments
export const SUPPORTED_CURRENCIES = [
  { code: 'usd', symbol: '$', name: 'US Dollar' },
  { code: 'eur', symbol: '€', name: 'Euro' },
  { code: 'gbp', symbol: '£', name: 'British Pound' },
  { code: 'cad', symbol: 'C$', name: 'Canadian Dollar' },
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]['code'];

// Helper function to format currency amounts
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  const currencyData = SUPPORTED_CURRENCIES.find(c => c.code === currency.toLowerCase());
  const symbol = currencyData?.symbol || '$';
  
  return `${symbol}${(amount / 100).toFixed(2)}`;
}

// Helper function to convert amount to cents for Stripe
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

// Helper function to convert cents to dollars
export function fromCents(amount: number): number {
  return amount / 100;
}