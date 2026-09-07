import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Sparkles, Sliders, Shuffle, Check, ChevronUp, Gauge } from 'lucide-react';

const LiveThemeToggle = () => {
  const { 
    theme, 
    themeId, 
    setTheme, 
    presets, 
    setIsStudioOpen, 
    randomizeTheme,
    motionSpeeds,
    motionSpeedId
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Alt + T to toggle Studio
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setIsStudioOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsStudioOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={popoverRef}>
      {/* Quick Switch Popover */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-80 p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl animate-scale-up space-y-3"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border-highlight)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <span className="text-xs font-heading font-black text-slate-100">
                Quick Theme Switcher
              </span>
            </div>
            <button
              onClick={() => randomizeTheme()}
              title="Generate Harmonious Palette"
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border hover:scale-105 active:scale-95 transition-all text-slate-300"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-elevated)'
              }}
            >
              <Shuffle className="w-3 h-3" />
              <span>Surprise 🎲</span>
            </button>
          </div>

          {/* Quick Preset Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {presets.map((preset) => {
              const isSelected = themeId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setTheme(preset.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-semibold transition-all hover:scale-[1.03] ${
                    isSelected ? 'ring-2 font-bold shadow-sm' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: preset.colors.bgSurface,
                    borderColor: isSelected ? preset.colors.primary : preset.colors.border,
                    color: preset.colors.textPrimary,
                    ringColor: preset.colors.primary
                  }}
                >
                  <div className="flex -space-x-1 shrink-0">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm" 
                      style={{ backgroundColor: preset.colors.primary }} 
                    />
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm" 
                      style={{ backgroundColor: preset.colors.secondary }} 
                    />
                  </div>
                  <span className="truncate text-[11px] flex-1">{preset.name.split(' ')[0]}</span>
                  {isSelected && (
                    <Check className="w-3 h-3 shrink-0 stroke-[3]" style={{ color: preset.colors.primary }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Open Full Studio Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsStudioOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'var(--theme-gradient-brand)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open Customizer Studio (Alt+T)</span>
          </button>
        </div>
      )}

      {/* Floating Pill Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Live Themes"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'var(--theme-border-highlight)',
          boxShadow: 'var(--theme-glow)'
        }}
      >
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:rotate-45 duration-300"
          style={{ background: 'var(--theme-gradient-brand)' }}
        >
          <Palette className="w-3.5 h-3.5" />
        </div>
        <span 
          className="text-xs font-black font-heading hidden sm:inline text-slate-100"
        >
          {theme.name.split(' ')[0]}
        </span>
        <ChevronUp 
          className={`w-3.5 h-3.5 transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
    </div>
  );
};

export default LiveThemeToggle;
