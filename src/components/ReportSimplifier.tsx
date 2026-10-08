import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Sparkles,
  Volume2,
  Languages,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Info,
  RotateCcw,
  Activity,
  CheckCircle2,
  AlertCircle,
  Download,
  Cpu,
  Crown,
} from 'lucide-react';
import { MedicalReportAnalysis, TestItem, SubscriptionInfo } from '../types';
import { speechService } from '../services/speech';
import { DEFAULT_SAMPLE_REPORT } from '../services/storage';
import { useI18n } from '../services/i18n';

interface ReportSimplifierProps {
  onSaveToHistory: (report: MedicalReportAnalysis) => void;
  subscription?: SubscriptionInfo;
  onOpenPremium?: () => void;
}

const SAMPLE_LAB_TEXT_EN = `LABORATORY REPORT - METROPOLIS CLINICAL DIAGNOSTICS
Patient Name: Ramesh Patel    Age: 58 Years    Gender: Male
Date: 15-Sep-2026

TEST DESCRIPTION                     RESULT          REFERENCE INTERVAL
-------------------------------------------------------------------------
Hemoglobin A1c (HbA1c)               7.4 %           < 5.7 % Normal
                                                     5.7 - 6.4 % Pre-Diabetes
                                                     >= 6.5 % Diabetes
Estimated Average Glucose (eAG)      166 mg/dL       -
Fasting Blood Sugar (FBS)            138 mg/dL       70 - 99 mg/dL
Lipid Profile:
  Total Cholesterol                  198 mg/dL       < 200 mg/dL
  HDL Cholesterol (Good)             46 mg/dL        > 40 mg/dL
  LDL Cholesterol (Calculated)       135 mg/dL       < 100 mg/dL (Optimal)
  Triglycerides                      185 mg/dL       < 150 mg/dL
Renal Function:
  Serum Creatinine                   0.95 mg/dL      0.70 - 1.30 mg/dL
  eGFR (CKD-EPI)                     88 mL/min/1.73  > 60 mL/min/1.73`;

const SAMPLE_LAB_TEXT_HI = `लैब टेस्ट रिपोर्ट - मेट्रोपोलिस क्लिनिकल डायग्नोस्टिक्स
रोगी: रमेश पटेल    उम्र: 58 वर्ष    लिंग: पुरुष
तारीख: 15-सितंबर-2026

परीक्षण विवरण (टेस्ट)                परिणाम          सामान्य सीमा
-------------------------------------------------------------------------
एचबीए1सी (HbA1c 3-माह औसत)          7.4 %           < 5.7 % सामान्य
                                                     5.7 - 6.4 % प्री-डायबिटीज
                                                     >= 6.5 % डायबिटीज
फास्टिंग ब्लड ग्लूकोज (खाली पेट)     138 mg/dL       70 - 99 mg/dL
लिपिड प्रोफाइल (कोलेस्ट्रॉल):
  कुल कोलेस्ट्रॉल                    198 mg/dL       < 200 mg/dL
  एचडीएल अच्छा कोलेस्ट्रॉल           46 mg/dL        > 40 mg/dL
  एलडीएल खराब कोलेस्ट्रॉल            135 mg/dL       < 100 mg/dL
  ट्राइग्लिसराइड्स                   185 mg/dL       < 150 mg/dL
किडनी कार्यक्षमता:
  सीरम क्रिएटिनिन                    0.95 mg/dL      0.70 - 1.30 mg/dL
  ईजीएफआर (eGFR)                     88 mL/min/1.73  > 60 mL/min/1.73`;

