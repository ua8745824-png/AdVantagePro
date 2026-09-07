import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CheckSquare, Plus, Edit, Clock, Award, PlayCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminTasks = () => {
  const { success, error: toastError } = useToast();

  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    campaignId: '',
    title: '',
    description: '',
    category: 'Video',
    videoUrl: '',
    reward: 15.00,
    requiredDurationSeconds: 30,
    dailyLimitPerUser: 1,
    totalCompletionLimit: 1000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, campRes] = await Promise.all([
        api.get(`/admin/tasks?page=${page}&pageSize=10`),
        api.get('/admin/campaigns?page=1&pageSize=50')
      ]);

      if (tasksRes.data?.data) {
        setTasks(tasksRes.data.data.items || []);
        setTotalPages(tasksRes.data.data.totalPages || 1);
      }

      if (campRes.data?.data?.items) {
        setCampaigns(campRes.data.data.items);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      campaignId: campaigns.length > 0 ? campaigns[0].id : '',
      title: '',
      description: '',
      category: 'Video',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      reward: 15.00,
      requiredDurationSeconds: 30,
      dailyLimitPerUser: 1,
      totalCompletionLimit: 1000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setIsEditing(true);
    setEditingId(t.id);
    setFormData({
      campaignId: t.campaignId,
      title: t.title,
      description: t.description,
      category: t.category,
      videoUrl: t.videoUrl || '',
      reward: t.reward,
      requiredDurationSeconds: t.requiredDurationSeconds,
      dailyLimitPerUser: t.dailyLimitPerUser,
      totalCompletionLimit: t.totalCompletionLimit,
      startDate: t.startDate ? t.startDate.split('T')[0] : '',
      endDate: t.endDate ? t.endDate.split('T')[0] : '',
      isActive: t.isActive
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEditing) {
        const res = await api.put(`/admin/tasks/${editingId}`, formData);
        if (res.data?.success) {
          success('Task updated successfully!');
          setModalOpen(false);
          loadData();
        } else {
          toastError(res.data?.message || 'Update failed.');
        }
      } else {
        const res = await api.post('/admin/tasks', formData);
        if (res.data?.success) {
          success('Task created successfully!');
          setModalOpen(false);
          loadData();
        } else {
          toastError(res.data?.message || 'Creation failed.');
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error saving task.');
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
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, configure watch timers, rewards, and manage sponsored tasks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Sponsored Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Task Title & Campaign</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3 text-right">Reward</th>
                <th className="pb-3 px-3 text-center">Duration</th>
                <th className="pb-3 px-3 text-center">Daily Limit</th>
                <th className="pb-3 px-3 text-right">Completions</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white text-sm">{t.title}</p>
                      <p className="text-[10px] text-amber-300 font-medium">Campaign: {t.campaignName}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-bold">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400 font-heading">
                      {Number(t.reward).toFixed(2)} PKR
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                      {t.requiredDurationSeconds}s
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">
                      {t.dailyLimitPerUser}/day
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-300 font-mono">
                      {t.currentCompletionCount}/{t.totalCompletionLimit}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      }`}>
                        {t.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    No tasks created yet.
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
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                {isEditing ? 'Edit Sponsored Task' : 'Create Sponsored Task'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Campaign</label>
                <select
                  required
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: parseInt(e.target.value, 10) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.campaignName} ({c.advertiserName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Watch: 2026 Brand Campaign Spotlight"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  required
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Video Embed URL</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Reward (PKR)</label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="any"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Required Watch Duration (Sec)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="600"
                    value={formData.requiredDurationSeconds}
                    onChange={(e) => setFormData({ ...formData, requiredDurationSeconds: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Daily Limit / User</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={formData.dailyLimitPerUser}
                    onChange={(e) => setFormData({ ...formData, dailyLimitPerUser: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Total Completion Cap</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalCompletionLimit}
                    onChange={(e) => setFormData({ ...formData, totalCompletionLimit: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
