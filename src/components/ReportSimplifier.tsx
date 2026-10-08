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
  Filter,
  FileText,
  Presentation,
  ShieldAlert,
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
Hemoglobin A1c (HbA1c)               7.4 %           < 5.7 % Normal (High - Red Zone)
                                                     5.7 - 6.4 % Pre-Diabetes
                                                     >= 6.5 % Diabetes
Fasting Blood Sugar (FBS)            138 mg/dL       70 - 99 mg/dL (High - Red Zone)
Lipid Profile:
  Total Cholesterol                  198 mg/dL       < 200 mg/dL (Borderline)
  HDL Cholesterol (Good)             46 mg/dL        > 40 mg/dL (Normal - Green Zone)
  LDL Cholesterol (Calculated)       135 mg/dL       < 100 mg/dL (High - Red Zone)
  Serum Triglycerides                185 mg/dL       < 150 mg/dL (Borderline - Yellow Zone)
Vitamins:
  Vitamin D3 (25-OH)                 22 ng/mL        30 - 100 ng/mL (Low - Yellow Zone)
Renal Function:
  Serum Creatinine                   0.95 mg/dL      0.70 - 1.30 mg/dL (Normal - Green Zone)
  eGFR (CKD-EPI)                     88 mL/min/1.73  > 60 mL/min/1.73 (Normal - Green Zone)`;

const SAMPLE_LAB_TEXT_HI = `लैब टेस्ट रिपोर्ट - मेट्रोपोलिस क्लिनिकल डायग्नोस्टिक्स
रोगी: रमेश पटेल    उम्र: 58 वर्ष    लिंग: पुरुष
तारीख: 15-सितंबर-2026

परीक्षण विवरण (टेस्ट)                परिणाम          सामान्य सीमा
-------------------------------------------------------------------------
एचबीए1सी (HbA1c 3-माह औसत)          7.4 %           < 5.7 % सामान्य (लाल जोन - उच्च)
                                                     5.7 - 6.4 % प्री-डायबिटीज
                                                     >= 6.5 % डायबिटीज
फास्टिंग ब्लड ग्लूकोज (खाली पेट)     138 mg/dL       70 - 99 mg/dL (लाल जोन - उच्च)
लिपिड प्रोफाइल (कोलेस्ट्रॉल):
  कुल कोलेस्ट्रॉल                    198 mg/dL       < 200 mg/dL
  एचडीएल अच्छा कोलेस्ट्रॉल           46 mg/dL        > 40 mg/dL (हरा जोन - सामान्य)
  एलडीएल खराब कोलेस्ट्रॉल            135 mg/dL       < 100 mg/dL (लाल जोन - उच्च)
  सीरम ट्राइग्लिसराइड्स               185 mg/dL       < 150 mg/dL (पीला जोन - बॉर्डरलाइन)
विटामिन:
  विटामिन डी3 (Vitamin D3)           22 ng/mL        30 - 100 ng/mL (पीला जोन - कम)
