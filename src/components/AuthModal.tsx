import React, { useState } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useI18n } from '../services/i18n';
import { authService } from '../services/auth';
import { AuthProviderType, AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'providers' | 'email'>('providers');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProviderLogin = async (provider: AuthProviderType, defaultEmail?: string, defaultName?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Simulate authentic secure provider authorization callback
      await new Promise((r) => setTimeout(r, 600));

      const email = defaultEmail || (provider === 'google'
        ? 'patient.google@example.com'
        : provider === 'microsoft'
        ? 'patient.microsoft@outlook.com'
        : 'patient.apple@icloud.com');

      const name = defaultName || (provider === 'google'
        ? 'Google User'
        : provider === 'microsoft'
        ? 'Microsoft User'
        : 'Apple User');

      const user = await authService.login(provider, email, name);
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess(user);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Authentication error.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg(language === 'hi' ? 'कृपया एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const user = await authService.login('email', emailInput, nameInput || emailInput.split('@')[0]);
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess(user);
      onClose();
    } catch (e: any) {
      setIsLoading(false);
      setErrorMsg(e.message || 'Authentication error.');
    }
  };

  const handleGuestContinue = () => {
    authService.continueAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-teal-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {language === 'hi' ? 'HealthLens सुरक्षित लॉगिन' : 'HealthLens Secure Sign In'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'hi' ? 'व्यक्तिगत स्वास्थ्य रिकॉर्ड सुरक्षा' : 'Authorized Health Data & Caregiver System'}
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

        {/* Demo Notice Banner (Requirement D) */}
        <div className="bg-amber-50 dark:bg-amber-950/40 px-5 py-2.5 border-b border-amber-200 dark:border-amber-900/60 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {language === 'hi'
              ? 'डेमो वातावरण: पूर्वावलोकन हेतु लॉगिन प्रवाह सक्रिय है। कोई पासवर्ड स्थानीय स्टोरेज में संग्रहीत नहीं होता।'
              : 'Demo Environment: Multi-provider login flows are simulated for AI Studio preview. Zero passwords stored in browser.'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'providers' ? (
            <div className="space-y-3">
              {/* Provider 1: Google */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProviderLogin('google', 'rajesh.sharma@healthlens.com', 'Rajesh Sharma')}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                {/* Google Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.02h3.87c2.26-2.09 3.67-5.17 3.67-9.11z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.26 21.26 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.27c-.25-.72-.39-1.49-.39-2.27s.14-1.55.39-2.27V6.61H1.28C.46 8.24 0 10.06 0 12s.46 3.76 1.28 5.39l3.99-3.12z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.74 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
                  />
                </svg>
                <span>{language === 'hi' ? 'Google के साथ जारी रखें' : 'Continue with Google'}</span>
              </button>

              {/* Provider 2: Microsoft */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProviderLogin('microsoft')}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                {/* Microsoft Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>{language === 'hi' ? 'Microsoft के साथ जारी रखें' : 'Continue with Microsoft'}</span>
              </button>

              {/* Provider 3: Apple */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProviderLogin('apple')}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                {/* Apple Logo SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.96-12.02-14.64-5.99-9.33-10.74-19.8-14.24-31.42-3.5-11.62-5.25-22.65-5.25-33.1 0-14.67 3.75-26.78 11.26-36.32 7.51-9.55 17.06-14.46 28.66-14.75 4.36 0 9.4 1.13 15.14 3.39 5.73 2.27 9.53 3.49 11.4 3.67 1.45 0 5.48-1.28 12.08-3.83 6.6-2.55 12.06-3.74 16.39-3.56 12.22.67 22.18 5.16 29.87 13.48-10.72 6.5-16.01 15.54-15.86 27.14.16 9.17 3.65 16.89 10.49 23.16 6.84 6.27 15.08 9.93 24.71 10.99-2.17 6.65-4.7 13.04-7.58 19.17zM119.22 31.84c0-7.39 2.68-14.28 8.04-20.67 5.37-6.39 12.04-10.49 20.02-12.3 0 1.25.07 2.41.07 3.49 0 7.21-2.8 14.26-8.39 21.14-5.6 6.88-12.51 10.87-20.74 11.97-.68-1.25-1-2.46-1-3.63z" />
                </svg>
                <span>{language === 'hi' ? 'Apple के साथ जारी रखें' : 'Continue with Apple'}</span>
              </button>

              {/* Provider 4: Email */}
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className="w-full py-3 px-4 rounded-2xl border border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <Mail className="w-4 h-4 text-teal-600" />
                <span>{language === 'hi' ? 'ईमेल पते के साथ जारी रखें' : 'Continue with Email'}</span>
              </button>
            </div>
          ) : (
            /* Email Form */
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'hi' ? 'आपका नाम' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('providers')}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'hi' ? 'वापस' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
                >
                  {isLoading ? (
                    <span>{language === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...'}</span>
                  ) : (
                    <>
                      <span>{language === 'hi' ? 'सुरक्षित साइन इन करें' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Retain Existing No-Login Experience (Explicit Requirement) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold underline cursor-pointer"
            >
              {language === 'hi'
                ? 'बिना लॉगिन किए अतिथि के रूप में जारी रखें (लोकल मोड)'
                : 'Continue as Guest (No Login Required • Local Device Mode)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
