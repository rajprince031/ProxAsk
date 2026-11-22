import React from 'react';
import './common.css';

const Badge = ({
  children,
  variant = 'default', // 'default' | 'orange' | 'teal' | 'success' | 'danger' | 'anonymous'
  size = 'sm', // 'sm' | 'md'
  icon = null,
  className = '',
}) => {
  return (
    <span className={`px-badge px-badge--${variant} px-badge--${size} font-mono ${className}`}>
      {icon && <span className="px-badge__icon">{icon}</span>}
      <span className="px-badge__label">{children}</span>
    </span>
  );
};

export default Badge;
