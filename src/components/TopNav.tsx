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
  const { currentUser, language, setLanguage, logout, trips, drivers, vehicles } = useStore();
  const t = translations[language];
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdminView = currentRoute.startsWith('/admin') || currentUser?.role === 'ADMIN';
  const isDriverView = currentRoute.startsWith('/driver') || currentUser?.role === 'DRIVER';

  const myDriver = isDriverView
    ? drivers.find((d) => d.id === currentUser?.driverId) ||
      drivers.find((d) => d.phone === currentUser?.phone) ||
      drivers[0]
    : null;
  const myVehicle = myDriver ? vehicles.find((v) => v.id === myDriver.vehicleId) : null;
  const driverInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'CH';

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
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>DPAR Protocol Wing · Official Sign-In</span>
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
              <div className="flex items-center gap-2 pl-1.5 border-l border-slate-200">
                {isDriverView ? (
                  /* Apple Chauffeur Avatar Button */
                  <button
                    onClick={() => {
                      if (onOpenProfile) onOpenProfile();
                      else onNavigate('/driver/profile');
                    }}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 shadow-sm active:scale-95 transition-all group"
                    title="Chauffeur ID Pass & Profile"
                  >
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center ring-2 ring-amber-400/50 shadow-xs shrink-0">
                      <span>{driverInitials}</span>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
                    </div>
                    <div className="text-left hidden xs:block">
                      <span className="text-[11.5px] font-semibold text-slate-100 block leading-tight group-hover:text-amber-300 transition-colors">
                        {currentUser.name}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-mono tracking-tight block leading-none">
                        {myVehicle?.plateNumber || 'Chauffeur Pass'}
                      </span>
                    </div>
                  </button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
