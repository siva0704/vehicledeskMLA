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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.auth.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.auth.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 'PHONE' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.auth.phoneLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t.auth.phonePlaceholder}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono-nums"
                  />
                </div>
                {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
              </div>

              <button
                onClick={() => handleSendOtp(phoneNumber)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t.auth.sendOtp}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo 1-Click Profiles */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  {t.auth.demoLoginTitle}
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickSelect(user)}
                      className="w-full p-2 text-left border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50/80 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{user.name}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {user.role}
                          </span>
                          {user.seniorityTier && (
                            <span className="text-[10px] font-mono-nums px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {user.seniorityTier === 'TIER_1' && 'Class A (Sedan)'}
                              {user.seniorityTier === 'TIER_2' && 'Class B (SUV)'}
                              {user.seniorityTier === 'TIER_3' && 'Class C (MPV)'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono-nums mt-0.5">
                          {user.phone} {user.designation ? `· ${user.designation}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-900 shrink-0">
                        Login →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simulated SMS Notification Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>SMS Gateway Simulator</span>
                </div>
                <p className="mt-1 text-slate-700">
                  {t.auth.codeSentTo} <span className="font-semibold font-mono-nums">{phoneNumber}</span>.
                </p>
                <div className="mt-2 flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-200">
                  <span className="text-xs text-slate-600">{t.auth.otpHelper}</span>
                  <span className="text-sm font-bold font-mono-nums tracking-widest text-slate-900">
                    {simulatedGeneratedOtp}
                  </span>
                  <button
                    onClick={() => setOtpCode(simulatedGeneratedOtp)}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.auth.otpLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-3 py-2 text-base text-center tracking-widest font-mono-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.auth.verify}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  onClick={() => setStep('PHONE')}
                  className="hover:text-slate-900 underline"
                >
                  ← Change Number
                </button>
                <button
                  onClick={() => handleSendOtp(phoneNumber, selectedUser || undefined)}
                  className="hover:text-slate-900 underline"
                >
                  {t.auth.resendOtp}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
