import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import {
  Car,
  ShieldCheck,
  Smartphone,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  Award,
  FileBadge,
  CheckCircle2,
  ArrowLeft,
  Download,
  AlertCircle,
  Building2,
  Check,
  Share,
  PlusSquare,
  X,
} from 'lucide-react';

interface DriverProfileProps {
  onBackToCockpit: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const DriverProfile: React.FC<DriverProfileProps> = ({ onBackToCockpit }) => {
  const { currentUser, drivers, vehicles, trips } = useStore();

  const myDriver =
    drivers.find((d) => d.id === currentUser?.driverId) ||
    drivers.find((d) => d.phone === currentUser?.phone) ||
    drivers[0];

  const myVehicle = vehicles.find((v) => v.id === myDriver?.vehicleId);

  // Calculate live trips for this driver
  const myCompletedTrips = trips.filter(
    (t) => t.assignedDriverId === myDriver?.id && t.status === 'COMPLETED'
  );

  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(standalone));

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Back Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCockpit}
          className="apple-btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cockpit</span>
        </button>

        <div className="flex items-center gap-2">
          {isStandalone ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Installed Chauffeur PWA</span>
            </span>
          ) : (
            <button
              onClick={handleInstallClick}
              className="apple-btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Chauffeur App</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Government Chauffeur Identity Card */}
      <div className="apple-card-elevated rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
        {/* Gold & Titanium Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border-2 border-amber-400/50 p-1 shadow-lg shrink-0 flex items-center justify-center">
                <img
                  src="/assets/vehicle-desk-emblem.svg"
                  alt="State Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>Official Protocol Service Pass</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">{myDriver?.name}</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Senior Protocol Chauffeur · Apex VVIP Squadron
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-3">
                  <span>Badge ID: DRV-00{myDriver?.id.replace('drv-', '')}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">Active &amp; Authorized</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Department
              </span>
              <span className="text-xs font-semibold text-slate-200 block">
                DPAR Protocol Division
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Government of Karnataka
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Sections */}
        <div className="p-6 space-y-6">
          {/* Section 1: Assigned Vehicle & Priority Pool */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-600" />
              <span>Assigned Vehicle &amp; Allocation Priority</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Vehicle Model
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {myVehicle?.model || 'Toyota Camry Hybrid (Sedan)'}
                </span>
                <span className="font-mono-nums text-slate-600 font-semibold block mt-0.5">
                  {myVehicle?.plate || 'KA-01-GA-1001'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Protocol Entitlement Class
                </span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs mt-1 shadow-2xs">
                  {myVehicle?.class || 'CLASS_A'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Apex VVIP Sedan</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Queue Priority Rank
                </span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30 font-bold text-xs mt-1">
                  Priority {myVehicle?.assignedPriority || 1} Vehicle
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Dispatched 1st in Queue
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Verification, Licensing & Compliance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-slate-600" />
              <span>Credentials &amp; Security Clearances</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Commercial DL
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="font-mono font-bold text-slate-900 block">KA-01-2018-0094480</span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  Verified · RTO Bengaluru Central
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Police Verification
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="font-semibold text-slate-900 block">State Intelligence Branch</span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  Cleared through Dec 2027
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Sanitization State
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="font-semibold text-slate-900 block">{myDriver?.cleanliness}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Post-tour inspection ready
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Duty History & Performance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Duty Performance &amp; Fatigue Management</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Trips Today
                </span>
                <span className="font-mono-nums text-2xl font-bold text-slate-900 mt-1 block">
                  {myCompletedTrips.length || myDriver?.tripsToday || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Trips This Week
                </span>
                <span className="font-mono-nums text-2xl font-bold text-slate-900 mt-1 block">
                  {myCompletedTrips.length || myDriver?.tripsThisWeek || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Hours Logged
                </span>
                <span className="font-mono-nums text-2xl font-bold text-slate-900 mt-1 block">
                  {myDriver?.totalHoursThisWeek || 0}h
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contacts & Dispatch Control Room */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-600" />
              <span>Protocol Emergency &amp; Control Room Directory</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">State Fleet Superintendent</span>
                  <span className="text-[11px] text-slate-500">Kavitha Rao (Duty Officer)</span>
                </div>
                <a
                  href="tel:+919900055667"
                  className="apple-btn-secondary py-1 px-3 text-xs font-mono font-semibold"
                >
                  +91 99000 55667
                </a>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                <div>
                  <span className="font-semibold text-slate-900 block">Vidhana Soudha Motor Depot</span>
                  <span className="text-[11px] text-slate-500">Central Dispatch &amp; Key Lockbox</span>
                </div>
                <a
                  href="tel:08022033500"
                  className="apple-btn-secondary py-1 px-3 text-xs font-mono font-semibold"
                >
                  080-22033500
                </a>
              </div>
            </div>
          </div>

          {/* Section 5: PWA Installation Guidance */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Mobile App (PWA) Standalone Mode
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {isStandalone
                    ? 'Running as installed standalone mobile application with persistent session.'
                    : 'Install on your iPhone or Android home screen for instant 1-tap protocol access.'}
                </p>
              </div>
            </div>

            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="apple-btn-primary py-2 px-4 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install on Mobile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="apple-card-elevated max-w-sm w-full rounded-3xl p-6 space-y-5 text-slate-900 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Install on iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-500">Apple Safari Home Screen Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Tap the Share Button</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    At the bottom of Safari, tap the share icon:
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
                    Scroll down and tap:
                    <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />
                    <span className="font-semibold text-slate-800">Add to Home Screen</span>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2 text-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>The Chauffeur app icon will be installed on your iOS home screen!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="apple-btn-primary w-full py-2.5 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
