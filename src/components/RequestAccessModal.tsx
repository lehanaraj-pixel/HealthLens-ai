import React, { useState } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  User,
  Mail,
  HeartHandshake,
} from 'lucide-react';
import { useI18n } from '../services/i18n';
import { authService } from '../services/auth';
import { GranularPermission } from '../types';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccountEmail?: string;
  targetAccountName?: string;
  onSubmitted?: () => void;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  isOpen,
  onClose,
  targetAccountEmail: initialTargetEmail = 'rajesh.sharma@healthlens.com',
  targetAccountName: initialTargetName = 'Rajesh Sharma',
  onSubmitted,
}) => {
  const { language } = useI18n();
  const currentUser = authService.getCurrentUser();

  const [requesterName, setRequesterName] = useState(
    currentUser?.name || 'Priya Sharma (Caregiver)'
  );
  const [requesterEmail, setRequesterEmail] = useState(
    currentUser?.email || 'priya.sharma@example.com'
  );
  const [targetEmail, setTargetEmail] = useState(initialTargetEmail);
  const [targetName, setTargetName] = useState(initialTargetName);
  const [purpose, setPurpose] = useState(
    'Family caregiver helping manage morning insulin and blood pressure schedule'
  );

  // Available permissions:
  // - View medical reports
  // - View prescription information
  // - Manage health reminders
  // - View health history
  // - View prescription tracker
  const [selectedPermissions, setSelectedPermissions] = useState<GranularPermission[]>([
    'view_reports',
    'view_prescriptions',
    'manage_reminders',
    'view_history',
    'view_tracker',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePermission = (perm: GranularPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const PERMISSION_CONFIG: Array<{ key: GranularPermission; labelEn: string; labelHi: string; descEn: string }> = [
    {
      key: 'view_reports',
      labelEn: 'View medical reports',
      labelHi: 'मेडिकल रिपोर्ट देखें',
      descEn: 'Inspect lab tests, blood sugar, lipid panels, and biomarker ranges',
    },
    {
      key: 'view_prescriptions',
      labelEn: 'View prescription information',
      labelHi: 'प्रिस्क्रिप्शन जानकारी देखें',
      descEn: 'View doctor dosages, frequencies, and meal timing instructions',
    },
    {
      key: 'manage_reminders',
      labelEn: 'Manage health reminders',
      labelHi: 'स्वास्थ्य अनुस्मारक प्रबंधित करें',
      descEn: 'Create, snooze, and mark daily medication alarms and checkups',
    },
    {
      key: 'view_history',
      labelEn: 'View health history',
      labelHi: 'स्वास्थ्य इतिहास देखें',
      descEn: 'View past processed medical documents and timeline',
    },
    {
      key: 'view_tracker',
      labelEn: 'View prescription tracker',
      labelHi: 'प्रिस्क्रिप्शन ट्रैकर देखें',
      descEn: 'Check daily pill adherence log and inventory status',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      setErrorMsg(language === 'hi' ? 'कृपया कम से कम एक अनुमति चुनें।' : 'Please select at least one permission.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await authService.submitAccessRequest(
        targetEmail,
        targetName,
        purpose,
        selectedPermissions
      );

      setIsSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-teal-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {language === 'hi' ? 'केयरगिवर खाता एक्सेस अनुरोध' : 'Request Caregiver Account Access'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'hi' ? 'खाता स्वामी की स्वीकृति के बाद ही एक्सेस मिलेगा' : 'Account owner must approve before access is granted'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {successMsg ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? 'अनुरोध सफलतापूर्वक भेजा गया!' : 'Authorization Request Sent!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {language === 'hi'
                ? `खाता स्वामी (${targetName}) को सूचना भेज दी गई है। उनकी स्वीकृति मिलने के बाद ही एक्सेस सक्रिय होगा।`
                : `A formal authorization request has been routed to the account owner (${targetName}). No data will be shared until they approve.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Requester Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Requester's Name
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Requester's Email
                </label>
                <input
                  type="email"
                  required
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Target Account Info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Patient Account Email
              </label>
              <input
                type="email"
                required
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Purpose of Access */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purpose of Access
              </label>
              <textarea
                rows={2}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. A family caregiver accessing a parent's health information..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* Requested Access Permissions (Granular Checklist) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Requested Access Permissions</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                  {selectedPermissions.length} selected
                </span>
              </label>

              <div className="space-y-2">
                {PERMISSION_CONFIG.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {language === 'hi' ? perm.labelHi : perm.labelEn}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {perm.descEn}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Authorization Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