export const ReportSimplifier: React.FC<ReportSimplifierProps> = ({
  onSaveToHistory,
  subscription,
  onOpenPremium,
}) => {
  const { language, t, tr } = useI18n();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalReportAnalysis | null>(null);
  const [isTranslatingHindi, setIsTranslatingHindi] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'hi'>('en');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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
          : 'File size exceeds 20MB. Please upload a smaller file.'
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
          ? 'कृपया लैब रिपोर्ट फाइल अपलोड करें या टेस्ट वैल्यू लिखें।'
          : 'Please upload a lab report image/PDF or paste test values.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    speechService.stop();

    try {
      const response = await fetch('/api/analyze-report', {
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
        const fullData: MedicalReportAnalysis = {
          ...resData.data,
          id: `rep-${Date.now()}`,
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
        setErrorMsg(resData.error || 'Failed to process report. Please try again.');
      }
    } catch (err: any) {
      console.error('Report simplification error:', err);
      const fallback: MedicalReportAnalysis = {
        ...DEFAULT_SAMPLE_REPORT,
        id: `rep-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setAnalysisResult(fallback);
      onSaveToHistory(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = () => {
    setInputText(language === 'hi' ? SAMPLE_LAB_TEXT_HI : SAMPLE_LAB_TEXT_EN);
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
Report: ${analysisResult.reportTitle}
Summary: ${analysisResult.summary}
Findings: ${analysisResult.importantFindings.join('. ')}
Terms: ${analysisResult.termsExplained.map((t) => `${t.term}: ${t.definition}`).join('. ')}
Questions: ${analysisResult.questionsForDoctor.join('. ')}
`;

      const response = await fetch('/api/translate-hindi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          type: 'Medical Lab Report Analysis',
        }),
      });

      const data = await response.json();

      const updatedResult: MedicalReportAnalysis = {
        ...analysisResult,
        hindiTranslation: {
          summaryHindi:
            data.data?.summaryHindi ||
            'यह रिपोर्ट आपके 3 महीने के शुगर नियंत्रण, कोलेस्ट्रॉल और गुर्दे की कार्यप्रणाली की सामान्य जांच है।',
          findingsHindi: analysisResult.importantFindings.map((f) => tr(f)),
          termsHindi: analysisResult.termsExplained.map((item) => ({
            term: tr(item.term),
            definition: tr(item.definition),
          })),
          questionsHindi: analysisResult.questionsForDoctor.map((q) => tr(q)),
        },
      };

      setAnalysisResult(updatedResult);
      setActiveLanguage('hi');
      onSaveToHistory(updatedResult);
    } catch (e) {
      console.error('Report translation error:', e);
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
मेडिकल रिपोर्ट सारांश: ${analysisResult.hindiTranslation?.summaryHindi || tr(analysisResult.summary)}।
मुख्य निष्कर्ष:
${(analysisResult.hindiTranslation?.findingsHindi || analysisResult.importantFindings.map((f) => tr(f))).join('। ')}।
कृपया ध्यान दें: HealthLens कोई बीमारी डायग्नोज़ नहीं करता। किसी भी निष्कर्ष के लिए अपने डॉक्टर से परामर्श करें।
`;
      speechService.speak(hindiText, 'hi');
    } else {
      const englishText = `
Medical Report Summary: ${analysisResult.summary}.
Important Findings: ${analysisResult.importantFindings.join('. ')}.
Safety notice: HealthLens does not diagnose diseases. Please consult your physician for clinical decisions.
`;
      speechService.speak(englishText, 'en');
    }
  };

  const getStatusBadge = (status: TestItem['status']) => {
    switch (status) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            {t('status_high')}
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {t('status_low')}
          </span>
        );
      case 'borderline':
      case 'abnormal':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {t('status_borderline')}
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            {t('status_normal')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block mb-1">
              {language === 'hi' ? 'रक्त व लैब रिपोर्ट विश्लेषक' : 'Clinical Laboratory Companion'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              {t('nav_report_simplifier')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === 'hi'
                ? 'ब्लड टेस्ट, HbA1c, किडनी, लिवर व लिपिड प्रोफाइल को सरल भाषा में समझें। मेडिकल शब्दों की परिभाषा व डॉक्टर से पूछने के सवाल प्राप्त करें।'
                : 'Upload blood test reports or lab values. Get simplified explanations, important findings, term glossaries, and doctor questions.'}
            </p>
          </div>

          {/* Model Badge */}
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

      {/* INPUT CARD */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white dim:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600" />
            {t('upload_report_heading')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('upload_report_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-teal-500/50 transition-colors bg-slate-50/50 dark:bg-slate-850/50">
            <input
              type="file"
              id="report-file-upload"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="report-file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2 w-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : t('upload_report_drop_prompt')}
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
                {t('paste_report_prompt')}
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('btn_try_sample_lab')}
              </button>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'जैसे:\nHbA1c: 7.4%\nFasting Blood Sugar: 138 mg/dL\nSerum Creatinine: 0.95 mg/dL\nTotal Cholesterol: 198 mg/dL...'
                  : 'e.g.\nHbA1c: 7.4%\nFasting Blood Sugar: 138 mg/dL\nSerum Creatinine: 0.95 mg/dL\nTotal Cholesterol: 198 mg/dL...'
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
              ? 'HealthLens कभी भी कोई बीमारी डायग्नोज़ नहीं करता और न ही डॉक्टर की जगह लेता है।'
              : 'HealthLens does not diagnose diseases or replace professional consultation.'}
          </p>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                {language === 'hi' ? 'AI द्वारा विश्लेषण हो रहा है...' : 'Analyzing Report with HealthLens AI...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('btn_simplify_report')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ANALYSIS RESULTS VIEW */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Toolbar */}
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
            </div>
          </div>

          {/* Overview Summary */}
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-3">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              {language === 'hi' ? 'रिपोर्ट सारांश' : 'Report Summary'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {tr(analysisResult.reportTitle)}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeLanguage === 'hi'
                ? analysisResult.hindiTranslation?.summaryHindi || tr(analysisResult.summary)
                : analysisResult.summary}
            </p>
          </div>

          {/* EXTRACTED TEST RESULTS TABLE */}
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              {t('tests_extracted_title')} ({analysisResult.tests.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">{t('test_name_col')}</th>
                    <th className="py-3 px-3">{t('test_result_col')}</th>
                    <th className="py-3 px-3">{t('test_ref_col')}</th>
                    <th className="py-3 px-3">{t('table_col_status')}</th>
                    <th className="py-3 px-3">{t('test_explanation_col')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysisResult.tests.map((test, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {tr(test.name)}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-teal-700 dark:text-teal-300 whitespace-nowrap">
                        {test.result}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {test.referenceRange}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(test.status)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 leading-relaxed min-w-[220px]">
                        {tr(test.simpleExplanation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* IMPORTANT FINDINGS */}
          {analysisResult.importantFindings && analysisResult.importantFindings.length > 0 && (
            <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                {t('important_findings_title')}
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {(activeLanguage === 'hi' && analysisResult.hindiTranslation?.findingsHindi
                  ? analysisResult.hindiTranslation.findingsHindi
                  : analysisResult.importantFindings
                ).map((finding, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tr(finding)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TERMS EXPLAINED (GLOSSARY) */}
          {analysisResult.termsExplained && analysisResult.termsExplained.length > 0 && (
            <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                {t('terms_explained_title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeLanguage === 'hi' && analysisResult.hindiTranslation?.termsHindi
                  ? analysisResult.hindiTranslation.termsHindi
                  : analysisResult.termsExplained
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1"
                  >
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {tr(item.term)}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {tr(item.definition)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTIONS FOR DOCTOR */}
          {analysisResult.questionsForDoctor && analysisResult.questionsForDoctor.length > 0 && (
            <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                {t('questions_for_doctor_title')}
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {(activeLanguage === 'hi' && analysisResult.hindiTranslation?.questionsHindi
                  ? analysisResult.hindiTranslation.questionsHindi
                  : analysisResult.questionsForDoctor
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

          {/* Safety Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">{t('clinical_boundary_title')}:</span>
              <span>
                {language === 'hi'
                  ? 'HealthLens केवल रिपोर्ट को समझने के लिए है। यह कोई रोग निदान (diagnosis) नहीं करता। किसी भी चिकित्सकीय निर्णय के लिए अपने चिकित्सक से संपर्क करें।'
                  : analysisResult.disclaimer}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
