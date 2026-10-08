import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  FileText,
  Trash2,
  Edit2,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Check,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { MedicationItem, TimeSlot, MealRelation } from '../types';
import { getTodayKey } from '../services/storage';
import { useI18n } from '../services/i18n';

interface PrescriptionTrackerProps {
  medications: MedicationItem[];
  onUpdateMedications: (meds: MedicationItem[]) => void;
  onNavigateToExplainer: () => void;
}

const TIME_SLOT_CONFIG: Record<
  TimeSlot,
  { labelKey: string; icon: React.ComponentType<{ className?: string }>; timeRange: string }
> = {
  morning: { labelKey: 'slot_morning', icon: Sun, timeRange: '07:00 AM - 11:00 AM' },
  afternoon: { labelKey: 'slot_afternoon', icon: Coffee, timeRange: '12:00 PM - 03:00 PM' },
  evening: { labelKey: 'slot_evening', icon: Sunset, timeRange: '05:00 PM - 08:00 PM' },
  night: { labelKey: 'slot_night', icon: Moon, timeRange: '08:30 PM - 11:00 PM' },
};

export const PrescriptionTracker: React.FC<PrescriptionTrackerProps> = ({
  medications,
  onUpdateMedications,
  onNavigateToExplainer,
}) => {
  const {
    language,
    t,
    tr,
    translateMedicationItem,
    translateSlot,
    translateMealRelation,
    translateCondition,
  } = useI18n();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicationItem | null>(null);
  const todayKey = getTodayKey();

  // New med modal form state
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState('Once daily');
  const [formSlots, setFormSlots] = useState<TimeSlot[]>(['morning']);
  const [formMorningTime, setFormMorningTime] = useState('08:00');
  const [formAfternoonTime, setFormAfternoonTime] = useState('13:00');
  const [formEveningTime, setFormEveningTime] = useState('19:00');
  const [formNightTime, setFormNightTime] = useState('21:30');
  const [formStartDate, setFormStartDate] = useState(todayKey);
  const [formEndDate, setFormEndDate] = useState('Ongoing');
  const [formMeal, setFormMeal] = useState<MealRelation>('after_food');
  const [formNote, setFormNote] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formReminder, setFormReminder] = useState(true);

  const resetForm = () => {
    setFormName('');
    setFormDosage('');
    setFormFrequency('Once daily');
    setFormSlots(['morning']);
    setFormMorningTime('08:00');
    setFormAfternoonTime('13:00');
    setFormEveningTime('19:00');
    setFormNightTime('21:30');
    setFormStartDate(todayKey);
    setFormEndDate('Ongoing');
    setFormMeal('after_food');
    setFormNote('');
    setFormCondition('');
    setFormReminder(true);
    setEditingMed(null);
  };

  const openEditModal = (med: MedicationItem) => {
    setEditingMed(med);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormFrequency(med.frequency);
    setFormSlots(med.slots);
    setFormMorningTime(med.targetTimes.morning || '08:00');
    setFormAfternoonTime(med.targetTimes.afternoon || '13:00');
    setFormEveningTime(med.targetTimes.evening || '19:00');
    setFormNightTime(med.targetTimes.night || '21:30');
    setFormStartDate(med.startDate);
    setFormEndDate(med.endDate);
    setFormMeal(med.mealRelation);
    setFormNote(med.doctorNote || '');
    setFormCondition(med.conditionTag || '');
    setFormReminder(med.reminderEnabled);
    setIsAddModalOpen(true);
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDosage.trim() || formSlots.length === 0) return;

    if (editingMed) {
      const updated = medications.map((m) =>
        m.id === editingMed.id
          ? {
              ...m,
              name: formName.trim(),
              dosage: formDosage.trim(),
              frequency: formFrequency.trim(),
              slots: formSlots,
              targetTimes: {
                morning: formSlots.includes('morning') ? formMorningTime : undefined,
                afternoon: formSlots.includes('afternoon') ? formAfternoonTime : undefined,
                evening: formSlots.includes('evening') ? formEveningTime : undefined,
                night: formSlots.includes('night') ? formNightTime : undefined,
              },
              startDate: formStartDate,
              endDate: formEndDate,
              doctorNote: formNote.trim(),
              conditionTag: formCondition.trim() || undefined,
              mealRelation: formMeal,
              reminderEnabled: formReminder,
            }
          : m
      );
      onUpdateMedications(updated);
    } else {
      const newMed: MedicationItem = {
        id: `med-${Date.now()}`,
        name: formName.trim(),
        dosage: formDosage.trim(),
        frequency: formFrequency.trim(),
        timingDescription: formSlots.join(', '),
        slots: formSlots,
        targetTimes: {
          morning: formSlots.includes('morning') ? formMorningTime : undefined,
          afternoon: formSlots.includes('afternoon') ? formAfternoonTime : undefined,
          evening: formSlots.includes('evening') ? formEveningTime : undefined,
          night: formSlots.includes('night') ? formNightTime : undefined,
        },
        startDate: formStartDate,
        endDate: formEndDate,
        doctorNote: formNote.trim(),
        conditionTag: formCondition.trim() || undefined,
        mealRelation: formMeal,
        reminderEnabled: formReminder,
        status: 'active',
        logs: {
          [todayKey]: {},
        },
      };
      onUpdateMedications([...medications, newMed]);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDeleteMedication = (id: string) => {
    const confirmMsg =
      language === 'hi'
        ? 'क्या आप इस दवा को अपने ट्रैकर से हटाना चाहते हैं?'
        : 'Are you sure you want to remove this medication from your tracker?';
    if (confirm(confirmMsg)) {
      onUpdateMedications(medications.filter((m) => m.id !== id));
    }
  };

  const setSlotStatus = (medId: string, slot: TimeSlot, status: 'taken' | 'skipped' | 'pending') => {
    const updated = medications.map((med) => {
      if (med.id !== medId) return med;
      const todayLogs = { ...(med.logs[todayKey] || {}) };
      if (status === 'pending') {
        delete todayLogs[slot];
      } else {
        todayLogs[slot] = status;
      }
      return {
        ...med,
        logs: {
          ...med.logs,
          [todayKey]: todayLogs,
        },
      };
    });
    onUpdateMedications(updated);
  };

  // Calculate statistics for adherence
  let totalDosesScheduledToday = 0;
  let totalDosesTakenToday = 0;
  medications.forEach((med) => {
    med.slots.forEach((slot) => {
      totalDosesScheduledToday += 1;
      const slotStatus = med.logs[todayKey]?.[slot];
      if (slotStatus === 'taken') {
        totalDosesTakenToday += 1;
      }
    });
  });

  const adherencePercentage =
    totalDosesScheduledToday > 0
      ? Math.round((totalDosesTakenToday / totalDosesScheduledToday) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Official Problem Statement Alignment Callout */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('problem_callout_title')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {t('problem_callout_heading')}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {t('problem_callout_desc')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {t('btn_add_medicine')}
            </button>
            <button
              onClick={onNavigateToExplainer}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/10 backdrop-blur-sm"
            >
              <FileText className="w-4 h-4 text-teal-300" />
              {t('btn_scan_prescription')}
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* Adherence Progress Widget */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-200 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-1">{t('today_progress_title')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                {totalDosesTakenToday} of {totalDosesScheduledToday}
              </span>
              <span className="text-teal-400 font-semibold">({adherencePercentage}%)</span>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-1">{t('active_prescriptions_count')}</span>
            <span className="text-xl font-bold text-white">{medications.length}</span>
            <span className="text-slate-400 ml-1.5">
              {language === 'hi' ? 'दवा नियम' : 'regimens'}
            </span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-slate-400 block mb-1">{t('problem_callout_title')}</span>
            <span className="text-xs font-medium text-teal-300 flex items-center gap-1.5 mt-1">
              <Check className="w-3.5 h-3.5 text-teal-400" />
              {language === 'hi' ? 'दवा संगठन मोड सक्रिय' : 'Prescription Organization Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Strict Medical Disclaimer Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 dim:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 dim:border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 dim:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('disclaimer_clinical_text')}
        </p>
      </div>

      {/* TODAY'S SCHEDULE - TIME BUCKETS (Morning, Afternoon, Evening, Night) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white dim:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t('today_schedule')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['morning', 'afternoon', 'evening', 'night'] as TimeSlot[]).map((slotKey) => {
            const slotConfig = TIME_SLOT_CONFIG[slotKey];
            const Icon = slotConfig.icon;
            const slotMeds = medications.filter((m) => m.slots.includes(slotKey));

            return (
              <div
                key={slotKey}
                className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col"
              >
                {/* Bucket Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 dim:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 dim:bg-teal-950/60 text-teal-700 dark:text-teal-300 dim:text-teal-300 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white dim:text-white capitalize">
                        {translateSlot(slotKey)}
                      </h3>
                      <span className="text-[11px] text-slate-400">{slotConfig.timeRange}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 dim:bg-slate-700 text-slate-600 dark:text-slate-300 dim:text-slate-300">
                    {slotMeds.length} {language === 'hi' ? 'खुराक' : slotMeds.length === 1 ? 'dose' : 'doses'}
                  </span>
                </div>

                {/* Med list for this slot */}
                {slotMeds.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    {language === 'hi'
                      ? 'इस समय के लिए कोई दवा निर्धारित नहीं है।'
                      : 'No medications scheduled for this time slot.'}
                  </p>
                ) : (
                  <div className="space-y-3 flex-1">
                    {slotMeds.map((rawMed) => {
                      const med = translateMedicationItem(rawMed);
                      const status = rawMed.logs[todayKey]?.[slotKey] || 'pending';
                      const targetTime = rawMed.targetTimes[slotKey];

                      return (
                        <div
                          key={`${rawMed.id}-${slotKey}`}
                          className={`p-3.5 rounded-xl border transition-all ${
                            status === 'taken'
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 dim:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 dim:border-emerald-800/60'
                              : status === 'skipped'
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 dim:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 dim:border-rose-800/60'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 dim:bg-slate-700/40 border-slate-200 dark:border-slate-700 dim:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white dim:text-white">
                                  {med.name}
                                </h4>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 dim:bg-teal-900/60 text-teal-800 dark:text-teal-200 dim:text-teal-200">
                                  {med.dosage}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 dim:text-slate-400">
                                {targetTime && (
                                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 dim:text-slate-300">
                                    <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                    {targetTime}
                                  </span>
                                )}
                                <span>•</span>
                                <span>{translateMealRelation(rawMed.mealRelation)}</span>
                                {med.conditionTag && (
                                  <>
                                    <span>•</span>
                                    <span className="text-teal-700 dark:text-teal-300 dim:text-teal-300 font-medium">
                                      {med.conditionTag}
                                    </span>
                                  </>
                                )}
                              </div>

                              {med.doctorNote && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 dim:text-slate-400 mt-1 italic">
                                  "{med.doctorNote}"
                                </p>
                              )}
                            </div>

                            {/* Status Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {status === 'taken' ? (
                                <button
                                  onClick={() => setSlotStatus(rawMed.id, slotKey, 'pending')}
                                  title="Marked as taken. Click to undo."
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {t('btn_taken')}
                                </button>
                              ) : status === 'skipped' ? (
                                <button
                                  onClick={() => setSlotStatus(rawMed.id, slotKey, 'pending')}
                                  title="Marked as skipped. Click to undo."
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white shadow-sm hover:bg-rose-500 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  {t('btn_skipped')}
                                </button>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setSlotStatus(rawMed.id, slotKey, 'taken')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:scale-95"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    {t('btn_take')}
                                  </button>
                                  <button
                                    onClick={() => setSlotStatus(rawMed.id, slotKey, 'skipped')}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                    title={t('btn_skipped')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ALL PRESCRIBED MEDICATIONS INVENTORY LIST */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white dim:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {language === 'hi'
                ? `सभी निर्धारित दवाइयां (${medications.length})`
                : `All Prescribed Medications (${medications.length})`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'डॉक्टर द्वारा लिखी गई सभी दवाइयों की सूची, भोजन के निर्देश और दवा लेने का समय'
                : 'Detailed registry of doctor-prescribed chronic therapies with food instructions and durations'}
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('btn_add_medicine')}
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base mb-1">
              {language === 'hi' ? 'अभी कोई निर्धारित दवा नहीं है' : 'No Prescribed Medications Yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              {language === 'hi'
                ? 'अपनी नियमित दवाइयां खुद जोड़ें या HealthLens AI से अपना पर्चा स्कैन करें।'
                : 'Add your chronic care medications manually, or scan your prescription using HealthLens AI.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-xl"
              >
                {t('btn_add_medicine')}
              </button>
              <button
                onClick={onNavigateToExplainer}
                className="px-4 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 rounded-xl"
              >
                {t('btn_scan_prescription')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((rawMed) => {
              const med = translateMedicationItem(rawMed);

              return (
                <div
                  key={rawMed.id}
                  className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between hover:border-teal-500/50 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white dim:text-white leading-snug">
                          {med.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300 dim:text-teal-300">
                            {med.dosage}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 dim:text-slate-300">
                            {med.frequency}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(rawMed)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('btn_edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(rawMed.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('btn_delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Badges & timing */}
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {rawMed.slots.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 dim:bg-slate-700 text-slate-700 dark:text-slate-300 dim:text-slate-300"
                        >
                          {translateSlot(s)} {rawMed.targetTimes[s] ? `(${rawMed.targetTimes[s]})` : ''}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 dim:text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{translateMealRelation(rawMed.mealRelation)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>
                          {language === 'hi' ? 'अवधि' : 'Duration'}: {rawMed.startDate} → {tr(rawMed.endDate)}
                        </span>
                      </p>
                      {med.conditionTag && (
                        <p className="text-teal-700 dark:text-teal-300 dim:text-teal-300 font-medium">
                          {language === 'hi' ? 'बीमारी' : 'Target condition'}: {med.conditionTag}
                        </p>
                      )}
                      {med.doctorNote && (
                        <p className="bg-slate-50 dark:bg-slate-800/60 dim:bg-slate-700/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 dim:border-slate-700 text-[11px] italic mt-2">
                          {language === 'hi' ? 'डॉक्टर निर्देश' : 'Dr. note'}: "{med.doctorNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 dim:border-slate-700 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {language === 'hi' ? 'स्थिति' : 'Status'}: <strong className="text-emerald-600 uppercase">{tr(rawMed.status)}</strong>
                    </span>
                    <span className="text-slate-400">
                      {language === 'hi' ? 'अनुस्मारक' : 'Reminder'}: <strong>{rawMed.reminderEnabled ? (language === 'hi' ? 'चालू' : 'ON') : (language === 'hi' ? 'बंद' : 'OFF')}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MEDICATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 dim:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white dim:text-white">
                {editingMed
                  ? (language === 'hi' ? 'निर्धारित दवा संपादित करें' : 'Edit Prescribed Medicine')
                  : (language === 'hi' ? 'नई निर्धारित दवा जोड़ें' : 'Add Prescribed Medicine')}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('table_col_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'जैसे: मेटफॉर्मिन 500mg, टेल्मीसार्टन 40mg...' : 'e.g. Metformin 500mg, Telmisartan 40mg...'}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'सटीक खुराक (Dosage) *' : 'Dosage * (Exactly as written)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'hi' ? 'जैसे: 500 mg, 1 गोली, 10 यूनिट' : 'e.g. 500 mg, 1 tablet, 10 units'}
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'बारंबारता (Frequency)' : 'Frequency'}
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Once daily">{t('freq_od')}</option>
                    <option value="Twice daily">{t('freq_bid')}</option>
                    <option value="Three times daily">{t('freq_tid')}</option>
                    <option value="As needed (SOS)">{t('freq_prn')}</option>
                    <option value="Weekly">{t('freq_weekly')}</option>
                  </select>
                </div>
              </div>

              {/* Slots Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'hi' ? 'दैनिक समय स्लॉट चुनें *' : 'Daily Time Slots *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as TimeSlot[]).map((slot) => {
                    const isSelected = formSlots.includes(slot);
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => {
                          if (isSelected) {
                            if (formSlots.length > 1) {
                              setFormSlots(formSlots.filter((s) => s !== slot));
                            }
                          } else {
                            setFormSlots([...formSlots, slot]);
                          }
                        }}
                        className={`py-2 px-3 text-xs font-medium rounded-xl border capitalize transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {translateSlot(slot)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Times */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                {formSlots.includes('morning') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {translateSlot('morning')} {language === 'hi' ? 'समय' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={formMorningTime}
                      onChange={(e) => setFormMorningTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                )}
                {formSlots.includes('afternoon') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {translateSlot('afternoon')} {language === 'hi' ? 'समय' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={formAfternoonTime}
                      onChange={(e) => setFormAfternoonTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                )}
                {formSlots.includes('evening') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {translateSlot('evening')} {language === 'hi' ? 'समय' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={formEveningTime}
                      onChange={(e) => setFormEveningTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                )}
                {formSlots.includes('night') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {translateSlot('night')} {language === 'hi' ? 'समय' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={formNightTime}
                      onChange={(e) => setFormNightTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Meal relation & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'भोजन का समय (Meal Timing)' : 'Meal Timing'}
                  </label>
                  <select
                    value={formMeal}
                    onChange={(e) => setFormMeal(e.target.value as MealRelation)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="after_food">{t('meal_after_food')}</option>
                    <option value="before_food">{t('meal_before_food')}</option>
                    <option value="with_food">{t('meal_with_food')}</option>
                    <option value="empty_stomach">{t('meal_empty_stomach')}</option>
                    <option value="anytime">{t('meal_anytime')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'रोग / बीमारी का नाम' : 'Chronic Condition Tag'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'जैसे: डायबिटीज, बीपी...' : 'e.g. Diabetes, Hypertension...'}
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('start_date_label')}
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('end_date_label')}
                  </label>
                  <input
                    type="text"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: निरंतर (Ongoing), 90 दिन' : 'e.g. Ongoing, 90 days, 2026-12-31'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Doctor's Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('table_col_doctor_note')}
                </label>
                <textarea
                  rows={2}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'जैसे: गुनगुने पानी से लें, भोजन के बाद लें, गोली न तोड़ें...'
                      : 'e.g. Take with warm water, avoid grapefruit juice, do not crush tablet...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              {/* Reminder toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="reminder-toggle"
                  checked={formReminder}
                  onChange={(e) => setFormReminder(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <label
                  htmlFor="reminder-toggle"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {language === 'hi'
                    ? 'इस दवा के लिए स्वास्थ्य अनुस्मारक व अलार्म चालू रखें'
                    : 'Enable health reminders for this medication'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t('btn_cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md"
                >
                  {editingMed
                    ? (language === 'hi' ? 'दवा अपडेट करें' : 'Update Medication')
                    : (language === 'hi' ? 'ट्रैकर में सहेजें' : 'Save to Tracker')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
