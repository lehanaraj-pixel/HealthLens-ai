import React from 'react';
import {
  ShieldAlert,
  X,
  UserCheck,
  Send,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useI18n } from '../services/i18n';

interface AccountConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccountName?: string;
  targetAccountEmail?: string;
  onContinueWithMyAccount: () => void;
  onRequestAccountAccess: () => void;
}

export const AccountConsentModal: React.FC<AccountConsentModalProps> = ({
  isOpen,
  onClose,
  targetAccountName = "Another Person's Account",
  targetAccountEmail = 'patient@example.com',
  onContinueWithMyAccount,
  onRequestAccountAccess,
}) => {
  const { language } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col">
        {/* Warning Banner Header */}
        <div className="px-6 py-5 border-b border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              {/* EXACT REQUIRED TITLE */}
              <h3 className="text-base font-extrabold text-white">
                Account Owner Authorization Required
              </h3>
              <p className="text-[11px] text-amber-200">
                {language === 'hi' ? 'खाता स्वामी की पूर्व अनुमति अनिवार्य है' : 'Strict Patient Privacy & Authorization Protocol'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target account info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                {language === 'hi' ? 'लक्षित खाता' : 'Target Account'}:
              </span>
              <strong className="text-slate-900 dark:text-white font-bold">{targetAccountName}</strong>
            </div>
            <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
              {targetAccountEmail}
            </span>
          </div>

          {/* EXACT REQUIRED MESSAGE */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            “You are attempting to access health information associated with another person's account. Please obtain the account owner's permission before continuing.”
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'हेल्थलेन्स डिजिटल स्वास्थ्य सुरक्षा नियमों के तहत किसी भी अन्य व्यक्ति के पर्चे, दवा सूची या लैब रिपोर्ट को देखने के लिए खाता स्वामी की स्पष्ट स्वीकृति आवश्यक है।'
              : 'Under HealthLens clinical privacy standards, family members, caregivers, and doctors must obtain explicit verified authorization before viewing protected prescriptions or lab records.'}
          </p>

          {/* EXACT REQUIRED OPTIONS */}
          <div className="pt-2 space-y-2.5">
            {/* Option 1: Continue with My Account */}
            <button
              type="button"
              onClick={() => {
                onContinueWithMyAccount();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Continue with My Account</span>
            </button>

            {/* Option 2: Request Account Access */}
            <button
              type="button"
              onClick={() => {
                onRequestAccountAccess();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Request Account Access</span>
            </button>

            {/* Option 3: Cancel */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
