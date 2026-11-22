import React from 'react';
import './common.css';

const LoadingSkeleton = ({
  type = 'card', // 'card' | 'feed' | 'profile' | 'line'
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (type === 'line') {
    return (
      <div className={`px-skeleton-group ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="px-skeleton px-skeleton--line animate-pulse" />
        ))}
      </div>
    );
  }

  if (type === 'card' || type === 'feed') {
    return (
      <div className={`px-skeleton-group ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="px-card px-skeleton-card animate-pulse">
            <div className="px-skeleton-card__header">
              <div className="px-skeleton px-skeleton--avatar" />
              <div className="px-skeleton-card__meta">
                <div className="px-skeleton px-skeleton--text px-skeleton--w-120" />
                <div className="px-skeleton px-skeleton--text px-skeleton--w-80" />
              </div>
            </div>
            <div className="px-skeleton px-skeleton--text px-skeleton--w-full" style={{ marginTop: '12px' }} />
            <div className="px-skeleton px-skeleton--text px-skeleton--w-3-4" style={{ marginTop: '8px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`px-skeleton px-skeleton--block animate-pulse ${className}`} />
  );
};

export default LoadingSkeleton;
