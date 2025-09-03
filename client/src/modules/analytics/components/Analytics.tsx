import React from 'react';
import { AnalyticsProps } from '../types';

export const Analytics: React.FC<AnalyticsProps> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`analytics-container ${className}`}
      data-testid="analytics-main"
      {...props}
    >
      {children || <p>Welcome to Analytics Module</p>}
    </div>
  );
};

export default Analytics;
