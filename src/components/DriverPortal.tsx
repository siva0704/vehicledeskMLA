import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { CleanlinessStatus, DriverStatus, TripRequest } from '../types';
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
} from 'lucide-react';
import { GpsModal } from './GpsModal';

interface DriverPortalProps {
  activeSubTab: 'driver-status' | 'driver-trip';
  onChangeSubTab: (tab: 'driver-status' | 'driver-trip') => void;
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
    driverAcceptTrip,
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

  const handleShareGps = () => {
    if (assignedTrip) {
      driverShareGps(assignedTrip.id, customGpsUrl, { lat: 12.9796, lng: 77.5908 });
    }
  };

  const handleCompleteTrip = () => {
    if (assignedTrip) {
      driverCompleteTrip(assignedTrip.id, postTripCleanliness);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills (Interactive Filter Controls) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onChangeSubTab('driver-status')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'driver-status'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.nav.driverStatus}
          </button>
          <button
            onClick={() => onChangeSubTab('driver-trip')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative ${
              activeSubTab === 'driver-trip'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.nav.driverTrip}</span>
            {assignedTrip && (
              <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Chauffeur Identity Bar */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{myDriver?.name}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-nums">{myVehicle?.model} ({myVehicle?.plate})</span>
        </div>
      </div>

      {/* SCREEN 1: DRIVER STATUS */}
      {activeSubTab === 'driver-status' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Rule Engine Eligibility Enforcement Banner */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              isEligible
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {isEligible ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {isEligible ? t.ruleEngine.eligible : t.ruleEngine.ineligible}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-current">
                    Rule 1 Enforced
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {isEligible
                    ? t.driver.eligibilityAlertSuccess
                    : t.driver.eligibilityAlertWarning}
                </p>
                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  Core Constraint: "Vehicle is visible to VIP allocation only when Available + Clean."
                </p>
              </div>
            </div>
          </div>

          {/* Status Controls Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {t.driver.currentStatus}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Update your operational readiness for the State VIP dispatch desk.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'AVAILABLE', label: t.driver.statusAvailable, color: 'text-emerald-700' },
                  { id: 'BUSY', label: t.driver.statusBusy, color: 'text-indigo-700' },
                  { id: 'OFF', label: t.driver.statusOff, color: 'text-slate-700' },
                  { id: 'MAINTENANCE', label: t.driver.statusMaintenance, color: 'text-amber-700' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id as DriverStatus)}
                    className={`p-3 text-left rounded-lg border text-xs font-semibold transition-all ${
                      myDriver?.status === st.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness State */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {t.driver.cleanlinessStatus}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Vehicles marked as 'Needs Cleaning' are quarantined from auto-dispatch until sanitized.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleCleanlinessChange('CLEAN')}
                  className={`p-3.5 text-left rounded-lg border text-xs transition-all ${
                    myDriver?.cleanliness === 'CLEAN'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold">{t.driver.cleanState}</span>
                  </div>
                  <span className="text-[11px] text-slate-600">
                    Interior vacuumed, sanitized, water bottles stocked, exterior washed.
                  </span>
                </button>

                <button
                  onClick={() => handleCleanlinessChange('NEEDS_CLEANING')}
                  className={`p-3.5 text-left rounded-lg border text-xs transition-all ${
                    myDriver?.cleanliness === 'NEEDS_CLEANING'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-600/20 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-bold">{t.driver.dirtyState}</span>
                  </div>
                  <span className="text-[11px] text-slate-600">
                    Awaiting wash bay or post-tour servicing. Vehicle is hidden from dispatch.
                  </span>
                </button>
              </div>
            </div>

            {/* Fairness Metrics */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t.driver.myMetrics}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    {t.driver.tripsToday}
                  </span>
                  <span className="font-mono-nums text-lg font-bold text-slate-900 mt-1 block">
                    {myDriver?.tripsToday || 0}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    {t.driver.tripsThisWeek}
                  </span>
                  <span className="font-mono-nums text-lg font-bold text-slate-900 mt-1 block">
                    {myDriver?.tripsThisWeek || 0}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    {t.driver.hoursThisWeek}
                  </span>
                  <span className="font-mono-nums text-lg font-bold text-slate-900 mt-1 block">
                    {myDriver?.totalHoursThisWeek || 0}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: TODAY'S TRIP FLOW */}
      {activeSubTab === 'driver-trip' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {assignedTrip ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-nums font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {assignedTrip.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {assignedTrip.vipName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {assignedTrip.vipDesignation} · {assignedTrip.date} at {assignedTrip.time}
                  </p>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Status: {assignedTrip.status}
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* Pickup & Drop Points */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {t.common.pickup}
                        </span>
                        {assignedTrip.isRoundTrip && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            <Repeat className="w-3 h-3 text-indigo-600" />
                            <span>Round Trip</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 mt-0.5 block">
                        {assignedTrip.pickupLocation}
                      </span>
                    </div>
                  </div>
                  {assignedTrip.isRoundTrip ? (
                    <div className="border-t border-slate-200/80 pt-2 flex items-start gap-2.5">
                      <Repeat className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                          Round Trip Destination
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          Standby with VIP & Return to {assignedTrip.pickupLocation}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-200/80 pt-2 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {t.common.drop}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {assignedTrip.dropLocation}
                        </span>
                      </div>
                    </div>
                  )}
                  {assignedTrip.notes && (
                    <div className="border-t border-slate-200/80 pt-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Special Notes: </span>
                      <span>{assignedTrip.notes}</span>
                    </div>
                  )}
                </div>

                {/* 4-Step Mandatory Chauffeur Workflow (Must-Have Feature) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mandatory Chauffeur Flow: Accept → Share GPS → Start → Complete
                  </h4>

                  {/* Step 1: Accept */}
                  <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {t.driver.step1Accept}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-7">
                        Acknowledge protocol duty and lock vehicle to this assignment.
                      </p>
                    </div>

                    {assignedTrip.status === 'ASSIGNED' ? (
                      <button
                        onClick={() => driverAcceptTrip(assignedTrip.id)}
                        className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Assignment</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accepted</span>
                      </span>
                    )}
                  </div>

                  {/* Step 2: Share GPS */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      ['ACCEPTED', 'GPS_SHARED', 'IN_PROGRESS', 'COMPLETED'].includes(
                        assignedTrip.status
                      )
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                            2
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {t.driver.step2Gps}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-7">
                          Broadcast live Google Maps location share link to VIP and Admin Board.
                        </p>
                      </div>

                      {assignedTrip.status === 'ACCEPTED' ? (
                        <button
                          onClick={handleShareGps}
                          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Live GPS</span>
                        </button>
                      ) : assignedTrip.gpsShareUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setGpsModalOpen(true)}
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3 text-indigo-600" />
                            <span>Preview Map</span>
                          </button>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            GPS Live
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {assignedTrip.status === 'ACCEPTED' && (
                      <div className="ml-7 pt-2 border-t border-slate-100">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Location Share URL (Simulated device GPS)
                        </label>
                        <input
                          type="text"
                          value={customGpsUrl}
                          onChange={(e) => setCustomGpsUrl(e.target.value)}
                          className="w-full text-xs font-mono-nums p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 3: Start Trip */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      ['GPS_SHARED', 'IN_PROGRESS', 'COMPLETED'].includes(assignedTrip.status)
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                            3
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {t.driver.step3Start}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-7">
                          Begin transit once VIP is seated at pickup location.
                        </p>
                      </div>

                      {assignedTrip.status === 'GPS_SHARED' ? (
                        <button
                          onClick={() => driverStartTrip(assignedTrip.id)}
                          className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Trip Now</span>
                        </button>
                      ) : ['IN_PROGRESS', 'COMPLETED'].includes(assignedTrip.status) ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          In Progress
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Step 4: Complete Trip */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      assignedTrip.status === 'IN_PROGRESS'
                        ? 'border-indigo-200 bg-indigo-50/30'
                        : 'border-slate-100 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                              4
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {t.driver.step4Done}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 ml-7">
                            Mark VIP drop completed and record post-tour vehicle cleanliness.
                          </p>
                        </div>

                        {assignedTrip.status === 'IN_PROGRESS' && (
                          <button
                            onClick={handleCompleteTrip}
                            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>

                      {assignedTrip.status === 'IN_PROGRESS' && (
                        <div className="ml-7 pt-2 border-t border-slate-200/80 flex items-center gap-4 text-xs">
                          <span className="text-slate-600 font-medium">Post-Trip Car State:</span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="cleanliness"
                              checked={postTripCleanliness === 'CLEAN'}
                              onChange={() => setPostTripCleanliness('CLEAN')}
                            />
                            <span>Clean & Ready</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="cleanliness"
                              checked={postTripCleanliness === 'NEEDS_CLEANING'}
                              onChange={() => setPostTripCleanliness('NEEDS_CLEANING')}
                            />
                            <span>Needs Cleaning / Wash</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Car className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900">
                  {t.driver.noAssignment}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  When a VIP requests a vehicle matching your class and you are set to Available + Clean, the Rule Engine assigns you automatically.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onChangeSubTab('driver-status')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Manage Availability Status
                </button>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
};
