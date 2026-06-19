import React, { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore.js';
import { useAuthStore } from '../store/authStore.js';
import { Layout } from '../components/Layout.js';
import { CheckCircle2, Circle, Clock, ListTodo, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { stats, fetchStats } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      icon: ListTodo,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'To Do',
      value: stats?.byStatus?.TODO || 0,
      icon: Circle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'In Progress',
      value: stats?.byStatus?.IN_PROGRESS || 0,
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Completed',
      value: stats?.byStatus?.DONE || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-800/20 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user?.email}!</h2>
            <p className="text-sm text-slate-400 mt-1">Here is a quick overview of your workspace today.</p>
          </div>
          <Link
            to="/tasks"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-violet-600/20 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Manage Tasks
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-slate-900/50 border ${card.borderColor} backdrop-blur-md flex items-center justify-between transition-all hover:scale-[1.02]`}
            >
              <div className="space-y-1">
                <p className="text-sm text-slate-400 font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Highlighted info & charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority breakdown card */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4">Priority Breakdown</h3>
            <div className="space-y-4">
              {['HIGH', 'MEDIUM', 'LOW'].map((prio) => {
                const count = stats?.byPriority?.[prio as keyof typeof stats.byPriority] || 0;
                const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                const colors = {
                  HIGH: 'bg-red-500 text-red-400 border-red-500/20',
                  MEDIUM: 'bg-amber-500 text-amber-400 border-amber-500/20',
                  LOW: 'bg-emerald-500 text-emerald-400 border-emerald-500/20',
                };
                return (
                  <div key={prio} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-300">{prio}</span>
                      <span className="text-slate-400">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[prio as keyof typeof colors].split(' ')[0]}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick task action card */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Need to do something?</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Create new tasks, assign them to team members, set priorities, and keep track of status updates. Everything integrates with our automated pipelines.
              </p>
            </div>
            <Link
              to="/tasks"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 hover:bg-violet-950/10 text-slate-300 hover:text-white transition-all group"
            >
              <span className="text-sm font-semibold">Go to Tasks list</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};
