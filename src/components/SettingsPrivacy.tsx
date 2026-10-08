import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Trash2,
  Bell,
  Volume2,
  Palette,
  Languages,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Lock,
} from 'lucide-react';
import { AppTheme, PatientProfile, MedicationItem, HealthReminder, MedicalHistoryRecord } from '../types';
import { useI18n } from '../services/i18n';
import { notificationService } from '../services/notifications';
import { speechService } from '../services/speech';

interface SettingsPrivacyProps {
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  profile: PatientProfile;
  medications: MedicationItem[];
  reminders: HealthReminder[];
  history: MedicalHistoryRecord[];
  onResetDemo: () => void;
}

export const SettingsPrivacy: React.FC<SettingsPrivacyProps> = ({
  theme,
  onChangeTheme,
  profile,
  medications,
  reminders,
  history,
  onResetDemo,
}) => {
  const { language, setLanguage, t } = useI18n();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportData = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      appName: 'HealthLens',
      profile,
      medications,
      reminders,
      history,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `healthlens_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleTestChime = () => {
    notificationService.playChime();
  };

  const handleTestSpeech = () => {
    speechService.speak(
      language === 'hi'
        ? 'हेल्थलेन्स वाक परीक्षण सफल रहा। आपकी दवाइयों का समय सही चल रहा है।'
        : 'HealthLens speech test successful. Your medication schedule is running properly.',
      language === 'hi' ? 'hi' : 'en'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
          <Settings className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'पेज 15: सेटिंग्स एवं गोपनीयता' : 'Page 15: Settings & Privacy'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          {language === 'hi' ? 'सेटिंग्स एवं डेटा गोपनीयता' : 'Settings & Data Privacy'}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          {language === 'hi'
            ? 'अपनी भाषा प्राथमिकता, थीम, ऑडियो अलर्ट प्रबंधित करें और अपने स्थानीय डेटा को सुरक्षित रूप से डाउनलोड करें।'
            : 'Configure language, display theme, audio chime alerts, and export or wipe your local patient health data.'}
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-teal-600" />
          <span>{language === 'hi' ? 'इंटरफ़ेस एवं भाषा प्राथमिकताएं' : 'Interface & Language Settings'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'hi' ? 'प्राथमिक भाषा (Language)' : 'Primary Language'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          {/* Theme Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {language === 'hi' ? 'थीम (Display Theme)' : 'Display Theme'}
            </span>
            <div className="flex gap-2">
              {(['light', 'dim', 'dark'] as AppTheme[]).map((thm) => (
                <button
                  key={thm}
                  type="button"
                  onClick={() => onChangeTheme(thm)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                    theme === thm
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Alerts & Chime Tests */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'hi' ? 'अलर्ट ध्वनि एवं वाक परीक्षण' : 'Alert Chimes & Voice Synthesis'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'दवा लेने के समय बजने वाली मधुर ध्वनि का परीक्षण करें।' : 'Test the pleasant sound alert played when marking medications taken.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestChime}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'hi' ? 'ध्वनि टेस्ट' : 'Test Chime'}</span>
            </button>
            <button
              onClick={handleTestSpeech}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-teal-200 dark:border-teal-800/60"
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'hi' ? 'आवाज़ टेस्ट' : 'Test Voice'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-5">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <span>{language === 'hi' ? 'डेटा प्रबंधन एवं बैकअप' : 'Data Management & Local Storage'}</span>
        </h2>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span>{language === 'hi' ? 'सहेजी गई दवाएं:' : 'Saved Medications:'}</span>
            <strong className="font-extrabold">{medications.length}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span>{language === 'hi' ? 'सहेजे गए अनुस्मारक:' : 'Health Reminders:'}</span>
            <strong className="font-extrabold">{reminders.length}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span>{language === 'hi' ? 'चिकित्सा इतिहास रिकॉर्ड:' : 'Medical History Records:'}</span>
            <strong className="font-extrabold">{history.length}</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            {downloadSuccess ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? (language === 'hi' ? 'बैकअप डाउनलोड हो गया!' : 'Backup Downloaded!') : (language === 'hi' ? 'पूरा डेटा डाउनलोड करें (JSON)' : 'Export Full Data (JSON)')}</span>
          </button>

          <button
            onClick={onResetDemo}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <span>{language === 'hi' ? 'नमूना डेटा रीलोड करें' : 'Reload Sample Chronic Data'}</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Statement */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>{language === 'hi' ? 'हमारी गोपनीयता प्रतिज्ञा' : 'Our Digital Health Privacy Guarantee'}</span>
        </div>
        <p className="leading-relaxed">
          {language === 'hi'
            ? 'HealthLens आपके किसी भी व्यक्तिगत स्वास्थ्य डेटा, लैब रिपोर्ट, या डॉक्टर के पर्चे को किसी भी तीसरे पक्ष के साथ साझा या संग्रहीत नहीं करता है। सभी रिकॉर्ड आपके डिवाइस के स्थानीय स्टोरेज में रहते हैं।'
            : 'HealthLens does not sell, track, or aggregate personal protected health information (PHI). Your prescriptions and lab values remain on your local client hardware.'}
        </p>
      </div>
    </div>
  );
};
