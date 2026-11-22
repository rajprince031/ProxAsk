import React from 'react';
import './common.css';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`px-empty-state ${className}`}>
      {icon && <div className="px-empty-state__icon">{icon}</div>}
      <h4 className="px-empty-state__title">{title}</h4>
      {description && <p className="px-empty-state__desc">{description}</p>}
      {action && <div className="px-empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
