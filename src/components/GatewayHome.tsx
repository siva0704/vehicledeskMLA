import React from 'react';
import {
  Shield,
  Car,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Smartphone,
  KeyRound,
  Compass,
} from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { WA_DESK_URL, isProdHost } from '../api';

interface GatewayHomeProps {
  onNavigate: (route: string) => void;
}

export const GatewayHome: React.FC<GatewayHomeProps> = ({ onNavigate }) => {
  const { language, backendConnected, users } = useStore();
  const t = translations[language];

  const mlaList = users.filter((u) => u.role === 'VIP');
  const driverList = users.filter((u) => u.role === 'DRIVER');

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-10">
      {/* Apple Executive Hero Header */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full apple-glass-island text-slate-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Department of Personnel and Administrative Reforms (DPAR) · Protocol Wing</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight leading-tight">
          Karnataka State VIP Fleet & Allocation Desk
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Autonomous priority queue allocation, chauffeur state-machine telemetry, and dedicated WhatsApp self-service for Hon'ble Members of the Legislative Assembly.
        </p>

        {/* Live System Connectivity Capsule */}
        <div className="flex items-center justify-center gap-3 text-xs pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-black/5 text-slate-700 shadow-2xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>Priority Queue Engine: <strong className="font-semibold text-slate-900">{backendConnected ? (isProdHost ? 'Live on Cloud Engine' : 'Live on Port 4000') : 'Local Standby'}</strong></span>
          </div>

          <a
            href={WA_DESK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100/70 font-semibold transition-all active:scale-95 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WA-Sim Protocol Emulator {isProdHost ? '(Cloud)' : '(3005)'}</span>
            <ExternalLink className="w-3 h-3 text-emerald-600/70" />
          </a>
        </div>
      </div>

      {/* Role Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Admin Portal */}
        <div className="apple-card p-6 flex flex-col justify-between group hover:border-blue-400/50">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-xs">
              <Shield className="w-6 h-6 stroke-[1.8]" />
            </div>

            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                Superintendent & Staff
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">Admin Portal</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Live allocation board, real-time driver readiness monitoring, emergency overrides with mandatory audit logging, and daily dispatch reports.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-black/[0.04]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live Priority Queue Telemetry</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cleanliness Gate & Duty Overrides</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protocol Audit Compliance Intelligence</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('/admin/login')}
              className="w-full apple-btn-primary flex items-center justify-center gap-2"
            >
              <span>Access Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Driver Portal */}
        <div className="apple-card p-6 flex flex-col justify-between group hover:border-emerald-400/50">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-xs">
              <Car className="w-6 h-6 stroke-[1.8]" />
            </div>

            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                State Chauffeur Cockpit
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">Driver Portal</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Focused mobile cockpit for protocol chauffeurs with 5-step trip execution, vehicle sanitization verification, and automated arrival alerts.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-black/[0.04]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Duty Readiness & Cleanliness Toggles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sequential 5-Step Trip Execution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated WhatsApp Arrival Alerts</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('/driver/login')}
              className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Chauffeur Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: WhatsApp for MLAs */}
        <div className="apple-card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border-black/10 shadow-lg">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-xs">
              <MessageSquare className="w-6 h-6 stroke-[1.8]" />
            </div>

            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">
                Exclusively on WhatsApp
              </span>
              <h2 className="text-xl font-bold text-white mt-2 tracking-tight">Hon'ble MLAs Desk</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Official protocol rides for Hon'ble MLAs are booked <strong className="text-emerald-300 font-semibold">exclusively via WhatsApp</strong>. Zero login friction.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-2 text-xs">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive & Natural Language:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Reply with <em>"Need car tomorrow at 10 AM to Airport"</em> or select from geofenced pickup lists like Deepika Location (LH).
              </p>
            </div>
          </div>

          <div className="pt-6 space-y-2 relative z-10">
            <a
              href={WA_DESK_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-full text-xs font-bold transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md"
            >
              <span>Launch WhatsApp Simulator</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[10.5px] text-center text-slate-400 font-medium">
              {isProdHost ? 'Cloud WA-Sim with verified MLAs' : 'WA-Sim running at localhost:3005 with verified MLAs'}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Seeded Credentials Showcase */}
      <div className="apple-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Verified Seeded Numbers & Personas (Production Testing)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Clean testing cohort. No dummy mock data or non-existent numbers.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-black/5">
            Passcode for all logins: 123456
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MLA Column */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏛️</span>
              <span>Hon'ble MLAs (WhatsApp)</span>
            </div>
            {mlaList.map((mla) => (
              <div
                key={mla.id}
                className="p-3 rounded-xl bg-white/70 border border-black/[0.06] shadow-2xs space-y-1 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{mla.name}</span>
                  <span className="text-[9.5px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                    {mla.seniorityTier}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{mla.designation}</p>
                <div className="text-[11px] font-mono text-emerald-800 font-semibold pt-0.5">
                  {mla.phone}
                </div>
              </div>
            ))}
          </div>

          {/* Driver Column */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚘</span>
              <span>State Chauffeurs (Cockpit)</span>
            </div>
            {driverList.map((drv) => (
              <div
                key={drv.id}
                className="p-3 rounded-xl bg-white/70 border border-black/[0.06] shadow-2xs space-y-1 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{drv.name}</span>
                  <span className="text-[9.5px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                    Priority Fleet
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Designated State Protocol Chauffeur</p>
                <div className="text-[11px] font-mono text-slate-700 font-semibold pt-0.5">
                  {drv.phone}
                </div>
              </div>
            ))}
          </div>

          {/* Admin Column */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Administration (Console)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 border border-black/[0.06] shadow-2xs space-y-1 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Kavitha Rao</span>
                <span className="text-[9.5px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-500">State Fleet Superintendent & Protocol Officer</p>
              <div className="text-[11px] font-mono text-blue-800 font-semibold pt-0.5">
                +91 99000 55667
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-dashed border-slate-300 text-xs text-slate-500 space-y-1.5">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                <span>Quick Login Tip</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Clicking any persona on the login screens automatically fills the credential for instant validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
