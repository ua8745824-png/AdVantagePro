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
    xs: 'w-6 h-6 min-w-[1.5rem] max-w-[1.5rem] min-h-[1.5rem] max-h-[1.5rem]',
    sm: 'w-8 h-8 min-w-[2rem] max-w-[2rem] min-h-[2rem] max-h-[2rem]',
    md: 'w-10 h-10 min-w-[2.5rem] max-w-[2.5rem] min-h-[2.5rem] max-h-[2.5rem]',
    lg: 'w-12 h-12 min-w-[3rem] max-w-[3rem] min-h-[3rem] max-h-[3rem]',
    xl: 'w-16 h-16 min-w-[4rem] max-w-[4rem] min-h-[4rem] max-h-[4rem]',
    '2xl': 'w-20 h-20 sm:w-24 sm:h-24 min-w-[5rem] min-h-[5rem]',
    hero: 'w-24 h-24 sm:w-32 sm:h-32'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl',
    hero: 'text-4xl sm:text-6xl'
  };

  // If user requests the complete full graphic badge
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center justify-center select-none max-w-full ${className}`}>
        <img 
          src="/novyra-logo.png" 
          alt="NOVYRA - Watch. Complete. Earn." 
          className={`object-contain transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_8px_24px_rgba(0,229,153,0.3)] ${
            size === 'hero' ? 'max-w-[260px] sm:max-w-[320px] w-full' : size === 'xl' ? 'w-40 sm:w-48' : 'w-28 sm:w-36'
          }`}
          loading="eager"
        />
      </div>
    );
  }

  const emblemImage = (
    <img 
      src="/novyra-icon.png" 
      alt="NOVYRA" 
      className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,229,153,0.35)] transition-transform duration-300 group-hover:scale-105 select-none shrink-0"
      loading="eager"
    />
  );

  // If used purely as an icon / emblem
  if (!showText && variant !== 'full') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 overflow-hidden ${iconSizes[size] || iconSizes.md} ${className}`}>
        {emblemImage}
      </div>
    );
  }

  // If used as logo with typography
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group max-w-full ${className}`}>
      <div className={`shrink-0 overflow-hidden flex items-center justify-center ${iconSizes[size] || iconSizes.md}`}>
        {emblemImage}
      </div>

      <div className="flex flex-col justify-center text-left min-w-0">
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
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1 sm:gap-1.5 truncate">
            <span className="inline-block w-1.5 sm:w-2 h-[1.5px] bg-[#00E599]/60 rounded-full shrink-0" />
            Watch. Complete. Earn.
            <span className="inline-block w-1.5 sm:w-2 h-[1.5px] bg-[#00E599]/60 rounded-full shrink-0" />
          </span>
        )}
      </div>
    </div>
  );
}
