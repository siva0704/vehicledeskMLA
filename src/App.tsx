/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import { TopNav } from './components/TopNav';
import { GatewayHome } from './components/GatewayHome';
import { AdminLogin } from './components/AdminLogin';
import { DriverLogin } from './components/DriverLogin';
import { AdminPortal } from './components/AdminPortal';
import { DriverPortal } from './components/DriverPortal';
import { RuleEngineExplainerModal } from './components/RuleEngineExplainerModal';
import { translations } from './translations';
import { Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, language } = useStore();
  const t = translations[language];

  // Route state initialized from window.location.hash or pathname
  const [route, setRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) return hash;
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/driver')) return path;
    return '/';
  });

  // Tab states for sub-portals
  const [adminTab, setAdminTab] = useState<'admin-board' | 'admin-report'>('admin-board');
  const [driverTab, setDriverTab] = useState<'driver-status' | 'driver-trip' | 'driver-profile'>('driver-status');
  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') || '/';
      setRoute(hash);
      if (hash === '/driver/profile') {
        setDriverTab('driver-profile');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newRoute: string) => {
    setRoute(newRoute);
    window.location.hash = newRoute;
    if (newRoute === '/driver/profile') {
      setDriverTab('driver-profile');
    }
  };

  // Redirect if logged in user navigates to login
  useEffect(() => {
    if (currentUser?.role === 'ADMIN' && (route === '/admin/login' || route === '/')) {
      navigateTo('/admin/dashboard');
    } else if (currentUser?.role === 'DRIVER' && (route === '/driver/login' || route === '/')) {
      navigateTo('/driver/dashboard');
    }
  }, [currentUser]);

  // Determine active subtab for topnav indicator
  const currentNavTab = route.startsWith('/admin')
    ? adminTab
    : route.startsWith('/driver')
    ? driverTab
    : 'gateway';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar */}
      <TopNav
        currentRoute={route}
        currentTab={currentNavTab}
        onNavigate={navigateTo}
        onSelectTab={(tab) => {
          if (tab.startsWith('admin-')) {
            setAdminTab(tab as 'admin-board' | 'admin-report');
            navigateTo('/admin/dashboard');
          } else if (tab.startsWith('driver-')) {
            setDriverTab(tab as 'driver-status' | 'driver-trip' | 'driver-profile');
            navigateTo('/driver/dashboard');
          }
        }}
        onOpenProfile={() => {
          setDriverTab('driver-profile');
          navigateTo('/driver/dashboard');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Gateway Landing View */}
        {route === '/' && <GatewayHome onNavigate={navigateTo} />}

        {/* 2. Admin Portal Views */}
        {route === '/admin/login' && (
          <AdminLogin
            onSuccess={() => navigateTo('/admin/dashboard')}
            onBack={() => navigateTo('/')}
          />
        )}

        {route === '/admin/dashboard' &&
          (currentUser?.role === 'ADMIN' ? (
            <AdminPortal activeSubTab={adminTab} onChangeSubTab={setAdminTab} />
          ) : (
            <AdminLogin
              onSuccess={() => navigateTo('/admin/dashboard')}
              onBack={() => navigateTo('/')}
            />
          ))}

        {/* 3. Driver Portal Views */}
        {route === '/driver/login' && (
          <DriverLogin
            onSuccess={() => navigateTo('/driver/dashboard')}
            onBack={() => navigateTo('/')}
          />
        )}

        {(route === '/driver/dashboard' || route === '/driver/profile') &&
          (currentUser?.role === 'DRIVER' ? (
            <DriverPortal
              activeSubTab={route === '/driver/profile' ? 'driver-profile' : driverTab}
              onChangeSubTab={(tab) => {
                setDriverTab(tab);
                if (tab === 'driver-profile') {
                  navigateTo('/driver/profile');
                } else {
                  navigateTo('/driver/dashboard');
                }
              }}
            />
          ) : (
            <DriverLogin
              onSuccess={() => navigateTo('/driver/dashboard')}
              onBack={() => navigateTo('/')}
            />
          ))}
      </main>

      {/* Official Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Department of Personnel and Administrative Reforms (DPAR)
            </span>
            <span aria-hidden="true">·</span>
            <span>Government of Karnataka</span>
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
            <span className="font-mono text-[11px] text-slate-400">
              Bangalore State Protocol Hub
            </span>
          </div>
        </div>
      </footer>

      {/* Rule Engine Modal */}
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
