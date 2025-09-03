import React from 'react';
import { AdminPanelProps } from '../types';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`admin-panel-container ${className}`}
      data-testid="admin-panel-main"
      {...props}
    >
      {children || <p>Welcome to AdminPanel Module</p>}
    </div>
  );
};

export default AdminPanel;
