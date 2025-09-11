import { loadStripe } from '@stripe/stripe-js';

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

// Convert amount to cents for Stripe
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

// Convert cents to dollars
export function fromCents(amount: number): number {
  return amount / 100;
}

// Payment form validation helpers
export function validateCardholderName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Payment error handling
export function getStripeErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  switch (error.code) {
    case 'card_declined':
      return 'Your card was declined. Please try a different card or contact your bank.';
    case 'expired_card':
      return 'Your card has expired. Please use a different card.';
    case 'incorrect_cvc':
      return 'Your card\'s security code is incorrect. Please check and try again.';
    case 'processing_error':
      return 'An error occurred processing your card. Please try again.';
    case 'insufficient_funds':
      return 'Your card has insufficient funds. Please use a different card.';
    case 'authentication_required':
      return 'Your payment requires authentication. Please complete the authentication process.';
    case 'payment_intent_authentication_failure':
      return 'Authentication failed. Please try again or use a different card.';
    default:
      return error.message || 'An error occurred while processing your payment. Please try again.';
  }
}

// Payment method icons mapping
export function getPaymentMethodIcon(type: string): string {
  const iconMap: Record<string, string> = {
    card: '💳',
    bank_transfer: '🏦',
    paypal: 'PayPal',
    apple_pay: '🍎',
    google_pay: 'G Pay',
    link: 'Link',
  };
  
  return iconMap[type] || '💳';
}

// Payment status helpers
export function getPaymentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'yellow',
    paid: 'green',
    failed: 'red',
    refunded: 'orange',
    partially_refunded: 'orange',
    cancelled: 'gray',
  };
  
  return statusColors[status] || 'gray';
}

export function getPaymentStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded',
    cancelled: 'Cancelled',
  };
  
  return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

// API request helpers for payments
export async function createPaymentIntent(data: {
  appointmentId: string;
  eventTypeId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}) {
  const response = await fetch('/api/payments/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment intent');
  }

  return response.json();
}

export async function confirmPayment(data: {
  paymentIntentId: string;
  appointmentId: string;
}) {
  const response = await fetch('/api/payments/confirm-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm payment');
  }

  return response.json();
}

export async function processRefund(data: {
  paymentId: string;
  amount?: number;
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent';
}) {
  const response = await fetch('/api/payments/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process refund');
  }

  return response.json();
}

// Initialize Stripe instance
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// Validate Stripe configuration
export function validateStripeConfig(): boolean {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
    return false;
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key format');
    return false;
  }
  
  return true;
}