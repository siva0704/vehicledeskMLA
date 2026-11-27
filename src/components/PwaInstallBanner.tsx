import React, { useEffect, useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  Check,
  Monitor,
  MoreVertical,
  Laptop,
  Sparkles,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('android');
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('chauffeur_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('chauffeur_pwa_banner_dismissed', 'true');
    } catch {}
  };

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(standalone));

    // Detect platform for default tab
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else if (/android/.test(ua)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    // Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('[PWA] Prompt error, falling back to guide modal:', err);
      }
    }
    // Always open smart guide modal if native prompt cannot run or user needs guide
    setShowModal(true);
  };

  return (
    <>
      {/* Sleek Apple Chauffeur PWA Install Bar */}
      <div className="apple-card p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-700/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                Install Chauffeur Cockpit App (PWA)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Always Logged In
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Add to your device home screen for 1-tap protocol cockpit access &amp; persistent offline login.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleInstallClick}
            className="apple-btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 shadow-md active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Universal Multi-Device Smart Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="apple-card-elevated max-w-md w-full rounded-3xl p-6 space-y-5 text-slate-900 border border-white/20 shadow-2xl bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900">
                    Install Chauffeur Mobile Cockpit
                  </h3>
                  <p className="text-[11px] text-slate-500">Government of Karnataka — DPAR Fleet</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device Platform Segmented Tabs */}
            <div className="apple-segmented-track grid grid-cols-3 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('ios')}
                className={`apple-segmented-pill text-xs py-1.5 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'ios'
                    ? 'bg-white shadow-xs text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🍎 iOS / Safari</span>
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`apple-segmented-pill text-xs py-1.5 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'android'
                    ? 'bg-white shadow-xs text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🤖 Android</span>
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`apple-segmented-pill text-xs py-1.5 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'desktop'
                    ? 'bg-white shadow-xs text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💻 Desktop</span>
              </button>
            </div>

            {/* Platform Guides */}
            {activeTab === 'ios' && (
              <div className="space-y-3 text-xs text-slate-700 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Tap Safari Share Button</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      At the bottom bar in Safari, tap the share icon:
                      <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Select &apos;Add to Home Screen&apos;</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      Scroll down in the action sheet and tap:
                      <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />
                      <span className="font-semibold text-slate-800">Add to Home Screen</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>The official Chauffeur Cockpit app icon will appear on your iPhone screen!</span>
                </div>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3 text-xs text-slate-700 animate-in fade-in duration-150">
                {deferredPrompt ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 block">
                      ⚡ 1-Tap Quick Install Ready
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      Your Android browser is ready to install the Chauffeur Cockpit immediately:
                    </p>
                    <button
                      onClick={async () => {
                        await deferredPrompt.prompt();
                        const c = await deferredPrompt.userChoice;
                        if (c.outcome === 'accepted') {
                          setDeferredPrompt(null);
                          setShowModal(false);
                        }
                      }}
                      className="apple-btn-primary w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Trigger Native Install Now</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Tap Menu (⋮ Three Dots)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          In Chrome or your Android browser, tap top-right menu:
                          <MoreVertical className="w-3.5 h-3.5 text-slate-700 inline" />
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Tap &apos;Install app&apos; or &apos;Add to Home screen&apos;</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tap <span className="font-semibold text-slate-800">Install app</span> to install the standalone Chauffeur Cockpit APK.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Always logged in — your chauffeur credentials persist across phone restarts.</span>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-3 text-xs text-slate-700 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Address Bar Install Icon</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      Look on the right side of your Chrome/Edge URL address bar for the:
                      <Download className="w-3.5 h-3.5 text-blue-600 inline" />
                      <span className="font-semibold text-slate-800">Install App</span> icon.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Or Browser Menu</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Click Chrome Menu (⋮) → <span className="font-semibold text-slate-800">Save and share</span> → <span className="font-semibold text-slate-800">Install Karnataka State Protocol</span>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center gap-2 text-xs">
                  <Laptop className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Opens in its own standalone native app window with zero browser URL bar distractions.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="apple-btn-secondary w-full py-2.5 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
