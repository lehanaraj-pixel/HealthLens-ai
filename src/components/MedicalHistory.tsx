import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  Trash2,
  Calendar,
  ExternalLink,
  Download,
  X,
  Volume2,
  Languages,
} from 'lucide-react';
import { MedicalHistoryRecord } from '../types';
import { speechService } from '../services/speech';
import { useI18n } from '../services/i18n';

interface MedicalHistoryProps {
  history: MedicalHistoryRecord[];
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const MedicalHistory: React.FC<MedicalHistoryProps> = ({
  history,
  onDeleteRecord,
  onClearHistory,
}) => {
  const { language, t, tr } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'report' | 'prescription'>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistoryRecord | null>(null);

  const filtered = history.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortSummary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportSummary = (record: MedicalHistoryRecord) => {
    let content = `HEALTHLENS RECORD: ${record.title}\nDate: ${record.date}\nType: ${record.type.toUpperCase()}\n\nSummary:\n${record.shortSummary}\n\n`;

    if (record.reportData) {
      content += `TESTS EVALUATED:\n`;
      record.reportData.tests.forEach((t) => {
        content += `- ${t.name}: ${t.result} (Ref: ${t.referenceRange}) - ${t.simpleExplanation}\n`;
      });
      content += `\nKEY FINDINGS:\n${record.reportData.importantFindings.join('\n')}\n`;
      content += `\nQUESTIONS FOR DOCTOR:\n${record.reportData.questionsForDoctor.join('\n')}\n`;
    } else if (record.prescriptionData) {
      content += `MEDICATIONS:\n`;
      record.prescriptionData.medications.forEach((m) => {
        content += `- ${m.name} (${m.dosage}): ${m.timing}. Purpose: ${m.purpose}\n`;
      });
      content += `\nQUESTIONS FOR DOCTOR:\n${record.prescriptionData.questionsForDoctorOrPharmacist.join('\n')}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthLens_${record.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <History className="w-3.5 h-3.5" />
            {t('history_page_title')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {language === 'hi'
              ? 'आपकी व्यक्तिगत स्वास्थ्य रिपोर्ट एवं पर्चा संग्रह'
              : 'Your Longitudinal Health Archive'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('history_page_sub')}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_history_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'report', 'prescription'] as const).map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setTypeFilter(filterVal)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border capitalize transition-all ${
                typeFilter === filterVal
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              {filterVal === 'all'
                ? t('filter_all_records')
                : filterVal === 'report'
                ? t('filter_reports_only')
                : t('filter_prescriptions_only')}
            </button>
          ))}

          {history.length > 0 && (
            <button
              onClick={() => {
                const confirmMsg =
                  language === 'hi'
                    ? 'क्या आप पूरा चिकित्सा इतिहास साफ़ करना चाहते हैं?'
                    : 'Clear all processed medical history records?';
                if (confirm(confirmMsg)) {
                  onClearHistory();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t('clear_all_history_btn')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base mb-1">
            {t('no_history_records')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {language === 'hi'
              ? 'जब आप कोई पर्चा या लैब रिपोर्ट विश्लेषण करेंगे, तो वह यहाँ सुरक्षित रूप से दिखाई देगा।'
              : 'When you analyze a prescription or blood report, it will be automatically saved here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between hover:border-teal-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.type === 'report'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.type === 'report' ? t('filter_reports_only') : t('filter_prescriptions_only')}
                  </span>

                  <button
                    onClick={() => onDeleteRecord(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title={t('btn_delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  {tr(item.title)}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                  {tr(item.shortSummary)}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => exportSummary(item)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('btn_download_summary')}
                </button>

                <button
                  onClick={() => setSelectedRecord(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100"
                >
                  {t('btn_view_details')}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-600 uppercase">
                  {selectedRecord.type === 'report' ? t('filter_reports_only') : t('filter_prescriptions_only')}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400">{selectedRecord.date}</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {tr(selectedRecord.title)}
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  {language === 'hi' ? 'सारांश' : 'Summary'}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {tr(selectedRecord.shortSummary)}
                </p>
              </div>

              {/* Lab tests list if present */}
              {selectedRecord.reportData && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('tests_extracted_title')}
                  </h3>
                  <div className="space-y-2">
                    {selectedRecord.reportData.tests.map((test, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {tr(test.name)}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {tr(test.simpleExplanation)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-teal-600 block">
                            {test.result}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Ref: {test.referenceRange}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescription meds if present */}
              {selectedRecord.prescriptionData && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('medications_explained_title')}
                  </h3>
                  <div className="space-y-2">
                    {selectedRecord.prescriptionData.medications.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {tr(m.name)}
                          </span>
                          <span className="font-bold text-teal-600">{m.dosage}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                          {tr(m.timing)} • {tr(m.purpose)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <button
                onClick={() => exportSummary(selectedRecord)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                {t('btn_download_summary')}
              </button>

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl"
              >
                {t('btn_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
