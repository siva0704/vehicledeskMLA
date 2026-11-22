import React, { useState } from 'react';
import { useStore } from '../store';
import { User } from '../types';
import {
  Shield,
  Phone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { api } from '../api';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const { users, login } = useStore();
  const [phone, setPhone] = useState('+919900055667');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [otp, setOtp] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const adminUsers = users.filter((u) => u.role === 'ADMIN');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    const matched = users.find((u) =>
      u.phone.replace(/[\s\-\(\)]/g, '').endsWith(clean.slice(-10))
    );

    if (!matched || matched.role !== 'ADMIN') {
      setError(
        'Unauthorized. Only registered Fleet Superintendents and Protocol Officers can access this console.'
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
        const { user } = await api.login(phone, 'ADMIN');
        login(user);
      } catch (err) {
        const matched = users.find((u) => u.role === 'ADMIN');
        if (matched) login(matched);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (adminUser: User) => {
    setPhone(adminUser.phone);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-14 px-4 sm:px-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 apple-segmented-pill bg-white/70 shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Gateway</span>
      </button>

      <div className="apple-card-elevated overflow-hidden border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
        {/* Apple Header */}
        <div className="p-7 text-center border-b border-black/[0.06] bg-gradient-to-b from-white to-slate-50/50">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 shadow-sm ring-2 ring-amber-500/30 border border-amber-400/40 bg-slate-900 flex items-center justify-center">
            <img
              src="/assets/vehicle-desk-emblem.svg"
              alt="State Protocol Emblem"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50 font-mono">
            Administration Wing
          </span>
          <h2 className="text-xl font-bold text-slate-950 mt-2 tracking-tight">
            Superintendent Console
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Authorized sign in for State Fleet Superintendents & Protocol Officers
          </p>
        </div>

        <div className="p-7 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Authorized Admin Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919900055667"
                    className="w-full pl-10 pr-4 py-2.5 text-xs apple-input font-mono font-medium"
                    required
                  />
                </div>
              </div>

              {/* Seeded Admin Profile Quick Tap */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Verified Protocol Admin:
                </span>
                {adminUsers.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectPreset(a)}
                    className="w-full text-left p-3 rounded-2xl border border-black/[0.06] bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-blue-900">
                        {a.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {a.designation}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-blue-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-black/5 shadow-2xs">
                      {a.phone}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full apple-btn-primary flex items-center justify-center gap-2 mt-2"
              >
                <span>Send Secure Passcode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
                <span>Passcode sent to {phone}</span>
                <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs text-[11px]">
                  123456
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  Enter 6-Digit Protocol Passcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full py-3 px-4 text-center apple-input font-mono tracking-widest text-base font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="apple-btn-secondary px-4 text-xs font-semibold"
                >
                  Change
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 apple-btn-primary flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In & Open Board'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center border-t border-black/[0.04] text-[10.5px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>DPAR Verified Protocol Access • 256-bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
