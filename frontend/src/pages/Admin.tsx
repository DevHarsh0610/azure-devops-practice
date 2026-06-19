import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout.js';
import { api } from '../utils/api.js';
import { Loader2, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  createdAt: string;
}

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (p: number) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/auth/users?page=${p}&limit=10`);
      setUsers(response.data.data);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve user list. Make sure you have admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user: UserItem) => {
    if (user.role === 'ADMIN') {
      alert('Cannot change status of an admin user.');
      return;
    }

    setUpdatingId(user.id);
    try {
      const response = await api.patch(`/auth/users/${user.id}/status`, {
        isActive: !user.isActive,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: response.data.data.isActive } : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div>
          <h2 className="text-2xl font-bold text-white">Administrative Panel</h2>
          <p className="text-sm text-slate-400 mt-1">Manage platform members, monitor statuses, and administer permissions.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading platform members...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <p className="text-slate-400 font-medium">No users registered on the platform</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-md">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/30 transition-all">
                      <td className="p-4 font-semibold text-white">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === 'ADMIN'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : u.role === 'MANAGER'
                            ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {u.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {u.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleStatusToggle(u)}
                            disabled={updatingId === u.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 ${
                              u.isActive
                                ? 'bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50'
                                : 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50'
                            }`}
                          >
                            {updatingId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                            ) : u.isActive ? (
                              'Suspend User'
                            ) : (
                              'Activate User'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-slate-400 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
