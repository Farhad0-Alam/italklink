import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
  appearance?: any;
  options?: any;
}

export function StripeProvider({ 
  children, 
  clientSecret, 
  appearance,
  options 
}: StripeProviderProps) {
  const defaultAppearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0f172a',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        padding: '12px',
        backgroundColor: '#ffffff',
        fontSize: '14px',
      },
      '.Input:focus': {
        border: '1px solid #2563eb',
        boxShadow: '0 0 0 1px #2563eb',
      },
      '.Input--invalid': {
        border: '1px solid #dc2626',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
      },
      '.Error': {
        fontSize: '13px',
        color: '#dc2626',
        marginTop: '4px',
      }
    }
  };

  const defaultOptions = {
    clientSecret,
    appearance: appearance || defaultAppearance,
    loader: 'auto',
    ...options
  };

  if (!clientSecret) {
    return <div>{children}</div>;
  }

  return (
    <Elements stripe={stripePromise} options={defaultOptions}>
      {children}
    </Elements>
  );
}