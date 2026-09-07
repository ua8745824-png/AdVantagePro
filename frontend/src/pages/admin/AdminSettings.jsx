import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, Check, ShieldCheck, Sliders } from 'lucide-react';

const AdminSettings = () => {
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingValues, setEditingValues] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data?.data) {
        setSettings(res.data.data);
        const map = {};
        res.data.data.forEach((s) => {
          map[s.key] = s.value;
        });
        setEditingValues(map);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSetting = async (key) => {
    try {
      setSavingKey(key);
      const val = editingValues[key];
      const res = await api.put(`/admin/settings/${key}`, { value: val });

      if (res.data?.success) {
        success(`Setting '${key}' saved successfully!`);
        loadSettings();
      } else {
        toastError(res.data?.message || 'Failed to save setting.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error saving setting.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Platform Dynamic Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust platform parameters, daily limits, referral revenue shares, and financial thresholds live.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-6">
        <div className="divide-y divide-slate-800/80">
          {settings.map((s) => (
            <div key={s.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300">{s.key}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-bold">
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editingValues[s.key] !== undefined ? editingValues[s.key] : s.value}
                  onChange={(e) => setEditingValues({ ...editingValues, [s.key]: e.target.value })}
                  className="w-48 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 text-right"
                />

                <button
                  onClick={() => handleSaveSetting(s.key)}
                  disabled={savingKey === s.key}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === s.key ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
