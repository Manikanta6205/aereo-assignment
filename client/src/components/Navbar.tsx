import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Award,
  PlusCircle,
  LayoutDashboard,
  History,
  Settings,
  FileText,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: health, isSuccess } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10000,
  });

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/generate', label: 'Generate', icon: PlusCircle },
    { to: '/jobs', label: 'Jobs', icon: History },
    { to: '/certificates', label: 'Library', icon: Award },
    { to: '/template', label: 'Template', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-600/30 group-hover:bg-indigo-700 transition-colors">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-bold text-slate-900 tracking-tight font-display">
                  CertiFlow
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 -mt-0.5">
                Certificate Generation Platform
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Side: Health Status + Primary CTA */}
          <div className="flex items-center gap-2.5">
            {/* System status pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSuccess ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isSuccess ? 'Backend API Live' : 'Connecting...'}</span>
            </div>

            <NavLink
              to="/generate"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Batch</span>
            </NavLink>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSuccess ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              {isSuccess ? 'API Server Online' : 'Connecting...'}
            </span>
            <span className="font-mono text-[10px]">FastAPI + Redis</span>
          </div>
        </div>
      )}
    </header>
  );
};
