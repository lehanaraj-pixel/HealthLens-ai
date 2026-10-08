import React, { useState } from 'react';
import {
  Activity,
  Pill,
  FileText,
  FileSpreadsheet,
  Bell,
  History,
  Bot,
  BookOpen,
  User,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  Languages,
  Palette,
  Zap,
  Crown,
  LayoutGrid,
  ChevronDown,
  X,
  FileCheck,
  HelpCircle,
  Shield,
  WifiOff,
  Settings,
  Info,
  Lock,
} from 'lucide-react';
import { AppTheme, PatientProfile, SubscriptionInfo, AuthUser } from '../types';
import { useI18n } from '../services/i18n';
import { authService } from '../services/auth';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  onOpenProfile: () => void;
  onResetDemo: () => void;
  onOpenPremium: () => void;
  subscription: SubscriptionInfo;
  profile: PatientProfile;
  onOpenAuth: () => void;
  onOpenConsent: () => void;
  onOpenCaregiverManager: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onChangeTheme,
  onOpenProfile,
  onResetDemo,
  onOpenPremium,
  subscription,
  profile,
  onOpenAuth,
  onOpenConsent,
  onOpenCaregiverManager,
}) => {
  const { language, setLanguage, t } = useI18n();
  const [is15MenuOpen, setIs15MenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());

  React.useEffect(() => {
    const unsub = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });
    return unsub;
  }, []);

  const pendingRequests = currentUser
    ? authService.getPendingRequestsForAccount(currentUser.email)
    : [];

  // The 15 Full Pages
  const all15Pages = [
    // Core Features
    { id: 'dashboard', num: 1, nameEn: 'Home', nameHi: 'होम (डैशबोर्ड)', icon: LayoutDashboard, category: 'core', descEn: 'Self-care dashboard & daily schedule', descHi: 'दैनिक दवा सारिणी व स्वास्थ्य प्रगति' },
    { id: 'prescription-explainer', num: 2, nameEn: 'Simplify', nameHi: 'प्रिस्क्रिप्शन विश्लेषक', icon: FileText, category: 'core', descEn: 'AI prescription decoder & food timings', descHi: 'डॉक्टर पर्चा व भोजन निर्देश' },
    { id: 'report-simplifier', num: 3, nameEn: 'Upload Report', nameHi: 'मेडिकल रिपोर्ट अपलोड', icon: FileSpreadsheet, category: 'core', descEn: 'Scan lab reports & detect abnormal flags', descHi: 'लैब रिपोर्ट स्कैन व बायोमार्कर' },
    { id: 'assistant', num: 4, nameEn: 'HealthLens AI Assistant', nameHi: 'हेल्थलेन्स AI सहायक', icon: Bot, category: 'core', descEn: '24/7 AI chronic health companion', descHi: '24/7 AI मेडिकल चैट साथी' },
    { id: 'history', num: 5, nameEn: 'History', nameHi: 'चिकित्सा इतिहास', icon: History, category: 'core', descEn: 'Past reports & prescriptions timeline', descHi: 'सहेजे गए पर्चे व लैब परिणाम' },
    { id: 'reminders', num: 6, nameEn: 'Reminders', nameHi: 'स्वास्थ्य अनुस्मारक', icon: Bell, category: 'core', descEn: 'Medication alerts & doctor visits', descHi: 'दवा व जांच के अलार्म' },

    // Add / Retain Features
    { id: 'result-view', num: 7, nameEn: 'Result View', nameHi: 'परिणाम दर्शक', icon: FileCheck, category: 'suite', descEn: 'Structured clinical biomarker report view', descHi: 'विस्तृत लैब मान व डॉक्टर प्रश्न' },
    { id: 'translation', num: 8, nameEn: 'Translation', nameHi: 'चिकित्सा अनुवाद', icon: Languages, category: 'suite', descEn: 'Bilingual medical translator & speech audio', descHi: 'हिन्दी स्वास्थ्य अनुवाद व ऑडियो' },
    { id: 'lab-guide', num: 9, nameEn: 'Lab & Vitals Guide', nameHi: 'लैब व वाइटल्स गाइड', icon: Activity, category: 'suite', descEn: 'Reference ranges for HbA1c, FBS, BP', descHi: 'शुगर, बीपी व लिपिड सामान्य सीमाएं' },
    { id: 'medical-terms', num: 10, nameEn: 'Medical Terms', nameHi: 'मेडिकल शब्दावली', icon: HelpCircle, category: 'suite', descEn: 'OD, BD, TDS Latin shorthand decoded', descHi: 'पर्चा संकेत व क्रोनिक शब्दावली' },
    { id: 'insights', num: 11, nameEn: 'Health Education', nameHi: 'स्वास्थ्य शिक्षा', icon: BookOpen, category: 'suite', descEn: 'Self-care guides for diabetes & BP', descHi: 'मधुमेह व बीपी स्व-देखभाल ज्ञान' },
    { id: 'offline-mode', num: 12, nameEn: 'Offline Mode', nameHi: 'ऑफलाइन मोड', icon: WifiOff, category: 'suite', descEn: 'Printable emergency wallet card & offline state', descHi: 'इमरजेंसी वॉलेट कार्ड व ऑफलाइन' },
    { id: 'premium-plans', num: 13, nameEn: 'Premium Plans', nameHi: 'प्रीमियम प्लान (₹5 / ₹29)', icon: Crown, category: 'suite', descEn: 'HealthLens Plus (₹5) & Monthly (₹29)', descHi: '1-दिन का पास ₹5 व मासिक ₹29', isSpecial: true },
    { id: 'about-us', num: 14, nameEn: 'About Us', nameHi: 'हमारे बारे में', icon: Info, category: 'suite', descEn: 'Mission, chronic illness focus & safety', descHi: 'हमारा उद्देश्य व चिकित्सीय सुरक्षा' },
    { id: 'settings-privacy', num: 15, nameEn: 'Settings & Privacy', nameHi: 'सेटिंग्स एवं गोपनीयता', icon: Settings, category: 'suite', descEn: 'Local storage, backup export & theme', descHi: 'डेटा बैकअप, थीम व प्राइवेसी' },
  ];

  const quickTabs = [
    { id: 'dashboard', label: language === 'hi' ? 'होम' : 'Home', icon: LayoutDashboard },
    { id: 'tracker', label: language === 'hi' ? 'दवा ट्रैकर' : 'Prescription Tracker', icon: Pill, highlight: true },
    { id: 'prescription-explainer', label: language === 'hi' ? 'सरलीकरण' : 'Simplify', icon: FileText },
    { id: 'report-simplifier', label: language === 'hi' ? 'रिपोर्ट' : 'Upload Report', icon: FileSpreadsheet },
    { id: 'assistant', label: language === 'hi' ? 'HealthLens AI' : 'HealthLens AI', icon: Bot },
    { id: 'reminders', label: language === 'hi' ? 'अनुस्मारक' : 'Reminders', icon: Bell },
    { id: 'history', label: language === 'hi' ? 'इतिहास' : 'History', icon: History },
    { id: 'result-view', label: language === 'hi' ? 'परिणाम' : 'Result View', icon: FileCheck },
    { id: 'translation', label: language === 'hi' ? 'अनुवाद' : 'Translation', icon: Languages },
    { id: 'lab-guide', label: language === 'hi' ? 'लैब गाइड' : 'Lab Guide', icon: Activity },
    { id: 'medical-terms', label: language === 'hi' ? 'शब्दावली' : 'Medical Terms', icon: HelpCircle },
    { id: 'insights', label: language === 'hi' ? 'स्वास्थ्य शिक्षा' : 'Education', icon: BookOpen },
    { id: 'offline-mode', label: language === 'hi' ? 'ऑफलाइन' : 'Offline', icon: WifiOff },
    { id: 'premium-plans', label: language === 'hi' ? 'प्रीमियम (₹5/₹29)' : 'Plans (₹5/₹29)', icon: Crown, isSpecial: true },
  ];

  const handleSelectPage = (id: string) => {
    setIs15MenuOpen(false);
    if (id === 'premium-plans') {
      onSelectTab('premium-plans');
    } else {
      onSelectTab(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 dim:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 dim:border-slate-700 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Problem Statement Tag */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white dim:text-white tracking-tight">
                    HEALTH<span className="text-teal-600 dark:text-teal-400">LENS</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 dim:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                    Rx
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {t('app_subtitle')}
                </span>
              </div>
            </button>
          </div>

          {/* Right Action Tools: All 15 Pages Trigger, Global Hindi Toggle, Premium Plans, Try Demo, Theme, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ALL 15 PAGES MENU TRIGGER BUTTON */}
            <button
              onClick={() => setIs15MenuOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700/60 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Browse All 15 Pages of HealthLens"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{language === 'hi' ? 'सभी 15 पेज' : 'All 15 Pages'}</span>
              <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-black">
                15
              </span>
            </button>

            {/* GLOBAL TRANSLATE TO HINDI TOGGLE BUTTON */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 dim:bg-slate-700/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Switch to English interface"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'hi'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Translate all interface labels, instructions & medications into Hindi (हिन्दी)"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>हिन्दी</span>
              </button>
            </div>

            {/* PREMIUM MODELS & SUBSCRIPTION TRIGGER (HealthLens Plus ₹5 & Monthly ₹29) */}
            <button
              onClick={onOpenPremium}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                subscription.tier === 'monthly'
                  ? 'bg-teal-600 text-white shadow-teal-500/20'
                  : subscription.tier === 'day_pass'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
              }`}
              title="View HealthLens Plus (₹5) or Monthly (₹29)"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>
                {subscription.tier === 'monthly'
                  ? language === 'hi'
                    ? '⭐ HealthLens Monthly (₹29)'
                    : '⭐ HealthLens Monthly (₹29)'
                  : subscription.tier === 'day_pass'
                  ? language === 'hi'
                    ? '⚡ HealthLens Plus (₹5)'
                    : '⚡ HealthLens Plus (₹5)'
                  : language === 'hi'
                  ? 'प्रीमियम (₹5 / ₹29)'
                  : 'Premium (₹5 / ₹29)'}
              </span>
            </button>

            {/* Try Demo Button */}
            <button
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Load sample chronic patient demo data (Diabetes & Hypertension)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('try_demo')}</span>
            </button>

            {/* Theme switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 dim:bg-slate-700/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 hidden sm:flex">
              <button
                onClick={() => onChangeTheme('light')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={t('theme_light')}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTheme('dim')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === 'dim'
                    ? 'bg-slate-700 text-teal-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={t('theme_dim')}
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeTheme('dark')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-teal-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={t('theme_dark')}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile & Account Authorization Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 dim:border-slate-700 hover:border-teal-500/50 bg-white dark:bg-slate-800 dim:bg-slate-800 transition-all cursor-pointer relative"
                title="Account, Caregiver Permissions & Profile"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                  {currentUser?.name?.charAt(0) || profile.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : profile.name.split(' ')[0]}
                  </div>
                  <span className="text-[9px] text-teal-600 dark:text-teal-400 font-bold block uppercase leading-none">
                    {currentUser?.provider ? currentUser.provider : 'Account'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />

                {/* Pending Caregiver Request Badge */}
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-2xl p-2.5 z-50 animate-in fade-in space-y-2">
                  {/* User Profile Summary */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {currentUser?.name || profile.name}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                        {currentUser?.provider ? `${currentUser.provider}` : 'Guest'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {currentUser?.email || 'rajesh.sharma@healthlens.com'}
                    </div>
                  </div>

                  {/* Pending Request Banner inside Dropdown */}
                  {pendingRequests.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-[11px]">
                        <span>🔔</span>
                        <span>{pendingRequests.length} Pending Caregiver Request</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onOpenCaregiverManager();
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all cursor-pointer text-center"
                      >
                        Review & Approve Permissions
                      </button>
                    </div>
                  )}

                  {/* Menu Action Items */}
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-teal-600" />
                      <span>{language === 'hi' ? 'रोगी प्रोफ़ाइल व लक्ष्य' : 'Patient Profile & Goals'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenCaregiverManager();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span>{language === 'hi' ? 'केयरगिवर अनुमति एवं ऑडिट लॉग' : 'Caregiver Authorization'}</span>
                      </span>
                      {pendingRequests.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenConsent();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      <span>{language === 'hi' ? 'अन्य खाते के एक्सेस का अनुरोध' : 'Request Access to Patient'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{language === 'hi' ? 'साइन इन / खाता बदलें' : 'Sign In / Switch Account'}</span>
                    </button>
                  </div>

                  {currentUser?.provider !== 'guest' && (
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          authService.logout();
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl text-left text-slate-500 hover:text-rose-600 text-[11px] font-semibold cursor-pointer"
                      >
                        {language === 'hi' ? 'साइन आउट' : 'Sign Out'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Hindi Notice Pill if active */}
        {language === 'hi' && (
          <div className="py-1.5 px-3 mb-1 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between animate-in fade-in duration-150">
            <span className="flex items-center gap-1.5 font-medium">
              <Languages className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {t('lang_active_notice')}
            </span>
            <button
              onClick={() => setLanguage('en')}
              className="text-[11px] font-bold underline hover:text-teal-700 cursor-pointer"
            >
              Switch back to English (अंग्रेज़ी)
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/60 dim:border-slate-700/60 no-scrollbar">
          {quickTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'premium-plans') {
                    onSelectTab('premium-plans');
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : item.isSpecial
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 dim:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dim:hover:bg-slate-700'
                } ${
                  item.highlight && !isActive
                    ? 'border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold'
                    : ''
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More Pages button directly on tabs */}
          <button
            onClick={() => setIs15MenuOpen(true)}
            className="px-2.5 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>{language === 'hi' ? '+ अन्य पेज' : '+ All Pages'}</span>
          </button>
        </nav>
      </div>

      {/* ALL 15 PAGES MODAL MENU OVERLAY */}
      {is15MenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 dim:border-slate-700 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-teal-500/20">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{language === 'hi' ? 'All 15 Pages मेनू' : 'All 15 Pages Directory'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                      15 Complete Features
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'hi'
                      ? 'HealthLens के किसी भी पेज पर सीधे जाने के लिए क्लिक करें।'
                      : 'Instantly jump to any feature across the complete HealthLens chronic care suite.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIs15MenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Grid */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Category 1: Core 6 Features */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>{language === 'hi' ? 'मुख्य विशेषताएं (Core Features)' : 'Core Chronic Care Features'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {all15Pages
                    .filter((p) => p.category === 'core')
                    .map((page) => {
                      const Icon = page.icon;
                      const isActive = activeTab === page.id;
                      return (
                        <button
                          key={page.id}
                          onClick={() => handleSelectPage(page.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                            isActive
                              ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 ring-2 ring-teal-500/40'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-teal-400/80 hover:bg-teal-50/30'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                                #{page.num}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {language === 'hi' ? page.nameHi : page.nameEn}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {language === 'hi' ? page.descHi : page.descEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Category 2: Retained & Added Clinical Suite (Pages 7 to 15) */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>{language === 'hi' ? 'क्लिनिकल टूल्स एवं मार्गदर्शिकाएं (Clinical Tools & Guides)' : 'Clinical Tools & HealthLens Features'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {all15Pages
                    .filter((p) => p.category === 'suite')
                    .map((page) => {
                      const Icon = page.icon;
                      const isActive = activeTab === page.id;
                      return (
                        <button
                          key={page.id}
                          onClick={() => handleSelectPage(page.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                            page.isSpecial
                              ? 'border-amber-400/80 bg-amber-50/40 dark:bg-amber-950/30'
                              : isActive
                              ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 ring-2 ring-teal-500/40'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-indigo-400/80 hover:bg-indigo-50/30'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                              page.isSpecial
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                                : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                #{page.num}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {language === 'hi' ? page.nameHi : page.nameEn}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {language === 'hi' ? page.descHi : page.descEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
