import React from 'react';
import {
  Heart,
  ShieldCheck,
  Target,
  Users,
  Sparkles,
  FileText,
  Activity,
  Award,
} from 'lucide-react';
import { useI18n } from '../services/i18n';

export const AboutUs: React.FC = () => {
  const { language } = useI18n();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पेज 14: हमारे बारे में' : 'Page 14: About Us'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {language === 'hi' ? 'HealthLens के बारे में' : 'About HealthLens'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'hi'
              ? 'दीर्घकालिक रोगियों के लिए भारत का समर्पित स्व-देखभाल प्रिस्क्रिप्शन ट्रैकर एवं मेडिकल रिपोर्ट साथी।'
              : 'Empowering chronic disease patients with medication adherence, decoded prescriptions, and simplified lab reports.'}
          </p>
        </div>
      </div>

      {/* Mission & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'hi' ? 'हमारा मिशन एवं उद्देश्य' : 'Our Mission'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'hi'
              ? 'मधुमेह, उच्च रक्तचाप और हृदय रोग से जूझ रहे लाखों भारतीय रोगी कठिन अंग्रेजी पर्चों और जटिल लैब रिपोर्टों के कारण दवाओं का समय और खुराक भूल जाते हैं। HealthLens का उद्देश्य हर मरीज को उसकी अपनी भाषा में समय पर सटीक दवा लेने में सक्षम बनाना है।'
              : 'Millions of chronic illness patients struggle with illegible prescription slips, Latin shorthand, and dense lab tables. HealthLens bridges the communication gap between busy physicians and patients, turning anxiety into empowered daily self-care.'}
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'hi' ? 'चिकित्सीय सुरक्षा एवं सीमाएं' : 'Clinical Safety Principles'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'hi'
              ? 'HealthLens कोई डॉक्टर या अस्पताल का विकल्प नहीं है। यह केवल डॉक्टर द्वारा लिखे गए पर्चे को व्यवस्थित करता है, खुराक का समय याद दिलाता है और लैब टेस्ट के मान समझाता है। हम कभी भी किसी रोगी की दवा नहीं बदलते।'
              : 'HealthLens never prescribes drugs, initiates treatments, or alters dosages. We structure your licensed physician’s regimen into actionable reminders and clarify laboratory terminology so you can have more productive doctor consultations.'}
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {language === 'hi' ? 'HealthLens के तीन मुख्य स्तंभ' : 'Three Core Pillars of HealthLens'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-teal-600 dark:text-teal-400 font-bold text-sm">1. Adherence First</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'नियमितता ही क्रोनिक बीमारियों की आधी जीत है।'
                : 'Consistent daily medication schedule tracking for hypertension & diabetes.'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">2. Plain Language & Hindi</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'मातृभाषा में स्पष्ट निर्देश, बिना किसी डॉक्टरी घबराहट के।'
                : 'Bilingual localization eliminating medical translation jargon loss.'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">3. Local Device Privacy</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'आपका स्वास्थ्य डेटा केवल आपके डिवाइस पर सुरक्षित है।'
                : 'Zero tracking and 100% on-device private local data storage.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
