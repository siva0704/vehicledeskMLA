import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { TripRequest, VehicleClass } from '../types';
import {
  ShieldAlert,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  Navigation,
  FileSpreadsheet,
  History,
  X,
  UserCheck,
  Search,
  Repeat,
} from 'lucide-react';
import { GpsModal } from './GpsModal';

interface AdminPortalProps {
  activeSubTab: 'admin-board' | 'admin-report';
  onChangeSubTab: (tab: 'admin-board' | 'admin-report') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeSubTab,
  onChangeSubTab,
}) => {
  const {
    currentUser,
    trips,
    drivers,
    vehicles,
    auditLogs,
    adminForceAssign,
    language,
  } = useStore();
  const t = translations[language];

  // Filters & Selection
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Force-Assign Modal State
  const [overrideModalTrip, setOverrideModalTrip] = useState<TripRequest | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideError, setOverrideError] = useState<string>('');
  const [selectedGpsTrip, setSelectedGpsTrip] = useState<TripRequest | null>(null);

  // Helper map for vehicles
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  // Filter requests
  const filteredTrips = trips.filter((trip) => {
    if (requestFilter === 'PENDING') {
      if (trip.status !== 'PENDING') return false;
    } else if (requestFilter === 'ACTIVE') {
      if (!['ASSIGNED', 'ACCEPTED', 'GPS_SHARED', 'IN_PROGRESS'].includes(trip.status)) {
        return false;
      }
    } else if (requestFilter === 'COMPLETED') {
      if (trip.status !== 'COMPLETED') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVip = trip.vipName.toLowerCase().includes(q);
      const matchId = trip.id.toLowerCase().includes(q);
      const matchDriver = trip.assignedDriverName?.toLowerCase().includes(q);
      const matchPlate = trip.assignedVehiclePlate?.toLowerCase().includes(q);
      if (!matchVip && !matchId && !matchDriver && !matchPlate) return false;
    }

    return true;
  });

  const handleOpenOverrideModal = (trip: TripRequest) => {
    setOverrideModalTrip(trip);
    // Default to first driver if available
    setSelectedDriverId(drivers[0]?.id || '');
    setOverrideReason('');
    setOverrideError('');
  };

  const handleConfirmOverride = () => {
    if (!overrideReason || overrideReason.trim().length < 6) {
      setOverrideError('Mandatory reason required (minimum 6 characters for official audit log).');
      return;
    }

    if (!overrideModalTrip || !selectedDriverId) {
      setOverrideError('Please select a driver to assign.');
      return;
    }

    const success = adminForceAssign(
      overrideModalTrip.id,
      selectedDriverId,
      overrideReason.trim(),
      currentUser?.name || 'Admin Officer'
    );

    if (success) {
      setOverrideModalTrip(null);
    } else {
      setOverrideError('Failed to execute override. Please check driver selection.');
    }
  };

  // Fairness calculations
  const totalWeeklyTrips = drivers.reduce((acc, d) => acc + d.tripsThisWeek, 0);
  const avgTripsPerDriver = drivers.length > 0 ? (totalWeeklyTrips / drivers.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills (Interactive Filter Controls) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onChangeSubTab('admin-board')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'admin-board'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.admin.boardTitle}
          </button>
          <button
            onClick={() => onChangeSubTab('admin-report')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative ${
              activeSubTab === 'admin-report'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.admin.fairnessTab} & Audit</span>
            {auditLogs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full font-mono-nums">
                {auditLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Admin Identity */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{currentUser?.name}</span>
          <span aria-hidden="true">·</span>
          <span>{currentUser?.designation}</span>
        </div>
      </div>

      {/* SCREEN 1: LIVE BOARD */}
      {activeSubTab === 'admin-board' && (
        <div className="space-y-6">
          {/* Top Board Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Total Fleet
              </span>
              <span className="font-mono-nums text-xl font-bold text-slate-900 mt-1 block">
                {vehicles.length} Units
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">State protocol inventory</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block">
                Available & Clean
              </span>
              <span className="font-mono-nums text-xl font-bold text-emerald-700 mt-1 block">
                {drivers.filter((d) => d.status === 'AVAILABLE' && d.cleanliness === 'CLEAN').length} Units
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Eligible for Rule Engine</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">
                Active Tours
              </span>
              <span className="font-mono-nums text-xl font-bold text-indigo-900 mt-1 block">
                {trips.filter((t) => ['ASSIGNED', 'ACCEPTED', 'GPS_SHARED', 'IN_PROGRESS'].includes(t.status)).length} Tours
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">In dispatch lifecycle</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block">
                Pending / Queued
              </span>
              <span className="font-mono-nums text-xl font-bold text-amber-900 mt-1 block">
                {trips.filter((t) => t.status === 'PENDING').length} Requests
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Requires attention/override</span>
            </div>
          </div>

          {/* Section: Live Trip Requests */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.admin.liveRequests}
                </h3>
                <p className="text-xs text-slate-500">
                  Monitored in real-time under Rule Engine constraints.
                </p>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setRequestFilter('ALL')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      requestFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({trips.length})
                  </button>
                  <button
                    onClick={() => setRequestFilter('PENDING')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      requestFilter === 'PENDING'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pending ({trips.filter((t) => t.status === 'PENDING').length})
                  </button>
                  <button
                    onClick={() => setRequestFilter('ACTIVE')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      requestFilter === 'ACTIVE'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setRequestFilter('COMPLETED')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      requestFilter === 'COMPLETED'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Completed
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search VIP / Plate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">VIP & Designation</th>
                    <th className="py-3 px-4">Route & Schedule</th>
                    <th className="py-3 px-4">Pref. Class</th>
                    <th className="py-3 px-4">Chauffeur & Car</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono-nums font-semibold text-slate-900">
                        {trip.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{trip.vipName}</div>
                        <div className="text-[11px] text-slate-500">{trip.vipDesignation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 truncate max-w-xs flex items-center gap-1.5">
                          {trip.isRoundTrip ? (
                            <>
                              <span className="truncate">{trip.pickupLocation}</span>
                              <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>Round Trip</span>
                              </span>
                            </>
                          ) : (
                            <span>
                              {trip.pickupLocation} → {trip.dropLocation}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono-nums text-slate-500 mt-0.5">
                          {trip.date} · {trip.time}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono-nums text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {trip.preferredClass}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {trip.assignedDriverName ? (
                          <div>
                            <div className="font-medium text-slate-900">
                              {trip.assignedDriverName}
                            </div>
                            <div className="text-[11px] font-mono-nums text-slate-500">
                              {trip.assignedVehiclePlate} ({trip.assignedVehicleModel})
                            </div>
                            {trip.isOverridden && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                                Overridden by {trip.overriddenByAdmin}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold italic">
                            Unassigned (Queued)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                            trip.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : trip.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {trip.gpsShareUrl && (
                            <button
                              onClick={() => setSelectedGpsTrip(trip)}
                              title="View GPS Share Link"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Navigation className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenOverrideModal(trip)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors whitespace-nowrap"
                          >
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTrips.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No trip requests match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Fleet & Driver Status Grid */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {t.admin.fleetOverview}
              </h3>
              <p className="text-xs text-slate-500">
                Rule 1 check: Only drivers who are <span className="font-semibold text-slate-800">Available</span> + <span className="font-semibold text-slate-800">Clean</span> receive automated dispatches.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Vehicle & Plate</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Chauffeur</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Cleanliness</th>
                    <th className="py-3 px-4">Rule Engine Eligibility</th>
                    <th className="py-3 px-4 font-mono-nums text-right">Trips Today / Week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((drv) => {
                    const veh = vehicleMap.get(drv.vehicleId);
                    const isEligible = drv.status === 'AVAILABLE' && drv.cleanliness === 'CLEAN';

                    return (
                      <tr key={drv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {veh?.model || 'General Vehicle'}
                          </div>
                          <div className="text-[11px] font-mono-nums text-slate-500">
                            {veh?.plate || 'KA-01-XX-0000'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono-nums text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {veh?.vehicleClass}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{drv.name}</div>
                          <div className="text-[11px] font-mono-nums text-slate-500">{drv.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                              drv.status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : drv.status === 'BUSY'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : drv.status === 'MAINTENANCE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {drv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {drv.cleanliness === 'CLEAN' ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Clean</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Needs Clean</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isEligible ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Auto-Eligible</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <X className="w-3 h-3 text-slate-400" />
                              <span>Ineligible</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-nums font-semibold text-slate-800">
                          {drv.tripsToday} / {drv.tripsThisWeek}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: OVERRIDE & REPORT */}
      {activeSubTab === 'admin-report' && (
        <div className="space-y-6">
          {/* Weekly Fairness Report */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {t.admin.fairnessReportTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {t.admin.fairnessExplanation}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Weekly Dept Average
                  </span>
                  <span className="font-mono-nums text-base font-bold text-slate-900">
                    {avgTripsPerDriver} trips / driver
                  </span>
                </div>
              </div>
            </div>

            {/* Fairness Distribution Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t.admin.fairnessDriver}</th>
                    <th className="py-3 px-4">{t.admin.fairnessVehicle}</th>
                    <th className="py-3 px-4 font-mono-nums text-center">{t.admin.fairnessTripsToday}</th>
                    <th className="py-3 px-4 font-mono-nums text-center">{t.admin.fairnessTripsWeek}</th>
                    <th className="py-3 px-4 font-mono-nums text-center">{t.admin.fairnessHours}</th>
                    <th className="py-3 px-4">{t.admin.fairnessStatus}</th>
                    <th className="py-3 px-4">{t.admin.fairnessFairnessIndex}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((d) => {
                    const veh = vehicleMap.get(d.vehicleId);
                    const diff = d.tripsThisWeek - parseFloat(avgTripsPerDriver);
                    let balanceStatus = 'Equitable';
                    let balanceColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

                    if (diff > 3) {
                      balanceStatus = 'Heavy Duty (De-prioritize)';
                      balanceColor = 'text-amber-700 bg-amber-50 border-amber-200';
                    } else if (diff < -3) {
                      balanceStatus = 'Light Duty (Priority Next)';
                      balanceColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
                    }

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{d.name}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono-nums">
                          {veh?.model} ({veh?.plate})
                        </td>
                        <td className="py-3 px-4 text-center font-mono-nums font-bold text-slate-900">
                          {d.tripsToday}
                        </td>
                        <td className="py-3 px-4 text-center font-mono-nums font-bold text-slate-900">
                          {d.tripsThisWeek}
                        </td>
                        <td className="py-3 px-4 text-center font-mono-nums text-slate-600">
                          {d.totalHoursThisWeek}h
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-700">
                            {d.status} · {d.cleanliness === 'CLEAN' ? 'Clean' : 'Needs Wash'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${balanceColor}`}
                          >
                            {balanceStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Override Audit Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {t.admin.auditLogTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Permanent immutable log of every manual override. Mandated by Protocol Security Standards.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t.admin.auditTimestamp}</th>
                    <th className="py-3 px-4">{t.admin.auditTripId}</th>
                    <th className="py-3 px-4">{t.admin.auditVip}</th>
                    <th className="py-3 px-4">{t.admin.auditDriver}</th>
                    <th className="py-3 px-4">{t.admin.auditAdmin}</th>
                    <th className="py-3 px-4">{t.admin.auditReason}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono-nums text-slate-500 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono-nums font-semibold text-slate-900">
                        {entry.tripId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{entry.vipName}</td>
                      <td className="py-3 px-4 text-slate-700">{entry.driverName}</td>
                      <td className="py-3 px-4 font-medium text-indigo-900">{entry.adminName}</td>
                      <td className="py-3 px-4 text-slate-800 bg-amber-50/50 rounded font-medium max-w-sm">
                        "{entry.reason}"
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {t.admin.noAuditLogs}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORCE-ASSIGN OVERRIDE MODAL */}
      {overrideModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {t.admin.overrideModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setOverrideModalTrip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Warning Box */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-semibold mb-0.5">Audit Mandatory Warning</p>
                <p className="text-slate-700">{t.admin.overrideModalWarning}</p>
              </div>

              {/* Trip Context */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-nums font-bold text-slate-900">
                    {overrideModalTrip.id} · {overrideModalTrip.vipName}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Pref: {overrideModalTrip.preferredClass}
                  </span>
                </div>
                <p className="text-slate-600">
                  {overrideModalTrip.pickupLocation} → {overrideModalTrip.dropLocation}
                </p>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.admin.selectDriverLabel}
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {drivers.map((drv) => {
                    const veh = vehicleMap.get(drv.vehicleId);
                    return (
                      <option key={drv.id} value={drv.id}>
                        {drv.name} ({veh?.model} - {veh?.plate} · {veh?.vehicleClass}) [
                        {drv.status}, {drv.cleanliness}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.admin.reasonLabel} <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => {
                    setOverrideReason(e.target.value);
                    if (overrideError) setOverrideError('');
                  }}
                  placeholder={t.admin.reasonPlaceholder}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {overrideError && (
                  <p className="text-xs text-rose-600 mt-1">{overrideError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalTrip(null)}
                  className="py-2.5 px-4 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  {t.admin.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOverride}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.admin.confirmOverride}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Location Modal */}
      {selectedGpsTrip && (
        <GpsModal
          isOpen={!!selectedGpsTrip}
          onClose={() => setSelectedGpsTrip(null)}
          gpsUrl={selectedGpsTrip.gpsShareUrl || 'https://maps.google.com/?q=12.9796,77.5908'}
          driverName={selectedGpsTrip.assignedDriverName}
          vehicleModel={selectedGpsTrip.assignedVehicleModel}
          vehiclePlate={selectedGpsTrip.assignedVehiclePlate}
          pickup={selectedGpsTrip.pickupLocation}
          drop={selectedGpsTrip.dropLocation}
        />
      )}
    </div>
  );
};
