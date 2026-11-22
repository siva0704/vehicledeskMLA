import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import {
  Car,
  Globe,
  LogOut,
  Compass,
  FileText,
  User,
  ExternalLink,
  ChevronDown,
  Smartphone,
} from 'lucide-react';

interface TopNavProps {
  currentRoute: string;
  currentTab: string;
  onNavigate: (route: string) => void;
  onSelectTab: (tab: string) => void;
  onOpenProfile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  currentTab,
  onNavigate,
  onSelectTab,
  onOpenProfile,
}) => {
  const { currentUser, language, setLanguage, logout, trips } = useStore();
  const t = translations[language];
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdminView = currentRoute.startsWith('/admin') || currentUser?.role === 'ADMIN';
  const isDriverView = currentRoute.startsWith('/driver') || currentUser?.role === 'DRIVER';

  const activeTripsCount = trips.filter(
    (tr) => tr.status !== 'COMPLETED' && tr.status !== 'CANCELLED'
  ).length;

  return (
    <header className="sticky top-2 z-50 px-3 sm:px-6 mb-3 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="apple-glass-island rounded-2xl sm:rounded-full px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/[0.08]">
          {/* Brand Emblem & Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/')}
              className="text-left group flex items-center gap-2.5 transition-transform active:scale-95"
              aria-label="Home Gateway"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-xs ring-2 ring-amber-500/40 border border-amber-400/30 bg-slate-900 flex items-center justify-center">
                <img
                  src="/assets/vehicle-desk-emblem.svg"
                  alt="Karnataka State Protocol Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-[13.5px] font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 leading-snug">
                  <span>Karnataka State Protocol</span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-black/5">
                    DPAR
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium leading-none">
                  {isAdminView
                    ? 'Superintendent Fleet Administration'
                    : isDriverView
                    ? 'State Chauffeur Cockpit'
                    : 'VIP & MLA Priority Dispatch Desk'}
                </div>
              </div>
            </button>
          </div>

          {/* Center Apple-style Segmented Navigation (Admin Only) */}
          <nav className="hidden md:flex items-center">
            {isAdminView && currentUser?.role === 'ADMIN' ? (
              <div className="apple-segmented-track">
                <button
                  onClick={() => onSelectTab('admin-board')}
                  className={`apple-segmented-pill flex items-center gap-1.5 ${
                    currentTab === 'admin-board' ? 'apple-segmented-pill-active' : ''
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Live Allotment Board</span>
                  {activeTripsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => onSelectTab('admin-report')}
                  className={`apple-segmented-pill flex items-center gap-1.5 ${
                    currentTab === 'admin-report' ? 'apple-segmented-pill-active' : ''
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Audit &amp; Daily Reports</span>
                </button>
              </div>
            ) : isDriverView && currentUser?.role === 'DRIVER' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Chauffeur Duty</span>
                </div>
              </div>
            ) : (
              <div className="apple-segmented-track">
                <button
                  onClick={() => onNavigate('/admin/login')}
                  className="apple-segmented-pill hover:text-slate-900"
                >
                  Admin Portal
                </button>
                <button
                  onClick={() => onNavigate('/driver/login')}
                  className="apple-segmented-pill hover:text-slate-900"
                >
                  Chauffeur Cockpit
                </button>
              </div>
            )}
          </nav>

          {/* Right Controls & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* For Admin: Show 24/7 Priority Queue Status */}
            {isAdminView && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-[11px] font-semibold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>24/7 Priority Queue Active</span>
              </div>
            )}

            {/* Language Switcher Pill */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/70 transition-all active:scale-95"
              title="Switch language between English & Kannada"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {/* User Profile & Direct Action Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                {isDriverView ? (
                  <button
                    onClick={() => {
                      if (onOpenProfile) onOpenProfile();
                      else onNavigate('/driver/profile');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-xs active:scale-95"
                    title="View Chauffeur Profile"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Profile</span>
                  </button>
                ) : null}

                <div className="hidden sm:block text-right pr-1">
                  <div className="text-[12px] font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-tight font-medium">
                    {currentUser.role}
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    onNavigate('/');
                  }}
                  title="Sign out of system"
                  className="p-1.5 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50/80 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
