import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  Pill,
  Stethoscope,
  Activity,
  Repeat,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  Volume2,
  RotateCw,
  X,
  Check,
  CalendarDays,
} from 'lucide-react';
import { HealthReminder, ReminderType, ReminderRepeat } from '../types';
import { notificationService } from '../services/notifications';
import { getTodayKey } from '../services/storage';
import { useI18n } from '../services/i18n';

interface RemindersManagerProps {
  reminders: HealthReminder[];
  onUpdateReminders: (updated: HealthReminder[]) => void;
}

const TYPE_CONFIG: Record<
  ReminderType,
  { labelKey: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  medicine: { labelKey: 'rem_type_medicine', icon: Pill, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60' },
  doctor_appointment: {
    labelKey: 'rem_type_doctor',
    icon: Stethoscope,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60',
  },
  checkup: { labelKey: 'rem_type_checkup', icon: Activity, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
  blood_test: { labelKey: 'rem_type_blood_test', icon: Calendar, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
  refill: { labelKey: 'rem_type_refill', icon: RotateCw, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
  custom: { labelKey: 'rem_type_custom', icon: Bell, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800' },
};

export const RemindersManager: React.FC<RemindersManagerProps> = ({
  reminders,
  onUpdateReminders,
}) => {
  const { language, t, tr, translateReminderItem } = useI18n();
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<HealthReminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<ReminderType>('medicine');
  const [formDate, setFormDate] = useState(getTodayKey());
  const [formTime, setFormTime] = useState('08:00');
  const [formRepeat, setFormRepeat] = useState<ReminderRepeat>('daily');
  const [formNotes, setFormNotes] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const requestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      notificationService.notify(
        language === 'hi' ? 'सूचनाएं सक्रिय हो गईं' : 'Notifications Activated',
        language === 'hi' ? 'हेल्थलेन्स अनुस्मारक अब इस डिवाइस पर चालू हैं!' : 'HealthLens reminders are now enabled on this device!'
      );
    }
  };

  const testChime = () => {
    notificationService.notify(
      language === 'hi' ? 'हेल्थलेन्स अलार्म परीक्षण' : 'HealthLens Reminder Chime',
      language === 'hi' ? 'यह परीक्षण अलर्ट ध्वनि है।' : 'This is a test notification audio alert.'
    );
  };

  const resetForm = () => {
    setFormTitle('');
    setFormType('medicine');
    setFormDate(getTodayKey());
    setFormTime('08:00');
    setFormRepeat('daily');
    setFormNotes('');
    setFormPriority('medium');
    setEditingReminder(null);
  };

  const openEdit = (rem: HealthReminder) => {
    setEditingReminder(rem);
    setFormTitle(rem.title);
    setFormType(rem.type);
    setFormDate(rem.date);
    setFormTime(rem.time);
    setFormRepeat(rem.repeat);
    setFormNotes(rem.notes || '');
    setFormPriority(rem.priority);
    setIsAddModalOpen(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingReminder) {
      const updated = reminders.map((r) =>
        r.id === editingReminder.id
          ? {
              ...r,
              title: formTitle.trim(),
              type: formType,
              date: formDate,
              time: formTime,
              repeat: formRepeat,
              notes: formNotes.trim(),
              priority: formPriority,
            }
          : r
      );
      onUpdateReminders(updated);
    } else {
      const newRem: HealthReminder = {
        id: `rem-${Date.now()}`,
        title: formTitle.trim(),
        type: formType,
        date: formDate,
        time: formTime,
        repeat: formRepeat,
        notes: formNotes.trim(),
        priority: formPriority,
        completed: false,
      };
      onUpdateReminders([...reminders, newRem]);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const toggleComplete = (id: string) => {
    onUpdateReminders(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const snoozeReminder = (id: string, minutes: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const newTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onUpdateReminders(
      reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              time: newTimeString,
              snoozedUntil: now.toISOString(),
            }
          : r
      )
    );
    notificationService.playChime();
  };

  const deleteReminder = (id: string) => {
    const confirmMsg =
      language === 'hi'
        ? 'क्या आप इस अनुस्मारक को हटाना चाहते हैं?'
        : 'Delete this health reminder?';
    if (confirm(confirmMsg)) {
      onUpdateReminders(reminders.filter((r) => r.id !== id));
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
            <Bell className="w-3.5 h-3.5" />
            {t('reminders_page_title')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {language === 'hi'
              ? 'दवा की खुराक, डॉक्टर मुलाकात या रिफिल कभी न भूलें'
              : 'Never Miss a Dose, Check-up, or Refill'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            {t('reminders_page_sub')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {t('btn_create_reminder')}
            </button>

            {notificationPermission !== 'granted' ? (
              <button
                onClick={requestPermission}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-teal-300" />
                {t('btn_enable_notifications')}
              </button>
            ) : (
              <button
                onClick={testChime}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {t('btn_test_chime')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('filter_all')} ({reminders.length})
        </button>

        {Object.entries(TYPE_CONFIG).map(([key, config]) => {
          const count = reminders.filter((r) => r.type === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all whitespace-nowrap ${
                filterType === key
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(config.labelKey)} ({count})
            </button>
          );
        })}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base mb-1">
            {language === 'hi' ? 'कोई अनुस्मारक नहीं मिला' : 'No Reminders Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {language === 'hi'
              ? 'अपनी नियमित स्व-देखभाल के लिए दवा, डॉक्टर जांच या रिफिल अनुस्मारक जोड़ें।'
              : 'Keep your chronic self-care organized by creating medicine, check-up, or refill reminders.'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-xl"
          >
            {t('btn_create_reminder')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((rawRem) => {
            const rem = translateReminderItem(rawRem);
            const config = TYPE_CONFIG[rawRem.type] || TYPE_CONFIG.custom;
            const Icon = config.icon;

            return (
              <div
                key={rawRem.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  rawRem.completed
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : 'bg-white dark:bg-slate-900 dim:bg-slate-800 border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm hover:border-teal-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {t(config.labelKey)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(rawRem)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t('btn_edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteReminder(rawRem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t('btn_delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`font-bold text-sm sm:text-base text-slate-900 dark:text-white ${
                      rawRem.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {rem.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {rawRem.time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {rawRem.date}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{tr(rawRem.repeat)}</span>
                  </div>

                  {rem.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2.5 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{rem.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!rawRem.completed && (
                      <>
                        <button
                          onClick={() => snoozeReminder(rawRem.id, 15)}
                          className="px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          title="Snooze 15 minutes"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => snoozeReminder(rawRem.id, 60)}
                          className="px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          title="Snooze 1 hour"
                        >
                          +1h
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => toggleComplete(rawRem.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                      rawRem.completed
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-teal-600 hover:bg-teal-500 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {rawRem.completed ? t('btn_taken') : t('btn_mark_done')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingReminder ? t('edit_reminder_heading') : t('new_reminder_heading')}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('reminder_title_label')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    language === 'hi'
                      ? 'जैसे: सुबह की मेटफॉर्मिन 500mg, डॉ. शर्मा से मुलाकात, बीपी दवा रिफिल...'
                      : 'e.g. Morning Metformin 500mg, Dr. Sharma Appointment, Refill BP pills...'
                  }
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('reminder_type_label')}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ReminderType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="medicine">{t('rem_type_medicine')}</option>
                    <option value="doctor_appointment">{t('rem_type_doctor')}</option>
                    <option value="checkup">{t('rem_type_checkup')}</option>
                    <option value="blood_test">{t('rem_type_blood_test')}</option>
                    <option value="refill">{t('rem_type_refill')}</option>
                    <option value="custom">{t('rem_type_custom')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('reminder_repeat_label')}
                  </label>
                  <select
                    value={formRepeat}
                    onChange={(e) => setFormRepeat(e.target.value as ReminderRepeat)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="daily">{t('repeat_daily')}</option>
                    <option value="once">{t('repeat_once')}</option>
                    <option value="weekly">{t('repeat_weekly')}</option>
                    <option value="monthly">{t('repeat_monthly')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('reminder_date_label')}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('reminder_time_label')}
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('reminder_notes_label')}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'जैसे: नाश्ते के बाद पानी के साथ लें, पर्चा साथ रखें...'
                      : 'e.g. Take with warm water after food, bring old blood reports...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
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
                  {editingReminder
                    ? (language === 'hi' ? 'अनुस्मारक अपडेट करें' : 'Update Reminder')
                    : (language === 'hi' ? 'अनुस्मारक सहेजें' : 'Save Reminder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
