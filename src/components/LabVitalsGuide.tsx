import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useI18n } from '../services/i18n';

interface LabTestGuideItem {
  id: string;
  name: string;
  category: string;
  normalRange: string;
  targetChronic: string;
  unit: string;
  whatItMeansEn: string;
  whatItMeansHi: string;
  warningEn: string;
  warningHi: string;
}

export const LabVitalsGuide: React.FC = () => {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkedTest, setCheckedTest] = useState<string>('hba1c');
  const [userValue, setUserValue] = useState<string>('7.2');

  const LAB_TESTS: LabTestGuideItem[] = [
    {
      id: 'hba1c',
      name: 'HbA1c (Glycated Hemoglobin)',
      category: 'Diabetes',
      normalRange: '< 5.7 %',
      targetChronic: '< 7.0 % for Diabetic Adults',
      unit: '%',
      whatItMeansEn:
        'Reflects your average blood sugar level over the past 2 to 3 months by measuring glucose bound to hemoglobin.',
      whatItMeansHi:
        'पिछले 2 से 3 महीनों का औसत ब्लड शुगर स्तर दर्शाता है। मधुमेह रोगियों के लिए सबसे महत्वपूर्ण टेस्ट।',
      warningEn: 'Levels > 8.0% indicate increased risk of neuropathy, retinopathy, and kidney damage.',
      warningHi: '8.0% से अधिक स्तर नसों, आंखों और गुर्दे पर प्रभाव का खतरा बढ़ाता है।',
    },
    {
      id: 'fbs',
      name: 'Fasting Blood Sugar (FBS)',
      category: 'Diabetes',
      normalRange: '70 - 99 mg/dL',
      targetChronic: '80 - 130 mg/dL',
      unit: 'mg/dL',
      whatItMeansEn: 'Measures blood glucose after an overnight fast (minimum 8 to 10 hours without food).',
      whatItMeansHi: 'रातभर (8 से 10 घंटे) खाली पेट रहने के बाद सुबह का ब्लड शुगर स्तर।',
      warningEn: 'Values ≥ 126 mg/dL on two separate tests diagnostic for diabetes.',
      warningHi: 'दो बार 126 mg/dL या अधिक आना मधुमेह का संकेत है।',
    },
    {
      id: 'ppbs',
      name: 'Post-Prandial Glucose (PPBS)',
      category: 'Diabetes',
      normalRange: '< 140 mg/dL',
      targetChronic: '< 180 mg/dL',
      unit: 'mg/dL',
      whatItMeansEn: 'Measures blood sugar exactly 2 hours after the start of a meal.',
      whatItMeansHi: 'भोजन शुरू करने के ठीक 2 घंटे बाद रक्त में ग्लूकोज का स्तर।',
      warningEn: 'High post-meal spikes (> 200 mg/dL) damage vascular endothelium.',
      warningHi: '200 mg/dL से अधिक होने पर रक्त वाहिकाओं पर दबाव पड़ता है।',
    },
    {
      id: 'bp',
      name: 'Blood Pressure (BP)',
      category: 'Cardiovascular',
      normalRange: '120/80 mmHg',
      targetChronic: '< 130/80 mmHg',
      unit: 'mmHg',
      whatItMeansEn: 'Measures systolic (heart pumping) and diastolic (heart resting) arterial pressure.',
      whatItMeansHi: 'धमनियों में रक्त का दबाव। ऊपर का (सिस्टोलिक) और नीचे का (डायस्टोलिक)।',
      warningEn: 'BP > 140/90 mmHg qualifies as Stage 2 Hypertension requiring pharmacotherapy.',
      warningHi: '140/90 से अधिक रक्तचाप उच्च रक्तचाप की श्रेणी में आता है।',
    },
    {
      id: 'cholesterol',
      name: 'Total Cholesterol',
      category: 'Lipid Profile',
      normalRange: '< 200 mg/dL',
      targetChronic: '< 170 mg/dL',
      unit: 'mg/dL',
      whatItMeansEn: 'Total amount of circulating blood cholesterol including HDL, LDL, and VLDL.',
      whatItMeansHi: 'रक्त में सभी प्रकार के कोलेस्ट्रॉल की कुल मात्रा।',
      warningEn: 'High cholesterol deposits plaque into coronary arteries.',
      warningHi: 'अधिक कोलेस्ट्रॉल धमनियों में रुकावट पैदा कर सकता है।',
    },
    {
      id: 'triglycerides',
      name: 'Triglycerides',
      category: 'Lipid Profile',
      normalRange: '< 150 mg/dL',
      targetChronic: '< 150 mg/dL',
      unit: 'mg/dL',
      whatItMeansEn: 'Type of fat in blood derived from excess dietary calories, especially carbs and sugars.',
      whatItMeansHi: 'रक्त में अतिरिक्त वसा। अधिक कार्बोहाइड्रेट व मीठा खाने से बढ़ता है।',
      warningEn: 'Levels > 200 mg/dL increase risk of pancreatitis and cardiovascular events.',
      warningHi: '200 mg/dL से अधिक स्तर हृदय और अग्न्याशय पर दबाव डालता है।',
    },
    {
      id: 'creatinine',
      name: 'Serum Creatinine',
      category: 'Kidney Function',
      normalRange: '0.7 - 1.3 mg/dL',
      targetChronic: 'Within age-adjusted range',
      unit: 'mg/dL',
      whatItMeansEn: 'Waste byproduct of muscle breakdown filtered out exclusively by kidneys.',
      whatItMeansHi: 'मांसपेशियों का अपशिष्ट पदार्थ जिसे स्वस्थ गुर्दे छानकर बाहर निकालते हैं।',
      warningEn: 'Persistent elevation indicates impaired renal filtration requiring doctor review.',
      warningHi: 'बढ़ा हुआ क्रिएटिनिन गुर्दे की कार्यक्षमता में कमी का संकेत देता है।',
    },
    {
      id: 'tsh',
      name: 'Thyroid Stimulating Hormone (TSH)',
      category: 'Endocrine',
      normalRange: '0.4 - 4.5 µIU/mL',
      targetChronic: '0.5 - 2.5 µIU/mL',
      unit: 'µIU/mL',
      whatItMeansEn: 'Pituitary hormone regulating thyroid activity. High TSH means sluggish thyroid.',
      whatItMeansHi: 'थायरॉइड ग्रंथि को नियंत्रित करने वाला हार्मोन। बढ़ा हुआ TSH हाइपोथायरायडिज्म का संकेत है।',
      warningEn: 'TSH > 5.0 with low T4 indicates clinical hypothyroidism requiring Thyroxine.',
      warningHi: '5.0 से अधिक होने पर सुस्ती, वजन बढ़ना और थायरॉइड दवा की आवश्यकता होती है।',
    },
  ];

  const categories = ['all', 'Diabetes', 'Cardiovascular', 'Lipid Profile', 'Kidney Function', 'Endocrine'];

  const filteredTests = LAB_TESTS.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पेज 9: लैब व वाइटल्स गाइड' : 'Page 9: Lab & Vitals Guide'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {language === 'hi' ? 'लैब टेस्ट एवं स्वास्थ्य वाइटल्स मार्गदर्शिका' : 'Clinical Lab Tests & Vitals Guide'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'hi'
              ? 'HbA1c, ब्लड शुगर, रक्तचाप, लिपिड प्रोफाइल और क्रिएटिनिन की सामान्य सीमाओं को समझें और जानें कि आपकी रिपोर्ट क्या कहती है।'
              : 'Understand normal ranges, diabetic targets, and warning signs for routine chronic illness blood tests.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 dim:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'टेस्ट या बायोमार्कर खोजें...' : 'Search test or biomarker...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? (language === 'hi' ? 'सभी जांचें' : 'All Tests') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4 hover:border-teal-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                  {test.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {test.name}
                </h3>
              </div>
            </div>

            {/* Target values */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  {language === 'hi' ? 'सामान्य सीमा (Normal)' : 'Normal Range'}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {test.normalRange}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
                <span className="text-[11px] text-teal-800 dark:text-teal-300 block font-medium">
                  {language === 'hi' ? 'क्रोनिक लक्ष्य (Target)' : 'Chronic Target'}
                </span>
                <span className="font-extrabold text-teal-900 dark:text-teal-200 mt-0.5 block">
                  {test.targetChronic}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'hi' ? test.whatItMeansHi : test.whatItMeansEn}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{language === 'hi' ? test.warningHi : test.warningEn}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
