/**
 * HEALTHLENS
 * Self-Care Prescription Tracker & Medical Report Companion for Chronic Disease Patients
 */

import React, { useState, useEffect } from 'react';
import {
  PatientProfile,
  MedicationItem,
  HealthReminder,
  MedicalHistoryRecord,
  AppTheme,
  TimeSlot,
  MedicalReportAnalysis,
  PrescriptionAnalysis,
  SubscriptionInfo,
  SubscriptionTier,
  AIModelId,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadMedications,
  saveMedications,
  loadReminders,
  saveReminders,
  loadHistory,
  saveHistory,
  loadTheme,
  saveTheme,
  loadSubscription,
  saveSubscription,
  DEFAULT_PROFILE,
  DEFAULT_MEDICATIONS,
  DEFAULT_REMINDERS,
  DEFAULT_HISTORY,
  DEFAULT_SUBSCRIPTION,
  getTodayKey,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PrescriptionTracker } from './components/PrescriptionTracker';
import { PrescriptionExplainer } from './components/PrescriptionExplainer';
import { ReportSimplifier } from './components/ReportSimplifier';
import { RemindersManager } from './components/RemindersManager';
import { MedicalHistory } from './components/MedicalHistory';
import { HealthLensAssistant } from './components/HealthLensAssistant';
import { SelfCareInsights } from './components/SelfCareInsights';
import { ResultView } from './components/ResultView';
import { TranslationCenter } from './components/TranslationCenter';
import { LabVitalsGuide } from './components/LabVitalsGuide';
import { MedicalTermsGuide } from './components/MedicalTermsGuide';
import { OfflineModeView } from './components/OfflineModeView';
import { PremiumPlansPage } from './components/PremiumPlansPage';
import { AboutUs } from './components/AboutUs';
import { SettingsPrivacy } from './components/SettingsPrivacy';
import { PatientProfileModal } from './components/PatientProfileModal';
import { PremiumModal } from './components/PremiumModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { AuthModal } from './components/AuthModal';
import { AccountConsentModal } from './components/AccountConsentModal';
import { RequestAccessModal } from './components/RequestAccessModal';
import { CaregiverAuthorizationManager } from './components/CaregiverAuthorizationManager';
import { Sparkles, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { notificationService } from './services/notifications';
import { I18nProvider, useI18n } from './services/i18n';

function AppContent() {
  const { language, t } = useI18n();
  const [theme, setTheme] = useState<AppTheme>(loadTheme);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<PatientProfile>(loadProfile);
  const [medications, setMedications] = useState<MedicationItem[]>(loadMedications);
  const [reminders, setReminders] = useState<HealthReminder[]>(loadReminders);
  const [history, setHistory] = useState<MedicalHistoryRecord[]>(loadHistory);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(loadSubscription);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const [isCaregiverManagerModalOpen, setIsCaregiverManagerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark' || theme === 'dim');
    saveTheme(theme);
  }, [theme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Profile save
  const handleSaveProfile = (newProfile: PatientProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    showToast(
      language === 'hi'
        ? 'रोगी प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।'
        : 'Patient profile updated successfully.'
    );
  };

  // Medication updates
  const handleUpdateMedications = (newMeds: MedicationItem[]) => {
    setMedications(newMeds);
    saveMedications(newMeds);
  };

  const handleAddMedicationToTracker = (newMed: MedicationItem) => {
    const updated = [...medications, newMed];
    setMedications(updated);
    saveMedications(updated);
    showToast(
      language === 'hi'
        ? `"${newMed.name}" दवा ट्रैकर में जोड़ी गई।`
        : `"${newMed.name}" added to Prescription Tracker.`
    );
  };

  const handleTogglePillStatus = (medId: string, slot: TimeSlot) => {
    const todayKey = getTodayKey();
    const updated = medications.map((med) => {
      if (med.id !== medId) return med;
      const todayLogs = { ...(med.logs[todayKey] || {}) };
      const current = todayLogs[slot];
      if (current === 'taken') {
        delete todayLogs[slot];
      } else {
        todayLogs[slot] = 'taken';
        notificationService.playChime();
      }
      return {
        ...med,
        logs: {
          ...med.logs,
          [todayKey]: todayLogs,
        },
      };
    });

    handleUpdateMedications(updated);
    showToast(
      language === 'hi'
        ? 'दवा नियमितता लॉग अपडेट हो गया।'
        : 'Medication adherence updated.'
    );
  };

  // Reminders updates
  const handleUpdateReminders = (newReminders: HealthReminder[]) => {
    setReminders(newReminders);
    saveReminders(newReminders);
  };

  const handleCompleteReminder = (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    );
    handleUpdateReminders(updated);
    notificationService.playChime();
    showToast(
      language === 'hi'
        ? 'अनुस्मारक पूर्ण चिह्नित किया गया।'
        : 'Reminder marked completed.'
    );
  };

  // History updates
  const handleSaveReportToHistory = (report: MedicalReportAnalysis) => {
    const record: MedicalHistoryRecord = {
      id: `hist-${Date.now()}`,
      type: 'report',
      title: report.reportTitle,
      date: report.reportDate || getTodayKey(),
      shortSummary: report.summary,
      reportData: report,
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...history];
    setHistory(updated);
    saveHistory(updated);
    showToast(
      language === 'hi'
        ? 'लैब टेस्ट रिपोर्ट चिकित्सा इतिहास में सहेजी गई।'
        : 'Lab report saved to Medical History.'
    );
  };

  const handleSavePrescriptionToHistory = (prescription: PrescriptionAnalysis) => {
    const record: MedicalHistoryRecord = {
      id: `hist-${Date.now()}`,
      type: 'prescription',
      title: prescription.prescriptionTitle,
      date: prescription.prescriptionDate || getTodayKey(),
      shortSummary: prescription.summary,
      prescriptionData: prescription,
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...history];
    setHistory(updated);
    saveHistory(updated);
    showToast(
      language === 'hi'
        ? 'डॉक्टर पर्चा चिकित्सा इतिहास में सहेजा गया।'
        : 'Prescription saved to Medical History.'
    );
  };

  const handleDeleteHistoryRecord = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
    showToast(
      language === 'hi'
        ? 'रिकॉर्ड इतिहास से हटा दिया गया।'
        : 'Record removed from history.'
    );
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
    showToast(
      language === 'hi'
        ? 'चिकित्सा इतिहास साफ़ कर दिया गया।'
        : 'Medical history cleared.'
    );
  };

  // Plan Selection handler
  const handleSelectPlan = (tier: SubscriptionTier, model?: AIModelId) => {
    const now = new Date();
    let expiresAt: string | undefined = undefined;

    if (tier === 'day_pass') {
      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expiresAt = expiry.toISOString();
    } else if (tier === 'monthly') {
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expiresAt = expiry.toISOString();
    }

    const updatedSub: SubscriptionInfo = {
      tier,
      selectedModel: model || (tier === 'free' ? 'gemini-2.5-flash' : 'gemini-2.5-pro'),
      activatedAt: tier === 'free' ? undefined : now.toISOString(),
      expiresAt,
    };

    setSubscription(updatedSub);
    saveSubscription(updatedSub);
    notificationService.playChime();

    if (tier === 'day_pass') {
      showToast(
        language === 'hi'
          ? '⚡ HealthLens Plus सक्रिय हो गया (₹5)! HealthLens AI Pro Medical अनलॉक है।'
          : '⚡ HealthLens Plus Activated (₹5)! HealthLens AI Pro Medical is unlocked for 24 hours.'
      );
    } else if (tier === 'monthly') {
      showToast(
        language === 'hi'
          ? '⭐ HealthLens Monthly सक्रिय हो गया (₹29)! HealthLens AI Pro अनलॉक है।'
          : '⭐ HealthLens Monthly Activated (₹29)! Full HealthLens AI Pro access unlocked.'
      );
    } else {
      showToast(
        language === 'hi'
          ? 'निःशुल्क मानक प्लान पर स्विच किया गया।'
          : 'Switched back to Free Chronic Plan.'
      );
    }
  };

  const handleSelectModel = (model: AIModelId) => {
    const updatedSub: SubscriptionInfo = {
      ...subscription,
      selectedModel: model,
    };
    setSubscription(updatedSub);
    saveSubscription(updatedSub);
    showToast(
      language === 'hi'
        ? `सक्रिय मॉडल: ${model}`
        : `Active AI Model set to ${model}`
    );
  };

  // Reset to Demo Mode (Crucial for Hackathon)
  const handleResetDemo = () => {
    setProfile(DEFAULT_PROFILE);
    saveProfile(DEFAULT_PROFILE);

    setMedications(DEFAULT_MEDICATIONS);
    saveMedications(DEFAULT_MEDICATIONS);

    setReminders(DEFAULT_REMINDERS);
    saveReminders(DEFAULT_REMINDERS);

    setHistory(DEFAULT_HISTORY);
    saveHistory(DEFAULT_HISTORY);

    setSubscription(DEFAULT_SUBSCRIPTION);
    saveSubscription(DEFAULT_SUBSCRIPTION);

    showToast(
      language === 'hi'
        ? 'डेमो मोड सक्रिय: नमूना क्रोनिक केयर डेटा लोड किया गया (डायबिटीज व बीपी)।'
        : 'Demo Mode Activated: Loaded sample chronic disease regimen (Diabetes & Hypertension).'
    );
    notificationService.playChime();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 dim:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onChangeTheme={setTheme}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onResetDemo={handleResetDemo}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        subscription={subscription}
        profile={profile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenConsent={() => setIsConsentModalOpen(true)}
        onOpenCaregiverManager={() => setIsCaregiverManagerModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            medications={medications}
            reminders={reminders}
            history={history}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateTab={setActiveTab}
            onTogglePillStatus={handleTogglePillStatus}
            onCompleteReminder={handleCompleteReminder}
          />
        )}

        {activeTab === 'tracker' && (
          <PrescriptionTracker
            medications={medications}
            onUpdateMedications={handleUpdateMedications}
            onNavigateToExplainer={() => setActiveTab('prescription-explainer')}
          />
        )}

        {activeTab === 'prescription-explainer' && (
          <PrescriptionExplainer
            onAddMedicationToTracker={handleAddMedicationToTracker}
            onSaveToHistory={handleSavePrescriptionToHistory}
            subscription={subscription}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />
        )}

        {activeTab === 'report-simplifier' && (
          <ReportSimplifier
            onSaveToHistory={handleSaveReportToHistory}
            subscription={subscription}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersManager
            reminders={reminders}
            onUpdateReminders={handleUpdateReminders}
          />
        )}

        {activeTab === 'history' && (
          <MedicalHistory
            history={history}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'assistant' && (
          <HealthLensAssistant
            profile={profile}
            subscription={subscription}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />
        )}

        {(activeTab === 'insights' || activeTab === 'health-education') && <SelfCareInsights />}

        {activeTab === 'result-view' && (
          <ResultView history={history} onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'translation' && <TranslationCenter />}

        {activeTab === 'lab-guide' && <LabVitalsGuide />}

        {activeTab === 'medical-terms' && <MedicalTermsGuide />}

        {activeTab === 'offline-mode' && (
          <OfflineModeView profile={profile} medications={medications} />
        )}

        {(activeTab === 'premium-plans' || activeTab === 'premium') && (
          <PremiumPlansPage
            subscription={subscription}
            onSelectPlan={handleSelectPlan}
            onSelectModel={handleSelectModel}
          />
        )}

        {activeTab === 'about-us' && <AboutUs />}

        {activeTab === 'settings-privacy' && (
          <SettingsPrivacy
            theme={theme}
            onChangeTheme={setTheme}
            profile={profile}
            medications={medications}
            reminders={reminders}
            history={history}
            onResetDemo={handleResetDemo}
            onOpenRequestAccessModal={() => setIsRequestAccessModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Read Aloud Controller Bar */}
      <AudioPlayerBar />

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Premium Plans Modal (Single Day Pass & Monthly Chronic Care) */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        subscription={subscription}
        onSelectPlan={handleSelectPlan}
        onSelectModel={handleSelectModel}
      />

      {/* Multiple Login Options Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => showToast(language === 'hi' ? `${u.name} के रूप में सफलतापूर्वक साइन इन किया गया।` : `Successfully signed in as ${u.name} (${u.provider.toUpperCase()}).`)}
      />

      {/* Account Owner Consent Modal (Requirement A) */}
      <AccountConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        targetAccountName="Rajesh Sharma"
        targetAccountEmail="rajesh.sharma@healthlens.com"
        onContinueWithMyAccount={() => showToast(language === 'hi' ? 'अपने वर्तमान खाते के साथ जारी रखा जा रहा है।' : 'Continuing with your verified account.')}
        onRequestAccountAccess={() => setIsRequestAccessModalOpen(true)}
      />

      {/* Request Account Access Modal (Requirement B & C) */}
      <RequestAccessModal
        isOpen={isRequestAccessModalOpen}
        onClose={() => setIsRequestAccessModalOpen(false)}
        targetAccountEmail="rajesh.sharma@healthlens.com"
        targetAccountName="Rajesh Sharma"
        onSubmitted={() => showToast(language === 'hi' ? 'एक्सेस अनुरोध खाता स्वामी को भेजा गया।' : 'Access request submitted to account owner.')}
      />

      {/* Caregiver Authorization & Permissions Modal */}
      {isCaregiverManagerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {language === 'hi' ? 'केयरगिवर अनुमति एवं खाता प्राधिकरण' : 'Caregiver Authorization & Access Control'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {language === 'hi' ? 'अनुमतियां प्रबंधित करें, नए अनुरोध स्वीकार/अस्वीकार करें' : 'Grant granular permissions, review requests, and audit history'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCaregiverManagerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <CaregiverAuthorizationManager
                onOpenRequestAccessModal={() => {
                  setIsCaregiverManagerModalOpen(false);
                  setIsRequestAccessModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 dim:border-slate-700 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 dim:bg-slate-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <strong className="text-slate-900 dark:text-white">HealthLens</strong>
            <span>•</span>
            <span>
              {language === 'hi'
                ? 'दीर्घकालिक रोगियों के लिए स्व-देखभाल प्रिस्क्रिप्शन ट्रैकर'
                : 'Self-Care Prescription Tracker for Chronic Disease Patients'}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] text-center sm:text-right">
            {language === 'hi'
              ? 'चिकित्सीय सुरक्षा सूचना: HealthLens डॉक्टर के पर्चे व्यवस्थित करता है और लैब रिपोर्ट समझाता है। यह कोई दवा नहीं लिखता और न ही उपचार बदलता है।'
              : 'Clinical safety note: HealthLens organizes doctor prescriptions and clarifies lab reports. It does not diagnose, prescribe, or alter treatments.'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
