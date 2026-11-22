import React from 'react';
import './common.css';

const Card = ({
  children,
  className = '',
  hoverable = false,
  padded = true,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`px-card ${hoverable ? 'px-card--hoverable' : ''} ${padded ? 'px-card--padded' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
