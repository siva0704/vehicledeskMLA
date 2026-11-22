import React, { useState } from 'react';
import { translations } from '../translations';
import { useStore } from '../store';
import { MapPin, ExternalLink, Copy, Check, Navigation, X } from 'lucide-react';

interface GpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gpsUrl: string;
  driverName?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  pickup?: string;
  drop?: string;
}

export const GpsModal: React.FC<GpsModalProps> = ({
  isOpen,
  onClose,
  gpsUrl,
  driverName,
  vehicleModel,
  vehiclePlate,
  pickup,
  drop,
}) => {
  const { language } = useStore();
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(gpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="apple-card-elevated max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 border border-white/20">
        {/* Apple Sheet Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {t.vip.currentLocation}
              </h3>
              <p className="text-[11px] text-slate-500">Official Protocol Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Chauffeur & Vehicle Context */}
          {(driverName || vehiclePlate) && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Assigned Chauffeur
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {driverName || 'Designated Driver'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Vehicle Unit
                </span>
                <span className="font-bold font-mono-nums text-slate-900 mt-0.5 block">
                  {vehicleModel} · {vehiclePlate}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Map Graphical Visualizer */}
          <div className="relative h-48 w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border border-slate-700/60 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#94a3b8 1px, #0f172a 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            ></div>

            {/* Road lines simulation */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-emerald-500/30 fill-none"
              strokeWidth="3"
              strokeDasharray="6 6"
            >
              <path d="M 40 140 Q 180 40, 360 80 T 480 120" />
            </svg>

            {/* Waypoints */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white shadow-sm">
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Pickup</span>
                <span className="font-semibold truncate max-w-[140px] block text-xs">
                  {pickup || 'Vidhana Soudha'}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white shadow-sm">
                <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block">Drop</span>
                <span className="font-semibold truncate max-w-[140px] block text-xs">
                  {drop || 'Kempegowda Intl Airport'}
                </span>
              </div>
            </div>

            {/* Animated Chauffeur Marker */}
            <div className="relative z-10 flex items-center justify-center my-auto">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-10 h-10 rounded-full bg-emerald-500/40 animate-ping"></span>
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white font-bold">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-mono-nums text-slate-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                12.9796° N, 77.5908° E
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Satellite Lock</span>
              </span>
            </div>
          </div>

          {/* Official Google Maps Share Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Google Maps Live Tracking URL (Protocol Encrypted)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={gpsUrl}
                className="apple-input w-full text-xs font-mono-nums py-2 px-3 text-slate-800 select-all"
              />
              <button
                onClick={handleCopy}
                className="apple-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.common.copied : t.common.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={gpsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-primary flex-1 py-2.5 px-4 text-xs flex items-center justify-center gap-2"
            >
              <span>{t.common.openMaps}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="apple-btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
