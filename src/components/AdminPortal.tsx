import React, { useState } from 'react';
import { useStore } from '../store';
import { WA_DESK_URL } from '../api';
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
  ExternalLink,
  Flame,
  Activity,
  Layers,
  ChevronRight,
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
    toggleDriverCleanliness,
    setDriverStatus,
    language,
  } = useStore();
  const t = translations[language];

  // Filters & Selection
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedDriverId, setFocusedDriverId] = useState<string | null>(null);

  // Force-Assign Modal State
  const [overrideModalTrip, setOverrideModalTrip] = useState<TripRequest | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideError, setOverrideError] = useState<string>('');
  const [selectedGpsTrip, setSelectedGpsTrip] = useState<TripRequest | null>(null);

  // Helper map for vehicles
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  // Sort vehicles strictly by priority
  const sortedVehicles = [...vehicles].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  // Filter requests
  const filteredTrips = trips.filter((trip) => {
    if (requestFilter === 'PENDING') {
      if (trip.status !== 'PENDING') return false;
    } else if (requestFilter === 'ACTIVE') {
      if (
        !['ASSIGNED', 'ACCEPTED', 'KEY_COLLECTED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'TRIP_STARTED', 'GPS_SHARED', 'IN_PROGRESS'].includes(
          trip.status
        )
      ) {
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

  // Fairness metrics
  const totalWeeklyTrips = drivers.reduce((acc, d) => acc + d.tripsThisWeek, 0);
  const avgTripsPerDriver = drivers.length > 0 ? (totalWeeklyTrips / drivers.length).toFixed(1) : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{activeSubTab === 'admin-board' ? 'Fleet Command & Live Allocation Board' : 'Weekly Protocol Fairness Report & Audit'}</span>
            {activeSubTab === 'admin-report' && auditLogs.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded-full font-mono font-bold">
                {auditLogs.length} Overrides
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeSubTab === 'admin-board'
              ? 'Real-time priority queue allocation, active tour telemetry, and driver readiness.'
              : 'Protocol compliance audit trails, override justifications, and chauffeur workload balancing.'}
          </p>
        </div>

        {/* Admin Identity Capsule */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 apple-glass-island px-3.5 py-1.5 rounded-full shadow-2xs">
          <span className="font-semibold text-slate-900">{currentUser?.name}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">{currentUser?.designation}</span>
        </div>
      </div>

      {/* SCREEN 1: LIVE BOARD */}
      {activeSubTab === 'admin-board' && (
        <div className="space-y-6">
          {/* Apple Glass KPI Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="apple-card p-4 sm:p-5 relative overflow-hidden group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono block">
                Total Fleet
              </span>
              <span className="font-mono-nums text-2xl sm:text-3xl font-bold text-slate-950 mt-1 block tracking-tight">
                {vehicles.length} Units
              </span>
              <span className="text-[11.5px] text-slate-500 mt-1 block">
                Karnataka State Protocol Inventory
              </span>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-slate-400/60" />
            </div>

            <div className="apple-card p-4 sm:p-5 relative overflow-hidden group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 font-mono block">
                Available & Clean
              </span>
              <span className="font-mono-nums text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 block tracking-tight">
                {drivers.filter((d) => d.status === 'AVAILABLE' && d.cleanliness === 'CLEAN').length} Units
              </span>
              <span className="text-[11.5px] text-emerald-800/80 mt-1 block">
                Eligible for Priority Auto-Dispatch
              </span>
              <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="apple-card p-4 sm:p-5 relative overflow-hidden group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 font-mono block">
                Active MLA Tours
              </span>
              <span className="font-mono-nums text-2xl sm:text-3xl font-bold text-blue-900 mt-1 block tracking-tight">
                {trips.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length} Tours
              </span>
              <span className="text-[11.5px] text-blue-700/80 mt-1 block">
                Live Chauffeur Lifecycle
              </span>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
            </div>

            <div className="apple-card p-4 sm:p-5 relative overflow-hidden group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 font-mono block">
                Pending / Queued
              </span>
              <span className="font-mono-nums text-2xl sm:text-3xl font-bold text-amber-900 mt-1 block tracking-tight">
                {trips.filter((t) => t.status === 'PENDING').length} Requests
              </span>
              <span className="text-[11.5px] text-amber-700/80 mt-1 block">
                Requires Manual Attention
              </span>
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Interactive Fleet Readiness & Activity Heatmap Strip */}
          <div className="apple-card p-5 space-y-3.5 border-black/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
                  Live Fleet Readiness & Allocation Heatmap (Priority Queue)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available & Clean
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> On Tour
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Wash / Service
                </span>
              </div>
            </div>

            {/* 7 Slot Heatmap Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {sortedVehicles.map((veh) => {
                const drv = drivers.find((d) => d.vehicleId === veh.id);
                const isBusy = drv?.status === 'BUSY';
                const isClean = drv?.cleanliness === 'CLEAN';
                const isAvail = drv?.status === 'AVAILABLE' && isClean;
                const isFocused = focusedDriverId === drv?.id;

                const bgStatus = isBusy
                  ? 'bg-blue-50/90 border-blue-200 text-blue-900 ring-blue-500/20'
                  : isAvail
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 ring-emerald-500/20'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950 ring-amber-500/20';

                const dotColor = isBusy
                  ? 'bg-blue-500 animate-pulse'
                  : isAvail
                  ? 'bg-emerald-500'
                  : 'bg-amber-500';

                return (
                  <button
                    key={veh.id}
                    onClick={() => setFocusedDriverId(isFocused ? null : drv?.id || null)}
                    className={`text-left p-3 rounded-2xl border transition-all text-xs relative overflow-hidden group shadow-2xs hover:scale-[1.02] active:scale-98 ${bgStatus} ${
                      isFocused ? 'ring-2 ring-blue-600 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/80 border border-black/5">
                        P{veh.priority}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    </div>
                    <div className="font-bold text-[12px] truncate">{veh.model.split(' ')[0]}</div>
                    <div className="text-[10.5px] opacity-75 font-mono truncate">{veh.plate}</div>
                    <div className="text-[11px] font-medium mt-1 truncate border-t border-black/5 pt-1">
                      {drv?.name.split(' ')[0] || 'Unassigned'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Live Trip Requests (Allotment Board) */}
          <div className="apple-card overflow-hidden border-black/[0.08]">
            <div className="p-4 sm:p-5 border-b border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-950 tracking-tight">
                  {t.admin.liveRequests}
                </h3>
                <p className="text-xs text-slate-500">
                  Monitored in real-time under priority queue allocation constraints.
                </p>
              </div>

              {/* Apple Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="apple-segmented-track">
                  <button
                    onClick={() => setRequestFilter('ALL')}
                    className={`apple-segmented-pill text-xs ${
                      requestFilter === 'ALL' ? 'apple-segmented-pill-active' : ''
                    }`}
                  >
                    All ({trips.length})
                  </button>
                  <button
                    onClick={() => setRequestFilter('PENDING')}
                    className={`apple-segmented-pill text-xs ${
                      requestFilter === 'PENDING' ? 'apple-segmented-pill-active' : ''
                    }`}
                  >
                    Pending ({trips.filter((t) => t.status === 'PENDING').length})
                  </button>
                  <button
                    onClick={() => setRequestFilter('ACTIVE')}
                    className={`apple-segmented-pill text-xs ${
                      requestFilter === 'ACTIVE' ? 'apple-segmented-pill-active' : ''
                    }`}
                  >
                    Active ({trips.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length})
                  </button>
                  <button
                    onClick={() => setRequestFilter('COMPLETED')}
                    className={`apple-segmented-pill text-xs ${
                      requestFilter === 'COMPLETED' ? 'apple-segmented-pill-active' : ''
                    }`}
                  >
                    Completed
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search VIP or Car..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs apple-input w-full sm:w-48 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-black/[0.05]">
                  <tr>
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-4">VIP & Designation</th>
                    <th className="py-3.5 px-4">Route & Schedule</th>
                    <th className="py-3.5 px-4">Priority & Class</th>
                    <th className="py-3.5 px-4">Chauffeur & Car</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono-nums font-semibold text-slate-900">
                        {trip.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-950">{trip.vipName}</div>
                        <div className="text-[11px] text-slate-500">{trip.vipDesignation}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 truncate max-w-xs flex items-center gap-1.5 font-medium">
                          {trip.isRoundTrip ? (
                            <>
                              <span className="truncate">{trip.pickupLocation}</span>
                              <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                                <Repeat className="w-2.5 h-2.5" />
                                <span>Round</span>
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
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-nums text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-black/5">
                            {trip.assignedPriority ? `P${trip.assignedPriority}` : 'P1'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {trip.preferredClass}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {trip.assignedDriverName ? (
                          <div>
                            <div className="font-semibold text-slate-950">
                              {trip.assignedDriverName}
                            </div>
                            <div className="text-[11px] font-mono-nums text-slate-500">
                              {trip.assignedVehiclePlate} ({trip.assignedVehicleModel})
                            </div>
                            {trip.isOverridden && (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5 inline-block">
                                Override: {trip.overriddenByAdmin}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-700 font-semibold italic text-xs">
                            Unassigned (Queued)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold text-[11px] px-2.5 py-1 rounded-full border ${
                            trip.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : trip.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                              : trip.status === 'ARRIVED_AT_PICKUP'
                              ? 'bg-purple-50 text-purple-800 border-purple-200/80 animate-pulse'
                              : 'bg-blue-50 text-blue-800 border-blue-200/80'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {trip.gpsShareUrl && (
                            <button
                              onClick={() => setSelectedGpsTrip(trip)}
                              title="View GPS Share Link"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                              <Navigation className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenOverrideModal(trip)}
                            className="px-3 py-1 text-xs font-semibold text-slate-700 apple-btn-secondary"
                          >
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Clean Apple-style Zero State */}
                  {filteredTrips.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 px-4 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-black/5 flex items-center justify-center mx-auto text-slate-400">
                            <Car className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              No Active Dispatches in Queue
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Waiting for Hon'ble MLAs to book rides via WhatsApp. Incoming requests will automatically trigger priority queue auto-dispatch.
                            </p>
                          </div>
                          <a
                            href={WA_DESK_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-all active:scale-95 shadow-2xs"
                          >
                            <span>Open WhatsApp Emulator & Book</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Fleet Status Grid */}
          <div className="apple-card overflow-hidden border-black/[0.08]">
            <div className="p-4 sm:p-5 border-b border-black/[0.05] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-950 tracking-tight">
                  {t.admin.fleetOverview}
                </h3>
                <p className="text-xs text-slate-500">
                  Priority Queue Constraints: Vehicles must be <span className="font-semibold text-slate-800">Available</span> and <span className="font-semibold text-slate-800">Clean</span> to receive automated dispatches.
                </p>
              </div>
              {focusedDriverId && (
                <button
                  onClick={() => setFocusedDriverId(null)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-black/[0.05]">
                  <tr>
                    <th className="py-3.5 px-4">Priority & Vehicle</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Chauffeur</th>
                    <th className="py-3.5 px-4">Status Toggle</th>
                    <th className="py-3.5 px-4">Cleanliness Gate</th>
                    <th className="py-3.5 px-4">Auto-Eligibility</th>
                    <th className="py-3.5 px-4 font-mono-nums text-right">Trips Today / Week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {sortedVehicles
                    .filter((v) => {
                      if (!focusedDriverId) return true;
                      const d = drivers.find((drv) => drv.vehicleId === v.id);
                      return d?.id === focusedDriverId;
                    })
                    .map((veh) => {
                      const drv = drivers.find((d) => d.vehicleId === veh.id);
                      if (!drv) return null;
                      const isEligible = drv.status === 'AVAILABLE' && drv.cleanliness === 'CLEAN';

                      return (
                        <tr key={veh.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-400/30">
                                P{veh.priority}
                              </span>
                              <div>
                                <div className="font-semibold text-slate-950">{veh.model}</div>
                                <div className="text-[11px] font-mono-nums text-slate-500">
                                  {veh.plate}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono-nums text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-black/5">
                              {veh.vehicleClass}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-950">{drv.name}</div>
                            <div className="text-[11px] font-mono-nums text-slate-500">{drv.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="apple-segmented-track scale-90 origin-left">
                              <button
                                onClick={() => setDriverStatus(drv.id, 'AVAILABLE')}
                                className={`apple-segmented-pill text-[11px] ${
                                  drv.status === 'AVAILABLE' ? 'apple-segmented-pill-active' : ''
                                }`}
                              >
                                Available
                              </button>
                              <button
                                onClick={() => setDriverStatus(drv.id, 'BUSY')}
                                className={`apple-segmented-pill text-[11px] ${
                                  drv.status === 'BUSY' ? 'apple-segmented-pill-active' : ''
                                }`}
                              >
                                Busy
                              </button>
                              <button
                                onClick={() => setDriverStatus(drv.id, 'MAINTENANCE')}
                                className={`apple-segmented-pill text-[11px] ${
                                  drv.status === 'MAINTENANCE' ? 'apple-segmented-pill-active' : ''
                                }`}
                              >
                                Rest
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleDriverCleanliness(drv.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all active:scale-95 flex items-center gap-1.5 ${
                                drv.cleanliness === 'CLEAN'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                              title="Click to toggle cleanliness state"
                            >
                              {drv.cleanliness === 'CLEAN' ? (
                                <>
                                  <Sparkles className="w-3 h-3 text-emerald-600" />
                                  <span>Clean</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Needs Wash</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            {isEligible ? (
                              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Auto-Eligible</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <X className="w-3 h-3 text-slate-400" />
                                <span>Ineligible</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-slate-900">
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
          <div className="apple-card p-6 space-y-4 border-black/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-950 tracking-tight">
                    {t.admin.fairnessReportTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {t.admin.fairnessExplanation}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold font-mono block">
                  Weekly Dept Average
                </span>
                <span className="font-mono-nums text-base font-bold text-slate-950">
                  {avgTripsPerDriver} trips / driver
                </span>
              </div>
            </div>

            {/* Fairness Distribution Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-black/[0.05]">
                  <tr>
                    <th className="py-3.5 px-4">{t.admin.fairnessDriver}</th>
                    <th className="py-3.5 px-4">{t.admin.fairnessVehicle}</th>
                    <th className="py-3.5 px-4 font-mono-nums text-center">{t.admin.fairnessTripsToday}</th>
                    <th className="py-3.5 px-4 font-mono-nums text-center">{t.admin.fairnessTripsWeek}</th>
                    <th className="py-3.5 px-4 font-mono-nums text-center">{t.admin.fairnessHours}</th>
                    <th className="py-3.5 px-4">{t.admin.fairnessStatus}</th>
                    <th className="py-3.5 px-4">{t.admin.fairnessFairnessIndex}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {drivers.map((d) => {
                    const veh = vehicleMap.get(d.vehicleId);
                    const diff = d.tripsThisWeek - parseFloat(avgTripsPerDriver);
                    let balanceStatus = 'Equitable';
                    let balanceColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';

                    if (diff > 3) {
                      balanceStatus = 'Heavy Duty (De-prioritize)';
                      balanceColor = 'text-amber-800 bg-amber-50 border-amber-200';
                    } else if (diff < -3) {
                      balanceStatus = 'Light Duty (Priority Next)';
                      balanceColor = 'text-blue-800 bg-blue-50 border-blue-200';
                    }

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-950">{d.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono-nums">
                          {veh?.model} ({veh?.plate})
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono-nums font-bold text-slate-950">
                          {d.tripsToday}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono-nums font-bold text-slate-950">
                          {d.tripsThisWeek}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono-nums text-slate-600">
                          {d.totalHoursThisWeek}h
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-medium text-slate-700">
                            {d.status} · {d.cleanliness === 'CLEAN' ? 'Clean' : 'Needs Wash'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${balanceColor}`}
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
          <div className="apple-card p-6 space-y-4 border-black/[0.08]">
            <div className="flex items-center gap-2 border-b border-black/[0.05] pb-3">
              <History className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-950 tracking-tight">
                {t.admin.auditLogTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Permanent immutable log of every manual override. Mandated by Protocol Security Standards.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-black/[0.05]">
                  <tr>
                    <th className="py-3.5 px-4">{t.admin.auditTimestamp}</th>
                    <th className="py-3.5 px-4">{t.admin.auditTripId}</th>
                    <th className="py-3.5 px-4">{t.admin.auditVip}</th>
                    <th className="py-3.5 px-4">{t.admin.auditDriver}</th>
                    <th className="py-3.5 px-4">{t.admin.auditAdmin}</th>
                    <th className="py-3.5 px-4">{t.admin.auditReason}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {auditLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono-nums text-slate-500 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono-nums font-semibold text-slate-900">
                        {entry.tripId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-950">{entry.vipName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{entry.driverName}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-900">{entry.adminName}</td>
                      <td className="py-3.5 px-4 text-slate-800 bg-amber-50/60 rounded-xl font-medium max-w-sm">
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

      {/* FORCE-ASSIGN OVERRIDE MODAL (Apple Sheet Modal) */}
      {overrideModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="apple-card-elevated max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-black/[0.08]">
            <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  {t.admin.overrideModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setOverrideModalTrip(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 shadow-2xs">
                <p className="font-semibold mb-0.5">Audit Mandatory Warning</p>
                <p className="text-slate-700">{t.admin.overrideModalWarning}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-black/[0.05] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-nums font-bold text-slate-950">
                    {overrideModalTrip.id} · {overrideModalTrip.vipName}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Pref: {overrideModalTrip.preferredClass}
                  </span>
                </div>
                <p className="text-slate-600">
                  {overrideModalTrip.pickupLocation} → {overrideModalTrip.dropLocation}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.admin.selectDriverLabel}
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full p-2.5 text-xs apple-input bg-white font-medium"
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
                  className="w-full p-2.5 text-xs apple-input"
                />
                {overrideError && (
                  <p className="text-xs text-rose-600 mt-1">{overrideError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalTrip(null)}
                  className="apple-btn-secondary px-4 text-xs font-semibold"
                >
                  {t.admin.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOverride}
                  className="apple-btn-primary flex items-center gap-1.5 text-xs font-semibold"
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
