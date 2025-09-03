// Main exports for DigitalWallet module
export { DigitalWallet } from './components/DigitalWallet';
export { useDigitalWallet } from './hooks/useDigitalWallet';
export type { DigitalWalletProps, DigitalWalletConfig } from './types';

// Module metadata
export const digitalWalletModule = {
  name: 'DigitalWallet',
  version: '1.0.0',
  description: 'DigitalWallet module for 2TalkLink',
  type: 'feature'
};
