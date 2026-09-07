import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext(null);

// 12 Curated Master Presets - Categorized for Modern Fintech, Cyber, Luxury, and Clean Light
export const THEME_PRESETS = [
  // --- FINTECH & DARK ---
  {
    id: 'fintech-indigo',
    name: 'Royal Indigo Fintech',
    category: 'fintech',
    tagline: 'Deep Slate & Royal Indigo (Stripe/Revolut standard)',
    mode: 'dark',
    colors: {
      primary: '#6366f1',
      primaryRgb: '99, 102, 241',
      secondary: '#3b82f6',
      secondaryRgb: '59, 130, 246',
      accent: '#818cf8',
      bgMain: '#080c14',
      bgSurface: '#0e1422',
      bgElevated: '#151d30',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(99, 102, 241, 0.35)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      glow: '0 8px 30px -4px rgba(99, 102, 241, 0.28)',
      gradientBrand: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3b82f6 100%)',
    },
    previewDot: ['#6366f1', '#3b82f6', '#080c14']
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    category: 'fintech',
    tagline: 'Obsidian Noir & Electric Sapphire Mist',
    mode: 'dark',
    colors: {
      primary: '#38bdf8',
      primaryRgb: '56, 189, 248',
      secondary: '#06b6d4',
      secondaryRgb: '6, 182, 212',
      accent: '#7dd3fc',
      bgMain: '#030712',
      bgSurface: '#0b0f19',
      bgElevated: '#111827',
      border: 'rgba(255, 255, 255, 0.07)',
      borderHighlight: 'rgba(56, 189, 248, 0.35)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      glow: '0 8px 30px -4px rgba(56, 189, 248, 0.25)',
      gradientBrand: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #06b6d4 100%)',
    },
    previewDot: ['#38bdf8', '#06b6d4', '#030712']
  },
  {
    id: 'emerald-wealth',
    name: 'Emerald Wealth',
    category: 'fintech',
    tagline: 'Private Banking Forest & Prestige Emerald',
    mode: 'dark',
    colors: {
      primary: '#10b981',
      primaryRgb: '16, 185, 129',
      secondary: '#059669',
      secondaryRgb: '5, 150, 105',
      accent: '#34d399',
      bgMain: '#050e0a',
      bgSurface: '#091a13',
      bgElevated: '#0f261d',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(16, 185, 129, 0.35)',
      textPrimary: '#f0fdf4',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      glow: '0 8px 30px -4px rgba(16, 185, 129, 0.28)',
      gradientBrand: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
    },
    previewDot: ['#10b981', '#059669', '#050e0a']
  },
  {
    id: 'oceanic-deep',
    name: 'Oceanic Horizon',
    category: 'fintech',
    tagline: 'Deep Marine Navy & Sky Azure',
    mode: 'dark',
    colors: {
      primary: '#2563eb',
      primaryRgb: '37, 99, 235',
      secondary: '#38bdf8',
      secondaryRgb: '56, 189, 248',
      accent: '#60a5fa',
      bgMain: '#050b14',
      bgSurface: '#0a1424',
      bgElevated: '#101e33',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(37, 99, 235, 0.35)',
      textPrimary: '#f0f9ff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      glow: '0 8px 30px -4px rgba(37, 99, 235, 0.25)',
      gradientBrand: 'linear-gradient(135deg, #2563eb 0%, #0284c7 50%, #38bdf8 100%)',
    },
    previewDot: ['#2563eb', '#38bdf8', '#050b14']
  },

  // --- LUXURY & VIBRANT ---
  {
    id: 'platinum-champagne',
    name: 'Platinum Champagne',
    category: 'luxury',
    tagline: 'Swiss Private Vault & Warm Champagne Gold',
    mode: 'dark',
    colors: {
      primary: '#d97706',
      primaryRgb: '217, 119, 6',
      secondary: '#f59e0b',
      secondaryRgb: '245, 158, 11',
      accent: '#fbbf24',
      bgMain: '#0a0a0c',
      bgSurface: '#121216',
      bgElevated: '#1a1a20',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(217, 119, 6, 0.35)',
      textPrimary: '#fefce8',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      glow: '0 8px 30px -4px rgba(217, 119, 6, 0.25)',
      gradientBrand: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #eab308 100%)',
    },
    previewDot: ['#d97706', '#f59e0b', '#0a0a0c']
  },
  {
    id: 'amethyst-luxe',
    name: 'Amethyst Luxe',
    category: 'luxury',
    tagline: 'Imperial Velvet & Royal Amethyst',
    mode: 'dark',
    colors: {
      primary: '#9333ea',
      primaryRgb: '147, 51, 234',
      secondary: '#c026d3',
      secondaryRgb: '192, 38, 211',
      accent: '#c084fc',
      bgMain: '#090712',
      bgSurface: '#120d22',
      bgElevated: '#1b1430',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(147, 51, 234, 0.35)',
      textPrimary: '#faf5ff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      glow: '0 8px 30px -4px rgba(147, 51, 234, 0.28)',
      gradientBrand: 'linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #c026d3 100%)',
    },
    previewDot: ['#9333ea', '#c026d3', '#090712']
  },
  {
    id: 'crimson-apex',
    name: 'Crimson Apex',
    category: 'luxury',
    tagline: 'Ruby Crimson & Ember Rose Noir',
    mode: 'dark',
    colors: {
      primary: '#e11d48',
      primaryRgb: '225, 29, 72',
      secondary: '#f43f5e',
      secondaryRgb: '244, 63, 94',
      accent: '#fb7185',
      bgMain: '#0f0709',
      bgSurface: '#190d10',
      bgElevated: '#241418',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(225, 29, 72, 0.35)',
      textPrimary: '#fff1f2',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      glow: '0 8px 30px -4px rgba(225, 29, 72, 0.25)',
      gradientBrand: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #f43f5e 100%)',
    },
    previewDot: ['#e11d48', '#f43f5e', '#0f0709']
  },
  {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    category: 'luxury',
    tagline: 'Coral Amber & Twilight Lavender',
    mode: 'dark',
    colors: {
      primary: '#ea580c',
      primaryRgb: '234, 88, 12',
      secondary: '#e11d48',
      secondaryRgb: '225, 29, 72',
      accent: '#fb923c',
      bgMain: '#0c080d',
      bgSurface: '#170f19',
      bgElevated: '#221625',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(234, 88, 12, 0.35)',
      textPrimary: '#fff7ed',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      glow: '0 8px 30px -4px rgba(234, 88, 12, 0.25)',
      gradientBrand: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #e11d48 100%)',
    },
    previewDot: ['#ea580c', '#e11d48', '#0c080d']
  },
  {
    id: 'cyber-matrix',
    name: 'Cyberpunk Matrix',
    category: 'luxury',
    tagline: 'Neon Cyan & Matrix Teal on Carbon',
    mode: 'dark',
    colors: {
      primary: '#06b6d4',
      primaryRgb: '6, 182, 212',
      secondary: '#10b981',
      secondaryRgb: '16, 185, 129',
      accent: '#22d3ee',
      bgMain: '#020617',
      bgSurface: '#081026',
      bgElevated: '#0f1a3a',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHighlight: 'rgba(6, 182, 212, 0.35)',
      textPrimary: '#ecfeff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      glow: '0 8px 30px -4px rgba(6, 182, 212, 0.28)',
      gradientBrand: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)',
    },
    previewDot: ['#06b6d4', '#10b981', '#020617']
  },

  // --- LIGHT & CRISP ---
  {
    id: 'swiss-light',
    name: 'Swiss Modern Light',
    category: 'light',
    tagline: 'Crisp Pearlescent Canvas & Royal Indigo (Linear Style)',
    mode: 'light',
    colors: {
      primary: '#4f46e5',
      primaryRgb: '79, 70, 229',
      secondary: '#2563eb',
      secondaryRgb: '37, 99, 235',
      accent: '#6366f1',
      bgMain: '#f8fafc',
      bgSurface: '#ffffff',
      bgElevated: '#f1f5f9',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHighlight: 'rgba(79, 70, 229, 0.25)',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#64748b',
      glow: '0 10px 25px -5px rgba(79, 70, 229, 0.15)',
      gradientBrand: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #3b82f6 100%)',
    },
    previewDot: ['#4f46e5', '#2563eb', '#f8fafc']
  },
  {
    id: 'cashmere-light',
    name: 'Cashmere Warm Light',
    category: 'light',
    tagline: 'Warm Neutral Sand & Espresso Bronze',
    mode: 'light',
    colors: {
      primary: '#b45309',
      primaryRgb: '180, 83, 9',
      secondary: '#d97706',
      secondaryRgb: '217, 119, 6',
      accent: '#d97706',
      bgMain: '#fafaf9',
      bgSurface: '#ffffff',
      bgElevated: '#f5f5f4',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHighlight: 'rgba(180, 83, 9, 0.25)',
      textPrimary: '#1c1917',
      textSecondary: '#57534e',
      textMuted: '#78716c',
      glow: '0 10px 25px -5px rgba(180, 83, 9, 0.12)',
      gradientBrand: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    },
    previewDot: ['#b45309', '#d97706', '#fafaf9']
  },
  {
    id: 'sakura-frost',
    name: 'Sakura Frost Light',
    category: 'light',
    tagline: 'Soft Rose Blush & Magenta Petal',
    mode: 'light',
    colors: {
      primary: '#e11d48',
      primaryRgb: '225, 29, 72',
      secondary: '#c026d3',
      secondaryRgb: '192, 38, 211',
      accent: '#f43f5e',
      bgMain: '#fff1f2',
      bgSurface: '#ffffff',
      bgElevated: '#ffe4e6',
      border: 'rgba(225, 29, 72, 0.12)',
      borderHighlight: 'rgba(225, 29, 72, 0.28)',
      textPrimary: '#1f1315',
      textSecondary: '#644349',
      textMuted: '#886268',
      glow: '0 10px 25px -5px rgba(225, 29, 72, 0.12)',
      gradientBrand: 'linear-gradient(135deg, #e11d48 0%, #c026d3 100%)',
    },
    previewDot: ['#e11d48', '#c026d3', '#fff1f2']
  }
];

