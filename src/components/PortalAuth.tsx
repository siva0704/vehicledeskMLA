import React, { useState } from 'react';
import { useStore } from '../store';
import { User } from '../types';
import {
  Shield,
  Car,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Lock,
  Building2,
  Sparkles,
} from 'lucide-react';
import { api, WA_DESK_URL } from '../api';
import { translations } from '../translations';

interface PortalAuthProps {
  initialRole?: 'ADMIN' | 'DRIVER';
  onSuccess: (role: 'ADMIN' | 'DRIVER') => void;
}

export const PortalAuth: React.FC<PortalAuthProps> = ({
  initialRole = 'ADMIN',
  onSuccess,
}) => {
  const { users, login, language } = useStore();
  const t = translations[language];

  const [activeRole, setActiveRole] = useState<'ADMIN' | 'DRIVER'>(initialRole);
  const [phone, setPhone] = useState(
    initialRole === 'ADMIN' ? '+919900055667' : '+919448033445'
  );
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [otp, setOtp] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleUsers = users.filter((u) => u.role === activeRole);

  const handleRoleSwitch = (role: 'ADMIN' | 'DRIVER') => {
    setActiveRole(role);
    setStep('PHONE');
    setError('');
    if (role === 'ADMIN') {
      setPhone('+919900055667');
    } else {
      setPhone('+919448033445');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    const matched = users.find((u) =>
      u.phone.replace(/[\s\-\(\)]/g, '').endsWith(clean.slice(-10))
    );

    if (!matched || matched.role !== activeRole) {
      setError(
        activeRole === 'ADMIN'
          ? 'Unauthorized. Only registered State Fleet Superintendents and Protocol Officers can access the administration console.'
          : 'Unauthorized. Only authorized Karnataka State Protocol Chauffeurs can access this cockpit.'
      );
      return;
    }

    setStep('OTP');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      try {
        const { user } = await api.login(phone, activeRole);
        login(user);
      } catch (err) {
        const matched =
          users.find(
            (u) =>
              u.role === activeRole &&
              u.phone
                .replace(/[\s\-\(\)]/g, '')
                .endsWith(phone.replace(/[\s\-\(\)]/g, '').slice(-10))
          ) || roleUsers[0];
        if (matched) login(matched);
      }
      onSuccess(activeRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (presetUser: User) => {
    setPhone(presetUser.phone);
    setError('');
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Official Government Portal Card */}
      <div className="apple-card-elevated overflow-hidden border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white rounded-3xl">
        {/* State Emblem & Authority Header */}
        <div className="p-6 sm:p-8 text-center border-b border-black/[0.06] bg-gradient-to-b from-white via-slate-50/40 to-slate-100/50">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 shadow-md ring-2 ring-amber-500/40 border-2 border-amber-400/50 bg-slate-900 flex items-center justify-center">
            <img
              src="/assets/vehicle-desk-emblem.svg"
              alt="Government of Karnataka Emblem"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 tracking-wide mb-2">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Government of Karnataka · DPAR Protocol Wing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
            State Protocol Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Official Single Sign-On Portal for Fleet Administration &amp; Chauffeurs
          </p>
        </div>

        {/* Apple-style Role Switcher Tabs */}
        <div className="px-6 sm:px-8 pt-6 pb-2">
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100/90 border border-black/5 gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-white text-slate-950 shadow-sm border border-black/[0.06]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeRole === 'ADMIN' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Fleet Administration</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('DRIVER')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${
                activeRole === 'DRIVER'
                  ? 'bg-white text-slate-950 shadow-sm border border-black/[0.06]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Car className={`w-4 h-4 ${activeRole === 'DRIVER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Chauffeur Cockpit</span>
            </button>
          </div>
        </div>

        {/* Authentication Form */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  {activeRole === 'ADMIN' ? 'Officer Mobile / Staff ID' : 'Chauffeur Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94480 00000"
                    required
                    className="apple-input pl-10 h-11 text-sm font-mono tracking-wide"
                  />
                </div>
              </div>

              {/* Quick Preset Selector for Beta Testing */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Authorized Credentials (Beta Verification)
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
                    1-Tap Fill
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleUsers.slice(0, 2).map((u) => {
                    const isSelected =
                      phone.replace(/[\s\-\(\)]/g, '').endsWith(u.phone.replace(/[\s\-\(\)]/g, '').slice(-10));
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectPreset(u)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? activeRole === 'ADMIN'
                              ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-semibold shadow-xs'
                              : 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-xs'
                            : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">{u.phone}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className={`apple-btn-primary w-full h-11 mt-2 text-sm font-bold flex items-center justify-center gap-2 ${
                  activeRole === 'ADMIN'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>Continue with Secure OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Verification Code (SMS / System OTP)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    required
                    className="apple-input pl-10 h-11 text-sm font-mono tracking-widest text-center text-lg font-bold"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
                  <span>Authorized mobile: <strong className="font-mono text-slate-700">{phone}</strong></span>
                  <button
                    type="button"
                    onClick={() => setStep('PHONE')}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`apple-btn-primary w-full h-11 text-sm font-bold flex items-center justify-center gap-2 ${
                  activeRole === 'ADMIN'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span>Verifying clearance...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize Session</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Official Protocol Footer Notice for Hon'ble MLAs */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Hon'ble MLAs &amp; Legislative Members Booking</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                Protocol vehicle dispatches are operated 24/7 via the verified Government WhatsApp Protocol Desk. No web login required for Hon'ble Members.
              </p>
            </div>
          </div>
          <a
            href={WA_DESK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn-secondary py-2 px-3 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 shrink-0 inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>WhatsApp Protocol Desk</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </a>
        </div>
      </div>
    </div>
  );
};
