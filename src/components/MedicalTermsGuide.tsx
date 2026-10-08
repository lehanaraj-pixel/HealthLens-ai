import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Pill,
  Activity,
  FileQuestion,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useI18n } from '../services/i18n';

export const MedicalTermsGuide: React.FC = () => {
  const { language } = useI18n();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'rx' | 'chronic' | 'tests'>('all');

  const RX_TERMS = [
    {
      abbr: 'OD',
      full: 'Omne in Die (Latin)',
      meaningEn: 'Once a day',
      meaningHi: 'दिन में एक बार',
      example: 'Take 1 tablet every 24 hours at the same time.',
      category: 'rx',
    },
    {
      abbr: 'BD / BID',
      full: 'Bis in Die (Latin)',
      meaningEn: 'Twice a day',
      meaningHi: 'दिन में दो बार',
      example: 'Usually morning and night, spaced ~12 hours apart.',
      category: 'rx',
    },
    {
      abbr: 'TDS / TID',
      full: 'Ter in Die (Latin)',
      meaningEn: 'Three times a day',
      meaningHi: 'दिन में तीन बार',
      example: 'Morning, afternoon, and evening (~8 hours apart).',
      category: 'rx',
    },
    {
      abbr: 'HS',
      full: 'Hora Somni (Latin)',
      meaningEn: 'At bedtime',
      meaningHi: 'रात को सोने से पहले',
      example: 'Take right before going to sleep at night (e.g., Atorvastatin).',
      category: 'rx',
    },
    {
      abbr: 'AC',
      full: 'Ante Cibum (Latin)',
      meaningEn: 'Before meals / on empty stomach',
      meaningHi: 'भोजन से पहले (खाली पेट)',
      example: 'Take 30-45 minutes before eating breakfast or meal.',
      category: 'rx',
    },
    {
      abbr: 'PC',
      full: 'Post Cibum (Latin)',
      meaningEn: 'After meals',
      meaningHi: 'भोजन के बाद',
      example: 'Take 10-15 minutes after eating to prevent stomach irritation.',
      category: 'rx',
    },
    {
      abbr: 'SOS / PRN',
      full: 'Si Opus Sit / Pro Re Nata',
      meaningEn: 'Take only as needed in emergency or acute pain',
      meaningHi: 'केवल आवश्यकता पड़ने पर या आपातकाल में',
      example: 'Take only if severe pain, fever, or emergency occurs.',
      category: 'rx',
    },
    {
      abbr: 'STAT',
      full: 'Statim (Latin)',
      meaningEn: 'Immediately and only once',
      meaningHi: 'तुरंत (केवल एक बार)',
      example: 'Administer dose right away without delay.',
      category: 'rx',
    },
  ];

  const CLINICAL_TERMS = [
    {
      term: 'Neuropathy (न्यूरोपैथी)',
      meaningEn: 'Nerve damage causing numbness, tingling, or burning sensation, common in chronic diabetes.',
      meaningHi: 'डायबिटीज के कारण नसों की क्षति। हाथ-पैरों में सुन्नपन, झनझनाहट या जलन होना।',
      category: 'chronic',
    },
    {
      term: 'Retinopathy (रेटिनोपैथी)',
      meaningEn: 'Damage to the retina blood vessels from high blood sugar, affecting visual acuity.',
      meaningHi: 'उच्च रक्त शर्करा से आंखों के पर्दे (रेटिना) को नुकसान। दृष्टि पर प्रभाव पड़ सकता है।',
      category: 'chronic',
    },
    {
      term: 'Nephropathy (नेफ्रोपैथी)',
      meaningEn: 'Progressive kidney disease resulting from chronic diabetes and uncontrolled hypertension.',
      meaningHi: 'मधुमेह और उच्च बीपी के कारण गुर्दे की कार्यक्षमता में गिरावट।',
      category: 'chronic',
    },
    {
      term: 'Hypoglycemia (हाइपोग्लाइसीमिया)',
      meaningEn: 'Dangerously low blood sugar (< 70 mg/dL). Symptoms: shakiness, sweating, confusion.',
      meaningHi: 'ब्लड शुगर का खतरनाक रूप से कम होना (< 70 mg/dL)। लक्षण: कंपन, पसीना, चक्कर आना।',
      category: 'chronic',
    },
    {
      term: 'Dyslipidemia (डिस्लिपिडेमिया)',
      meaningEn: 'Abnormal blood fat balance (high LDL bad cholesterol, high triglycerides, low HDL).',
      meaningHi: 'रक्त में कोलेस्ट्रॉल और वसा का असंतुलन (बढ़ा हुआ खराब कोलेस्ट्रॉल व ट्राइग्लिसराइड्स)।',
      category: 'chronic',
    },
    {
      term: 'Glycemic Index (ग्लाइसेमिक इंडेक्स)',
      meaningEn: 'A rating system for carbohydrate foods showing how quickly they raise blood sugar.',
      meaningHi: 'खाद्य पदार्थों की रैंकिंग जो बताती है कि वे ब्लड शुगर को कितनी तेजी से बढ़ाते हैं।',
      category: 'chronic',
    },
  ];

  const filteredRx = RX_TERMS.filter(
    (item) =>
      (activeCategory === 'all' || activeCategory === 'rx') &&
      (item.abbr.toLowerCase().includes(search.toLowerCase()) ||
        item.meaningEn.toLowerCase().includes(search.toLowerCase()) ||
        item.meaningHi.includes(search))
  );

  const filteredClinical = CLINICAL_TERMS.filter(
    (item) =>
      (activeCategory === 'all' || activeCategory === 'chronic') &&
      (item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.meaningEn.toLowerCase().includes(search.toLowerCase()) ||
        item.meaningHi.includes(search))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पेज 10: मेडिकल शब्दावली' : 'Page 10: Medical Terms'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {language === 'hi' ? 'चिकित्सीय शब्दकोश एवं संक्षिप्त रूप' : 'Medical Terms & Prescription Abbreviations'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'hi'
              ? 'डॉक्टर के पर्चों पर लिखे लैटिन संक्षिप्त रूपों (OD, BD, TDS, HS, SOS) और क्रोनिक बीमारियों की शब्दावली का सरल भाषा में अर्थ समझें।'
              : 'Demystify Latin prescription shorthand (OD, BD, TDS, HS, SOS) and chronic illness medical terminology in plain English and Hindi.'}
          </p>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 dim:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'शब्दावली या संक्षिप्त रूप खोजें...' : 'Search term or abbreviation...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'hi' ? 'सभी शब्द' : 'All Terms'}
          </button>
          <button
            onClick={() => setActiveCategory('rx')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'rx'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'hi' ? 'पर्चा संकेत (Rx Codes)' : 'Rx Codes (OD/BD)'}
          </button>
          <button
            onClick={() => setActiveCategory('chronic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'chronic'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'hi' ? 'क्रोनिक बीमारियां' : 'Chronic Diseases'}
          </button>
        </div>
      </div>

      {/* Rx Shorthand Table */}
      {(activeCategory === 'all' || activeCategory === 'rx') && filteredRx.length > 0 && (
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>{language === 'hi' ? 'डॉक्टर पर्चे के सामान्य लैटिन संकेत' : 'Common Doctor Prescription Shorthand'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRx.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-800/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-teal-700 dark:text-teal-400 font-mono">
                    {item.abbr}
                  </span>
                  <span className="text-[10px] text-slate-400 italic">{item.full}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'hi' ? item.meaningHi : item.meaningEn}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  💡 {item.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Medical Terms Grid */}
      {(activeCategory === 'all' || activeCategory === 'chronic') && filteredClinical.length > 0 && (
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>{language === 'hi' ? 'क्रोनिक स्वास्थ्य शब्दावली' : 'Chronic Condition Clinical Glossary'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClinical.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-800/60 space-y-1.5"
              >
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {item.term}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'hi' ? item.meaningHi : item.meaningEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
