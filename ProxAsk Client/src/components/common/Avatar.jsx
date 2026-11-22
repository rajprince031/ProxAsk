import React from 'react';
import './common.css';

const getInitials = (name, username) => {
  if (name && typeof name === 'string') {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (username && typeof username === 'string') {
    return username.slice(0, 2).toUpperCase();
  }
  return '??';
};

// Generates consistent subtle gradient based on string seed
const getGradientSeed = (seed) => {
  if (!seed) return 'linear-gradient(135deg, #0F766E 0%, #082E2E 100%)';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [
    'linear-gradient(135deg, #0F766E 0%, #082E2E 100%)',
    'linear-gradient(135deg, #FF7A00 0%, #9A3412 100%)',
    'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
    'linear-gradient(135deg, #EA580C 0%, #7C2D12 100%)',
    'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
  ];
  return hues[Math.abs(hash) % hues.length];
};

const Avatar = ({
  src,
  alt = 'User avatar',
  name = '',
  username = '',
  size = 'md', // 'xs' (24px) | 'sm' (32px) | 'md' (40px) | 'lg' (48px) | 'xl' (80px)
  isAnonymous = false,
  className = '',
  status = null, // 'online' | 'offline' | null
}) => {
  const initials = isAnonymous ? '?' : getInitials(name, username);
  const background = isAnonymous
    ? 'linear-gradient(135deg, #334155 0%, #1E293B 100%)'
    : getGradientSeed(username || name);

  return (
    <div className={`px-avatar px-avatar--${size} ${className}`}>
      {src && !isAnonymous ? (
        <img
          src={src}
          alt={alt}
          className="px-avatar__img"
          onError={(e) => {
            // fallback to initials on error
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div
          className="px-avatar__placeholder"
          style={{ background }}
        >
          <span className="px-avatar__initials font-mono">{initials}</span>
        </div>
      )}
      {status && <span className={`px-avatar__status px-avatar__status--${status}`} />}
    </div>
  );
};

export default Avatar;
