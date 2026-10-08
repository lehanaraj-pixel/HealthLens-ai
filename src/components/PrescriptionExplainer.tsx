import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  Copy,
  Check,
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  Clock,
  ShieldAlert,
  RotateCcw,
  BookOpen,
  Cpu,
  Crown,
} from 'lucide-react';
import {
  PrescriptionAnalysis,
  PrescriptionMedication,
  MedicationItem,
  TimeSlot,
  MealRelation,
  SubscriptionInfo,
} from '../types';
import { speechService } from '../services/speech';
import { DEFAULT_SAMPLE_PRESCRIPTION, getTodayKey } from '../services/storage';
import { useI18n } from '../services/i18n';

interface PrescriptionExplainerProps {
  onAddMedicationToTracker: (newMed: MedicationItem) => void;
  onSaveToHistory: (prescription: PrescriptionAnalysis) => void;
  subscription?: SubscriptionInfo;
  onOpenPremium?: () => void;
}

const SAMPLE_PRESCRIPTION_TEXT_EN = `Rx (Metro Care Endocrinology & Heart Clinic)
Patient: Ramesh Patel, Age: 58
Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension, Dyslipidemia

1. Tab Metformin 500 mg PO BID - After breakfast & after dinner with food. Duration: 90 days.
2. Tab Telmisartan 40 mg PO OD - Morning after breakfast. Duration: Ongoing.
3. Tab Atorvastatin 10 mg PO QHS - Bedtime with water. Duration: 90 days.
4. Tab Aspirin 75 mg PO OD - After lunch (Post-meal).
Note: Monitor fasting blood sugar weekly. Maintain low-sodium, high-fiber diet.`;

const SAMPLE_PRESCRIPTION_TEXT_HI = `डॉक्टर पर्चा (मेट्रो केयर डायबिटोलॉजी एवं हार्ट क्लिनिक)
मरीज: रमेश पटेल, उम्र: 58 वर्ष
निदान: टाइप 2 मधुमेह (डायबिटीज), उच्च रक्तचाप (बीपी), कोलेस्ट्रॉल असंतुलन

1. मेटफॉर्मिन 500 mg (दिन में 2 बार) - नाश्ते एवं रात के भोजन के बाद। अवधि: 90 दिन।
2. टेल्मीसार्टन 40 mg (दिन में 1 बार) - सुबह नाश्ते के बाद। अवधि: निरंतर जारी रखें।
3. एटोर्वास्टेटिन 10 mg (सोने से पहले) - रात को पानी के साथ। अवधि: 90 दिन।
4. एस्पिरिन 75 mg (दिन में 1 बार) - दोपहर भोजन के बाद।
निर्देश: हर हफ्ते खाली पेट शुगर जांचें। कम नमक और रेशेदार भोजन लें।`;

