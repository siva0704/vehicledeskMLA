import React from 'react';
import { useStore } from '../store';
import { translations } from '../translations';
import { ShieldCheck, X, Check, ArrowRight, Layers, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t.ruleEngine.title} & RBAC Architecture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* RBAC Phase 1 Justification (Directly from PDF Brief) */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-700" />
              <span className="font-bold text-indigo-950 text-sm">
                RBAC (Role-Based Access Control) Phase 1 Pattern
              </span>
            </div>
            <p className="text-slate-700">
              In Phase 1, access is decided <span className="font-semibold text-slate-900">solely by the user role (VIP, Driver, Admin)</span>. No complex dynamic policies yet. This keeps the system simple, auditable, and fast to deliver.
            </p>
            <div className="text-[11px] text-indigo-900 pt-1 border-t border-indigo-200/80">
              <strong>Why not ABAC yet?</strong> Attribute-Based Access Control (role + time + location + tier) adds complexity and operational audit friction. Government and protocol fleet systems fail when access control is over-engineered early.
            </div>
          </div>

          {/* Hardcoded Rule Engine Gates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Central Hardcoded Dispatch Rules (Non-Negotiable)
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Strict Gate: Available + Clean
                  </span>
                  <span>{t.ruleEngine.rule1}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Seniority Auto-Assignment & Fairness Balancing
                  </span>
                  <span>
                    Vehicle class is auto-assigned based on VIP protocol seniority rank (Apex Tier 1 → Class A Sedan, Tier 2 → Class B SUV, Tier 3 → Class C MPV). Among eligible units, the chauffeur with least trips completed today is selected.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Hierarchy Fallback Cascade
                  </span>
                  <span>{t.ruleEngine.rule3} (e.g. Class A fallback to Class B SUV, then Class C).</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Exhaustion & Live Board Queuing
                  </span>
                  <span>{t.ruleEngine.rule4}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <span className="font-bold text-slate-900 block">
                    Mandatory Reason for Admin Overrides
                  </span>
                  <span>{t.ruleEngine.rule5}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Out of Scope discipline from Brief */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Phase 1 Clear Scope Boundaries
            </span>
            <p className="text-slate-500 text-[11px]">
              Explicitly excluded: Chat, Ratings, In-app Payments, Continuous tracking history, Heavy maps SDKs, Multi-stop routes. Phase 1 focuses strictly on rapid, reliable state vehicle dispatch with bulletproof auditability.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
