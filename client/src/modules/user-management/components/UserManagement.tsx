import React from 'react';
import { UserManagementProps } from '../types';

export const UserManagement: React.FC<UserManagementProps> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`user-management-container ${className}`}
      data-testid="user-management-main"
      {...props}
    >
      {children || <p>Welcome to UserManagement Module</p>}
    </div>
  );
};

export default UserManagement;