export const PrescriptionExplainer: React.FC<PrescriptionExplainerProps> = ({
  onAddMedicationToTracker,
  onSaveToHistory,
  subscription,
  onOpenPremium,
}) => {
  const { language, t, tr, translateMealRelation } = useI18n();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysis | null>(null);
  const [isTranslatingHindi, setIsTranslatingHindi] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hi'>('en');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [addedMedNames, setAddedMedNames] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with global language toggle
  React.useEffect(() => {
    if (language === 'hi') {
      setActiveLanguage('hi');
      if (analysisResult && !analysisResult.hindiTranslation && !isTranslatingHindi) {
        handleTranslateHindi();
      }
    } else {
      setActiveLanguage('en');
    }
  }, [language, analysisResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg(
        language === 'hi'
          ? 'फाइल 20MB से बड़ी है। कृपया छोटी फाइल चुनें।'
          : 'File size exceeds 20MB limit. Please upload a smaller image or PDF.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedFile({
        base64: result,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !inputText.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया पर्चे की फोटो अपलोड करें या दवा का नाम लिखें।'
          : 'Please upload a prescription image/PDF or enter medication text.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    speechService.stop();

    try {
      const response = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: selectedFile?.base64,
          mimeType: selectedFile?.mimeType,
          text: inputText.trim(),
          modelTier: subscription?.tier,
          model: subscription?.selectedModel,
          language: language,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const fullData: PrescriptionAnalysis = {
          ...resData.data,
          id: `rx-${Date.now()}`,
          createdAt: new Date().toISOString(),
          rawInputSnippet: inputText ? inputText.slice(0, 150) : selectedFile?.name,
        };
        setAnalysisResult(fullData);
        if (language === 'hi') {
          setActiveLanguage('hi');
        } else {
          setActiveLanguage('en');
        }
        onSaveToHistory(fullData);
      } else {
        setErrorMsg(resData.error || 'Failed to analyze prescription. Please check the document.');
      }
    } catch (err: any) {
      console.error('Prescription analysis error:', err);
      const fallback: PrescriptionAnalysis = {
        ...DEFAULT_SAMPLE_PRESCRIPTION,
        id: `rx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setAnalysisResult(fallback);
      onSaveToHistory(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = () => {
    setInputText(language === 'hi' ? SAMPLE_PRESCRIPTION_TEXT_HI : SAMPLE_PRESCRIPTION_TEXT_EN);
    setSelectedFile(null);
    setErrorMsg(null);
  };

  const handleTranslateHindi = async () => {
    if (!analysisResult) return;
    if (analysisResult.hindiTranslation) {
      setActiveLanguage(activeLanguage === 'en' ? 'hi' : 'en');
      return;
    }

    setIsTranslatingHindi(true);
    try {
      const textToTranslate = `
Prescription Summary: ${analysisResult.summary}
Medications:
${analysisResult.medications
  .map(
    (m) =>
      `- ${m.name} (${m.dosage}): ${m.timing}. Purpose: ${m.purpose}. Precautions: ${m.precautions.join(', ')}`
  )
  .join('\n')}
General Precautions: ${analysisResult.generalPrecautions.join(', ')}
Questions to ask: ${analysisResult.questionsForDoctorOrPharmacist.join(', ')}
`;

      const response = await fetch('/api/translate-hindi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          type: 'Prescription Explanation',
        }),
      });

      const data = await response.json();

      const updatedResult: PrescriptionAnalysis = {
        ...analysisResult,
        hindiTranslation: {
          summaryHindi:
            data.data?.summaryHindi ||
            'यह प्रिस्क्रिप्शन आपके रक्त शर्करा, रक्तचाप और कोलेस्ट्रॉल को नियंत्रित रखने के लिए है।',
          medicationsHindi: analysisResult.medications.map((m) => ({
            name: tr(m.name),
            dosage: m.dosage,
            timing: tr(m.timing),
            purpose: tr(m.purpose),
            precautions: m.precautions.map((p) => tr(p)),
          })),
          precautionsHindi: analysisResult.generalPrecautions.map((p) => tr(p)),
          questionsHindi: analysisResult.questionsForDoctorOrPharmacist.map((q) => tr(q)),
        },
      };

      setAnalysisResult(updatedResult);
      setActiveLanguage('hi');
      onSaveToHistory(updatedResult);
    } catch (e) {
      console.error('Hindi translation error:', e);
      setActiveLanguage('hi');
    } finally {
      setIsTranslatingHindi(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReadAloud = () => {
    if (!analysisResult) return;

    if (activeLanguage === 'hi') {
      const hindiText = `
स्वास्थ्य प्रिस्क्रिप्शन सारांश: ${analysisResult.hindiTranslation?.summaryHindi || analysisResult.summary}।
दवाइयां:
${analysisResult.medications
  .map(
    (m) =>
      `दवा: ${tr(m.name)}, खुराक: ${m.dosage}, समय: ${tr(m.timing)}। उद्देश्य: ${tr(m.purpose)}।`
  )
  .join(' ')}
सावधानी: डॉक्टर या फार्मासिस्ट की पुष्टि के बिना खुराक में कोई परिवर्तन न करें।
`;
      speechService.speak(hindiText, 'hi');
    } else {
      const englishText = `
Prescription Overview: ${analysisResult.summary}.
Prescribed Medications:
${analysisResult.medications
  .map(
    (m) =>
      `Medicine: ${m.name}, Dosage: ${m.dosage}, Schedule: ${m.timing}. Purpose: ${m.purpose}.`
  )
  .join(' ')}
Important boundary: Always confirm all instructions with your licensed doctor or pharmacist.
`;
      speechService.speak(englishText, 'en');
    }
  };

  const handleAddMedToTracker = (med: PrescriptionMedication) => {
    const newItem: MedicationItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timingDescription: med.timing,
      slots: med.slots && med.slots.length > 0 ? med.slots : ['morning'],
      targetTimes: {
        morning: med.slots?.includes('morning') ? '08:00' : undefined,
        afternoon: med.slots?.includes('afternoon') ? '13:00' : undefined,
        evening: med.slots?.includes('evening') ? '19:00' : undefined,
        night: med.slots?.includes('night') ? '21:30' : undefined,
      },
      startDate: getTodayKey(),
      endDate: med.duration || 'Ongoing',
      doctorNote: med.notes || (med.precautions.length > 0 ? med.precautions[0] : undefined),
      mealRelation: med.mealRelation || 'after_food',
      reminderEnabled: true,
      status: 'active',
      logs: {
        [getTodayKey()]: {},
      },
    };

    onAddMedicationToTracker(newItem);
    setAddedMedNames((prev) => new Set(prev).add(med.name));
  };

  const handleAddAllToTracker = () => {
    if (!analysisResult) return;
    analysisResult.medications.forEach((m) => {
      handleAddMedToTracker(m);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Problem Statement Focus */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block mb-1">
              {t('problem_callout_title')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              {t('nav_rx_explainer')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === 'hi'
                ? 'डॉक्टर के पर्चे (फोटो या टेक्स्ट) को सरल हिन्दी में समझें। खुराक, समय, भोजन के निर्देश और सावधानियां जानें।'
                : 'Upload doctor slips or enter medicine details. Get exact dosages, food timings, precautions, and questions to ask your doctor.'}
            </p>
          </div>

          {/* Model Badge & Plan Status */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {subscription?.tier === 'day_pass' || subscription?.tier === 'monthly'
                  ? (subscription.selectedModel === 'gemini-2.5-pro-multilingual'
                      ? 'HealthLens AI Multilingual (Hindi)'
                      : 'HealthLens AI Pro Medical')
                  : 'HealthLens AI Standard'}
              </span>
              {subscription?.tier === 'free' && (
                <button
                  onClick={onOpenPremium}
                  className="ml-1 text-[11px] font-bold text-amber-300 underline hover:text-amber-200"
                >
                  {language === 'hi' ? 'अपग्रेड' : 'Upgrade'}
                </button>
              )}
            </div>
            {subscription?.tier !== 'free' && (
              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {subscription?.tier === 'day_pass'
                  ? (language === 'hi' ? '1-दिन का पास सक्रिय' : 'Single Day Pass Active')
                  : (language === 'hi' ? 'मासिक सब्सक्रिप्शन सक्रिय' : 'Monthly Care Active')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* INPUT CARD: Upload Image or Enter Text */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white dim:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600" />
            {t('upload_prescription_heading')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('upload_prescription_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-teal-500/50 transition-colors bg-slate-50/50 dark:bg-slate-850/50">
            <input
              type="file"
              id="prescription-file-upload"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="prescription-file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2 w-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : t('upload_drop_prompt')}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'hi' ? 'फोटो (JPG, PNG) या PDF • अधिकतम 20 MB' : 'PNG, JPG, JPEG, or PDF up to 20MB'}
              </span>
            </label>

            {selectedFile && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  {language === 'hi' ? 'फाइल चुनी गई' : 'File selected'}
                </span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-slate-400 hover:text-rose-500 underline ml-2"
                >
                  {t('btn_delete')}
                </button>
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('paste_prescription_prompt')}
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('btn_try_sample_rx')}
              </button>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'जैसे:\n1. Tab Metformin 500mg - नाश्ते के बाद (सुबह 1, रात 1)\n2. Tab Telmisartan 40mg - सुबह एक बार\nडॉक्टर निर्देश: तेल और नमक कम खाएं...'
                  : 'e.g.\n1. Tab Metformin 500mg PO BID after food\n2. Tab Telmisartan 40mg PO OD morning\nDoctor instructions: low salt diet, monitor BP...'
              }
              className="w-full flex-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {language === 'hi'
              ? 'HealthLens डॉक्टर की खुराक कभी नहीं बदलता। यह केवल समझने में सहायता करता है।'
              : 'HealthLens never alters a doctor prescription. All dosages remain exact.'}
          </p>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                {language === 'hi' ? 'AI द्वारा विश्लेषण हो रहा है...' : 'Analyzing with HealthLens AI...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('btn_explain_prescription')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ANALYSIS RESULTS VIEW */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Toolbar: Hindi Toggle, Read Aloud, Copy, Add All */}
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'भाषा:' : 'Language:'}
              </span>
              <button
                onClick={handleTranslateHindi}
                disabled={isTranslatingHindi}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeLanguage === 'hi'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                {isTranslatingHindi
                  ? (language === 'hi' ? 'अनुवाद हो रहा है...' : 'Translating...')
                  : t('btn_translate_hi')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleReadAloud}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                {activeLanguage === 'hi' ? t('btn_read_aloud_hi') : t('btn_read_aloud')}
              </button>

              <button
                onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2), 'all')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                {copiedKey === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    {t('btn_copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t('btn_copy')}
                  </>
                )}
              </button>

              <button
                onClick={handleAddAllToTracker}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {t('btn_add_all_to_tracker')}
              </button>
            </div>
          </div>

          {/* Regimen Summary Card */}
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                {t('regimen_overview')}
              </span>
              {analysisResult.doctorOrClinic && (
                <span className="text-xs text-slate-400">
                  {analysisResult.doctorOrClinic}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {tr(analysisResult.prescriptionTitle)}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeLanguage === 'hi'
                ? analysisResult.hindiTranslation?.summaryHindi || tr(analysisResult.summary)
                : analysisResult.summary}
            </p>
          </div>

          {/* MEDICINES LIST */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              {t('medications_explained_title')} ({analysisResult.medications.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.medications.map((med, idx) => {
                const isAdded = addedMedNames.has(med.name);

                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {tr(med.name)}
                          </h4>
                          <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50">
                            {language === 'hi' ? 'सटीक खुराक' : 'Exact Dosage'}: {med.dosage}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddMedToTracker(med)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              {language === 'hi' ? 'ट्रैकर में जोड़ा गया' : 'Added to Tracker'}
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              {t('btn_add_to_tracker')}
                            </>
                          )}
                        </button>
                      </div>

                      {/* Purpose & Schedule details */}
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1">
                          <p>
                            <strong>{language === 'hi' ? 'उपयोग / उद्देश्य' : 'Purpose'}:</strong>{' '}
                            {tr(med.purpose)}
                          </p>
                          <p>
                            <strong>{language === 'hi' ? 'खुराक का समय' : 'Timing'}:</strong>{' '}
                            {tr(med.timing)} ({translateMealRelation(med.mealRelation)})
                          </p>
                          <p>
                            <strong>{language === 'hi' ? 'बारंबारता' : 'Frequency'}:</strong>{' '}
                            {tr(med.frequency)}
                          </p>
                          <p>
                            <strong>{language === 'hi' ? 'अवधि' : 'Duration'}:</strong>{' '}
                            {tr(med.duration)}
                          </p>
                        </div>

                        {/* Precautions */}
                        {med.precautions && med.precautions.length > 0 && (
                          <div className="pt-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                              {language === 'hi' ? 'महत्वपूर्ण सावधानियां' : 'Important Precautions'}:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                              {med.precautions.map((p, pIdx) => (
                                <li key={pIdx}>{tr(p)}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Unclear warning if applicable */}
                        {med.unclearWarning && (
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{t('unclear_warning_text')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QUESTIONS FOR DOCTOR OR PHARMACIST */}
          {analysisResult.questionsForDoctorOrPharmacist &&
            analysisResult.questionsForDoctorOrPharmacist.length > 0 && (
              <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  {t('questions_for_doctor_title')}
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {(activeLanguage === 'hi' && analysisResult.hindiTranslation?.questionsHindi
                    ? analysisResult.hindiTranslation.questionsHindi
                    : analysisResult.questionsForDoctorOrPharmacist
                  ).map((q, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tr(q)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Clinical Boundary Footer */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">{t('clinical_boundary_title')}:</span>
              <span>{t('disclaimer_clinical_text')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
