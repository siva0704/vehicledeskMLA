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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t.vip.currentLocation}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Chauffeur & Vehicle Context */}
          {(driverName || vehiclePlate) && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Chauffeur</span>
                <span className="font-bold text-slate-900">{driverName || 'Designated Driver'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Vehicle</span>
                <span className="font-bold font-mono-nums text-slate-900">
                  {vehicleModel} · {vehiclePlate}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Map Graphical Visualizer */}
          <div className="relative h-48 w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between p-4">
            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#475569 1px, transparent 1px), radial-gradient(#475569 1px, #f1f5f9 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            ></div>

            {/* Road lines simulation */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 fill-none"
              strokeWidth="4"
              strokeDasharray="6 6"
            >
              <path d="M 40 140 Q 180 40, 360 80 T 480 120" />
            </svg>

            {/* Waypoints */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="bg-white/95 px-2.5 py-1 rounded-md shadow-xs border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium uppercase block">Pickup</span>
                <span className="font-semibold text-slate-800 truncate max-w-[140px] block">
                  {pickup || 'Vidhana Soudha'}
                </span>
              </div>
              <div className="bg-white/95 px-2.5 py-1 rounded-md shadow-xs border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium uppercase block">Drop</span>
                <span className="font-semibold text-slate-800 truncate max-w-[140px] block">
                  {drop || 'KIA Airport VIP'}
                </span>
              </div>
            </div>

            {/* Animated Chauffeur Marker */}
            <div className="relative z-10 flex items-center justify-center my-auto">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-indigo-500/30 animate-ping"></span>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] font-mono-nums text-slate-600 bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                Live GPS: 12.9796° N, 77.5908° E
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Satellite Signal
              </span>
            </div>
          </div>

          {/* Official Google Maps Share Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Google Maps Live Share Link (Official Format)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={gpsUrl}
                className="w-full text-xs font-mono-nums py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
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
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>{t.common.openMaps}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
