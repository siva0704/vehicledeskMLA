import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { TripRequest, VehicleClass } from '../types';
import { getSeniorityDetails } from '../ruleEngine';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  PhoneCall,
  AlertCircle,
  FileCheck,
  Shield,
  ArrowRight,
  ExternalLink,
  Info,
  Repeat,
} from 'lucide-react';
import { GpsModal } from './GpsModal';

interface VipPortalProps {
  activeSubTab: 'vip-home' | 'vip-request' | 'vip-trip';
  onChangeSubTab: (tab: 'vip-home' | 'vip-request' | 'vip-trip') => void;
}

export const VipPortal: React.FC<VipPortalProps> = ({
  activeSubTab,
  onChangeSubTab,
}) => {
  const {
    currentUser,
    trips,
    vehicles,
    drivers,
    createTripRequest,
    driverCompleteTrip,
    language,
  } = useStore();
  const t = translations[language];

  // Request Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00 AM');
  const [pickup, setPickup] = useState('Vidhana Soudha (Porch Gate 1)');
  const [drop, setDrop] = useState("Kempegowda Int'l Airport (KIA) VIP Terminal 2");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [notes, setNotes] = useState('');
  const [lastSubmissionResult, setLastSubmissionResult] = useState<{
    trip: TripRequest;
    reason: string;
    success: boolean;
  } | null>(null);

  // VIP Seniority & Auto-assigned Vehicle Class
  const seniorityInfo = getSeniorityDetails(currentUser);

  // GPS Modal State
  const [selectedGpsTrip, setSelectedGpsTrip] = useState<TripRequest | null>(null);

  // Filter trips for current VIP
  const myTrips = trips.filter((tr) => tr.vipId === currentUser?.id);
  const activeTrip = myTrips.find((tr) => tr.status !== 'COMPLETED' && tr.status !== 'CANCELLED');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const { trip, engineResult } = createTripRequest({
      vipId: currentUser.id,
      vipName: currentUser.name,
      vipPhone: currentUser.phone,
      vipDesignation: currentUser.designation || 'VIP Protocol Member',
      date,
      time,
      pickupLocation: pickup,
      dropLocation: isRoundTrip ? `Round Trip (Return to ${pickup})` : drop,
      isRoundTrip,
      preferredClass: seniorityInfo.vehicleClass,
      notes,
    });

    setLastSubmissionResult({
      trip,
      reason: engineResult.traceReason,
      success: engineResult.success,
    });

    if (engineResult.success) {
      setTimeout(() => {
        onChangeSubTab('vip-trip');
      }, 1200);
    }
  };

  // Preset location chips for convenience
  const PRESET_PICKUPS = [
    'Vidhana Soudha (Porch Gate 1)',
    'Kumara Krupa State Guest House',
    'Raj Bhavan (Governor Secretariat)',
    'Vikasa Soudha Entrance',
  ];

  const PRESET_DROPS = [
    "Kempegowda Int'l Airport (KIA) VIP Terminal 2",
    'HAL Airport VIP Porch',
    'Suvarna Vidhana Soudha, Belagavi',
    'IISc Main Auditorium, Malleshwaram',
  ];

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills (Interactive Filter Controls) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onChangeSubTab('vip-home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'vip-home'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.nav.vipHome}
          </button>
          <button
            onClick={() => onChangeSubTab('vip-request')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'vip-request'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.nav.vipRequest}
          </button>
          <button
            onClick={() => onChangeSubTab('vip-trip')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative ${
              activeSubTab === 'vip-trip'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t.nav.vipMyTrip}</span>
            {activeTrip && (
              <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>
        </div>

        {/* Current VIP Identity */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{currentUser?.name}</span>
          <span aria-hidden="true">·</span>
          <span>{currentUser?.designation}</span>
        </div>
      </div>

      {/* SCREEN 1: VIP HOME */}
      {activeSubTab === 'vip-home' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs text-indigo-300 font-medium">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Protocol Allocation Desk</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t.vip.welcome} {currentUser?.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.vip.activeStatusBanner} Vehicles are strictly dispatched via the Hardcoded
                Rule Engine only when Chauffeur is <span className="text-white font-semibold">Available</span> and the vehicle is verified <span className="text-white font-semibold">Clean</span>.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onChangeSubTab('vip-request')}
                  className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <Car className="w-4 h-4 text-slate-900" />
                  <span>{t.vip.newRequestBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>



          {/* Active Trip Spotlight if existing */}
          {activeTrip && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-900">Active Protocol Tour</span>
                    <span className="text-[11px] font-mono-nums px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {activeTrip.id}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {activeTrip.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-950 font-medium">
                    {activeTrip.pickupLocation} → {activeTrip.dropLocation}
                  </p>
                  <p className="text-xs text-indigo-800 mt-1">
                    Assigned: <span className="font-semibold">{activeTrip.assignedVehicleModel}</span> ({activeTrip.assignedVehiclePlate}) · Chauffeur: {activeTrip.assignedDriverName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onChangeSubTab('vip-trip')}
                    className="px-3.5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs whitespace-nowrap"
                  >
                    {t.vip.myTripTitle}
                  </button>
                  {activeTrip.gpsShareUrl && (
                    <button
                      onClick={() => setSelectedGpsTrip(activeTrip)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-indigo-300 text-indigo-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Live GPS</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 2: REQUEST VEHICLE */}
      {activeSubTab === 'vip-request' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {t.vip.requestFormTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Submissions are instantly evaluated against the Hardcoded Rule Engine (Available + Clean check, preference class matching, and driver fairness balancing).
              </p>
            </div>

            {lastSubmissionResult && (
              <div
                className={`p-4 rounded-xl mb-6 border text-xs ${
                  lastSubmissionResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {lastSubmissionResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {lastSubmissionResult.success
                      ? 'Rule Engine Auto-Allocation Succeeded'
                      : 'Request Queued for Admin Attention'}
                  </span>
                </div>
                <p className="text-slate-700">{lastSubmissionResult.reason}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t.vip.dateLabel}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t.vip.timeLabel}
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Location with Round Trip toggle beside it */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.vip.pickupLabel}
                  </label>

                  {/* Round Trip Toggle beside Pickup */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Repeat className={`w-3.5 h-3.5 ${isRoundTrip ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{t.vip.roundTripToggle}</span>
                    </span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={isRoundTrip}
                        onChange={(e) => setIsRoundTrip(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-slate-900"></div>
                    </div>
                  </label>
                </div>

                <div className="relative mb-2">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Enter pickup address / gate"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PICKUPS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setPickup(loc)}
                      className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Round trip active banner vs Drop Location (Drop is GONE when round trip toggled on) */}
              {isRoundTrip ? (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
                  <Repeat className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Round Trip Itinerary Enabled</span>
                    <span className="text-slate-600 text-[11px] mt-0.5 block">
                      Drop location is omitted for round trips. Chauffeur remains on standby with you throughout the tour and returns to <span className="font-semibold text-slate-900">{pickup}</span>.
                    </span>
                  </div>
                </div>
              ) : (
                /* Drop Location - Visible only when round trip is OFF */
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t.vip.dropLabel}
                  </label>
                  <div className="relative mb-2">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required={!isRoundTrip}
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      placeholder="Enter destination"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_DROPS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setDrop(loc)}
                        className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-assigned Vehicle Class based on VIP Seniority (Preferred Class selection removed) */}
              <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {t.vip.seniorityAutoClassTitle}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {seniorityInfo.tierName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {seniorityInfo.className}
                      </span>
                      <span className="text-[10px] font-mono-nums px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                        Auto-assigned
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Designated Fleet: {seniorityInfo.carModels}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-[11px]">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      VIP Protocol Rank
                    </span>
                    <span className="font-semibold text-slate-800">
                      {currentUser?.designation || 'Special Protocol Officer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.vip.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.vip.notesPlaceholder}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{t.vip.submitRequest}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREEN 3: MY TRIP */}
      {activeSubTab === 'vip-trip' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {activeTrip ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {t.vip.myTripTitle}
                    </h3>
                    <span className="text-xs font-mono-nums text-slate-500 font-semibold">
                      {activeTrip.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeTrip.date} at {activeTrip.time}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {activeTrip.status}
                  </span>
                  {activeTrip.isOverridden && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Admin Override
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Rule Engine Dispatch Stamp */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Dispatch Audit Trace: </span>
                    <span>{activeTrip.ruleTraceReason || 'Dispatched via hardcoded rule engine.'}</span>
                  </div>
                </div>

                {/* Pickup to Drop Row */}
                <div
                  className={`grid ${
                    activeTrip.isRoundTrip ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                  } gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {t.common.pickup}
                      </span>
                      {activeTrip.isRoundTrip && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          <Repeat className="w-3 h-3 text-indigo-600" />
                          <span>Round Trip</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {activeTrip.pickupLocation}
                    </span>
                    {activeTrip.isRoundTrip && (
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Chauffeur remains on standby and returns to {activeTrip.pickupLocation}.
                      </span>
                    )}
                  </div>
                  {!activeTrip.isRoundTrip && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        {t.common.drop}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 block">
                        {activeTrip.dropLocation}
                      </span>
                    </div>
                  )}
                </div>

                {/* Assigned Vehicle & Chauffeur Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle */}
                  <div className="p-4 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {t.vip.assignedVehicle}
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {activeTrip.assignedVehicleModel || 'Pending assignment'}
                    </div>
                    <div className="text-xs font-mono-nums text-slate-600 mt-0.5">
                      Plate: {activeTrip.assignedVehiclePlate || 'N/A'} · {activeTrip.assignedVehicleClass}
                    </div>
                  </div>

                  {/* Chauffeur */}
                  <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        {t.vip.assignedDriver}
                      </span>
                      <div className="text-sm font-bold text-slate-900">
                        {activeTrip.assignedDriverName || 'Pending driver'}
                      </div>
                      <div className="text-xs font-mono-nums text-slate-600 mt-0.5">
                        {activeTrip.assignedDriverPhone || 'N/A'}
                      </div>
                    </div>
                    {activeTrip.assignedDriverPhone && (
                      <a
                        href={`tel:${activeTrip.assignedDriverPhone}`}
                        className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title={t.vip.callDriver}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Post-assignment: Google Maps Live Location Share Link */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {t.vip.currentLocation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeTrip.gpsShareUrl
                          ? 'Live GPS broadcast active via Google Maps share link.'
                          : 'Driver has not yet shared live GPS link. Stand by.'}
                      </p>
                    </div>

                    {activeTrip.gpsShareUrl ? (
                      <button
                        onClick={() => setSelectedGpsTrip(activeTrip)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t.vip.viewGpsLink}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 italic">
                        Awaiting GPS from Driver
                      </span>
                    )}
                  </div>
                </div>

                {/* Driver Lifecycle Progress Timeline */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-3">
                    Driver Lifecycle Flow
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        ['ASSIGNED', 'ACCEPTED', 'GPS_SHARED', 'IN_PROGRESS', 'COMPLETED'].includes(
                          activeTrip.status
                        )
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Step 1</span>
                      {t.vip.timelineAssigned}
                    </div>

                    <div
                      className={`p-2.5 rounded-lg border ${
                        ['ACCEPTED', 'GPS_SHARED', 'IN_PROGRESS', 'COMPLETED'].includes(activeTrip.status)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Step 2</span>
                      {t.vip.timelineAccepted}
                    </div>

                    <div
                      className={`p-2.5 rounded-lg border ${
                        ['GPS_SHARED', 'IN_PROGRESS', 'COMPLETED'].includes(activeTrip.status)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Step 3</span>
                      {t.vip.timelineGps}
                    </div>

                    <div
                      className={`p-2.5 rounded-lg border ${
                        ['IN_PROGRESS', 'COMPLETED'].includes(activeTrip.status)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Step 4</span>
                      {t.vip.timelineStarted}
                    </div>
                  </div>
                </div>

                {/* VIP Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => driverCompleteTrip(activeTrip.id, 'CLEAN')}
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.vip.markDone}</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Feedback received. Protocol officer has been notified.');
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    {t.vip.reportIssue}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Car className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900">{t.vip.noActiveTrip}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule your official travel using the Rule Engine allocation desk.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onChangeSubTab('vip-request')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {t.vip.bookNow}
                </button>
              </div>
            </div>
          )}

          {/* Past Trips History */}
          {myTrips.filter((t) => t.status === 'COMPLETED').length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed Protocol Trips
              </h3>
              <div className="space-y-3">
                {myTrips
                  .filter((t) => t.status === 'COMPLETED')
                  .map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {trip.pickupLocation} → {trip.dropLocation}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {trip.date} · Chauffeur: {trip.assignedDriverName} ({trip.assignedVehiclePlate})
                        </div>
                      </div>
                      <span className="font-mono-nums text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        Completed
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
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
