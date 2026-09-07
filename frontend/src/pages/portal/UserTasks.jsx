import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  PlayCircle, Clock, Award, CheckCircle2, 
  X, Sparkles, Loader2 
} from 'lucide-react';

const UserTasks = () => {
  const { refreshSummary } = useOutletContext() || {};
  const { success, error: toastError } = useToast();
  const { theme } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Active Task Session State
  const [activeSession, setActiveSession] = useState(null);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerProgress, setTimerProgress] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccessData, setClaimSuccessData] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?category=${category}`);
      if (res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [category]);

  // Handle Starting a Task Session
  const handleStartTask = async (taskId) => {
    try {
      setSessionStarting(true);
      const res = await api.post(`/tasks/${taskId}/start-session`);
      if (res.data?.success && res.data?.data) {
        const session = res.data.data;
        setActiveSession(session);
        setTimerSecondsLeft(session.requiredDurationSeconds);
        setTimerProgress(0);
        setCanClaim(false);
        setClaimSuccessData(null);
      } else {
        toastError(res.data?.message || 'Could not start task session.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Task is currently unavailable.');
    } finally {
      setSessionStarting(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!activeSession || timerSecondsLeft <= 0 || canClaim) return;

    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClaim(true);
          setTimerProgress(100);
          return 0;
        }
        const total = activeSession.requiredDurationSeconds;
        const remaining = prev - 1;
        setTimerProgress(Math.round(((total - remaining) / total) * 100));
        return remaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, timerSecondsLeft, canClaim]);

  // Complete Session & Claim Reward
  const handleClaimReward = async () => {
    if (!activeSession || !canClaim || claiming) return;

    try {
      setClaiming(true);
      const res = await api.post('/tasks/complete-session', {
        sessionNonce: activeSession.SessionNonce || activeSession.sessionNonce
      });

      if (res.data?.success && res.data?.data) {
        setClaimSuccessData(res.data.data);
        success(`🎉 Reward of ${res.data.data.rewardAmount} PKR claimed successfully!`);
        fetchTasks();
        if (refreshSummary) refreshSummary();
      } else {
        toastError(res.data?.message || 'Claim failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to claim reward.');
    } finally {
      setClaiming(false);
    }
  };

  const closeTaskModal = () => {
    setActiveSession(null);
    setClaimSuccessData(null);
    setCanClaim(false);
    setTimerSecondsLeft(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl" style={{ color: 'var(--theme-text-primary)' }}>
            Watch & Earn Tasks
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
            Complete designated watch duration on sponsored campaigns to receive instant PKR wallet credits.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div 
          className="flex items-center gap-1.5 p-1 rounded-xl border"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          {['All', 'Video', 'Survey', 'Interaction'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                category === cat
                  ? 'text-white shadow-md'
                  : 'hover:opacity-80'
              }`}
              style={{
                background: category === cat ? 'var(--theme-gradient-brand)' : 'transparent',
                color: category === cat ? '#ffffff' : 'var(--theme-text-secondary)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div 
              key={n} 
              className="p-6 rounded-3xl border h-64 animate-pulse" 
              style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
            />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--theme-bg-surface)',
                borderColor: task.canStart ? 'var(--theme-border)' : 'transparent',
                opacity: task.canStart ? 1 : 0.65
              }}
            >
              <div className="space-y-4">
                {/* Badge Row */}
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                      borderColor: 'var(--theme-border-highlight)',
                      color: 'var(--theme-primary)'
                    }}
                  >
                    {task.category}
                  </span>
                  <div 
                    className="flex items-center gap-1.5 text-xs font-black font-heading"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    <Award className="w-4 h-4" />
                    <span>+{Number(task.reward).toFixed(2)} PKR</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-heading font-bold text-base line-clamp-2" style={{ color: 'var(--theme-text-primary)' }}>
                    {task.title}
                  </h3>
                  <p className="text-xs mt-2 line-clamp-3 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                    {task.description}
                  </p>
                </div>

                {/* Duration & Daily Limit */}
                <div 
                  className="pt-2 flex items-center justify-between text-xs border-t"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
                    <span>{task.requiredDurationSeconds} seconds</span>
                  </div>
                  <div className="text-[11px] font-medium">
                    {task.todayCompletedCount}/{task.dailyLimitPerUser} done today
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {task.canStart ? (
                  <button
                    onClick={() => handleStartTask(task.id)}
                    disabled={sessionStarting}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'var(--theme-gradient-brand)',
                      boxShadow: 'var(--theme-glow)'
                    }}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Watch & Earn</span>
                  </button>
                ) : (
                  <div 
                    className="w-full py-2.5 rounded-xl border text-center text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--theme-bg-elevated)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-muted)'
                    }}
                  >
                    {task.statusMessage || 'Limit Reached'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="p-12 text-center rounded-3xl border space-y-2"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <PlayCircle className="w-10 h-10 mx-auto" style={{ color: 'var(--theme-text-muted)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>No active tasks in this category</p>
          <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Check back shortly as new sponsor campaigns go live throughout the day.</p>
        </div>
      )}

      {/* 2. Interactive Task Player Modal */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div 
            className="w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
            style={{
              backgroundColor: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border-highlight)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                    color: 'var(--theme-primary)'
                  }}
                >
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm truncate max-w-md" style={{ color: 'var(--theme-text-primary)' }}>
                    {activeSession.title}
                  </h3>
                  <p className="text-[11px] font-bold" style={{ color: 'var(--theme-primary)' }}>
                    Reward: +{Number(activeSession.reward).toFixed(2)} PKR
                  </p>
                </div>
              </div>

              {!claimSuccessData && (
                <button
                  onClick={closeTaskModal}
                  className="p-1.5 rounded-lg border hover:scale-105 transition-all"
                  style={{
                    borderColor: 'var(--theme-border)',
                    backgroundColor: 'var(--theme-bg-elevated)',
                    color: 'var(--theme-text-secondary)'
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {claimSuccessData ? (
                /* Celebration View */
                <div className="py-8 text-center space-y-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-xl"
                    style={{
                      backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                      color: 'var(--theme-primary)',
                      boxShadow: 'var(--theme-glow)'
                    }}
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-heading font-black text-2xl" style={{ color: 'var(--theme-text-primary)' }}>
                    Reward Credited!
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>+{claimSuccessData.rewardAmount} PKR</span> has been added to your available balance.
                  </p>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    New Balance: {Number(claimSuccessData.newAvailableBalance).toFixed(2)} PKR
                  </p>
                  <button
                    onClick={closeTaskModal}
                    className="px-8 py-3 rounded-xl text-white text-xs font-bold transition-all mt-4 hover:scale-105"
                    style={{
                      background: 'var(--theme-gradient-brand)',
                      boxShadow: 'var(--theme-glow)'
                    }}
                  >
                    Done & Return to Tasks
                  </button>
                </div>
              ) : (
                /* Active Task View */
                <>
                  <div 
                    className="relative aspect-video rounded-2xl border overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--theme-bg-elevated)',
                      borderColor: 'var(--theme-border)'
                    }}
                  >
                    {activeSession.videoUrl ? (
                      <iframe
                        src={activeSession.videoUrl}
                        title="Sponsored Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto" style={{ color: 'var(--theme-primary)' }} />
                        <p className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>Sponsored Interactive Campaign</p>
                        <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Keep this session active until the duration completes.</p>
                      </div>
                    )}
                  </div>

                  {/* Countdown Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span style={{ color: 'var(--theme-text-secondary)' }}>
                        {canClaim ? 'Duration Completed!' : `Watching: ${timerSecondsLeft}s remaining`}
                      </span>
                      <span style={{ color: 'var(--theme-primary)' }}>{timerProgress}%</span>
                    </div>

                    <div 
                      className="w-full h-3 rounded-full overflow-hidden border"
                      style={{
                        backgroundColor: 'var(--theme-bg-elevated)',
                        borderColor: 'var(--theme-border)'
                      }}
                    >
                      <div
                        className="h-full transition-all duration-1000 ease-linear rounded-full"
                        style={{
                          width: `${timerProgress}%`,
                          background: 'var(--theme-gradient-brand)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div>
                    {canClaim ? (
                      <button
                        onClick={handleClaimReward}
                        disabled={claiming}
                        className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        style={{
                          background: 'var(--theme-gradient-brand)',
                          boxShadow: 'var(--theme-glow)'
                        }}
                      >
                        {claiming ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Claim {Number(activeSession.reward).toFixed(2)} PKR Reward</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div 
                        className="w-full py-3.5 rounded-xl border text-center text-xs font-semibold flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: 'var(--theme-bg-elevated)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text-muted)'
                        }}
                      >
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Please watch for {timerSecondsLeft} more seconds to claim reward</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasks;
