import React, { useState } from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { User } from '../types';
import { Phone, KeyRound, X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, login, language } = useStore();
  const t = translations[language];

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedGeneratedOtp, setSimulatedGeneratedOtp] = useState('482910');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (phone: string, presetUser?: User) => {
    if (!phone || phone.trim().length < 8) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedGeneratedOtp(randomOtp);
    setPhoneNumber(phone);
    setSelectedUser(presetUser || null);
    setStep('OTP');
  };

  const handleVerifyOtp = () => {
    if (otpCode !== simulatedGeneratedOtp && otpCode !== '123456') {
      setError('Invalid OTP code. Please enter the generated 6-digit code shown above.');
      return;
    }

    if (selectedUser) {
      login(selectedUser);
    } else {
      // Find matching user by phone or create guest VIP
      const existing = users.find((u) => u.phone === phoneNumber);
      if (existing) {
        login(existing);
      } else {
        const newUser: User = {
          id: `user-${Date.now()}`,
          phone: phoneNumber,
          name: 'Authorized Guest VIP',
          role: 'VIP',
          designation: 'Visiting Dignitary Protocol',
        };
        login(newUser);
      }
    }

    onClose();
  };

  const handleQuickSelect = (user: User) => {
    setSelectedUser(user);
    setPhoneNumber(user.phone);
    handleSendOtp(user.phone, user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="apple-card-elevated max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 border border-white/20">
        {/* Apple Sheet Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <img
                src="/assets/vehicle-desk-emblem.svg"
                alt="Emblem"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{t.auth.title}</h3>
              <p className="text-[11px] text-slate-500">{t.auth.subtitle}</p>
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
          {step === 'PHONE' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.auth.phoneLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="apple-input pl-10 text-xs font-mono-nums"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <button
                onClick={() => handleSendOtp(phoneNumber)}
                className="apple-btn-primary w-full py-2.5 text-xs font-semibold"
              >
                {t.auth.sendOtp}
              </button>

              {/* Seeded Quick Select */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  1-Tap Seeded Passcode Login
                </span>
                <div className="space-y-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickSelect(u)}
                      className="w-full text-left p-2.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{u.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {u.role}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-nums text-slate-500">{u.phone}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>One-Time Protocol Passcode Sent</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Passcode dispatched to <span className="font-mono font-bold">{phoneNumber}</span>:
                </p>
                <div className="text-center py-2 bg-white rounded-xl border border-emerald-300/60 font-mono text-lg font-bold tracking-widest text-emerald-950 shadow-2xs">
                  {simulatedGeneratedOtp}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="apple-input pl-10 text-xs font-mono text-center tracking-widest text-base font-bold"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                className="apple-btn-primary w-full py-2.5 text-xs font-semibold"
              >
                {t.auth.verifyOtp}
              </button>

              <button
                onClick={() => setStep('PHONE')}
                className="apple-btn-secondary w-full py-2 text-xs"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
