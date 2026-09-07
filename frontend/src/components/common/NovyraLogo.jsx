import React from 'react';

/**
 * Official NOVYRA Brand Logo Component
 * Renders the official 3D Emerald Hexagonal Shield Emblem and Typography.
 */
export default function NovyraLogo({ 
  size = 'md', 
  showText = false, 
  showTagline = false, 
  variant = 'auto', // 'auto' | 'emblem' | 'full'
  className = '' 
}) {
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
    hero: 'w-36 h-36'
  };

  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl',
    hero: 'text-6xl'
  };

  // If user requests the complete full graphic badge
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
        <img 
          src="/novyra-logo.png" 
          alt="NOVYRA - Watch. Complete. Earn." 
          className={`object-contain transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_8px_24px_rgba(0,229,153,0.3)] ${
            size === 'hero' ? 'max-w-[320px] w-full' : size === 'xl' ? 'w-48' : 'w-36'
          }`}
          loading="eager"
        />
      </div>
    );
  }

  const emblemImage = (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <img 
        src="/novyra-icon.png" 
        alt="NOVYRA" 
        className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,229,153,0.35)] transition-transform duration-300 group-hover:scale-105"
        loading="eager"
      />
    </div>
  );

  // If used purely as an icon / emblem
  if (!showText && variant !== 'full') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${iconSizes[size] || iconSizes.md} ${className}`}>
        {emblemImage}
      </div>
    );
  }

  // If used as logo with typography
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <div className={`shrink-0 ${iconSizes[size] || iconSizes.md}`}>
        {emblemImage}
      </div>

      <div className="flex flex-col justify-center text-left">
        <span 
          className={`font-heading font-black tracking-wider leading-none ${textSizes[size] || textSizes.md}`}
          style={{
            background: 'linear-gradient(135deg, #00E599 0%, #00B377 50%, #008055 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.08em'
          }}
        >
          NOVYRA
        </span>
        {showTagline && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-[1.5px] bg-[#00E599]/60 rounded-full" />
            Watch. Complete. Earn.
            <span className="inline-block w-2 h-[1.5px] bg-[#00E599]/60 rounded-full" />
          </span>
        )}
      </div>
    </div>
  );
}
