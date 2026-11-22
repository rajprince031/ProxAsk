import React from 'react';
import './common.css';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`px-btn px-btn--${variant} px-btn--${size} ${isLoading ? 'px-btn--loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="px-btn__spinner animate-spin" />
      ) : (
        leftIcon && <span className="px-btn__icon px-btn__icon--left">{leftIcon}</span>
      )}
      <span className="px-btn__text">{children}</span>
      {!isLoading && rightIcon && (
        <span className="px-btn__icon px-btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
