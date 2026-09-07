import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Sparkles, Sliders, Check, ChevronDown, Shuffle } from 'lucide-react';

const LiveThemeSelector = ({ className = '', showLabel = true }) => {
  const { 
    theme, 
    themeId, 
    setTheme, 
    presets, 
    setIsStudioOpen, 
    randomizeTheme 
  } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105"
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'var(--theme-border-highlight)',
          color: 'var(--theme-text-primary)'
        }}
        title="Change Live Theme"
      >
        <span 
          className="w-3 h-3 rounded-full shadow-sm shrink-0" 
          style={{ backgroundColor: 'var(--theme-primary)' }} 
        />
        {showLabel && (
          <span className="truncate max-w-[100px] font-bold">
            {theme.name.split(' ')[0]}
          </span>
        )}
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
          style={{ color: 'var(--theme-text-secondary)' }}
        />
      </button>

      {dropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 p-3 rounded-2xl border shadow-2xl backdrop-blur-2xl z-50 animate-scale-up space-y-2.5"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border-highlight)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>
              Live Theme
            </span>
            <button
              onClick={() => {
                randomizeTheme();
              }}
              title="Surprise Palette"
              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border hover:scale-105"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-elevated)',
                color: 'var(--theme-primary)'
              }}
            >
              <Shuffle className="w-2.5 h-2.5" />
              <span>Surprise</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {presets.map((p) => {
              const isSelected = themeId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setTheme(p.id);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border text-left text-[11px] font-semibold transition-all ${
                    isSelected ? 'ring-1 font-bold' : ''
                  }`}
                  style={{
                    backgroundColor: p.colors.bgElevated,
                    borderColor: isSelected ? p.colors.primary : p.colors.border,
                    color: p.colors.textPrimary
                  }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: p.colors.primary }} 
                  />
                  <span className="truncate flex-1">{p.name.split(' ')[0]}</span>
                  {isSelected && (
                    <Check className="w-2.5 h-2.5 shrink-0 stroke-[3]" style={{ color: p.colors.primary }} />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setDropdownOpen(false);
              setIsStudioOpen(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
            style={{
              background: 'var(--theme-gradient-brand)'
            }}
          >
            <Sliders className="w-3 h-3" />
            <span>Customizer Studio</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveThemeSelector;
