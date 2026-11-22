import React, { forwardRef } from 'react';
import './common.css';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  maxLength,
  value = '',
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`px-input-group ${error ? 'px-input-group--error' : ''} ${className}`}>
      <div className="px-input-label-row">
        {label && (
          <label htmlFor={textareaId} className="px-input-label">
            {label}
          </label>
        )}
        {maxLength && (
          <span className="px-input-counter font-mono">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <div className="px-input-wrapper">
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          className="px-textarea"
          {...props}
        />
      </div>
      {error && <span className="px-input-error">{error}</span>}
      {!error && helperText && <span className="px-input-helper">{helperText}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