export const MOTION_SPEEDS = [
  { id: 'instant', label: 'Instant', duration: '0s', ms: 0 },
  { id: 'snappy', label: 'Snappy', duration: '0.18s', ms: 180 },
  { id: 'smooth', label: 'Smooth (Default)', duration: '0.35s', ms: 350 },
  { id: 'fluid', label: 'Fluid', duration: '0.6s', ms: 600 },
  { id: 'cinematic', label: 'Cinematic', duration: '0.9s', ms: 900 }
];

// Helper: Hex to RGB
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '99, 102, 241';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

// Helper: Adjust Hex Brightness
function adjustBrightness(hex, percent) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let num = parseInt(c, 16);
  let r = Math.min(255, Math.max(0, ((num >> 16) & 255) + Math.round(255 * (percent / 100))));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 255) + Math.round(255 * (percent / 100))));
  let b = Math.min(255, Math.max(0, (num & 255) + Math.round(255 * (percent / 100))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('novyra_theme') || 'fintech-indigo';
  });

  const [motionSpeedId, setMotionSpeedId] = useState(() => {
    return localStorage.getItem('novyra_motion_speed') || 'smooth';
  });

  const [ambientMeshEnabled, setAmbientMeshEnabled] = useState(() => {
    const saved = localStorage.getItem('novyra_ambient_mesh');
    return saved !== null ? saved === 'true' : true;
  });

  const [customConfig, setCustomConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('novyra_custom_theme');
      return saved ? JSON.parse(saved) : {
        primary: '#6366f1',
        secondary: '#3b82f6',
        bgMain: '#080c14',
        mode: 'dark',
        glowLevel: 'subtle',
      };
    } catch {
      return {
        primary: '#6366f1',
        secondary: '#3b82f6',
        bgMain: '#080c14',
        mode: 'dark',
        glowLevel: 'subtle'
      };
    }
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Active theme calculation
  const activeTheme = useMemo(() => {
    if (themeId === 'custom') {
      const isLight = customConfig.mode === 'light';
      const pRgb = hexToRgb(customConfig.primary);
      const sRgb = hexToRgb(customConfig.secondary);

      const bgSurface = isLight ? '#ffffff' : adjustBrightness(customConfig.bgMain, 5);
      const bgElevated = isLight ? '#f1f5f9' : adjustBrightness(customConfig.bgMain, 10);

      const glowMap = {
        off: 'none',
        subtle: `0 8px 25px -4px rgba(${pRgb}, 0.2)`,
        vibrant: `0 8px 30px -4px rgba(${pRgb}, 0.35)`,
        neon: `0 0 40px 0px rgba(${pRgb}, 0.5)`
      };

      return {
        id: 'custom',
        name: 'Custom Live Studio',
        tagline: 'Your personalized live color harmony',
        mode: customConfig.mode || 'dark',
        colors: {
          primary: customConfig.primary,
          primaryRgb: pRgb,
          secondary: customConfig.secondary,
          secondaryRgb: sRgb,
          accent: customConfig.secondary,
          bgMain: customConfig.bgMain,
          bgSurface: bgSurface,
          bgElevated: bgElevated,
          border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
          borderHighlight: `rgba(${pRgb}, 0.35)`,
          textPrimary: isLight ? '#0f172a' : '#f8fafc',
          textSecondary: isLight ? '#475569' : '#94a3b8',
          textMuted: isLight ? '#64748b' : '#64748b',
          glow: glowMap[customConfig.glowLevel || 'subtle'],
          gradientBrand: `linear-gradient(135deg, ${customConfig.primary} 0%, ${customConfig.secondary} 100%)`,
        },
        previewDot: [customConfig.primary, customConfig.secondary, customConfig.bgMain]
      };
    }

    const found = THEME_PRESETS.find(p => p.id === themeId);
    return found || THEME_PRESETS[0];
  }, [themeId, customConfig]);

  // Inject CSS Variables and Motion Settings to Root DOM
  useEffect(() => {
    localStorage.setItem('novyra_theme', themeId);
    localStorage.setItem('novyra_motion_speed', motionSpeedId);
    localStorage.setItem('novyra_ambient_mesh', String(ambientMeshEnabled));

    if (themeId === 'custom') {
      localStorage.setItem('novyra_custom_theme', JSON.stringify(customConfig));
    }

    const root = document.documentElement;
    const { colors, mode, id } = activeTheme;

    // Set dataset attributes
    root.setAttribute('data-theme', id);
    root.setAttribute('data-theme-mode', mode);

    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Set Motion Speed CSS Variable
    const speedObj = MOTION_SPEEDS.find(s => s.id === motionSpeedId) || MOTION_SPEEDS[2];
    root.style.setProperty('--theme-transition-duration', speedObj.duration);

    // Apply Live CSS Variables
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-rgb', colors.primaryRgb);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-secondary-rgb', colors.secondaryRgb);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-bg-main', colors.bgMain);
    root.style.setProperty('--theme-bg-surface', colors.bgSurface);
    root.style.setProperty('--theme-bg-elevated', colors.bgElevated);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-border-highlight', colors.borderHighlight);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-glow', colors.glow);
    root.style.setProperty('--theme-gradient-brand', colors.gradientBrand);

    // Also update legacy tailwind base variables for backwards compatibility
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-accent', colors.secondary);
    root.style.setProperty('--color-bg-dark', colors.bgMain);
    root.style.setProperty('--color-card-dark', colors.bgSurface);
    root.style.setProperty('--color-border-dark', colors.border);

    // Dynamic document body background & text
    document.body.style.backgroundColor = colors.bgMain;
    document.body.style.color = colors.textPrimary;
  }, [activeTheme, themeId, customConfig, motionSpeedId, ambientMeshEnabled]);

  // Random Harmonious Fintech Palette Generator
  const randomizeTheme = useCallback(() => {
    const randomFintechHues = [
      { p: '#6366f1', s: '#3b82f6', bg: '#080c14', name: 'Royal Indigo' },
      { p: '#38bdf8', s: '#06b6d4', bg: '#030712', name: 'Midnight Sapphire' },
      { p: '#10b981', s: '#059669', bg: '#050e0a', name: 'Prestige Emerald' },
      { p: '#2563eb', s: '#38bdf8', bg: '#050b14', name: 'Oceanic Horizon' },
      { p: '#d97706', s: '#f59e0b', bg: '#0a0a0c', name: 'Platinum Champagne' },
      { p: '#9333ea', s: '#c026d3', bg: '#090712', name: 'Amethyst Luxe' },
      { p: '#e11d48', s: '#f43f5e', bg: '#0f0709', name: 'Crimson Apex' },
      { p: '#ea580c', s: '#e11d48', bg: '#0c080d', name: 'Sunset Horizon' },
      { p: '#06b6d4', s: '#10b981', bg: '#020617', name: 'Cyber Matrix' },
      { p: '#4f46e5', s: '#2563eb', bg: '#f8fafc', mode: 'light', name: 'Swiss Linear Light' }
    ];

    const pick = randomFintechHues[Math.floor(Math.random() * randomFintechHues.length)];
    const newConfig = {
      primary: pick.p,
      secondary: pick.s,
      bgMain: pick.bg,
      mode: pick.mode || 'dark',
      glowLevel: 'subtle'
    };

    setCustomConfig(newConfig);
    setThemeId('custom');
  }, []);

  const resetTheme = useCallback(() => {
    setThemeId('fintech-indigo');
    setMotionSpeedId('smooth');
    setAmbientMeshEnabled(true);
    setCustomConfig({
      primary: '#6366f1',
      secondary: '#3b82f6',
      bgMain: '#080c14',
      mode: 'dark',
      glowLevel: 'subtle'
    });
  }, []);

  const updateCustomConfig = useCallback((updates) => {
    setCustomConfig(prev => ({ ...prev, ...updates }));
    setThemeId('custom');
  }, []);

  const value = useMemo(() => ({
    theme: activeTheme,
    themeId,
    setTheme: setThemeId,
    customConfig,
    setCustomConfig: updateCustomConfig,
    motionSpeedId,
    setMotionSpeedId,
    motionSpeeds: MOTION_SPEEDS,
    ambientMeshEnabled,
    setAmbientMeshEnabled,
    randomizeTheme,
    resetTheme,
    presets: THEME_PRESETS,
    isStudioOpen,
    setIsStudioOpen,
    isDark: activeTheme.mode === 'dark'
  }), [
    activeTheme, 
    themeId, 
    customConfig, 
    updateCustomConfig, 
    motionSpeedId, 
    ambientMeshEnabled, 
    randomizeTheme, 
    resetTheme, 
    isStudioOpen
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {/* Dynamic Ambient Aurora Background Mesh */}
      {ambientMeshEnabled && (
        <div className="theme-ambient-mesh" aria-hidden="true">
          <div className="orb-1" />
          <div className="orb-2" />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
