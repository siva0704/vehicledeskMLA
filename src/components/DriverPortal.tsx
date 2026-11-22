import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { CleanlinessStatus, DriverStatus } from '../types';
import {
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Sparkles,
  AlertTriangle,
  Play,
  Share2,
  Check,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Repeat,
  Radio,
  Gauge,
  Calendar,
  User,
} from 'lucide-react';
import { GpsModal } from './GpsModal';
import { DriverProfile } from './DriverProfile';
import { PwaInstallBanner } from './PwaInstallBanner';

interface DriverPortalProps {
  activeSubTab: 'driver-status' | 'driver-trip' | 'driver-profile';
  onChangeSubTab: (tab: 'driver-status' | 'driver-trip' | 'driver-profile') => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  activeSubTab,
  onChangeSubTab,
}) => {
  const {
    currentUser,
    drivers,
    vehicles,
    trips,
    updateDriverStatus,
    updateDriverCleanliness,
    driverCollectKeys,
    driverEnRoute,
    driverArrivedAtPickup,
    driverShareGps,
    driverStartTrip,
    driverCompleteTrip,
    language,
  } = useStore();
  const t = translations[language];

  // Match driver record: either linked driverId or match by phone or fallback to first driver
  const myDriver =
    drivers.find((d) => d.id === currentUser?.driverId) ||
    drivers.find((d) => d.phone === currentUser?.phone) ||
    drivers[0];

  const myVehicle = vehicles.find((v) => v.id === myDriver?.vehicleId);

  // Active assignment for this driver
  const assignedTrip = trips.find(
    (tr) =>
      tr.assignedDriverId === myDriver?.id &&
      tr.status !== 'COMPLETED' &&
      tr.status !== 'CANCELLED'
  );

  const myCompletedCount = trips.filter(
    (t) => t.assignedDriverId === myDriver?.id && t.status === 'COMPLETED'
  ).length;
  const driverTripsToday = Math.max(myDriver?.tripsToday || 0, myCompletedCount);
  const driverTripsThisWeek = Math.max(myDriver?.tripsThisWeek || 0, myCompletedCount);
  const driverHoursThisWeek = Math.round(
    ((myDriver?.totalHoursThisWeek || 0) + (myCompletedCount * 1.5)) * 10
  ) / 10;

  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [customGpsUrl, setCustomGpsUrl] = useState(
    myDriver?.currentGpsShareUrl || 'https://maps.google.com/?q=12.9796,77.5908'
  );
  const [postTripCleanliness, setPostTripCleanliness] = useState<CleanlinessStatus>('CLEAN');

  const isEligible = myDriver?.status === 'AVAILABLE' && myDriver?.cleanliness === 'CLEAN';

  const handleStatusChange = (status: DriverStatus) => {
    if (myDriver) updateDriverStatus(myDriver.id, status);
  };

  const handleCleanlinessChange = (cleanliness: CleanlinessStatus) => {
    if (myDriver) updateDriverCleanliness(myDriver.id, cleanliness);
  };

  const handleCompleteTrip = () => {
    if (assignedTrip) {
      driverCompleteTrip(assignedTrip.id, postTripCleanliness);
    }
  };

  // Determine current step index for the Apple Workout Stepper (1 to 5)
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 1;
      case 'KEY_COLLECTED':
        return 2;
      case 'EN_ROUTE_TO_PICKUP':
        return 3;
      case 'ARRIVED_AT_PICKUP':
        return 4;
      case 'TRIP_STARTED':
      case 'IN_PROGRESS':
        return 5;
      case 'COMPLETED':
        return 6;
      default:
        return 1;
    }
  };

  const currentStep = assignedTrip ? getStepIndex(assignedTrip.status) : 0;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* PWA Mobile Installation Banner */}
      <PwaInstallBanner />

      {/* Top Apple Segmented Control Island */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3 sm:p-3.5 rounded-3xl border border-black/[0.06] shadow-xs">
        <div className="apple-segmented-track p-1 inline-flex w-fit">
          <button
            onClick={() => onChangeSubTab('driver-status')}
            className={`apple-segmented-pill flex items-center gap-2 ${
              activeSubTab === 'driver-status' ? 'active' : ''
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Duty Readiness</span>
          </button>
          <button
            onClick={() => onChangeSubTab('driver-trip')}
            className={`apple-segmented-pill flex items-center gap-2 relative ${
              activeSubTab === 'driver-trip' ? 'active' : ''
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Today&apos;s Tour</span>
            {assignedTrip && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => onChangeSubTab('driver-profile')}
            className={`apple-segmented-pill flex items-center gap-2 ${
              activeSubTab === 'driver-profile' ? 'active' : ''
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Chauffeur Pass</span>
          </button>
        </div>

        {/* Chauffeur Vehicle & Duty Indicator Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/[0.04] border border-black/[0.06] text-xs self-start sm:self-auto">
          <div className={`w-2 h-2 rounded-full ${isEligible ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
          <span className="font-semibold text-slate-800">{myDriver?.name}</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono-nums text-slate-600 font-medium">
            {myVehicle?.model} ({myVehicle?.plate})
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300">
            {myVehicle?.assignedPriority ? `P${myVehicle.assignedPriority}` : 'Pool'}
          </span>
        </div>
      </div>

      {/* SCREEN 1: OPERATIONAL READINESS & STATUS */}
      {activeSubTab === 'driver-status' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Rule Engine Eligibility Card */}
          <div
            className={`apple-card p-5 transition-all ${
              isEligible
                ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border-emerald-200/80 text-emerald-950'
                : 'bg-gradient-to-r from-amber-50/90 to-orange-50/70 border-amber-200/80 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  isEligible ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-600 text-white shadow-sm'
                }`}
              >
                {isEligible ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight">
                    {isEligible ? t.ruleEngine.eligible : t.ruleEngine.ineligible}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 border border-current shadow-2xs">
                    Rule 1 Auto-Dispatch Gate
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {isEligible
                    ? t.driver.eligibilityAlertSuccess
                    : t.driver.eligibilityAlertWarning}
                </p>
                <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                  Core Constraint: &quot;Vehicle is eligible for automated VIP allocation only when Available + Clean.&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Operational Availability Card */}
          <div className="apple-card-elevated p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {t.driver.currentStatus}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Duty Readiness</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Update your active protocol status. Only &quot;Available for Duty&quot; receives automated WhatsApp allocations.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'AVAILABLE', label: t.driver.statusAvailable, color: 'text-emerald-700' },
                  { id: 'BUSY', label: t.driver.statusBusy, color: 'text-indigo-700' },
                  { id: 'OFF', label: t.driver.statusOff, color: 'text-slate-700' },
                  { id: 'MAINTENANCE', label: t.driver.statusMaintenance, color: 'text-amber-700' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id as DriverStatus)}
                    className={`p-3.5 text-center rounded-2xl border text-xs font-semibold transition-all ${
                      myDriver?.status === st.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200/80 hover:border-slate-300 text-slate-700 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Cleanliness State */}
            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {t.driver.cleanlinessStatus}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Sanitization Inspection</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Vehicles marked as &apos;Needs Cleaning&apos; are quarantined from dispatch queue until sanitized.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleCleanlinessChange('CLEAN')}
                  className={`p-4 text-left rounded-2xl border text-xs transition-all ${
                    myDriver?.cleanliness === 'CLEAN'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 font-semibold shadow-2xs'
                      : 'border-slate-200/80 hover:border-slate-300 text-slate-700 bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900">{t.driver.cleanState}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 leading-relaxed block">
                    Interior vacuumed, sanitized, water bottles stocked, exterior washed.
                  </span>
                </button>

                <button
                  onClick={() => handleCleanlinessChange('NEEDS_CLEANING')}
                  className={`p-4 text-left rounded-2xl border text-xs transition-all ${
                    myDriver?.cleanliness === 'NEEDS_CLEANING'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 font-semibold shadow-2xs'
                      : 'border-slate-200/80 hover:border-slate-300 text-slate-700 bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900">{t.driver.dirtyState}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 leading-relaxed block">
                    Awaiting wash bay or post-tour servicing. Vehicle is hidden from dispatch.
                  </span>
                </button>
              </div>
            </div>

            {/* Apple Duty Statistics */}
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t.driver.myMetrics} · Workload Balancing
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    {t.driver.tripsToday}
                  </span>
                  <span className="font-mono-nums text-xl font-bold text-slate-900 mt-1 block tracking-tight">
                    {driverTripsToday}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    {t.driver.tripsThisWeek}
                  </span>
                  <span className="font-mono-nums text-xl font-bold text-slate-900 mt-1 block tracking-tight">
                    {driverTripsThisWeek}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    {t.driver.hoursThisWeek}
                  </span>
                  <span className="font-mono-nums text-xl font-bold text-slate-900 mt-1 block tracking-tight">
                    {driverHoursThisWeek}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: TODAY'S TRIP WORKFLOW (Apple Watch / Workout Style Flow) */}
      {activeSubTab === 'driver-trip' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {assignedTrip ? (
            <div className="apple-card-elevated rounded-3xl overflow-hidden shadow-lg border border-slate-200/80">
              {/* Apple Frosted Card Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-nums font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {assignedTrip.id}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {assignedTrip.vipName}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {assignedTrip.vipDesignation} · {assignedTrip.date} at {assignedTrip.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {assignedTrip.status}
                  </span>
                  {assignedTrip.assignedPriority && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Priority {assignedTrip.assignedPriority}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Route Overview */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                      <div className="w-0.5 h-6 bg-slate-300 my-1"></div>
                      <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Pickup Point (Vidhana Soudha / LH)
                          </span>
                          {assignedTrip.isRoundTrip && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              <Repeat className="w-3 h-3 text-indigo-600" />
                              <span>Round Trip</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900 block mt-0.5">
                          {assignedTrip.pickupLocation}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Destination
                        </span>
                        <span className="text-xs font-bold text-slate-900 block mt-0.5">
                          {assignedTrip.dropLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {assignedTrip.notes && (
                    <div className="border-t border-slate-200/80 pt-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Dispatch Notes: </span>
                      <span>{assignedTrip.notes}</span>
                    </div>
                  )}
                </div>

                {/* Apple Watch / iOS Workout-Style Stepper Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Sequential Execution Flow (Step {Math.min(currentStep, 5)} of 5)
                    </h4>
                    <span className="text-xs font-semibold text-indigo-600">
                      {currentStep >= 5 ? 'Final Step' : 'Active Tour'}
                    </span>
                  </div>

                  {/* 5-Step Horizontal Indicator */}
                  <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                    {[
                      { step: 1, label: 'Keys' },
                      { step: 2, label: 'En Route' },
                      { step: 3, label: 'Arrived' },
                      { step: 4, label: 'Started' },
                      { step: 5, label: 'Done' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`py-2 px-1 text-center rounded-xl transition-all ${
                          currentStep === s.step
                            ? 'bg-slate-900 text-white font-bold shadow-xs'
                            : currentStep > s.step
                            ? 'bg-emerald-500 text-white font-semibold'
                            : 'text-slate-400 font-medium'
                        }`}
                      >
                        <div className="text-[10px] uppercase">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Collect Keys */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          currentStep > 1
                            ? 'bg-emerald-500 text-white'
                            : currentStep === 1
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          1. Collect Vehicle Keys & Fuel Card
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Retrieve physical keys from Vidhana Soudha protocol lockbox.
                        </p>
                      </div>
                    </div>

                    {assignedTrip.status === 'ASSIGNED' ? (
                      <button
                        onClick={() => driverCollectKeys(assignedTrip.id)}
                        className="apple-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Check className="w-4 h-4" />
                        <span>Collect Keys</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Keys Secured</span>
                      </span>
                    )}
                  </div>

                  {/* Step 2: Head En Route */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 2
                        ? 'border-slate-200/80 bg-white'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            currentStep > 2
                              ? 'bg-emerald-500 text-white'
                              : currentStep === 2
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            2. Head En Route to MLA Pickup
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Heading toward: <span className="font-semibold text-slate-800">{assignedTrip.pickupLocation}</span>.
                          </p>
                        </div>
                      </div>

                      {assignedTrip.status === 'KEY_COLLECTED' ? (
                        <button
                          onClick={() => driverEnRoute(assignedTrip.id, customGpsUrl)}
                          className="apple-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Dispatch En Route</span>
                        </button>
                      ) : currentStep > 2 ? (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            onClick={() => setGpsModalOpen(true)}
                            className="apple-btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3 text-indigo-600" />
                            <span>Preview Map</span>
                          </button>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            En Route Done
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {assignedTrip.status === 'KEY_COLLECTED' && (
                      <div className="ml-10 pt-3 border-t border-slate-100 mt-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Live Location Share URL (Dispatched to MLA WhatsApp)
                        </label>
                        <input
                          type="text"
                          value={customGpsUrl}
                          onChange={(e) => setCustomGpsUrl(e.target.value)}
                          className="apple-input text-xs font-mono-nums py-1.5 px-3"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 3: Arrived at Pickup */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 3
                        ? 'border-slate-200/80 bg-white'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            currentStep > 3
                              ? 'bg-emerald-500 text-white'
                              : currentStep === 3
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            3. Arrived at Pickup Location
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Waiting at porch: <span className="font-semibold text-slate-800">{assignedTrip.pickupLocation}</span>. Automatically alerts MLA on WhatsApp.
                          </p>
                        </div>
                      </div>

                      {assignedTrip.status === 'EN_ROUTE_TO_PICKUP' ? (
                        <button
                          onClick={() => driverArrivedAtPickup(assignedTrip.id)}
                          className="apple-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap bg-amber-600 hover:bg-amber-700"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Report Arrived (Alert MLA)</span>
                        </button>
                      ) : currentStep > 3 ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>At Pickup Bay</span>
                        </span>
                      ) : null}
                    </div>

                    {assignedTrip.status === 'ARRIVED_AT_PICKUP' && (
                      <div className="ml-10 mt-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Automated WhatsApp alert sent to Hon. {assignedTrip.vipName}: Chauffeur arrived at pickup porch.</span>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Start Trip */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      currentStep >= 4
                        ? 'border-slate-200/80 bg-white'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            currentStep > 4
                              ? 'bg-emerald-500 text-white'
                              : currentStep === 4
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {currentStep > 4 ? <Check className="w-4 h-4" /> : '4'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            4. Start Trip (VIP Boarded)
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Begin journey once MLA is seated in the vehicle.
                          </p>
                        </div>
                      </div>

                      {assignedTrip.status === 'ARRIVED_AT_PICKUP' ? (
                        <button
                          onClick={() => driverStartTrip(assignedTrip.id)}
                          className="apple-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Trip Now</span>
                        </button>
                      ) : currentStep > 4 ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                          Trip In Progress
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Step 5: Complete Trip */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      ['TRIP_STARTED', 'IN_PROGRESS'].includes(assignedTrip.status)
                        ? 'border-indigo-300 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            5
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              5. Complete Trip & Report Car State
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Mark VIP drop completed and record post-tour vehicle cleanliness.
                            </p>
                          </div>
                        </div>

                        {['TRIP_STARTED', 'IN_PROGRESS'].includes(assignedTrip.status) && (
                          <button
                            onClick={handleCompleteTrip}
                            className="apple-btn-primary py-2.5 px-5 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>

                      {['TRIP_STARTED', 'IN_PROGRESS'].includes(assignedTrip.status) && (
                        <div className="ml-10 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-xs">
                          <span className="text-slate-700 font-semibold">Post-Trip State:</span>
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border border-emerald-200 bg-white shadow-2xs">
                            <input
                              type="radio"
                              name="cleanliness"
                              checked={postTripCleanliness === 'CLEAN'}
                              onChange={() => setPostTripCleanliness('CLEAN')}
                              className="accent-emerald-600"
                            />
                            <span className="font-semibold text-emerald-950">Clean & Ready (Priority Pool)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border border-amber-200 bg-white shadow-2xs">
                            <input
                              type="radio"
                              name="cleanliness"
                              checked={postTripCleanliness === 'NEEDS_CLEANING'}
                              onChange={() => setPostTripCleanliness('NEEDS_CLEANING')}
                              className="accent-amber-600"
                            />
                            <span className="font-semibold text-amber-950">Needs Cleaning / Wash</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Apple Standby Screen (When no active trip is assigned) */
            <div className="apple-card-elevated p-12 text-center space-y-5 rounded-3xl">
              <div className="relative w-16 h-16 mx-auto">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                <div className="relative w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Radio className="w-8 h-8" />
                </div>
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Dispatch Radar Active</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight pt-1">
                  On Standby · Ready for Protocol Dispatch
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When an Hon&apos;ble MLA requests an official vehicle via WhatsApp matching your vehicle class, the Priority Queue will automatically route the dispatch to your cockpit.
                </p>
              </div>

              {/* Driver Unit Summary Pill */}
              <div className="inline-flex items-center gap-3 p-2 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-semibold text-slate-800">{myDriver?.name}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono-nums text-slate-600">{myVehicle?.model} ({myVehicle?.plate})</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-emerald-700">{myDriver?.cleanliness}</span>
              </div>

              <div>
                <button
                  onClick={() => onChangeSubTab('driver-status')}
                  className="apple-btn-secondary px-5 py-2.5 text-xs font-semibold"
                >
                  Manage Duty Availability & Readiness
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 3: DRIVER PROFILE */}
      {activeSubTab === 'driver-profile' && (
        <DriverProfile onBackToCockpit={() => onChangeSubTab('driver-trip')} />
      )}

      {/* GPS Location Modal */}
      {assignedTrip && (
        <GpsModal
          isOpen={gpsModalOpen}
          onClose={() => setGpsModalOpen(false)}
          gpsUrl={assignedTrip.gpsShareUrl || customGpsUrl}
          driverName={assignedTrip.assignedDriverName}
          vehicleModel={assignedTrip.assignedVehicleModel}
          vehiclePlate={assignedTrip.assignedVehiclePlate}
          pickup={assignedTrip.pickupLocation}
          drop={assignedTrip.dropLocation}
        />
      )}

      {/* Apple Floating Glass Tab Bar (Mobile / PWA Bottom Bar) */}
      <div className="fixed bottom-3 inset-x-0 z-40 px-4 md:hidden flex justify-center pointer-events-none">
        <nav className="apple-glass-island rounded-full p-1.5 shadow-[0_12px_40px_rgb(0,0,0,0.18)] border border-slate-200/80 bg-white/95 backdrop-blur-xl flex items-center gap-1 pointer-events-auto max-w-sm w-full justify-between">
          <button
            onClick={() => onChangeSubTab('driver-status')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
              activeSubTab === 'driver-status'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Readiness</span>
          </button>

          <button
            onClick={() => onChangeSubTab('driver-trip')}
            className={`relative flex-1 py-2 px-3 rounded-full text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
              activeSubTab === 'driver-trip'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Live Tour</span>
            {assignedTrip && (
              <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onChangeSubTab('driver-profile')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
              activeSubTab === 'driver-profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">Pass / Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
