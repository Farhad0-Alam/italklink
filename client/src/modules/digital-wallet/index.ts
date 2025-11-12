// Main exports for DigitalWallet module  
export { WalletButtons } from './components/WalletButtons';
export { useDigitalWallet } from './hooks/useDigitalWallet';
export type { DigitalWalletProps, DigitalWalletConfig } from './types';

// Re-export for backward compatibility
export { WalletButtons as DigitalWallet } from './components/WalletButtons';

// Module metadata
export const digitalWalletModule = {
  name: 'DigitalWallet',
  version: '1.0.0',
  description: 'Digital Wallet module for TalkLink',
  type: 'feature'
};
