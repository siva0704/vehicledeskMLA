import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { Role } from '../types';
import {
  Car,
  Globe,
  LogOut,
  User as UserIcon,
  Shield,
  Clock,
  Compass,
  FileText,
  RotateCcw,
  Sliders,
} from 'lucide-react';

interface TopNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenRuleInfo: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenRuleInfo,
}) => {
  const { currentUser, language, setLanguage, switchRole, logout, resetToDefaultData } =
    useStore();
  const t = translations[language];
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getNavItems = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'VIP':
        return [
          { id: 'vip-home', label: t.nav.vipHome, icon: Compass },
          { id: 'vip-request', label: t.nav.vipRequest, icon: Car },
          { id: 'vip-trip', label: t.nav.vipMyTrip, icon: Clock },
        ];
      case 'DRIVER':
        return [
          { id: 'driver-status', label: t.nav.driverStatus, icon: Sliders },
          { id: 'driver-trip', label: t.nav.driverTrip, icon: Car },
        ];
      case 'ADMIN':
        return [
          { id: 'admin-board', label: t.nav.adminBoard, icon: Compass },
          { id: 'admin-report', label: t.nav.adminReport, icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentUser?.role === 'VIP') onSelectTab('vip-home');
                else if (currentUser?.role === 'DRIVER') onSelectTab('driver-status');
                else if (currentUser?.role === 'ADMIN') onSelectTab('admin-board');
              }}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
                VD
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                {t.appTitle}
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rule Engine Info Button */}
            <button
              onClick={onOpenRuleInfo}
              title="Inspect Rule Engine & RBAC Architecture"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rules Engine</span>
            </button>

            {/* Language Toggle: EN / ಕನ್ನಡ */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  language === 'kn'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Role Switcher (Crucial for Rapid Testing & Demonstration) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-2xs whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Role: {currentUser ? currentUser.role : 'Guest'}</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t.nav.switchRole}
                  </div>
                  {(['VIP', 'DRIVER', 'ADMIN'] as Role[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setShowRoleMenu(false);
                        if (role === 'VIP') onSelectTab('vip-home');
                        if (role === 'DRIVER') onSelectTab('driver-status');
                        if (role === 'ADMIN') onSelectTab('admin-board');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                        currentUser?.role === role
                          ? 'bg-slate-900 text-white font-medium'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>
                        {role === 'VIP' && t.roles.vip}
                        {role === 'DRIVER' && t.roles.driver}
                        {role === 'ADMIN' && t.roles.admin}
                      </span>
                      {currentUser?.role === role && (
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-100"></div>
                  <button
                    onClick={() => {
                      resetToDefaultData();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile / Auth */}
            {currentUser ? (
              <button
                onClick={logout}
                title={t.nav.logout}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {t.nav.login}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Zone */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 border-t border-slate-100 gap-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-slate-900 bg-slate-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
