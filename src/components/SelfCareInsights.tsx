import React, { useState } from 'react';
import {
  BookOpen,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  Volume2,
  Languages,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { speechService } from '../services/speech';
import { useI18n } from '../services/i18n';

interface InsightArticle {
  id: string;
  category: string;
  categoryHindi: string;
  title: string;
  titleHindi: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  summaryHindi: string;
  points: string[];
  pointsHindi: string[];
  questionsForDoctor: string[];
  questionsForDoctorHindi: string[];
}

const INSIGHTS_DATA: InsightArticle[] = [
  {
    id: 'art-hba1c',
    category: 'Blood Sugar & Diabetes',
    categoryHindi: 'ब्लड शुगर एवं मधुमेह',
    title: 'Demystifying HbA1c & Fasting Glucose',
    titleHindi: 'HbA1c और खाली पेट शुगर को समझें',
    icon: Activity,
    summary:
      'HbA1c reflects your average blood sugar levels over the last 90 days. Unlike a single fingerprick test, it shows overall consistency in diabetes management.',
    summaryHindi:
      'HbA1c पिछले 90 दिनों के आपके औसत रक्त शर्करा का माप है। यह केवल एक दिन का नहीं, बल्कि दीर्घकालिक नियंत्रण दिखाता है।',
    points: [
      'Normal baseline: Below 5.7%. Pre-diabetes: 5.7% to 6.4%. Diabetes indicator: 6.5% or above.',
      'For chronic diabetes patients, target goals are individualized (often below 7.0%, but decided with your doctor).',
      'Daily medication timing directly stabilizes fasting morning glucose surges.',
    ],
    pointsHindi: [
      'सामान्य स्तर: 5.7% से कम। प्रीडायबिटीज: 5.7% से 6.4%। 6.5% या अधिक मधुमेह दर्शाता है।',
      'दीर्घकालिक रोगियों के लिए लक्ष्य व्यक्तिगत होता है (अक्सर 7.0% के आसपास डॉक्टर तय करते हैं)।',
      'दवा का नियमित समय सुबह की शुगर को नियंत्रित रखने में मदद करता है।',
    ],
    questionsForDoctor: [
      'What specific HbA1c target is safest for my current age and condition?',
      'Should I be testing fasting and post-meal glucose at home?',
    ],
    questionsForDoctorHindi: [
      'मेरी उम्र और स्वास्थ्य के अनुसार मेरा सुरक्षित HbA1c लक्ष्य क्या होना चाहिए?',
      'क्या मुझे घर पर खाली पेट और भोजन के बाद शुगर की जांच करनी चाहिए?',
    ],
  },
  {
    id: 'art-bp',
    category: 'Vascular & Heart Care',
    categoryHindi: 'रक्तचाप एवं हृदय देखभाल',
    title: 'Mastering Blood Pressure Numbers',
    titleHindi: 'रक्तचाप (Blood Pressure) के आंकड़े समझें',
    icon: Heart,
    summary:
      'Blood pressure is recorded as Systolic (when heart pumps) over Diastolic (when heart rests). Consistently high pressure stresses arteries and kidneys.',
    summaryHindi:
      'रक्तचाप दो संख्याओं में मापा जाता है: सिस्टोलिक (धड़कन के समय) और डायस्टोलिक (विश्राम के समय)। लगातार उच्च दबाव नसों और गुर्दों को नुकसान पहुंचाता है।',
    points: [
      'Standard target: Under 120 / 80 mmHg. Stage 1 hypertension begins at 130/80 mmHg.',
      'Check at the same time daily, sitting comfortably with feet flat for 5 minutes prior.',
      'Taking BP medications like Telmisartan every morning provides essential 24-hour vascular shielding.',
    ],
    pointsHindi: [
      'सामान्य लक्ष्य: 120/80 mmHg से नीचे। 130/80 से ऊपर बढ़ा हुआ रक्तचाप माना जाता है।',
      'रोजाना एक ही समय पर 5 मिनट शांत बैठकर नापें।',
      'डॉक्टर द्वारा दी गई बीपी की दवा (जैसे टेल्मीसार्टन) कभी अचानक बंद न करें।',
    ],
    questionsForDoctor: [
      'What is my personal target BP reading for morning and evening?',
      'What should I do if my reading is unexpectedly above 140/90?',
    ],
    questionsForDoctorHindi: [
      'मेरे लिए सुबह और शाम का व्यक्तिगत सुरक्षित ब्लड प्रेशर क्या होना चाहिए?',
      'यदि मेरा ब्लड प्रेशर अचानक 140/90 से अधिक आ जाए तो क्या करें?',
    ],
  },
  {
    id: 'art-lipid',
    category: 'Cardiovascular Health',
    categoryHindi: 'हृदय स्वास्थ्य एवं कोलेस्ट्रॉल',
    title: 'Understanding Cholesterol: LDL vs HDL',
    titleHindi: 'कोलेस्ट्रॉल को समझें: अच्छा (HDL) बनाम खराब (LDL)',
    icon: Activity,
    summary:
      'Cholesterol travels in blood on carriers: LDL deposits fatty plaque inside vessel walls, while HDL cleans excess cholesterol back to the liver.',
    summaryHindi:
      'LDL खराब कोलेस्ट्रॉल है जो नसों में जमता है, जबकि HDL अच्छा कोलेस्ट्रॉल है जो नसों को साफ़ रखकर हृदय की रक्षा करता है।',
    points: [
      'For chronic patients, doctors typically aim for LDL below 100 mg/dL (or below 70 mg/dL for elevated cardiovascular risk).',
      'Statins (like Atorvastatin) are commonly taken at bedtime because the liver produces most cholesterol overnight.',
      'Routine 30-minute brisk walking boosts healthy protective HDL.',
    ],
    pointsHindi: [
      'दीर्घकालिक रोगियों में खराब कोलेस्ट्रॉल (LDL) 100 से कम रखने की सलाह दी जाती है।',
      'स्टेटिन दवाइयां आमतौर पर रात को सोने से पहले ली जाती हैं क्योंकि रात में लिवर में कोलेस्ट्रॉल अधिक बनता है।',
      'रोजाना 30 मिनट टहलना अच्छे HDL को बढ़ाने में मदद करता है।',
    ],
    questionsForDoctor: [
      'What is my target LDL level based on my chronic health conditions?',
      'Are there specific foods I should limit to improve my triglyceride levels?',
    ],
    questionsForDoctorHindi: [
      'मेरी बीमारी के अनुसार मेरा लक्षित LDL कोलेस्ट्रॉल स्तर क्या होना चाहिए?',
      'ट्राइग्लिसराइड्स कम करने के लिए मुझे किन खाद्य पदार्थों से बचना चाहिए?',
    ],
  },
  {
    id: 'art-kidney',
    category: 'Renal & Kidney Shield',
    categoryHindi: 'गुर्दा (किडनी) सुरक्षा',
    title: 'Kidney Filtering: Creatinine & eGFR Explained',
    titleHindi: 'किडनी कार्यक्षमता: क्रिएटिनिन और eGFR को समझें',
    icon: Stethoscope,
    summary:
      'Kidneys filter metabolic waste from the bloodstream. Long-term diabetes and hypertension are the two most common reasons kidneys need periodic monitoring.',
    summaryHindi:
      'गुर्दे रक्त से अपशिष्ट पदार्थों को छानते हैं। डायबिटीज और हाई बीपी में किडनी की नियमित जांच अत्यंत आवश्यक है।',
    points: [
      'Serum Creatinine: Normal range is usually 0.7 to 1.3 mg/dL. Rising levels suggest slower filtration.',
      'eGFR (Estimated Glomerular Filtration Rate): Above 60 is standard, above 90 is optimal.',
      'Adequate daily hydration and strictly avoiding unprescribed painkiller NSAIDs protects delicate nephrons.',
    ],
    pointsHindi: [
      'सीरम क्रिएटिनिन: सामान्य सीमा 0.7 से 1.3 mg/dL है। बढ़ा हुआ स्तर धीमी कार्यक्षमता दिखाता है।',
      'eGFR: 60 से ऊपर सामान्य माना जाता है, 90 से ऊपर सर्वोत्तम है।',
      'भरपूर पानी पिएं और बिना डॉक्टर की सलाह के दर्द निवारक (NSAID) दवाइयां न लें।',
    ],
    questionsForDoctor: [
      'How often should my creatinine and urine albumin be retested?',
      'Are all of my current medications safe for my current kidney function level?',
    ],
    questionsForDoctorHindi: [
      'मुझे कितनी बार क्रिएटिनिन और यूरिन टेस्ट दोहराना चाहिए?',
      'क्या मेरी सभी मौजूदा दवाएं मेरी किडनी के लिए सुरक्षित हैं?',
    ],
  },
  {
    id: 'art-adherence',
    category: 'Prescription Self-Care',
    categoryHindi: 'स्व-देखभाल एवं दवा नियम',
    title: 'Adherence Best Practices for Chronic Regimens',
    titleHindi: 'दीर्घकालिक दवाइयों के नियमित सेवन के सुनहरे नियम',
    icon: Pill,
    summary:
      'Taking long-term medications consistently prevents hospitalizations, vascular complications, and organ strain.',
    summaryHindi:
      'लगातार और सही समय पर दवा लेने से अस्पताल जाने की नौबत नहीं आती और शरीर के अंग सुरक्षित रहते हैं।',
    points: [
      'Pair pills with existing daily anchors: breakfast, evening news, or brushing teeth.',
      'Never skip or double a dose without explicit pharmacist or doctor instructions.',
      'Refill prescription bottles at least 7 days before running completely out.',
    ],
    pointsHindi: [
      'दवा को अपनी दैनिक दिनचर्या से जोड़ें: जैसे नाश्ते के बाद या रात को सोने से पहले।',
      'यदि कोई खुराक छूट जाए तो कभी भी एक साथ दोहरी खुराक न लें।',
      'दवा खत्म होने से 7 दिन पहले ही रिफिल खरीद लें।',
    ],
    questionsForDoctor: [
      'What is the safe procedure if I miss a dose of my morning medication by several hours?',
      'Can any of my daily doses be combined to simplify my schedule?',
    ],
    questionsForDoctorHindi: [
      'यदि मेरी सुबह की दवा छूट जाए तो मुझे क्या करना चाहिए?',
      'क्या मेरे दवा के समय को आसान बनाने के लिए कोई बदलाव किया जा सकता है?',
    ],
  },
];

export const SelfCareInsights: React.FC = () => {
  const { language, t } = useI18n();
  const [expandedId, setExpandedId] = useState<string>('art-hba1c');
  const [activeArticleLanguage, setActiveArticleLanguage] = useState<Record<string, 'en' | 'hi'>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? '' : id);
  };

  const getLang = (id: string): 'en' | 'hi' => {
    if (activeArticleLanguage[id]) return activeArticleLanguage[id];
    return language === 'hi' ? 'hi' : 'en';
  };

  const toggleLanguageForArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getLang(id);
    setActiveArticleLanguage((prev) => ({
      ...prev,
      [id]: current === 'en' ? 'hi' : 'en',
    }));
  };

  const readAloud = (art: InsightArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    const lang = getLang(art.id);
    if (lang === 'hi') {
      const hiText = `${art.titleHindi}। ${art.summaryHindi}। मुख्य बिंदु: ${art.pointsHindi.join('। ')}`;
      speechService.speak(hiText, 'hi');
    } else {
      const enText = `${art.title}. ${art.summary}. Key Points: ${art.points.join('. ')}`;
      speechService.speak(enText, 'en');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            {t('insights_page_title')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {language === 'hi'
              ? 'दीर्घकालिक बीमारियों की सरल और वैज्ञानिक समझ'
              : 'Empowering Knowledge for Long-term Wellness'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('insights_page_sub')}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {INSIGHTS_DATA.map((art) => {
          const isExpanded = expandedId === art.id;
          const Icon = art.icon;
          const artLang = getLang(art.id);
          const isHindi = artLang === 'hi';

          const title = isHindi ? art.titleHindi : art.title;
          const summary = isHindi ? art.summaryHindi : art.summary;
          const points = isHindi ? art.pointsHindi : art.points;
          const questions = isHindi ? art.questionsForDoctorHindi : art.questionsForDoctor;
          const category = isHindi ? art.categoryHindi : art.category;

          return (
            <div
              key={art.id}
              className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm overflow-hidden transition-all"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(art.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-0.5">
                      {category}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => toggleLanguageForArticle(art.id, e)}
                    className="p-2 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={isHindi ? 'Switch to English' : 'हिन्दी में पढ़ें'}
                  >
                    <Languages className={`w-4 h-4 ${isHindi ? 'text-teal-600' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => readAloud(art, e)}
                    className="p-2 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={t('btn_read_aloud')}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {summary}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {isHindi ? 'महत्वपूर्ण स्व-देखभाल बिंदु:' : 'Key Clinical Insights & Targets:'}
                    </h4>
                    <ul className="space-y-2">
                      {points.map((pt, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Questions for Doctor */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {isHindi ? 'अगली मुलाकात में डॉक्टर से क्या पूछें:' : 'Questions to Ask Your Doctor:'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs text-slate-700 dark:text-slate-300"
                        >
                          💬 "{q}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
