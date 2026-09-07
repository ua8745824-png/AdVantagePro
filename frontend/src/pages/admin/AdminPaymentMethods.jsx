import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Sliders, Edit, Upload, Check, X, QrCode, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminPaymentMethods = () => {
  const { success, error: toastError } = useToast();

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [editModalMethod, setEditModalMethod] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payment-methods');
      if (res.data?.data) {
        setMethods(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleToggleEnabled = async (m) => {
    try {
      const updated = { ...m, isEnabled: !m.isEnabled };
      const res = await api.put(`/admin/payment-methods/${m.id}`, updated);
      if (res.data?.success) {
        success(`${m.name} ${updated.isEnabled ? 'enabled' : 'disabled'}.`);
        loadMethods();
      }
    } catch (err) {
      toastError('Failed to toggle status.');
    }
  };

  const handleSaveMethod = async (e) => {
    e.preventDefault();
    if (!editModalMethod) return;

    try {
      setSaving(true);
      let finalQrPath = editModalMethod.qrCodePath;

      // Upload QR file if selected
      if (qrFile) {
        const formData = new FormData();
        formData.append('file', qrFile);
        const qrRes = await api.post('/admin/payment-methods/upload-qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (qrRes.data?.data?.qrPath) {
          finalQrPath = qrRes.data.data.qrPath;
        }
      }

      const payload = { ...editModalMethod, qrCodePath: finalQrPath };
      const res = await api.put(`/admin/payment-methods/${editModalMethod.id}`, payload);

      if (res.data?.success) {
        success(`${editModalMethod.name} settings updated!`);
        setEditModalMethod(null);
        setQrFile(null);
        loadMethods();
      } else {
        toastError(res.data?.message || 'Update failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error updating payment method.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Payment Rails & QR Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure Pakistani gateways (Easypaisa, JazzCash, 1Link Bank, USDT TRC20), limits, and merchant QR images.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-white">{m.name}</span>
                <button
                  onClick={() => handleToggleEnabled(m)}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                    m.isEnabled
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  <span>{m.isEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <p>Type: <strong className="text-slate-200">{m.type}</strong></p>
                {m.accountTitle && <p>Title: <strong className="text-white">{m.accountTitle}</strong></p>}
                {m.accountNumber && <p className="font-mono text-[11px] text-amber-300 truncate">Account: {m.accountNumber}</p>}
                <p>Deposit Limits: {Number(m.minDeposit).toLocaleString()} - {Number(m.maxDeposit).toLocaleString()} PKR</p>
                <p>Withdrawal Limits: {Number(m.minWithdrawal).toLocaleString()} - {Number(m.maxWithdrawal).toLocaleString()} PKR</p>
              </div>
            </div>

            <button
              onClick={() => { setEditModalMethod(m); setQrFile(null); }}
              className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Rails & QR Code</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editModalMethod && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                Edit {editModalMethod.name}
              </h3>
              <button onClick={() => setEditModalMethod(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account Title</label>
                <input
                  type="text"
                  value={editModalMethod.accountTitle || ''}
                  onChange={(e) => setEditModalMethod({ ...editModalMethod, accountTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account / IBAN Number</label>
                <input
                  type="text"
                  value={editModalMethod.accountNumber || ''}
                  onChange={(e) => setEditModalMethod({ ...editModalMethod, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Deposit (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.minDeposit}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, minDeposit: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Deposit (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.maxDeposit}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, maxDeposit: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.minWithdrawal}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, minWithdrawal: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.maxWithdrawal}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, maxWithdrawal: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Instructions for Users</label>
                <textarea
                  rows="2"
                  value={editModalMethod.instructions || ''}
                  onChange={(e) => setEditModalMethod({ ...editModalMethod, instructions: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Upload Merchant QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalMethod(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethods;
