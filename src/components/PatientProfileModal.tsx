import React, { useState } from 'react';
import { X, User, Heart, Target, Plus, Check, Languages } from 'lucide-react';
import { PatientProfile } from '../types';
import { useI18n } from '../services/i18n';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile;
  onSave: (updated: PatientProfile) => void;
}

const COMMON_CHRONIC_CONDITIONS = [
  'Type 2 Diabetes',
  'Type 1 Diabetes',
  'Hypertension (High BP)',
  'Dyslipidemia (High Cholesterol)',
  'Hypothyroidism',
  'Asthma / COPD',
  'Chronic Kidney Disease',
  'Coronary Artery Disease',
  'Osteoarthritis',
  'GERD / Acid Reflux',
  'Fatty Liver',
];

const COMMON_CONDITIONS_HI_MAP: Record<string, string> = {
  'Type 2 Diabetes': 'टाइप 2 मधुमेह (Type 2 Diabetes)',
  'Type 1 Diabetes': 'टाइप 1 मधुमेह (Type 1 Diabetes)',
  'Hypertension (High BP)': 'उच्च रक्तचाप (High BP)',
  'Dyslipidemia (High Cholesterol)': 'उच्च कोलेस्ट्रॉल (Cholesterol)',
  'Hypothyroidism': 'हाइपोथायरायडिज्म (Thyroid)',
  'Asthma / COPD': 'दमा / अस्थमा (Asthma)',
  'Chronic Kidney Disease': 'गुर्दे की बीमारी (Kidney)',
  'Coronary Artery Disease': 'हृदय रोग (Heart)',
  'Osteoarthritis': 'गठिया (Arthritis)',
  'GERD / Acid Reflux': 'एसिडिटी / गैस (GERD)',
  'Fatty Liver': 'फैटी लिवर (Fatty Liver)',
};

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const { language, setLanguage, t } = useI18n();
  const [formData, setFormData] = useState<PatientProfile>({ ...profile });
  const [customCond, setCustomCond] = useState('');

  if (!isOpen) return null;

  const toggleCondition = (cond: string) => {
    const exists = formData.conditions.includes(cond);
    if (exists) {
      setFormData({
        ...formData,
        conditions: formData.conditions.filter((c) => c !== cond),
      });
    } else {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, cond],
      });
    }
  };

  const addCustomCondition = () => {
    if (!customCond.trim()) return;
    if (!formData.conditions.includes(customCond.trim())) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, customCond.trim()],
      });
    }
    setCustomCond('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 dim:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 dim:bg-teal-950/60 text-teal-700 dark:text-teal-300 dim:text-teal-300 flex items-center justify-center font-semibold text-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white dim:text-white">
                {t('profile_title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 dim:text-slate-400">
                {language === 'hi'
                  ? 'दीर्घकालिक बीमारी प्रबंधन के लिए व्यक्तिगत जानकारी (स्थानीय रूप से सुरक्षित)'
                  : 'Personalized for chronic disease management (stored locally)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Global Language Setting */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {language === 'hi' ? 'इंटरफ़ेस भाषा (Language)' : 'Interface Language'}
              </span>
              <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-lg border border-teal-200 dark:border-teal-700">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    language === 'hi'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>
            <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
              {language === 'hi'
                ? 'हिन्दी मोड सक्रिय होने पर पूरे ऐप का इंटरफ़ेस, सभी दवाइयां व रिपोर्ट हिन्दी में प्रस्तुत की जाती हैं।'
                : 'When active, utilizes HealthLens AI to translate interface labels, medication instructions, and analysis results into Hindi for regional accessibility.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 dim:text-slate-300 mb-1.5">
                {t('full_name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dim:border-slate-700 bg-white dark:bg-slate-800 dim:bg-slate-900 text-slate-900 dark:text-white dim:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 dim:text-slate-300 mb-1.5">
                {t('age_label')}
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dim:border-slate-700 bg-white dark:bg-slate-800 dim:bg-slate-900 text-slate-900 dark:text-white dim:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 dim:text-slate-300 mb-1.5">
              {t('gender_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'Male', labelKey: 'male' },
                { key: 'Female', labelKey: 'female' },
                { key: 'Other', labelKey: 'other_gender' },
              ].map(({ key, labelKey }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setFormData({ ...formData, gender: key })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                    formData.gender === key
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 dim:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dim:bg-slate-900/50 text-slate-700 dark:text-slate-300 dim:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 dim:text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {t('profile_conditions')}
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.conditions.length} {language === 'hi' ? 'चयनित' : 'selected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 dim:text-slate-400 mb-2.5">
              {language === 'hi'
                ? 'वे स्वास्थ्य स्थितियां चुनें जिन्हें आप सक्रिय रूप से प्रबंधित कर रहे हैं:'
                : 'Select any conditions you are actively monitoring or managing:'}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {COMMON_CHRONIC_CONDITIONS.map((cond) => {
                const isSelected = formData.conditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`text-xs py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/50 dim:bg-teal-950/50 border-teal-500 text-teal-800 dark:text-teal-200 dim:text-teal-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 dim:border-slate-700 bg-white dark:bg-slate-800 dim:bg-slate-900 text-slate-600 dark:text-slate-400 dim:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                    {language === 'hi' ? COMMON_CONDITIONS_HI_MAP[cond] || cond : cond}
                  </button>
                );
              })}
            </div>

            {/* Custom Condition */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'hi' ? 'अन्य बीमारी जोड़ें...' : 'Add other condition (e.g. Migraine, Sleep Apnea)...'}
                value={customCond}
                onChange={(e) => setCustomCond(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCondition();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dim:border-slate-700 bg-white dark:bg-slate-800 dim:bg-slate-900 text-slate-900 dark:text-white dim:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={addCustomCondition}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {language === 'hi' ? 'जोड़ें' : 'Add'}
              </button>
            </div>
          </div>

          {/* Health Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 dim:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {t('profile_goal')}
            </label>
            <textarea
              rows={2}
              value={formData.healthGoal}
              onChange={(e) => setFormData({ ...formData, healthGoal: e.target.value })}
              placeholder={
                language === 'hi'
                  ? 'जैसे: खाली पेट शुगर 130 से कम रखें, रोजाना समय पर बीपी की दवा लें...'
                  : 'e.g. Keep fasting blood sugar below 130 mg/dL, take BP medication every morning on time...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dim:border-slate-700 bg-white dark:bg-slate-800 dim:bg-slate-900 text-slate-900 dark:text-white dim:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 dim:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 dim:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md transition-colors"
            >
              {language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
