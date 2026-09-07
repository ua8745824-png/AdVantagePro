import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  X, Sparkles, Check, Palette, Sliders, Shuffle, 
  RotateCcw, Copy, Sun, Moon, Zap, Layers, Eye, Gauge, 
  Flame, CheckCircle2, TrendingUp, Award, Sparkle, ArrowRight
} from 'lucide-react';

const QUICK_COLORS = [
  '#6366f1', '#3b82f6', '#4f46e5', '#0284c7', 
  '#10b981', '#059669', '#d97706', '#9333ea', 
  '#e11d48', '#ea580c', '#06b6d4', '#c026d3'
];

const BG_PRESETS_DARK = [
  { label: 'Deep Slate', hex: '#080c14' },
  { label: 'Obsidian Noir', hex: '#030712' },
  { label: 'Midnight Marine', hex: '#050b14' },
  { label: 'Forest Noir', hex: '#050e0a' },
  { label: 'Matte Onyx', hex: '#0a0a0c' },
  { label: 'Imperial Plum', hex: '#090712' },
  { label: 'Crimson Slate', hex: '#0f0709' },
  { label: 'Twilight Charcoal', hex: '#0c080d' },
];

const BG_PRESETS_LIGHT = [
  { label: 'Swiss Pearl', hex: '#f8fafc' },
  { label: 'Pure White', hex: '#ffffff' },
  { label: 'Cashmere Sand', hex: '#fafaf9' },
  { label: 'Sakura Blush', hex: '#fff1f2' },
  { label: 'Soft Slate', hex: '#f1f5f9' },
];

