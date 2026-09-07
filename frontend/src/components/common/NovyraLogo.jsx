import React from 'react';

export default function NovyraLogo({ 
  size = 'md', 
  showText = false, 
  showTagline = false, 
  className = '' 
}) {
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    xs: 'text-base',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const svgElement = (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none transition-all duration-300"
      style={{ filter: 'drop-shadow(var(--theme-glow))' }}
    >
      <defs>
        <linearGradient id="novyra-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-primary)" />
          <stop offset="50%" stopColor="var(--theme-secondary)" />
          <stop offset="100%" stopColor="var(--theme-primary)" />
        </linearGradient>
        <linearGradient id="novyra-n-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--theme-primary)" />
          <stop offset="60%" stopColor="var(--theme-secondary)" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <radialGradient id="novyra-bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--theme-bg-surface)" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Hexagonal Shield Foundation */}
      <polygon 
        points="50,4 92,26 92,74 50,96 8,74 8,26" 
        stroke="url(#novyra-shield-grad)" 
        strokeWidth="4.5" 
        strokeLinejoin="round"
        fill="url(#novyra-bg-glow)" 
      />

      {/* Inner Accent Facets */}
      <polygon 
        points="50,14 82,31 82,69 50,86 18,69 18,31" 
        stroke="url(#novyra-shield-grad)" 
        strokeWidth="1.2" 
        strokeOpacity="0.4"
        fill="none" 
      />

      {/* Geometric 'N' Monogram */}
      <path 
        d="M28 72 V28 L50 56 L72 28 V72" 
        stroke="url(#novyra-n-grad)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Verified Core Spark / Radiant Node */}
      <circle cx="50" cy="56" r="3.5" fill="var(--theme-secondary)" className="animate-pulse" />
      <circle cx="72" cy="28" r="3" fill="var(--theme-primary)" />
      <circle cx="28" cy="28" r="3" fill="var(--theme-primary)" />
    </svg>
  );

  // If used purely as an icon / emblem
  if (!showText) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${iconSizes[size] || ''} ${className}`}>
        {svgElement}
      </div>
    );
  }

  // If used as full logo with text
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`shrink-0 ${iconSizes[size] || iconSizes.md}`}>
        {svgElement}
      </div>

      <div className="flex flex-col justify-center">
        <span 
          className={`font-heading font-black tracking-wider leading-none ${textSizes[size] || textSizes.md}`}
          style={{
            background: 'var(--theme-gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          NOVYRA
        </span>
        {showTagline && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Watch. Complete. Earn.
          </span>
        )}
      </div>
    </div>
  );
}
