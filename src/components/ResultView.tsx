import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Printer,
  Volume2,
  Languages,
  ArrowRight,
  Sparkles,
  Download,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react';
import { MedicalHistoryRecord, MedicalReportAnalysis, PrescriptionAnalysis } from '../types';
import { useI18n } from '../services/i18n';
import { speechService } from '../services/speech';

interface ResultViewProps {
  history: MedicalHistoryRecord[];
  onNavigateTab: (tab: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ history, onNavigateTab }) => {
  const { language, t } = useI18n();

  // Find latest report or prescription, or fallback to sample
  const latestReportRecord = history.find((h) => h.type === 'report' && h.reportData);
  const latestRxRecord = history.find((h) => h.type === 'prescription' && h.prescriptionData);

  const [activeTab, setActiveTab] = useState<'report' | 'prescription'>('report');

  const report: MedicalReportAnalysis = latestReportRecord?.reportData || {
    id: 'sample-report',
    reportTitle: language === 'hi' ? 'व्यापक मेटाबॉलिक एवं लिपिड पैनल' : 'Comprehensive Metabolic & Lipid Panel',
    patientName: 'Rajesh Sharma',
    reportDate: '2026-09-15',
    summary:
      language === 'hi'
        ? 'रक्त जांच में बढ़ा हुआ फास्टिंग ब्लड शुगर (152 mg/dL) और HbA1c (8.2%) टाइप 2 डायबिटीज के अनियंत्रित स्तर को दर्शाता है। लिपिड प्रोफाइल में ट्राइग्लिसराइड्स थोड़े बढ़े हुए हैं।'
        : 'Blood tests indicate elevated Fasting Blood Glucose (152 mg/dL) and HbA1c (8.2%), indicating suboptimal glycemic control in Type 2 Diabetes. Moderate hypertriglyceridemia observed.',
    tests: [
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        result: '8.2 %',
        referenceRange: '< 5.7 % (Normal), 5.7-6.4% (Prediabetes)',
        status: 'high',
        simpleExplanation:
          language === 'hi'
            ? 'पिछले 3 महीनों के औसत ब्लड शुगर का स्तर बढ़ा हुआ है। डॉक्टर से दवा की खुराक की समीक्षा करवाएं।'
            : 'Average blood sugar over the last 90 days is above target range. Requires clinical review with physician.',
      },
      {
        name: 'Fasting Blood Sugar (FBS)',
        result: '152 mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'high',
        simpleExplanation:
          language === 'hi'
            ? 'खाली पेट रक्त शर्करा सामान्य से अधिक है। सुबह खाली पेट नियमित जांच जारी रखें।'
            : 'Fasting glucose is elevated. Maintain consistent morning monitoring before breakfast.',
      },
      {
        name: 'Serum Creatinine',
        result: '1.05 mg/dL',
        referenceRange: '0.7 - 1.3 mg/dL',
        status: 'normal',
        simpleExplanation:
          language === 'hi'
            ? 'किडनी (गुर्दे) की कार्यप्रणाली पूरी तरह सामान्य है।'
            : 'Kidney filtration biomarker is safely within normal limits.',
      },
      {
        name: 'Total Cholesterol',
        result: '228 mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'borderline',
        simpleExplanation:
          language === 'hi'
            ? 'कुल कोलेस्ट्रॉल स्तर थोड़ा बढ़ा हुआ है। वसायुक्त भोजन कम करें और चिकित्सक से परामर्श लें।'
            : 'Mildly elevated total cholesterol. Dietary saturated fat reduction recommended.',
      },
      {
        name: 'Triglycerides',
        result: '185 mg/dL',
        referenceRange: '< 150 mg/dL',
        status: 'high',
        simpleExplanation:
          language === 'hi'
            ? 'रक्त में वसा की मात्रा थोड़ी बढ़ी हुई है। नियमित पैदल चलना लाभदायक है।'
            : 'Elevated blood fats. Regular physical activity and refined carbohydrate restriction advised.',
      },
    ],
    importantFindings: [
      language === 'hi'
        ? 'HbA1c 8.2% मधुमेह में आहार व दवा समायोजन की आवश्यकता दर्शाता है।'
        : 'HbA1c of 8.2% indicates need for glycemic medication optimization.',
      language === 'hi'
        ? 'किडनी सुरक्षित है (क्रिएटिनिन 1.05 mg/dL सामान्य)।'
        : 'Kidney function is well-preserved (Serum Creatinine 1.05 mg/dL normal).',
      language === 'hi'
        ? 'कोलेस्ट्रॉल और ट्राइग्लिसराइड्स में सुधार हेतु जीवनशैली में बदलाव जरूरी है।'
        : 'Mild dyslipidemia warrants cardiovascular lifestyle precautions.',
    ],
    termsExplained: [
      {
        term: 'HbA1c',
        definition:
          language === 'hi'
            ? 'ग्लाइकेटेड हीमोग्लोबिन: पिछले 3 महीनों का औसत ब्लड शुगर स्तर।'
            : 'Glycated hemoglobin test showing 3-month rolling average blood glucose.',
      },
      {
        term: 'Lipid Profile',
        definition:
          language === 'hi'
            ? 'कोलेस्ट्रॉल एवं ट्राइग्लिसराइड्स जैसे रक्त वसा की जांच।'
            : 'Comprehensive measurement of cholesterol and fat molecules in blood.',
      },
    ],
    questionsForDoctor: [
      language === 'hi'
        ? 'क्या HbA1c 8.2% को नियंत्रित करने के लिए मेटफॉर्मिन की खुराक बदलने की आवश्यकता है?'
        : 'Should my Metformin dosage or timing be adjusted to bring HbA1c below 7.0%?',
      language === 'hi'
        ? 'क्या ट्राइग्लिसराइड्स के लिए स्टेटिन दवा शुरू करने की आवश्यकता है?'
        : 'Do my triglyceride levels warrant lipid-lowering medication or dietary interventions?',
      language === 'hi'
        ? 'अगला ब्लड टेस्ट कितने हफ़्तों बाद करवाना चाहिए?'
        : 'When should I repeat the fasting blood glucose and HbA1c panel?',
    ],
    disclaimer:
      language === 'hi'
        ? 'HealthLens AI द्वारा तैयार विश्लेषण केवल सूचनात्मक समझ के लिए है। किसी भी दवा में बदलाव करने से पहले अपने डॉक्टर से सलाह लें।'
        : 'HealthLens AI analysis is for educational self-care purposes only. Consult your treating doctor before altering any treatments.',
    createdAt: new Date().toISOString(),
  };

  const prescription: PrescriptionAnalysis = latestRxRecord?.prescriptionData || {
    id: 'sample-prescription',
    prescriptionTitle: language === 'hi' ? 'क्रोनिक केयर प्रिस्क्रिप्शन सारांश' : 'Chronic Care Prescription Regimen',
    doctorOrClinic: 'Dr. Anand Verma, MD (Endocrinology)',
    prescriptionDate: '2026-09-12',
    summary:
      language === 'hi'
        ? 'टाइप 2 मधुमेह और उच्च रक्तचाप के लिए निर्धारित दैनिक दवाएं। खाली पेट व भोजन के बाद का समय निर्धारित किया गया है।'
        : 'Prescription regimen for managing Type 2 Diabetes & Primary Hypertension. Structured for morning and evening intake.',
    medications: [
      {
        name: 'Metformin 500mg SR',
        dosage: '1 Tablet',
        frequency: 'Twice daily (BID)',
        timing: 'Morning and Night after meals',
        slots: ['morning', 'night'],
        duration: 'Ongoing (Chronic)',
        purpose: language === 'hi' ? 'ब्लड शुगर नियंत्रण' : 'Blood sugar regulation',
        mealRelation: 'after_food',
        precautions: [
          language === 'hi' ? 'पेट की परेशानी से बचने के लिए भोजन के बाद लें' : 'Take strictly after meals to prevent GI upset',
        ],
      },
      {
        name: 'Telmisartan 40mg',
        dosage: '1 Tablet',
        frequency: 'Once daily (OD)',
        timing: 'Morning before/with breakfast',
        slots: ['morning'],
        duration: 'Ongoing (Chronic)',
        purpose: language === 'hi' ? 'रक्तचाप (BP) नियंत्रण' : 'Blood pressure management',
        mealRelation: 'before_food',
        precautions: [
          language === 'hi' ? 'रोजाना एक ही समय पर लें, अचानक खड़े होने से बचें' : 'Take at the same time daily, monitor morning BP',
        ],
      },
      {
        name: 'Atorvastatin 10mg',
        dosage: '1 Tablet',
        frequency: 'Once at bedtime (HS)',
        timing: 'Night before sleep',
        slots: ['night'],
        duration: 'Ongoing',
        purpose: language === 'hi' ? 'कोलेस्ट्रॉल और हृदय सुरक्षा' : 'Cholesterol control and arterial protection',
        mealRelation: 'after_food',
        precautions: [
          language === 'hi' ? 'रात को सोने से पहले लें' : 'Take at night before sleep for optimal liver absorption',
        ],
      },
    ],
    generalPrecautions: [
      language === 'hi' ? 'कोई भी खुराक न छोड़ें और डॉक्टर की अनुमति के बिना दवा बंद न करें।' : 'Do not skip doses or discontinue medications without consulting your doctor.',
      language === 'hi' ? 'दिन में कम से कम 2 से 2.5 लीटर पानी पिएं।' : 'Maintain adequate hydration throughout the day.',
    ],
    questionsForDoctorOrPharmacist: [
      language === 'hi' ? 'क्या इन दवाओं का कोई परस्पर प्रभाव (drug interaction) हो सकता है?' : 'Are there any potential interactions with over-the-counter painkillers?',
      language === 'hi' ? 'यदि कोई खुराक छूट जाए तो क्या करना चाहिए?' : 'What should I do if a morning dose of Telmisartan is missed?',
    ],
    disclaimer:
      language === 'hi'
        ? 'HealthLens AI द्वारा तैयार पर्चा सारांश केवल रोगी की समझ के लिए है। चिकित्सक के मूल पर्चे का पालन करें।'
        : 'HealthLens AI prescription summary is for patient self-care adherence only. Always follow your prescribing physician.',
    createdAt: new Date().toISOString(),
  };

  const handleReadSummary = () => {
    const textToRead =
      activeTab === 'report'
        ? `${report.reportTitle}. ${report.summary}`
        : `${prescription.prescriptionTitle}. ${prescription.summary}`;
    speechService.speak(textToRead, language === 'hi' ? 'hi' : 'en');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'पेज 7: क्लिनिकल परिणाम दर्शक' : 'Page 7: Clinical Result View'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {language === 'hi' ? 'मेडिकल परिणाम एवं विस्तृत रिपोर्ट' : 'Comprehensive Result View'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'HealthLens AI द्वारा विश्लेषित लैब टेस्ट और पर्चे के परिणाम देखें। सामान्य व असामान्य बायोमार्कर और डॉक्टर से पूछने योग्य प्रश्न।'
                : 'Structured breakdown of lab test biomarkers, reference ranges, prescription regimens, and doctor consultation questions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleReadSummary}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md border border-white/20"
              title="Read aloud clinical summary"
            >
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span>{language === 'hi' ? 'बोलकर सुनें' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-teal-600/20"
              title="Print clinical result sheet"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'hi' ? 'प्रिंट / PDF' : 'Print / Export'}</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Lab Report vs Prescription */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'report'
                ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{language === 'hi' ? 'लैब टेस्ट रिपोर्ट (Lab Report)' : 'Lab Report Results'}</span>
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'prescription'
                ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'hi' ? 'डॉक्टर पर्चा (Prescription)' : 'Prescription Regimen'}</span>
          </button>
        </div>
      </div>

      {/* Main Result Sheet */}
      {activeTab === 'report' ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {report.reportTitle}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {report.patientName && (
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      {report.patientName}
                    </span>
                  )}
                  {report.reportDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.reportDate}
                    </span>
                  )}
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 self-start sm:self-auto">
                HealthLens AI Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>{language === 'hi' ? 'क्लिनिकल सारांश: ' : 'Clinical Summary: '}</strong>
              {report.summary}
            </div>

            {/* Test Results Table */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                {language === 'hi' ? 'परीक्षण परिणाम एवं संदर्भ सीमाएं' : 'Biomarker Values & Reference Ranges'}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 sm:p-4">{language === 'hi' ? 'जांच का नाम' : 'Test Name'}</th>
                      <th className="p-3 sm:p-4">{language === 'hi' ? 'परिणाम' : 'Result'}</th>
                      <th className="p-3 sm:p-4">{language === 'hi' ? 'सामान्य सीमा' : 'Reference Range'}</th>
                      <th className="p-3 sm:p-4">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                      <th className="p-3 sm:p-4">{language === 'hi' ? 'सरल व्याख्या' : 'Explanation'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.tests.map((test, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 sm:p-4 font-bold text-slate-900 dark:text-white">{test.name}</td>
                        <td className="p-3 sm:p-4 font-black font-mono text-slate-900 dark:text-slate-100">{test.result}</td>
                        <td className="p-3 sm:p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{test.referenceRange}</td>
                        <td className="p-3 sm:p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              test.status === 'normal'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : test.status === 'high'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : test.status === 'low'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {test.status}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-slate-600 dark:text-slate-300 max-w-xs">{test.simpleExplanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Questions to Ask Doctor */}
            {report.questionsForDoctor && report.questionsForDoctor.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-2.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  {language === 'hi' ? 'अगली विजिट में डॉक्टर से पूछें' : 'Questions to Ask Your Doctor'}
                </h4>
                <div className="space-y-2">
                  {report.questionsForDoctor.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="font-bold text-teal-600 shrink-0">Q{idx + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Prescription View */
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {prescription.prescriptionTitle}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                {prescription.doctorOrClinic && (
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    👨‍⚕️ {prescription.doctorOrClinic}
                  </span>
                )}
                {prescription.prescriptionDate && (
                  <span>📅 {prescription.prescriptionDate}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('tracker')}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <span>{language === 'hi' ? 'दवा ट्रैकर में देखें' : 'Open in Tracker'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>{language === 'hi' ? 'पर्चा सारांश: ' : 'Prescription Summary: '}</strong>
            {prescription.summary}
          </div>

          {/* Medicines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prescription.medications.map((med, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {med.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                    {med.frequency}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>{language === 'hi' ? 'खुराक: ' : 'Dosage: '}</strong>{med.dosage}</div>
                  <div><strong>{language === 'hi' ? 'समय: ' : 'Timing: '}</strong>{med.timing}</div>
                  <div><strong>{language === 'hi' ? 'उद्देश्य: ' : 'Purpose: '}</strong>{med.purpose}</div>
                </div>

                {med.precautions && med.precautions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-amber-800 dark:text-amber-300">
                    ⚠️ {med.precautions[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          {language === 'hi'
            ? 'अन्य टूल्स: नया पर्चा या रिपोर्ट स्कैन करना चाहते हैं?'
            : 'Want to scan a new report or decode a fresh prescription slip?'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('report-simplifier')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-600 hover:border-teal-500"
          >
            {language === 'hi' ? 'रिपोर्ट अपलोड' : 'Upload Report'}
          </button>
          <button
            onClick={() => onNavigateTab('prescription-explainer')}
            className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-500"
          >
            {language === 'hi' ? 'पर्चा सरलीकरण' : 'Simplify Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
};
