import React, { forwardRef } from 'react';
import './common.css';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`px-input-group ${error ? 'px-input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="px-input-label">
          {label}
        </label>
      )}
      <div className="px-input-wrapper">
        {leftIcon && <span className="px-input-icon px-input-icon--left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`px-input ${leftIcon ? 'px-input--has-left' : ''} ${rightIcon ? 'px-input--has-right' : ''}`}
          {...props}
        />
        {rightIcon && <span className="px-input-icon px-input-icon--right">{rightIcon}</span>}
      </div>
      {error && <span className="px-input-error">{error}</span>}
      {!error && helperText && <span className="px-input-helper">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
