import React from 'react';

/**
 * Authentic 4-color Google "G" Logo
 */
export const GoogleIcon = ({ className = "w-5 h-5", size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Authentic Telegram Paper Plane Logo
 */
export const TelegramIcon = ({ className = "w-5 h-5", size, withBadge = false }) => {
  if (withBadge) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 shadow-sm ${className}`}
        style={{
          background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
          ...(size ? { width: size, height: size } : {})
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-3/5 h-3/5 text-white translate-x-[-1px] translate-y-[1px]" 
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
        </svg>
      </div>
    );
  }

  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="url(#tg-grad)" />
      <path 
        d="M5.4 12.06c2.93-1.28 4.88-2.12 5.86-2.53 2.79-1.16 3.37-1.36 3.75-1.36.08 0 .27.02.4.12.1.08.13.2.14.28 0 .06.01.24 0 .37-.15 1.59-.8 5.45-1.14 7.23-.14.75-.42 1.01-.69 1.03-.58.05-1.03-.38-1.59-.75-.88-.58-1.39-.94-2.24-1.5-.99-.65-.35-1.01.22-1.6.15-.15 2.73-2.5 2.78-2.71.01-.03 0-.13-.06-.18-.06-.05-.14-.03-.21-.02-.1.02-1.5 0.95-4.24 2.8-.4.28-.77.41-1.09.41-.36-.01-1.05-.21-1.56-.37-.63-.21-1.13-.32-1.09-.67.02-.18.27-.37.76-.56z" 
        fill="#ffffff" 
      />
      <defs>
        <linearGradient id="tg-grad" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/**
 * Modern High-Contrast Email / Envelope Icon
 */
export const EmailIcon = ({ className = "w-5 h-5", size }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="16" x="2" y="4" rx="3" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default {
  Google: GoogleIcon,
  Telegram: TelegramIcon,
  Email: EmailIcon
};
