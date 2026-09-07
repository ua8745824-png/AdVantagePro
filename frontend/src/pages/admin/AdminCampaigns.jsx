import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Megaphone, Plus, Edit, Check, X, ChevronLeft, ChevronRight, DollarSign, Calendar } from 'lucide-react';

const AdminCampaigns = () => {
  const { success, error: toastError } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: '',
    advertiserName: '',
    description: '',
    rewardPerCompletion: 15.00,
    platformCommission: 0.00,
    dailyBudget: 5000.00,
    totalBudget: 50000.00,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/campaigns?page=${page}&pageSize=10`);
      if (res.data?.data) {
        setCampaigns(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [page]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      campaignName: '',
      advertiserName: '',
      description: '',
      rewardPerCompletion: 15.00,
      platformCommission: 0.00,
      dailyBudget: 5000.00,
      totalBudget: 50000.00,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Active'
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFormData({
      campaignName: c.campaignName,
      advertiserName: c.advertiserName,
      description: c.description || '',
      rewardPerCompletion: c.rewardPerCompletion,
      platformCommission: c.platformCommission,
      dailyBudget: c.dailyBudget,
      totalBudget: c.totalBudget,
      startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : '',
      status: c.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEditing) {
        const res = await api.put(`/admin/campaigns/${editingId}`, formData);
        if (res.data?.success) {
          success('Campaign updated successfully!');
          setModalOpen(false);
          loadCampaigns();
        } else {
          toastError(res.data?.message || 'Update failed.');
        }
      } else {
        const res = await api.post('/admin/campaigns', formData);
        if (res.data?.success) {
          success('Campaign created successfully!');
          setModalOpen(false);
          loadCampaigns();
        } else {
          toastError(res.data?.message || 'Creation failed.');
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error saving campaign.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Sponsor Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage advertising campaigns, sponsor budgets, and reward allocations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Sponsor Campaign</span>
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Campaign & Sponsor</th>
                <th className="pb-3 px-3 text-right">Reward / View</th>
                <th className="pb-3 px-3 text-right">Total Budget</th>
                <th className="pb-3 px-3 text-right">Spent Budget</th>
                <th className="pb-3 px-3 text-center">Tasks Count</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {campaigns.length > 0 ? (
                campaigns.map((c) => {
                  const percentSpent = Math.min(100, Math.round((c.spentBudget / (c.totalBudget || 1)) * 100));
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white text-sm">{c.campaignName}</p>
                        <p className="text-[10px] text-amber-300 font-medium">Advertiser: {c.advertiserName}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-400 font-heading">
                        {Number(c.rewardPerCompletion).toFixed(2)} PKR
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-white font-heading">
                        {Number(c.totalBudget).toLocaleString()} PKR
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <p className="font-bold text-slate-300 font-heading">
                          {Number(c.spentBudget).toLocaleString()} PKR
                        </p>
                        <div className="w-20 bg-slate-950 h-1.5 rounded-full ml-auto mt-1 overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentSpent}%` }} />
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-300">
                        {c.tasksCount}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No sponsor campaigns created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                {isEditing ? 'Edit Sponsor Campaign' : 'Create Sponsor Campaign'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Brand Awareness 2026"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Advertiser / Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Khaadi Official"
                  value={formData.advertiserName}
                  onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Reward / View (PKR)</label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="any"
                    value={formData.rewardPerCompletion}
                    onChange={(e) => setFormData({ ...formData, rewardPerCompletion: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Total Budget (PKR)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="any"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCampaigns;
