import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { LogOut, LayoutDashboard, CheckSquare, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
              <CheckSquare className="w-6 h-6 text-violet-400" />
              TaskManager Pro
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/tasks"
                className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Tasks
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full pl-3 pr-4 py-1.5">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center border border-violet-500/50 text-violet-300 font-semibold text-sm">
                {user?.email[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">{user?.email}</p>
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider leading-none">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-red-950/30 hover:border-red-900/50 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TaskManager Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};
