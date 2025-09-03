import React from 'react';
import { FormBuilderProps } from '../types';

export const FormBuilder: React.FC<FormBuilderProps> = ({ 
  children,
  className = "",
  ...props 
}) => {
  return (
    <div 
      className={`form-builder-container ${className}`}
      data-testid="form-builder-main"
      {...props}
    >
      {children || <p>Welcome to FormBuilder Module</p>}
    </div>
  );
};

export default FormBuilder;
