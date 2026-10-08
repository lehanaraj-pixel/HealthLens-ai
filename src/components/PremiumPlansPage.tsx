import React, { useState } from 'react';
import {
  Crown,
  Check,
  Zap,
  Calendar,
  Sparkles,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useI18n } from '../services/i18n';
import { SubscriptionInfo, SubscriptionTier, AIModelId } from '../types';
import { PaymentModal } from './PaymentModal';

interface PremiumPlansPageProps {
  subscription: SubscriptionInfo;
  onSelectPlan: (tier: SubscriptionTier, model?: AIModelId) => void;
  onSelectModel: (model: AIModelId) => void;
}

export const PremiumPlansPage: React.FC<PremiumPlansPageProps> = ({
  subscription,
  onSelectPlan,
  onSelectModel,
}) => {
  const { language } = useI18n();
  const [checkoutPlan, setCheckoutPlan] = useState<'day_pass' | 'monthly' | null>(null);

  const handlePaymentSuccess = (tier: SubscriptionTier) => {
    onSelectPlan(tier, 'gemini-2.5-pro');
    setCheckoutPlan(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-300 bg-amber-950/60 px-3.5 py-1 rounded-full mb-4 border border-amber-500/40">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'hi' ? 'पेज 13: पारदर्शी प्रीमियम प्लान' : 'Page 13: Transparent Premium Plans'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {language === 'hi' ? 'सस्ती एवं सुलभ क्रोनिक केयर योजनाएं' : 'Affordable Self-Care Plans for Every Patient'}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          {language === 'hi'
            ? 'बिना किसी छुपे शुल्क के। अस्पताल जाने के लिए 1-दिन का पास (₹5) लें या पूरे महीने की असीमित देखभाल (₹29) चुनें।'
            : 'Zero hidden commitments. Activate single-day access for ₹5 on your clinic visit, or continuous 30-day chronic care for ₹29.'}
        </p>
      </div>

      {/* 3 PRICING CARDS: FREE (₹0), HEALTHLENS PLUS (₹5), HEALTHLENS MONTHLY (₹29) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {/* 1. FREE PLAN - ₹0 / forever */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Free Plan
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {language === 'hi' ? 'हमेशा' : 'Forever'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {language === 'hi' ? 'निःशुल्क प्लान' : 'Free Chronic Plan'}
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {language === 'hi'
                  ? 'दैनिक दवा ट्रैकिंग और स्थानीय गोपनीयता हमेशा मुफ्त है।'
                  : 'Daily medication adherence and local device storage forever free.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              {[
                language === 'hi' ? 'दैनिक दवा ट्रैकर और समय सारिणी' : 'Daily prescription medication tracker',
                language === 'hi' ? 'HealthLens AI Standard मॉडल' : 'Standard HealthLens AI analysis',
                language === 'hi' ? '100% ऑन-डिवाइस स्थानीय गोपनीयता' : 'Offline device storage safety',
                language === 'hi' ? 'बुनियादी स्वास्थ्य अनुस्मारक' : 'Standard pill reminders',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('free', 'gemini-2.5-flash')}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
              subscription.tier === 'free'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 font-black cursor-default'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800'
            }`}
          >
            {subscription.tier === 'free'
              ? (language === 'hi' ? 'वर्तमान सक्रिय प्लान (₹0)' : 'Current Active Plan (₹0)')
              : (language === 'hi' ? 'मुफ़्त प्लान चुनें (₹0)' : 'Choose Free Plan (₹0)')}
          </button>
        </div>

        {/* 2. HEALTHLENS PLUS - ₹5 / 24 HOURS */}
        <div
          className={`p-6 sm:p-7 rounded-3xl border-2 flex flex-col justify-between space-y-6 relative transition-all ${
            subscription.tier === 'day_pass'
              ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xl ring-2 ring-amber-500/40'
              : 'border-amber-400/80 bg-white dark:bg-slate-900 dim:bg-slate-800 shadow-md hover:border-amber-500'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                HealthLens Plus
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                24 {language === 'hi' ? 'घंटे' : 'hours'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                HealthLens Plus
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">₹5</span>
                <span className="text-xs text-slate-500">/ 24 {language === 'hi' ? 'घंटे' : 'hours'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {language === 'hi'
                  ? 'आज अस्पताल या डॉक्टर क्लिनिक विजिट के लिए सर्वश्रेष्ठ।'
                  : 'Ideal for doctor visits and acute lab consultations today.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              {[
                language === 'hi' ? 'HealthLens AI Pro Medical अनलॉक' : 'HealthLens AI Pro Medical unlocked',
                language === 'hi' ? 'हस्तलिखित कठिन पर्चों का सटीक विश्लेषण' : 'Decodes complex handwriting scripts',
                language === 'hi' ? 'डॉक्टर से पूछने योग्य प्राथमिक प्रश्न' : 'Priority doctor consultation queries',
                language === 'hi' ? '24 घंटे असीमित हिन्दी व अंग्रेज़ी व्याख्या' : '24-hour unlimited bilingual AI access',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCheckoutPlan('day_pass')}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
              subscription.tier === 'day_pass'
                ? 'bg-amber-500 text-slate-950 font-black cursor-default'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer'
            }`}
          >
            {subscription.tier === 'day_pass' ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{language === 'hi' ? 'सक्रिय है (₹5 / 24 घंटे)' : 'Active (₹5 / 24 hours)'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{language === 'hi' ? 'HealthLens Plus लें (₹5)' : 'Get HealthLens Plus (₹5)'}</span>
              </>
            )}
          </button>
        </div>

        {/* 3. HEALTHLENS MONTHLY - ₹29 / 30 DAYS */}
        <div
          className={`p-6 sm:p-7 rounded-3xl border-2 flex flex-col justify-between space-y-6 relative transition-all ${
            subscription.tier === 'monthly'
              ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-xl ring-2 ring-teal-500/40'
              : 'border-teal-500/80 bg-white dark:bg-slate-900 dim:bg-slate-800 shadow-md hover:border-teal-500'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                HealthLens Monthly
              </span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {language === 'hi' ? 'सर्वोत्तम मूल्य' : 'Best Value'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                HealthLens Monthly
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">₹29</span>
                <span className="text-xs text-slate-500">/ 30 {language === 'hi' ? 'दिन' : 'days'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {language === 'hi'
                  ? 'डायबिटीज व बीपी जैसे दीर्घकालिक रोगियों के लिए संपूर्ण 30-दिवसीय क्रोनिक देखभाल।'
                  : 'Comprehensive continuous adherence and refill tracking for chronic disease.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              {[
                language === 'hi' ? 'HealthLens AI Pro Medical व हिन्दी इंजन' : 'HealthLens AI Pro Medical & Multilingual',
                language === 'hi' ? 'असीमित पर्चे व लैब टेस्ट सरलीकरण' : 'Unlimited prescription & lab scans',
                language === 'hi' ? 'डॉक्टर के लिए संपूर्ण स्वास्थ्य डोजियर PDF' : 'Doctor Health Dossier PDF export',
                language === 'hi' ? '30-दिवसीय स्वचालित दवा रिफिल अलर्ट' : 'Automated 30-day refill alerts',
                language === 'hi' ? '90-दिवसीय रुझान विश्लेषण' : 'Longitudinal glucose & BP trends',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCheckoutPlan('monthly')}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
              subscription.tier === 'monthly'
                ? 'bg-teal-600 text-white font-black cursor-default'
                : 'bg-teal-600 hover:bg-teal-500 text-white font-black cursor-pointer'
            }`}
          >
            {subscription.tier === 'monthly' ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{language === 'hi' ? 'सक्रिय है (₹29 / 30 दिन)' : 'Active (₹29 / 30 days)'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? 'HealthLens Monthly लें (₹29)' : 'Get HealthLens Monthly (₹29)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Security Assurance Section */}
      <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>{language === 'hi' ? '100% सुरक्षित भुगतान गारंटी (UPI, कार्ड, नेटबैंकिंग)' : '100% Secure Payment Guarantee (UPI, Cards, NetBanking)'}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {language === 'hi'
            ? 'भारतीय रिजर्व बैंक (RBI) के भुगतान सुरक्षा दिशानिर्देशों के अनुरूप 256-बिट SSL एन्क्रिप्शन। तुरंत प्लान एक्टिवेशन।'
            : 'All transactions secured with 256-bit bank-grade encryption in compliance with RBI digital payment directives.'}
        </p>
      </div>

      {/* Interactive Payment Modal for Checkout */}
      {checkoutPlan && (
        <PaymentModal
          isOpen={true}
          onClose={() => setCheckoutPlan(null)}
          plan={checkoutPlan}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