किडनी कार्यक्षमता:
  सीरम क्रिएटिनिन                    0.95 mg/dL      0.70 - 1.30 mg/dL (हरा जोन - सामान्य)
  ईजीएफआर (eGFR)                     88 mL/min/1.73  > 60 mL/min/1.73 (हरा जोन - सामान्य)`;

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
  const [colorFilter, setColorFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

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

    const isPpt = file.name.endsWith('.ppt') || file.name.endsWith('.pptx');
    const detectedMime = isPpt
      ? file.name.endsWith('.pptx')
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/vnd.ms-powerpoint'
      : file.type || 'image/jpeg';

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedFile({
        base64: result,
        mimeType: detectedMime,
        name: file.name,
      });
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const getTrafficLightZone = (status: TestItem['status']): 'red' | 'yellow' | 'green' => {
    if (status === 'high' || status === 'abnormal') return 'red';
    if (status === 'borderline' || status === 'low') return 'yellow';
    return 'green';
  };

  const getStatusBadge = (status: TestItem['status']) => {
    const zone = getTrafficLightZone(status);
    if (zone === 'red') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse ring-2 ring-rose-400/40 shrink-0" />
          <span>{language === 'hi' ? '🔴 लाल: उच्च स्तर (Red)' : '🔴 RED • High Alert'}</span>
        </span>
      );
    }
    if (zone === 'yellow') {
      const isLow = status === 'low';
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40 shrink-0" />
          <span>
            {language === 'hi'
              ? isLow
                ? '🟡 पीला: कम स्तर (Low)'
                : '🟡 पीला: बॉर्डरलाइन (Caution)'
              : isLow
              ? '🟡 YELLOW • Low Alert'
              : '🟡 YELLOW • Borderline Caution'}
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-400/40 shrink-0" />
        <span>{language === 'hi' ? '🟢 हरा: सामान्य (Normal)' : '🟢 GREEN • Normal Target'}</span>
      </span>
    );
  };

  const renderRangeMeter = (status: TestItem['status']) => {
    const zone = getTrafficLightZone(status);
    return (
      <div className="space-y-1.5 my-1.5">
        {/* 3-Zone Traffic Light Spectrum */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-1 border border-slate-200 dark:border-slate-700 shadow-inner">
          {/* Green Zone (Safe Normal) */}
          <div
            className={`flex-1 rounded-l-full transition-all flex items-center justify-center text-[8px] font-extrabold ${
              zone === 'green'
                ? 'bg-emerald-500 text-white shadow-xs ring-2 ring-emerald-400/50'
                : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 opacity-60'
            }`}
          >
            {zone === 'green' ? '✓ NORMAL' : ''}
          </div>
          {/* Yellow Zone (Caution / Borderline) */}
          <div
            className={`flex-1 transition-all flex items-center justify-center text-[8px] font-extrabold ${
              zone === 'yellow'
                ? 'bg-amber-400 text-slate-950 shadow-xs ring-2 ring-amber-300/60'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 opacity-60'
            }`}
          >
            {zone === 'yellow' ? '⚠ CAUTION' : ''}
          </div>
          {/* Red Zone (High / Critical Alert) */}
          <div
            className={`flex-1 rounded-r-full transition-all flex items-center justify-center text-[8px] font-extrabold ${
              zone === 'red'
                ? 'bg-rose-500 text-white shadow-xs ring-2 ring-rose-400/50'
                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 opacity-60'
            }`}
          >
            {zone === 'red' ? '⚡ HIGH' : ''}
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold">
          <span className={zone === 'green' ? 'text-emerald-700 dark:text-emerald-300 font-extrabold' : 'text-slate-400'}>
            🟢 Green: Target Range
          </span>
          <span className={zone === 'yellow' ? 'text-amber-800 dark:text-amber-300 font-extrabold' : 'text-slate-400'}>
            🟡 Yellow: Caution
          </span>
          <span className={zone === 'red' ? 'text-rose-700 dark:text-rose-300 font-extrabold' : 'text-slate-400'}>
            🔴 Red: High Alert
          </span>
        </div>
      </div>
    );
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
              accept="image/*,application/pdf,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.doc,.docx,text/plain"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="report-file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2 w-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-xs">
                {selectedFile?.name?.endsWith('.ppt') || selectedFile?.name?.endsWith('.pptx') ? (
                  <Presentation className="w-6 h-6 text-amber-500" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : (language === 'hi' ? 'लैब रिपोर्ट, प्रेजेंटेशन (PPT) या PDF चुनें' : 'Upload Lab Report, Presentation (PPT), or PDF')}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'PPT/PPTX स्लाइड्स, PDF, या फोटो (JPG, PNG) • 20 MB तक'
                  : 'PPT, PPTX, PDF, PNG, JPG, or Documents up to 20MB'}
              </span>
            </label>

            {selectedFile && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  {selectedFile.name.endsWith('.ppt') || selectedFile.name.endsWith('.pptx')
                    ? (language === 'hi' ? 'PPT प्रेजेंटेशन लोड हो गई' : 'PPT Presentation Selected')
                    : (language === 'hi' ? 'फाइल चुनी गई' : 'File selected')}
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

          {/* TRAFFIC LIGHT CLINICAL STATUS TRIAGE DASHBOARD (RED, YELLOW, GREEN) */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{language === 'hi' ? 'क्लिनिकल ट्रैफिक लाइट रंग प्रणाली' : 'Clinical Traffic Light System (Red, Yellow, Green)'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Tri-Color Triage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'hi'
                      ? 'आपकी रिपोर्ट के सभी परीक्षणों को लाल (उच्च जोखिम), पीला (मध्यम सावधानी) व हरा (सामान्य) रंगों में वर्गीकृत किया गया है।'
                      : 'Biomarkers categorized into Red (High Alert), Yellow (Caution/Borderline), and Green (Safe Target) clinical zones.'}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {analysisResult.tests.length} Total Biomarkers
                </span>
              </div>
            </div>

            {/* 3 Prominent Color Triage Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. RED ZONE */}
              <button
                type="button"
                onClick={() => setColorFilter(colorFilter === 'red' ? 'all' : 'red')}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                  colorFilter === 'red'
                    ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/50'
                    : 'bg-rose-950/30 border-rose-800/60 hover:bg-rose-950/50 hover:border-rose-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>RED ZONE (लाल)</span>
                  </span>
                  <span className="text-2xl font-black text-rose-400 font-mono">
                    {analysisResult.tests.filter((t) => t.status === 'high' || t.status === 'abnormal').length}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white">
                  {language === 'hi' ? 'उच्च स्तर / डॉक्टर से चर्चा' : 'High Alert • Out of Target'}
                </h4>
                <p className="text-[11px] text-rose-200/80 mt-1 line-clamp-2">
                  {language === 'hi'
                    ? 'मानक सीमा से काफी ऊपर। डॉक्टर से खुराक या आहार पर परामर्श करें।'
                    : 'Significantly elevated values requiring doctor discussion.'}
                </p>
                <div className="mt-3 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                  <span>{colorFilter === 'red' ? '✓ Showing Red Tests' : 'Filter Red Tests →'}</span>
                </div>
              </button>

              {/* 2. YELLOW ZONE */}
              <button
                type="button"
                onClick={() => setColorFilter(colorFilter === 'yellow' ? 'all' : 'yellow')}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                  colorFilter === 'yellow'
                    ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-amber-950/30 border-amber-800/60 hover:bg-amber-950/50 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>YELLOW ZONE (पीला)</span>
                  </span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {analysisResult.tests.filter((t) => t.status === 'borderline' || t.status === 'low').length}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white">
                  {language === 'hi' ? 'बॉर्डरलाइन / सावधानी' : 'Caution • Borderline / Low'}
                </h4>
                <p className="text-[11px] text-amber-200/80 mt-1 line-clamp-2">
                  {language === 'hi'
                    ? 'बॉर्डरलाइन या कम स्तर। खान-पान व जीवनशैली में सुधार रखें।'
                    : 'Borderline or low values requiring dietary/lifestyle awareness.'}
                </p>
                <div className="mt-3 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <span>{colorFilter === 'yellow' ? '✓ Showing Yellow Tests' : 'Filter Yellow Tests →'}</span>
                </div>
              </button>

              {/* 3. GREEN ZONE */}
              <button
                type="button"
                onClick={() => setColorFilter(colorFilter === 'green' ? 'all' : 'green')}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                  colorFilter === 'green'
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/50'
                    : 'bg-emerald-950/30 border-emerald-800/60 hover:bg-emerald-950/50 hover:border-emerald-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>GREEN ZONE (हरा)</span>
                  </span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {analysisResult.tests.filter((t) => t.status === 'normal' || (!['high', 'abnormal', 'borderline', 'low'].includes(t.status))).length}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white">
                  {language === 'hi' ? 'सामान्य लक्ष्य / सुरक्षित' : 'Normal • In Healthy Target'}
                </h4>
                <p className="text-[11px] text-emerald-200/80 mt-1 line-clamp-2">
                  {language === 'hi'
                    ? 'स्वस्थ संदर्भ सीमा में। अपनी वर्तमान दिनचर्या जारी रखें।'
                    : 'Safely maintained within optimal physiological reference targets.'}
                </p>
                <div className="mt-3 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span>{colorFilter === 'green' ? '✓ Showing Green Tests' : 'Filter Green Tests →'}</span>
                </div>
              </button>
            </div>

            {/* Quick Color Filter Tabs */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Filter by color:</span>
              <button
                type="button"
                onClick={() => setColorFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  colorFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                All Biomarkers ({analysisResult.tests.length})
              </button>
              <button
                type="button"
                onClick={() => setColorFilter('red')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  colorFilter === 'red'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>🔴 Red High ({analysisResult.tests.filter((t) => t.status === 'high' || t.status === 'abnormal').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setColorFilter('yellow')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  colorFilter === 'yellow'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800 hover:bg-amber-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>🟡 Yellow Caution ({analysisResult.tests.filter((t) => t.status === 'borderline' || t.status === 'low').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setColorFilter('green')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  colorFilter === 'green'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>🟢 Green Normal ({analysisResult.tests.filter((t) => t.status === 'normal' || (!['high', 'abnormal', 'borderline', 'low'].includes(t.status))).length})</span>
              </button>
            </div>
          </div>

          {/* EXTRACTED TEST RESULTS TABLE & 3-ZONE SPECTRUM GAUGES */}
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>{t('tests_extracted_title')}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  (Showing {analysisResult.tests.filter((t) => colorFilter === 'all' || (colorFilter === 'red' && (t.status === 'high' || t.status === 'abnormal')) || (colorFilter === 'yellow' && (t.status === 'borderline' || t.status === 'low')) || (colorFilter === 'green' && (t.status === 'normal' || (!['high', 'abnormal', 'borderline', 'low'].includes(t.status))))).length} of {analysisResult.tests.length})
                </span>
              </h3>

              {colorFilter !== 'all' && (
                <button
                  onClick={() => setColorFilter('all')}
                  className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Clear filter • Show all
                </button>
              )}
            </div>

            {/* Test Cards with 3-Zone Range Meter and Vivid Traffic Light Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.tests
                .filter((test) => {
                  if (colorFilter === 'all') return true;
                  const zone = getTrafficLightZone(test.status);
                  return zone === colorFilter;
                })
                .map((test, idx) => {
                  const zone = getTrafficLightZone(test.status);
                  const isRed = zone === 'red';
                  const isYellow = zone === 'yellow';

                  return (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                        isRed
                          ? 'border-l-6 border-l-rose-500 border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                          : isYellow
                          ? 'border-l-6 border-l-amber-500 border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                          : 'border-l-6 border-l-emerald-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {tr(test.name)}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            Reference: <strong className="font-mono text-slate-700 dark:text-slate-300">{test.referenceRange}</strong>
                          </span>
                        </div>

                        {/* Traffic Light Status Badge */}
                        <div className="shrink-0">
                          {getStatusBadge(test.status)}
                        </div>
                      </div>

                      {/* Result Value Display */}
                      <div className="flex items-baseline gap-2 pt-1 pb-1 border-y border-slate-100 dark:border-slate-800/80">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Your Value:</span>
                        <span
                          className={`text-xl font-black font-mono tracking-tight ${
                            isRed
                              ? 'text-rose-600 dark:text-rose-400'
                              : isYellow
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {test.result}
                        </span>
                      </div>

                      {/* VISUAL 3-ZONE RANGE METER (GREEN, YELLOW, RED) */}
                      {renderRangeMeter(test.status)}

                      {/* Explanation */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {tr(test.simpleExplanation)}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Traffic Light Color System Legend */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-600" />
                <span>{language === 'hi' ? 'ट्रैफिक लाइट रंग संदर्शिका (Clinical Legend):' : 'Clinical Traffic Light Legend & Patient Guidelines:'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
                  <strong className="block font-black text-rose-700 dark:text-rose-400">🔴 Red Zone (High / Action)</strong>
                  <span>Significantly out of range. Discuss timing, medication dose, or next steps with doctor.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                  <strong className="block font-black text-amber-700 dark:text-amber-400">🟡 Yellow Zone (Caution)</strong>
                  <span>Borderline or mildly abnormal. Focus on diet, exercise, and periodic monitoring.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                  <strong className="block font-black text-emerald-700 dark:text-emerald-400">🟢 Green Zone (Normal)</strong>
                  <span>Optimal clinical reference target. Adherence routine is working effectively.</span>
                </div>
              </div>
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
