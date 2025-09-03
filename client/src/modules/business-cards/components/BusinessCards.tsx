import React from 'react';
import { BusinessCardsProps } from '../types';

export const BusinessCards: React.FC<BusinessCardsProps> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`business-cards-container ${className}`}
      data-testid="business-cards-main"
      {...props}
    >
      {children || <p>Welcome to BusinessCards Module</p>}
    </div>
  );
};

export default BusinessCards;
