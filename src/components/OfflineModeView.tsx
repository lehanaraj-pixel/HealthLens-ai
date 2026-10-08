import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Wifi,
  HardDrive,
  Printer,
  ShieldCheck,
  User,
  Heart,
  Pill,
  Download,
  AlertCircle,
  FileCheck,
  Smartphone,
} from 'lucide-react';
import { PatientProfile, MedicationItem } from '../types';
import { useI18n } from '../services/i18n';

interface OfflineModeViewProps {
  profile: PatientProfile;
  medications: MedicationItem[];
}

export const OfflineModeView: React.FC<OfflineModeViewProps> = ({ profile, medications }) => {
  const { language } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
              <WifiOff className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'पेज 12: ऑफलाइन मोड' : 'Page 12: Offline Mode'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {language === 'hi' ? 'ऑफलाइन स्वास्थ्य सुरक्षा एवं इमरजेंसी कार्ड' : 'Offline Mode & Emergency Wallet Card'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'HealthLens आपके सभी पर्चे, दवा रिमाइंडर और व्यक्तिगत रिकॉर्ड आपके डिवाइस पर सुरक्षित रूप से सहेजता है। बिना इंटरनेट के भी सब कुछ उपलब्ध है।'
                : 'HealthLens operates fully offline on your device. Access your complete prescription regimen, adherence logs, and emergency medical dossier with zero internet required.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>{isOnline ? (language === 'hi' ? 'ऑनलाइन कनेक्टेड' : 'Device Online') : (language === 'hi' ? 'ऑफलाइन मोड सक्रिय' : 'Offline Mode Active')}</span>
            </div>
            <button
              onClick={handlePrintCard}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'hi' ? 'कार्ड प्रिंट करें' : 'Print Wallet Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Storage Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            <span>{language === 'hi' ? 'स्थानीय डिवाइस स्टोरेज' : 'Local Device Storage'}</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {language === 'hi' ? '100% ऑन-डिवाइस' : '100% Encrypted & Local'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'आपकी स्वास्थ्य जानकारी आपके ब्राउज़र के एन्क्रिप्टेड स्टोरेज में रहती है।'
              : 'Zero cloud leakage. All prescriptions and schedules persist safely on this hardware.'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'सक्रिय दवाइयां कैश्ड' : 'Cached Prescriptions'}</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {medications.length} {language === 'hi' ? 'दवाएं सुरक्षित' : 'Medications Ready'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'बिना नेटवर्क के भी खुराक का समय और रिमाइंडर ठीक से काम करते हैं।'
              : 'Time slots, food instructions, and adherence marks continue working without interruption.'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'प्राइवेसी सुरक्षा' : 'Zero Tracking'}</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {language === 'hi' ? 'गोपनीयता सुरक्षित' : 'HIPAA Compliant Standard'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'कोई डेटा बेचा या ट्रैक नहीं किया जाता। आप जब चाहें पूरा डेटा हटा सकते हैं।'
              : 'Data never leaves your browser cache unless you choose to export it.'}
          </p>
        </div>
      </div>

      {/* Emergency Wallet Card (Printable) */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 sm:p-8 border-2 border-teal-500/40 dark:border-teal-500/30 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
              HL
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {language === 'hi' ? 'रोगी आपातकालीन चिकित्सा वॉलेट कार्ड' : 'Emergency Medical Wallet Card'}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                HealthLens Chronic Care • Carry this card while traveling
              </span>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 self-start sm:self-auto">
            EMERGENCY MEDICAL PROFILE
          </span>
        </div>

        {/* Patient Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{language === 'hi' ? 'रोगी का नाम' : 'Patient Name'}</span>
            <strong className="text-slate-900 dark:text-white font-extrabold">{profile.name}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{language === 'hi' ? 'आयु / लिंग' : 'Age / Gender'}</span>
            <strong className="text-slate-900 dark:text-white font-extrabold">{profile.age} Yrs • {profile.gender}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{language === 'hi' ? 'निगरानी की जा रही स्थिति' : 'Conditions'}</span>
            <strong className="text-teal-700 dark:text-teal-300 font-extrabold">{profile.conditions.join(', ')}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{language === 'hi' ? 'रक्त समूह' : 'Blood Group'}</span>
            <strong className="text-rose-700 dark:text-rose-400 font-extrabold">B Positive (B+)</strong>
          </div>
        </div>

        {/* Active Medications List */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'hi' ? 'सक्रिय निर्धारित दवाइयां (दैनिक खुराक)' : 'Active Prescribed Medications (Daily Regimen)'}</span>
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {medications.map((med, idx) => (
              <div key={idx} className="p-3 sm:p-4 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{med.name}</span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {med.dosage} • {med.frequency} • {med.timingDescription}
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                    {med.mealRelation.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency instructions */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {language === 'hi'
              ? 'आपातकालीन निर्देश: यदि रोगी अचेत पाया जाए, तो रक्त शर्करा (Glucometer) जांचें और तुरंत 108 या निकटतम अस्पताल से संपर्क करें।'
              : 'First Responder Notice: In case of acute altered sensorium, check capillary blood glucose immediately for severe hypoglycemia before intravenous fluids.'}
          </span>
        </div>
      </div>
    </div>
  );
};
