import React from 'react';
import {
  Pill,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Activity,
  ArrowRight,
  Sparkles,
  Heart,
  ChevronRight,
  Bell,
  Check,
  ShieldCheck,
} from 'lucide-react';
import {
  PatientProfile,
  MedicationItem,
  HealthReminder,
  MedicalHistoryRecord,
  TimeSlot,
} from '../types';
import { getTodayKey } from '../services/storage';
import { useI18n } from '../services/i18n';

interface DashboardProps {
  profile: PatientProfile;
  medications: MedicationItem[];
  reminders: HealthReminder[];
  history: MedicalHistoryRecord[];
  onOpenProfile: () => void;
  onNavigateTab: (tab: string) => void;
  onTogglePillStatus: (medId: string, slot: TimeSlot) => void;
  onCompleteReminder: (reminderId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  medications,
  reminders,
  history,
  onOpenProfile,
  onNavigateTab,
  onTogglePillStatus,
  onCompleteReminder,
}) => {
  const {
    language,
    t,
    tr,
    translateMedicationItem,
    translateReminderItem,
    translateCondition,
    translateSlot,
    translateMealRelation,
  } = useI18n();
  const todayKey = getTodayKey();

  // Calculate today's adherence stats
  let totalScheduledPills = 0;
  let takenPills = 0;

  medications.forEach((med) => {
    med.slots.forEach((slot) => {
      totalScheduledPills += 1;
      if (med.logs[todayKey]?.[slot] === 'taken') {
        takenPills += 1;
      }
    });
  });

  const todayReminders = reminders.filter((r) => r.date === todayKey);
  const totalTasks = totalScheduledPills + todayReminders.length;
  const completedTasks =
    takenPills + todayReminders.filter((r) => r.completed).length;

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Upcoming appointments or checkups
  const upcomingDoctorAppts = reminders.filter(
    (r) =>
      !r.completed &&
      (r.type === 'doctor_appointment' ||
        r.type === 'checkup' ||
        r.type === 'blood_test')
  );

  // Recent history items
  const recentReports = history.filter((h) => h.type === 'report').slice(0, 2);
  const recentPrescriptions = history
    .filter((h) => h.type === 'prescription')
    .slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Patient Greeting & Condition Bar */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 dim:text-teal-300 uppercase tracking-wider">
              {t('chronic_companion_badge')}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white dim:text-white">
            {language === 'hi' ? `स्वागत है, ${profile.name}` : `Welcome back, ${profile.name}`}
          </h1>

          {/* Chronic Conditions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              {t('monitoring_conditions')}
            </span>
            {profile.conditions.map((cond, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 dim:bg-teal-950/50 text-teal-800 dark:text-teal-200 dim:text-teal-200 border border-teal-200/50 dark:border-teal-800/50"
              >
                {translateCondition(cond)}
              </span>
            ))}
          </div>

          {profile.healthGoal && (
            <p className="text-xs text-slate-600 dark:text-slate-400 dim:text-slate-400 italic pt-1">
              🎯 {t('personal_goal')} "{tr(profile.healthGoal)}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenProfile}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 dim:bg-slate-700 text-slate-700 dark:text-slate-200 dim:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            {t('edit_profile_btn')}
          </button>
        </div>
      </div>

      {/* TODAY'S SELF-CARE OVERVIEW & PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Gauge Card */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                {t('adherence_tracker_tag')}
              </span>
              <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                {t('today_badge')}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {t('today_progress_title')}
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              {completedTasks} of {totalTasks} {t('tasks_completed_suffix')}
            </p>

            {/* Circular Progress Display */}
            <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-teal-400 transition-all duration-700"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">
                  {progressPercentage}%
                </span>
                <span className="text-[10px] text-teal-300 font-semibold uppercase">
                  {t('today_progress_adherence')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-300">
            {progressPercentage === 100 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                {t('all_tasks_completed')}
              </span>
            ) : (
              <span>
                {totalTasks - completedTasks} {t('tasks_remaining_suffix')}
              </span>
            )}
          </div>
        </div>

        {/* Quick Numbers / Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                {t('medicines_scheduled')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white dim:text-white">
                {totalScheduledPills}
              </span>
            </div>
            <span className="text-[11px] text-teal-700 dark:text-teal-300 font-medium mt-3">
              {t('daily_doses_label')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                {t('medicines_taken')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {takenPills}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-3">
              {totalScheduledPills > 0
                ? `${Math.round((takenPills / totalScheduledPills) * 100)} ${t('on_time_label')}`
                : t('status_normal')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                {t('upcoming_checkups')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                {upcomingDoctorAppts.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-3">{t('appointments_count_label')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                {t('active_reminders')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {reminders.filter((r) => !r.completed).length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-3">
              {language === 'hi' ? 'सक्रिय अलर्ट' : 'Active alerts'}
            </span>
          </div>

          {/* Quick Launch Action Cards */}
          <div
            onClick={() => onNavigateTab('tracker')}
            className="col-span-2 p-5 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 border border-teal-200/70 dark:border-teal-800/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('nav_tracker')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t('action_track_meds')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </div>

          <div
            onClick={() => onNavigateTab('prescription-explainer')}
            className="col-span-2 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('nav_rx_explainer')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t('action_scan_rx')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* TODAY'S MEDICINE TIMELINE PREVIEW */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dim:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t('today_schedule')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'दवा लेने के बाद तुरंत टिक करें या भोजन के निर्देश देखें'
                : 'Quickly mark medicines taken or check food instructions'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('tracker')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            {t('open_full_tracker')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {medications.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">
            {t('no_meds_scheduled_today')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {medications.map((rawMed) => {
              const med = translateMedicationItem(rawMed);

              return rawMed.slots.map((slot) => {
                const status = rawMed.logs[todayKey]?.[slot] || 'pending';
                const time = rawMed.targetTimes[slot] || '';

                return (
                  <div
                    key={`${rawMed.id}-${slot}`}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      status === 'taken'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {med.name}
                        </span>
                        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                        {translateSlot(slot)} {time ? `(${time})` : ''} • {translateMealRelation(rawMed.mealRelation)}
                      </p>
                    </div>

                    <button
                      onClick={() => onTogglePillStatus(rawMed.id, slot)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1 ${
                        status === 'taken'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-teal-600 hover:bg-teal-500 text-white active:scale-95'
                      }`}
                    >
                      {status === 'taken' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('btn_taken')}
                        </>
                      ) : (
                        t('btn_take')
                      )}
                    </button>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>

      {/* UPCOMING APPOINTMENTS & REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Appointments & Tests */}
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              {t('upcoming_checkups')}
            </h3>
            <button
              onClick={() => onNavigateTab('reminders')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              {language === 'hi' ? 'सभी देखें' : 'View All'}
            </button>
          </div>

          {upcomingDoctorAppts.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center italic">
              {t('no_upcoming_appts')}
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingDoctorAppts.slice(0, 3).map((rawAppt) => {
                const appt = translateReminderItem(rawAppt);

                return (
                  <div
                    key={rawAppt.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {appt.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'hi' ? 'तारीख' : 'Date'}: {appt.date} at {appt.time}
                      </p>
                      {appt.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onCompleteReminder(rawAppt.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title={t('btn_mark_done')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reports & Prescriptions */}
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              {t('recent_documents')}
            </h3>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              {t('view_history_link')}
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.length === 0 && recentPrescriptions.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center italic">
                {t('no_recent_reports_found')}
              </p>
            )}

            {recentReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onNavigateTab('history')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase">
                    {language === 'hi' ? 'लैब टेस्ट रिपोर्ट' : 'Lab Report'}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {tr(rep.title)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {tr(rep.shortSummary)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}

            {recentPrescriptions.map((rx) => (
              <div
                key={rx.id}
                onClick={() => onNavigateTab('history')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">
                    {language === 'hi' ? 'डॉक्टर पर्चा विश्लेषण' : 'Prescription Analysis'}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {tr(rx.title)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {tr(rx.shortSummary)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Safety Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">{t('clinical_boundary_title')}:</span>
          <span>{t('disclaimer_clinical_text')}</span>
        </div>
      </div>
    </div>
  );
};
