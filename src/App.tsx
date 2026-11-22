/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { TopNav } from './components/TopNav';
import { VipPortal } from './components/VipPortal';
import { DriverPortal } from './components/DriverPortal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { RuleEngineExplainerModal } from './components/RuleEngineExplainerModal';
import { translations } from './translations';
import { Shield, Sparkles, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, language, switchRole } = useStore();
  const t = translations[language];

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('vip-home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  // Sync default tab when user switches role
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRoleQuickSwitch = (role: 'VIP' | 'DRIVER' | 'ADMIN') => {
    switchRole(role);
    if (role === 'VIP') setActiveTab('vip-home');
    if (role === 'DRIVER') setActiveTab('driver-status');
    if (role === 'ADMIN') setActiveTab('admin-board');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar adhering to Top Bar Contract */}
      <TopNav
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRuleInfo={() => setRuleModalOpen(true)}
      />

      {/* Role Swimlane Switcher Bar (For Easy Multi-Role Acceptance Testing) */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">RBAC Active View:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {currentUser ? currentUser.role : 'Guest'}
            </span>
            <span className="text-slate-400 hidden md:inline">
              · {currentUser ? currentUser.name : 'Sign in to access desk'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">
              Test Swimlanes:
            </span>
            <button
              onClick={() => handleRoleQuickSwitch('VIP')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                currentUser?.role === 'VIP'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              VIP View
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('DRIVER')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                currentUser?.role === 'DRIVER'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Driver View
            </button>
            <button
              onClick={() => handleRoleQuickSwitch('ADMIN')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Admin View
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto font-bold text-lg">
              VD
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t.auth.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              {t.auth.subtitle}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                {t.nav.login}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* VIP ROLE SCREENS (Home -> Request -> My Trip) */}
            {currentUser.role === 'VIP' && (
              <VipPortal
                activeSubTab={
                  activeTab.startsWith('vip-')
                    ? (activeTab as 'vip-home' | 'vip-request' | 'vip-trip')
                    : 'vip-home'
                }
                onChangeSubTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* DRIVER ROLE SCREENS (Status -> Today's Trip) */}
            {currentUser.role === 'DRIVER' && (
              <DriverPortal
                activeSubTab={
                  activeTab.startsWith('driver-')
                    ? (activeTab as 'driver-status' | 'driver-trip')
                    : 'driver-status'
                }
                onChangeSubTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* ADMIN ROLE SCREENS (Live Board -> Override & Report) */}
            {currentUser.role === 'ADMIN' && (
              <AdminPortal
                activeSubTab={
                  activeTab.startsWith('admin-')
                    ? (activeTab as 'admin-board' | 'admin-report')
                    : 'admin-board'
                }
                onChangeSubTab={(tab) => setActiveTab(tab)}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{t.appTitle}</span>
            <span aria-hidden="true">·</span>
            <span>Phase 1 RBAC System</span>
            <span aria-hidden="true">·</span>
            <span>English & ಕನ್ನಡ</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setRuleModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors underline font-medium"
            >
              Rules Engine Specification
            </button>
            <span className="font-mono-nums text-[11px] text-slate-400">
              Bangalore State Protocol Hub
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <RuleEngineExplainerModal
        isOpen={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
