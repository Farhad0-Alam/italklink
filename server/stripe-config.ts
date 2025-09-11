import Stripe from 'stripe';

// Lazy Stripe instance - only created when needed
let stripeInstance: Stripe | null = null;

// Check if Stripe is configured
export function hasStripeConfig(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && 
           process.env.STRIPE_PUBLISHABLE_KEY && 
           process.env.STRIPE_WEBHOOK_SECRET);
}

// Get Stripe instance with lazy initialization
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required to use payment features');
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Legacy export for backward compatibility - throws error if not configured
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe];
  }
});

// Stripe configuration constants with safe access
export const STRIPE_CONFIG = {
  get publishableKey() {
    const key = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!key) throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is required');
    return key;
  },
  get webhookSecret() {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    return secret;
  },
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