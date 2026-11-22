import React from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { ShieldCheck, X, Layers, Sparkles } from 'lucide-react';

interface RuleEngineExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleEngineExplainerModal: React.FC<RuleEngineExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useStore();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="apple-card-elevated max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col border border-white/20">
        {/* Apple Sheet Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {t.ruleEngine.title} &amp; Priority Queue Specification
              </h3>
              <p className="text-[11px] text-slate-500">Government Protocol Dispatch Algorithm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Strict Priority Queue Allocation Architecture */}
          <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-purple-50/70 border border-indigo-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-indigo-950 text-sm">
                Strict Priority Queue Allocation (Vehicle 1 → Vehicle 2 → Vehicle 3)
              </span>
            </div>
            <p className="text-slate-700">
              When an Hon&apos;ble MLA requests a vehicle via WhatsApp, the backend queries the pool sorted by priority. The highest-priority available and clean vehicle is automatically assigned first (Vehicle 1 first; if busy/unclean, fallback to Vehicle 2, then Vehicle 3).
            </p>
            <div className="text-[11px] text-indigo-900 pt-1.5 border-t border-indigo-200/80">
              <strong>Zero Manual Dispatchers:</strong> Eliminates phone calls and manual errors. MLA bookings trigger real-time vehicle allocation and immediate driver cockpit notifications.
            </div>
          </div>

          {/* Core Dispatch Rules */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mandatory Protocol Dispatch Rules
            </h4>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Strict Gate: Available + Clean Only
                  </span>
                  <span className="text-slate-600">{t.ruleEngine.rule1}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Seniority Rank &amp; Priority Queue Matching
                  </span>
                  <span className="text-slate-600">
                    Vehicle class is auto-assigned based on VIP protocol seniority rank (Apex Tier 1 → Class A Sedan, Tier 2 → Class B SUV, Tier 3 → Class C MPV). Within the class, allocation strictly traverses Priority 1 → Priority 2 → Priority 3.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Hierarchy Fallback Cascade
                  </span>
                  <span className="text-slate-600">{t.ruleEngine.rule3} (e.g. Class A fallback to Class B SUV, then Class C).</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Fairness Balancing &amp; Fatigue Mitigation
                  </span>
                  <span className="text-slate-600">
                    If multiple units share equal priority rank, the chauffeur with the lowest trip count today is dispatched to prevent driver fatigue.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Mandatory Reason for Admin Overrides
                  </span>
                  <span className="text-slate-600">{t.ruleEngine.rule5} Every manual change creates an immutable audit trail.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="apple-btn-primary py-2 px-5 text-xs font-semibold"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
