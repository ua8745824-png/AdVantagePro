import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Search, Filter, ShieldCheck, ChevronLeft, ChevronRight, Code } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/audit-logs?page=${page}&pageSize=15&action=${actionFilter}&entityType=${entityFilter}`
      );
      if (res.data?.data) {
        setLogs(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, entityFilter]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          System Audit Logs & Accountability
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Immutable audit trail capturing all administrative approvals, balance adjustments, and setting modifications.
        </p>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Actor Admin</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Target Entity</th>
                <th className="pb-3 px-3">Audit Details / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      @{log.actorUsername || 'System'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="font-bold">{log.entityType}</span> <span className="text-slate-500">#{log.entityId}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 max-w-md">
                      <p>{log.reason}</p>
                      {log.afterDataJson && (
                        <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{log.afterDataJson}</p>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    No audit logs recorded yet.
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
    </div>
  );
};

export default AdminAuditLogs;
