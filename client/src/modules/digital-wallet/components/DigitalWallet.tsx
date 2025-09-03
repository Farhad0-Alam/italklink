import React from 'react';
import { DigitalWalletProps } from '../types';

export const DigitalWallet: React.FC<DigitalWalletProps> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`digital-wallet-container ${className}`}
      data-testid="digital-wallet-main"
      {...props}
    >
      {children || <p>Welcome to DigitalWallet Module</p>}
    </div>
  );
};

export default DigitalWallet;
