import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { 
  User, Mail, Phone, Lock, Gift, ShieldCheck, 
  KeyRound, Check, Palette, Sliders, Sparkles 
} from 'lucide-react';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const { 
    theme, 
    themeId, 
    setTheme, 
    presets, 
    setIsStudioOpen, 
    randomizeTheme 
  } = useTheme();

  const [profileData, setProfileData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await api.put('/profile', profileData);
      if (res.data?.success) {
        success('Profile updated successfully!');
        if (refreshUser) refreshUser();
      } else {
        toastError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Profile update error.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toastError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastError('New password and confirmation do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data?.success) {
        success('Password changed successfully! You will need to log in with your new password on other sessions.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toastError(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Account Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account profile details, security credentials, and live appearance themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Account Overview Card (4 cols) */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="text-center space-y-3">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center font-heading font-black text-2xl text-white mx-auto shadow-xl"
              style={{ background: 'var(--theme-gradient-brand)', boxShadow: 'var(--theme-glow)' }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">{user?.fullName}</h3>
              <p className="text-xs font-mono" style={{ color: 'var(--theme-primary)' }}>@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Email:</span>
              <span className="text-white font-medium truncate max-w-[150px]">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Phone:</span>
              <span className="text-white font-mono">{user?.phoneNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Referral Code:</span>
              <span className="text-amber-300 font-mono font-bold">{user?.referralCode}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Member Since:</span>
              <span className="text-slate-300">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Active Theme:</span>
              <span className="font-bold uppercase" style={{ color: 'var(--theme-primary)' }}>{theme.name}</span>
            </div>
          </div>
        </div>

        {/* Right: Profile Editor, Password Form & Live Themes (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Live Themes & Appearance */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    Live Appearance Themes
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Switch between presets or open the studio to build your custom color scheme live.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStudioOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
                style={{ background: 'var(--theme-gradient-brand)', boxShadow: 'var(--theme-glow)' }}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Theme Studio</span>
              </button>
            </div>

            {/* Presets Quick Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {presets.map((preset) => {
                const isSelected = themeId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTheme(preset.id)}
                    className="relative flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: preset.colors.bgSurface,
                      borderColor: isSelected ? preset.colors.primary : preset.colors.border,
                      boxShadow: isSelected ? `0 0 15px -3px ${preset.colors.primary}40` : 'none'
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 gap-1 shrink-0 border"
                      style={{ backgroundColor: preset.colors.bgMain, borderColor: preset.colors.border }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate" style={{ color: preset.colors.textPrimary }}>
                        {preset.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: preset.colors.textSecondary }}>
                        {preset.mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                      </p>
                    </div>

                    {isSelected && (
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                        style={{ backgroundColor: preset.colors.primary }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={randomizeTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:scale-105"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-elevated)',
                  color: 'var(--theme-text-primary)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Surprise Palette 🎲</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStudioOpen(true)}
                className="sm:hidden px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md"
                style={{ background: 'var(--theme-gradient-brand)' }}
              >
                Open Studio
              </button>
            </div>
          </div>

          {/* 2. Edit Profile Form */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
            <h3 className="font-heading font-bold text-base text-white">
              Personal Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number (Easypaisa / JazzCash)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-3 rounded-xl text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                style={{ background: 'var(--theme-gradient-brand)', boxShadow: 'var(--theme-glow)' }}
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* 3. Change Password Form */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-bold text-base text-white">
                Change Account Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