const LiveThemeCustomizer = () => {
  const { 
    theme, 
    themeId, 
    setTheme, 
    customConfig, 
    setCustomConfig, 
    motionSpeedId,
    setMotionSpeedId,
    motionSpeeds,
    ambientMeshEnabled,
    setAmbientMeshEnabled,
    randomizeTheme, 
    resetTheme, 
    presets, 
    isStudioOpen, 
    setIsStudioOpen,
    isDark
  } = useTheme();

  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom' | 'motion'
  const [presetCategory, setPresetCategory] = useState('all'); // 'all' | 'fintech' | 'luxury' | 'light'
  const [copied, setCopied] = useState(false);
  const [sandboxCount, setSandboxCount] = useState(500);

  if (!isStudioOpen) return null;

  const handleCopyConfig = () => {
    const payload = {
      theme: theme.name,
      id: theme.id,
      colors: theme.colors,
      motionSpeed: motionSpeedId,
      ambientMesh: ambientMeshEnabled
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPresets = presets.filter(p => {
    if (presetCategory === 'all') return true;
    return p.category === presetCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-scale-up"
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'var(--theme-border-highlight)',
          boxShadow: 'var(--theme-glow)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-5 border-b shrink-0"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
              style={{ background: 'var(--theme-gradient-brand)' }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-heading text-slate-100">
                  Live Theme & Motion Studio
                </h2>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                    color: 'var(--theme-primary)'
                  }}
                >
                  Zero Reload
                </span>
              </div>
              <p className="text-xs mt-0.5 text-slate-400">
                Active: <span className="font-bold text-slate-200" style={{ color: 'var(--theme-primary)' }}>{theme.name}</span> • Transitions: <span className="font-semibold text-slate-300">{motionSpeeds.find(s => s.id === motionSpeedId)?.label}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStudioOpen(false)}
            className="p-2 rounded-xl border hover:scale-105 transition-all text-slate-400 hover:text-white"
            style={{ 
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-bg-elevated)'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex flex-wrap items-center gap-2 px-6 pt-4 border-b pb-3 shrink-0"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presets'
                ? 'shadow-md text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'presets' ? 'var(--theme-gradient-brand)' : 'var(--theme-bg-elevated)',
              boxShadow: activeTab === 'presets' ? 'var(--theme-glow)' : 'none'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Presets ({presets.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('custom');
              if (themeId !== 'custom') setTheme('custom');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'shadow-md text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'custom' ? 'var(--theme-gradient-brand)' : 'var(--theme-bg-elevated)',
              boxShadow: activeTab === 'custom' ? 'var(--theme-glow)' : 'none'
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Palette Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('motion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'motion'
                ? 'shadow-md text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'motion' ? 'var(--theme-gradient-brand)' : 'var(--theme-bg-elevated)',
              boxShadow: activeTab === 'motion' ? 'var(--theme-glow)' : 'none'
            }}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Transitions & Motion</span>
          </button>

          {/* Quick Randomize & Reset */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={randomizeTheme}
              title="Generate Harmonious Palette"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border hover:scale-105 active:scale-95 transition-all text-slate-200"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-elevated)'
              }}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Surprise 🎲</span>
            </button>

            <button
              onClick={resetTheme}
              title="Reset to Default"
              className="p-1.5 rounded-xl border hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-white"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-elevated)'
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MASTER PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Themes' },
                  { id: 'fintech', label: '💎 Fintech & Dark' },
                  { id: 'luxury', label: '👑 Luxury & Cyber' },
                  { id: 'light', label: '☀️ Light & Pearlescent' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPresetCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      presetCategory === cat.id
                        ? 'text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={{
                      background: presetCategory === cat.id ? 'var(--theme-gradient-brand)' : 'var(--theme-bg-elevated)',
                      border: '1px solid var(--theme-border)'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresets.map((preset) => {
                  const isSelected = themeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setTheme(preset.id)}
                      className="relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] group"
                      style={{
                        backgroundColor: preset.colors.bgSurface,
                        borderColor: isSelected ? preset.colors.primary : preset.colors.border,
                        boxShadow: isSelected ? `0 0 24px -4px ${preset.colors.primary}60` : 'none'
                      }}
                    >
                      {/* Swatch Pill Preview */}
                      <div 
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center p-1.5 gap-1 shrink-0 shadow-md border"
                        style={{
                          backgroundColor: preset.colors.bgMain,
                          borderColor: preset.colors.border
                        }}
                      >
                        <div className="flex gap-1">
                          <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: preset.colors.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: preset.colors.secondary }} />
                        </div>
                        <div 
                          className="w-8 h-1.5 rounded-full" 
                          style={{ background: preset.colors.gradientBrand }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 
                            className="font-heading font-black text-sm truncate"
                            style={{ color: preset.colors.textPrimary }}
                          >
                            {preset.name}
                          </h4>
                          <span 
                            className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0"
                            style={{
                              backgroundColor: preset.mode === 'dark' ? '#00000080' : '#ffffff80',
                              color: preset.colors.primary
                            }}
                          >
                            {preset.mode === 'dark' ? '🌙' : '☀️'}
                          </span>
                        </div>
                        <p 
                          className="text-[11px] mt-0.5 line-clamp-2"
                          style={{ color: preset.colors.textSecondary }}
                        >
                          {preset.tagline}
                        </p>
                      </div>

                      {/* Active Checkmark Badge */}
                      {isSelected && (
                        <div 
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg animate-scale-up"
                          style={{ backgroundColor: preset.colors.primary }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM COLOR STUDIO */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* 1. Mode & Background Tone */}
              <div 
                className="p-5 rounded-2xl border space-y-4"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Base Canvas & Lighting Mode
                  </h4>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl border" style={{ borderColor: 'var(--theme-border)' }}>
                    <button
                      onClick={() => setCustomConfig({ mode: 'dark', bgMain: '#080c14' })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        customConfig.mode === 'dark' ? 'text-white' : 'text-slate-400'
                      }`}
                      style={{
                        background: customConfig.mode === 'dark' ? 'var(--theme-gradient-brand)' : 'transparent'
                      }}
                    >
                      <Moon className="w-3 h-3" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => setCustomConfig({ mode: 'light', bgMain: '#f8fafc' })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        customConfig.mode === 'light' ? 'text-white' : 'text-slate-400'
                      }`}
                      style={{
                        background: customConfig.mode === 'light' ? 'var(--theme-gradient-brand)' : 'transparent'
                      }}
                    >
                      <Sun className="w-3 h-3" />
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(customConfig.mode === 'light' ? BG_PRESETS_LIGHT : BG_PRESETS_DARK).map((bg) => (
                    <button
                      key={bg.hex}
                      onClick={() => setCustomConfig({ bgMain: bg.hex })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        customConfig.bgMain === bg.hex ? 'ring-2 font-bold' : 'hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: bg.hex,
                        borderColor: 'var(--theme-border)',
                        color: customConfig.mode === 'light' ? '#0f172a' : '#ffffff',
                        ringColor: 'var(--theme-primary)'
                      }}
                    >
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: bg.hex }} />
                      <span>{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Primary Color Picker */}
              <div 
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Primary Brand Highlight
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={customConfig.primary}
                      onChange={(e) => setCustomConfig({ primary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg border uppercase" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-primary)' }}>
                      {customConfig.primary}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCustomConfig({ primary: c })}
                      className="w-8 h-8 rounded-xl shadow-md transition-transform hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: c,
                        boxShadow: customConfig.primary === c ? `0 0 12px ${c}` : 'none'
                      }}
                    >
                      {customConfig.primary === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Secondary / Accent Color Picker */}
              <div 
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Secondary / Gradient Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={customConfig.secondary}
                      onChange={(e) => setCustomConfig({ secondary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg border uppercase" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-secondary)' }}>
                      {customConfig.secondary}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCustomConfig({ secondary: c })}
                      className="w-8 h-8 rounded-xl shadow-md transition-transform hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: c,
                        boxShadow: customConfig.secondary === c ? `0 0 12px ${c}` : 'none'
                      }}
                    >
                      {customConfig.secondary === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Glow Intensity */}
              <div 
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Glow & Atmospheric Aura
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['off', 'subtle', 'vibrant', 'neon'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCustomConfig({ glowLevel: lvl })}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                        (customConfig.glowLevel || 'subtle') === lvl
                          ? 'shadow-md text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      style={{
                        background: (customConfig.glowLevel || 'subtle') === lvl ? 'var(--theme-gradient-brand)' : 'var(--theme-bg-surface)',
                        borderColor: 'var(--theme-border)'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSITIONS & MOTION */}
          {activeTab === 'motion' && (
            <div className="space-y-6">
              {/* Transition Speed Options */}
              <div 
                className="p-5 rounded-2xl border space-y-4"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Theme Transition Speed
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Control how fast colors, cards, and text morph when switching themes.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {motionSpeeds.map((spd) => {
                    const isSelected = motionSpeedId === spd.id;
                    return (
                      <button
                        key={spd.id}
                        onClick={() => setMotionSpeedId(spd.id)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected ? 'shadow-md text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                        style={{
                          background: isSelected ? 'var(--theme-gradient-brand)' : 'var(--theme-bg-surface)',
                          borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                          boxShadow: isSelected ? 'var(--theme-glow)' : 'none'
                        }}
                      >
                        <p className="text-xs font-bold">{spd.label}</p>
                        <p className="text-[10px] opacity-75 font-mono mt-0.5">{spd.duration}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambient Aurora Mesh Toggle */}
              <div 
                className="p-5 rounded-2xl border flex items-center justify-between gap-4"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Ambient Aurora Background Mesh
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Renders dynamic glowing ambient spheres in the background that smoothly sync with your active palette.
                  </p>
                </div>

                <button
                  onClick={() => setAmbientMeshEnabled(!ambientMeshEnabled)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shrink-0 ${
                    ambientMeshEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                  style={{
                    backgroundColor: ambientMeshEnabled ? 'var(--theme-primary)' : undefined
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      ambientMeshEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* SHARED LIVE INTERACTIVE SANDBOX PREVIEW */}
          <div 
            className="p-6 rounded-3xl border space-y-4 shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border-highlight)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <div 
              className="absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: 'var(--theme-gradient-brand)' }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Real-Time Component Sandbox
                </span>
              </div>
              <span 
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold" 
                style={{ 
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)', 
                  color: 'var(--theme-primary)' 
                }}
              >
                Live Dynamic Feed
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <h3 className="font-heading font-black text-xl text-slate-100">
                  Next-Gen <span className="text-gradient-brand">Novyra Platform</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Watch verified sponsored tasks, complete instant proofs, and receive rewards directly into your account with live customizable styling.
                </p>
              </div>

              {/* Live Metric Simulation */}
              <div 
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: 'var(--theme-bg-main)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Live Reward Counter</p>
                  <p className="text-2xl font-black font-heading text-emerald-400">
                    +{sandboxCount.toLocaleString()} PKR
                  </p>
                </div>
                <button
                  onClick={() => setSandboxCount(c => c + 25)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'var(--theme-gradient-brand)',
                    boxShadow: 'var(--theme-glow)'
                  }}
                >
                  Simulate Claim
                </button>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
              <button 
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--theme-gradient-brand)',
                  boxShadow: 'var(--theme-glow)'
                }}
              >
                Primary Brand Action
              </button>
              <button 
                className="px-4 py-2.5 rounded-xl font-bold text-xs border transition-all hover:scale-105 active:scale-95"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-elevated)',
                  color: 'var(--theme-text-primary)'
                }}
              >
                Secondary Action
              </button>
              <div 
                className="px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5"
                style={{
                  borderColor: 'var(--theme-border-highlight)',
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)',
                  color: 'var(--theme-primary)'
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant Settlement Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-t shrink-0"
          style={{ 
            borderColor: 'var(--theme-border)',
            backgroundColor: 'var(--theme-bg-surface)'
          }}
        >
          <button
            onClick={handleCopyConfig}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-slate-300 hover:text-white"
            style={{
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-bg-elevated)'
            }}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Configuration!' : 'Copy Theme JSON'}</span>
          </button>

          <button
            onClick={() => setIsStudioOpen(false)}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--theme-gradient-brand)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveThemeCustomizer;
