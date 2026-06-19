import React, { useEffect, useState } from 'react';
import { useTaskStore, type Task } from '../store/taskStore.js';
import { Layout } from '../components/Layout.js';
import { Plus, Trash2, Filter, Loader2, User, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api.js';

export const Tasks: React.FC = () => {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Just fetch standard user details if authenticated
      const response = await api.get('/auth/users');
      setUsers(response.data.data);
    } catch (err) {
      // If not admin, the users endpoint might fail. We can handle it gracefully.
      console.log('Could not fetch user list (requires ADMIN).');
    }
  };

  const handleFilterChange = (status: string, prio: string) => {
    setStatusFilter(status);
    setPriorityFilter(prio);

    const filters: any = {};
    if (status) filters.status = status;
    if (prio) filters.priority = prio;

    fetchTasks(filters);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      await createTask(title, description, priority, assigneeId);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssigneeId('');
      setShowCreateModal(false);
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      await updateTask(task.id, { status: newStatus as any });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const getPriorityBadgeClass = (prio: string) => {
    switch (prio) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Tasks List</h2>
            <p className="text-sm text-slate-400 mt-1">Manage, filter, and track tasks inside your workspace.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-md flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <Filter className="w-4 h-4" />
            Filters:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value, priorityFilter)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => handleFilterChange(statusFilter, e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Tasks List Grid */}
        {loading && tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
            <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-base text-slate-400 font-medium">No tasks found</p>
            <p className="text-xs text-slate-500 mt-1">Try creating a task or changing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 truncate" title={task.title}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  {/* Status Dropdown */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Status</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Completed</option>
                    </select>
                  </div>

                  {/* Assignee / Creator Info */}
                  <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>Creator: {task.creator?.email || 'System'}</span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-violet-500/60" />
                        <span className="text-slate-400">Assignee: {task.assignee.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal Dialog */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Task</h3>
                <p className="text-xs text-slate-400 mt-1">Fill out parameters to register a new task in this workspace.</p>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task summary"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task details and instructions..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignee</label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-violet-500 outline-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-violet-600/20 disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
