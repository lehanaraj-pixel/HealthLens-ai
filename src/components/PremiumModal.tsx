import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Cpu,
  ArrowRight,
  Languages,
} from 'lucide-react';
import { useI18n } from '../services/i18n';
import { SubscriptionInfo, SubscriptionTier, AIModelId } from '../types';
import { PaymentModal } from './PaymentModal';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionInfo;
  onSelectPlan: (tier: SubscriptionTier, model?: AIModelId) => void;
  onSelectModel: (model: AIModelId) => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSelectPlan,
  onSelectModel,
}) => {
  const { language, t } = useI18n();
  const [checkoutPlan, setCheckoutPlan] = useState<'day_pass' | 'monthly' | null>(null);

  if (!isOpen) return null;

  const isSubscribed = subscription.tier === 'day_pass' || subscription.tier === 'monthly';

  // Calculate remaining time if applicable
  const getRemainingTimeText = () => {
    if (!subscription.expiresAt) return null;
    const expiry = new Date(subscription.expiresAt).getTime();
    const diffMs = expiry - Date.now();
    if (diffMs <= 0) return language === 'hi' ? 'अवधि समाप्त' : 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.ceil(hours / 24);
      return language === 'hi' ? `${days} दिन शेष` : `${days} days remaining`;
    }
    return language === 'hi' ? `${hours} घंटे ${mins} मिनट शेष` : `${hours}h ${mins}m remaining`;
  };

  const remainingText = getRemainingTimeText();

  const handlePaymentSuccess = (tier: SubscriptionTier) => {
    onSelectPlan(tier, 'gemini-2.5-pro');
    setCheckoutPlan(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Modal Header */}
          <div className="relative px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 dim:border-slate-700 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {t('premium_modal_title')}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {t('premium_modal_sub')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Status Badge if subscribed */}
            {isSubscribed && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-emerald-300">
                    {subscription.tier === 'day_pass'
                      ? (language === 'hi' ? 'HealthLens Plus (1-दिन का पास) सक्रिय है' : 'HealthLens Plus (Single Day Pass) Active')
                      : (language === 'hi' ? 'HealthLens Monthly (मासिक क्रोनिक केयर) सक्रिय है' : 'HealthLens Monthly Active')}
                  </span>
                </div>
                {remainingText && (
                  <span className="text-amber-300 font-bold bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-full text-[11px]">
                    ⏱ {remainingText}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* SUBSCRIPTION CARDS: HEALTHLENS PLUS (₹5 / 24h) vs HEALTHLENS MONTHLY (₹29 / 30d) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. HEALTHLENS PLUS - ₹5 / 24 HOURS */}
              <div
                className={`rounded-2xl p-6 border transition-all flex flex-col justify-between relative ${
                  subscription.tier === 'day_pass'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/50 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850 hover:border-amber-400/60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      HealthLens Plus
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      24 {language === 'hi' ? 'घंटे' : 'hours'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      HealthLens Plus
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ₹5
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">/ 24 {language === 'hi' ? 'घंटे' : 'hours'}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {language === 'hi'
                        ? 'आज डॉक्टर से मिलने या अस्पताल जाने के लिए सबसे उपयुक्त। पर्चा और रिपोर्ट तुरंत स्कैन करें।'
                        : 'Ideal for your doctor appointment or hospital check-up today. Zero ongoing commitment.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                    {[
                      language === 'hi'
                        ? 'प्रीमियम मॉडल: HealthLens AI Pro Medical अनलॉक'
                        : 'Premium Model: Unlocks HealthLens AI Pro Medical',
                      language === 'hi'
                        ? 'कठिन हस्तलिखित डॉक्टर पर्चे का सटीक डीकोडिंग'
                        : 'Decodes ambiguous handwritten doctor scripts',
                      language === 'hi'
                        ? 'डॉक्टर से पूछने योग्य प्राथमिक प्रश्नों की सूची'
                        : 'Priority doctor consultation checklist',
                      language === 'hi'
                        ? '24 घंटे असीमित हिन्दी व अंग्रेज़ी HealthLens AI मेडिकल व्याख्या'
                        : '24-hour bilingual HealthLens AI medical companion',
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/60 dark:border-slate-750">
                  <button
                    onClick={() => {
                      if (subscription.tier === 'day_pass') return;
                      setCheckoutPlan('day_pass');
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      subscription.tier === 'day_pass'
                        ? 'bg-amber-500 text-slate-950 font-black cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 cursor-pointer'
                    }`}
                  >
                    {subscription.tier === 'day_pass' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        {language === 'hi' ? 'HealthLens Plus सक्रिय है (₹5)' : 'HealthLens Plus Active (₹5)'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {language === 'hi' ? 'HealthLens Plus लें (₹5 / 24 घंटे)' : 'Get HealthLens Plus (₹5 / 24 hours)'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. HEALTHLENS MONTHLY - ₹29 / 30 DAYS */}
              <div
                className={`rounded-2xl p-6 border transition-all flex flex-col justify-between relative ${
                  subscription.tier === 'monthly'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/50 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850 hover:border-teal-400/60'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      HealthLens Monthly
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {language === 'hi' ? 'सर्वोत्तम मूल्य' : 'Best Value'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      HealthLens Monthly
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ₹29
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">/ 30 {language === 'hi' ? 'दिन' : 'days'}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {language === 'hi'
                        ? 'मधुमेह, बीपी, थायरॉइड एवं हृदय रोगियों के लिए निरंतर 30 दिनों की संपूर्ण देखभाल।'
                        : 'Continuous adherence, refill courier alerts, and physician dossiers for lifelong conditions.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                    {[
                      language === 'hi'
                        ? 'HealthLens AI Pro Medical एवं शुद्ध हिन्दी इंजन दोनों शामिल'
                        : 'HealthLens AI Pro Medical & Multilingual both included',
                      language === 'hi'
                        ? 'असीमित पर्चे, ब्लड रिपोर्ट एवं लैब टेस्ट सरलीकरण'
                        : 'Unlimited prescription scans & lab analyses',
                      language === 'hi'
                        ? 'डॉक्टर के लिए संपूर्ण स्वास्थ्य डोजियर (PDF सारांश)'
                        : 'Comprehensive Doctor Health Dossier export',
                      language === 'hi'
                        ? '30-दिवसीय स्वचालित दवा रिफिल अलर्ट'
                        : 'Automated 30-day medication refill alerts',
                      language === 'hi'
                        ? '90-दिवसीय HbA1c एवं रक्तचाप रुझान विश्लेषण'
                        : 'Longitudinal HbA1c & Blood Pressure trajectory analytics',
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/60 dark:border-slate-750">
                  <button
                    onClick={() => {
                      if (subscription.tier === 'monthly') return;
                      setCheckoutPlan('monthly');
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      subscription.tier === 'monthly'
                        ? 'bg-teal-600 text-white font-black cursor-default'
                        : 'bg-teal-600 hover:bg-teal-500 text-white cursor-pointer'
                    }`}
                  >
                    {subscription.tier === 'monthly' ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        {language === 'hi' ? 'HealthLens Monthly सक्रिय है (₹29)' : 'HealthLens Monthly Active (₹29)'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {language === 'hi' ? 'HealthLens Monthly लें (₹29 / 30 दिन)' : 'Get HealthLens Monthly (₹29 / 30 days)'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI MODEL SELECTOR SECTION - User-Facing HealthLens AI Branding */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('model_selection_title')}
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({isSubscribed ? (language === 'hi' ? 'प्रीमियम मॉडल अनलॉक हैं' : 'Premium Models Unlocked') : (language === 'hi' ? 'अपग्रेड पर अनलॉक' : 'Unlock with Plus or Monthly')})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. HEALTHLENS AI STANDARD */}
                <button
                  type="button"
                  onClick={() => onSelectModel('gemini-2.5-flash')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    subscription.selectedModel === 'gemini-2.5-flash'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/40'
                      : 'border-slate-200 dark:border-slate-750 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-teal-600" />
                      HealthLens AI Standard
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {language === 'hi' ? 'निःशुल्क' : 'Free'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {t('model_flash_desc')}
                  </p>
                </button>

                {/* 2. HEALTHLENS AI PRO MEDICAL */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSubscribed) {
                      onSelectModel('gemini-2.5-pro');
                    } else {
                      setCheckoutPlan('day_pass');
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    subscription.selectedModel === 'gemini-2.5-pro'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/40'
                      : 'border-slate-200 dark:border-slate-750 bg-slate-50/40 dark:bg-slate-800/40 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      HealthLens AI Pro Medical
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      {language === 'hi' ? 'प्रीमियम' : 'Premium'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {t('model_pro_desc')}
                  </p>
                </button>

                {/* 3. HEALTHLENS AI MULTILINGUAL */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSubscribed) {
                      onSelectModel('gemini-2.5-pro-multilingual');
                    } else {
                      setCheckoutPlan('day_pass');
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    subscription.selectedModel === 'gemini-2.5-pro-multilingual'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/40'
                      : 'border-slate-200 dark:border-slate-750 bg-slate-50/40 dark:bg-slate-800/40 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-indigo-500" />
                      HealthLens AI Multilingual
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                      {language === 'hi' ? 'शुद्ध हिन्दी' : 'Hindi Pro'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {t('model_multilingual_desc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Free Tier Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'hi' ? 'Free Plan (₹0 / forever - निःशुल्क प्लान)' : 'Free Plan (₹0 / forever)'}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {language === 'hi'
                    ? 'दवा ट्रैकर, बुनियादी पर्चा विश्लेषण, और व्यक्तिगत गोपनीयता हमेशा निःशुल्क है।'
                    : 'Includes daily medication tracker, standard HealthLens AI analysis, and offline device storage.'}
                </span>
              </div>
              {subscription.tier !== 'free' && (
                <button
                  onClick={() => {
                    onSelectPlan('free', 'gemini-2.5-flash');
                    onClose();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline shrink-0 ml-4 cursor-pointer"
                >
                  {language === 'hi' ? 'मुफ़्त प्लान पर लौटें' : 'Switch to Free (₹0)'}
                </button>
              )}
            </div>
          </div>
        </div>
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
    </>
  );
};
