import {
  PatientProfile,
  MedicationItem,
  HealthReminder,
  MedicalHistoryRecord,
  AppTheme,
  MedicalReportAnalysis,
  PrescriptionAnalysis,
  SubscriptionInfo,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'healthlens_profile_v1',
  MEDICATIONS: 'healthlens_medications_v1',
  REMINDERS: 'healthlens_reminders_v1',
  HISTORY: 'healthlens_history_v1',
  THEME: 'healthlens_theme_v1',
  SUBSCRIPTION: 'healthlens_subscription_v1',
};

export const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'free',
  selectedModel: 'gemini-2.5-flash',
};

export const DEFAULT_PROFILE: PatientProfile = {
  name: 'Ramesh Patel',
  age: 58,
  gender: 'Male',
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Dyslipidemia'],
  healthGoal: 'Maintain fasting blood sugar under 130 mg/dL and take all daily medications on schedule.',
};

export const getTodayKey = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const DEFAULT_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-1',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    frequency: 'Twice daily (BID)',
    timingDescription: 'After breakfast and after dinner',
    slots: ['morning', 'night'],
    targetTimes: {
      morning: '08:00',
      night: '20:00',
    },
    startDate: '2026-06-01',
    endDate: 'Ongoing',
    doctorNote: 'Take with or immediately after food to avoid gastric irritation. Stay well hydrated.',
    mealRelation: 'after_food',
    reminderEnabled: true,
    status: 'active',
    conditionTag: 'Type 2 Diabetes',
    logs: {
      [getTodayKey()]: {
        morning: 'taken',
        night: 'pending',
      },
    },
  },
  {
    id: 'med-2',
    name: 'Telmisartan',
    dosage: '40 mg',
    frequency: 'Once daily (OD)',
    timingDescription: 'Morning after breakfast',
    slots: ['morning'],
    targetTimes: {
      morning: '08:30',
    },
    startDate: '2026-06-01',
    endDate: 'Ongoing',
    doctorNote: 'Keep taking consistently every morning to maintain 24-hour arterial pressure control.',
    mealRelation: 'after_food',
    reminderEnabled: true,
    status: 'active',
    conditionTag: 'Hypertension',
    logs: {
      [getTodayKey()]: {
        morning: 'taken',
      },
    },
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    dosage: '10 mg',
    frequency: 'Once daily (QHS)',
    timingDescription: 'At bedtime with a glass of water',
    slots: ['night'],
    targetTimes: {
      night: '21:30',
    },
    startDate: '2026-06-01',
    endDate: 'Ongoing',
    doctorNote: 'Taken at night when cholesterol synthesis in the liver is highest.',
    mealRelation: 'anytime',
    reminderEnabled: true,
    status: 'active',
    conditionTag: 'Dyslipidemia',
    logs: {
      [getTodayKey()]: {
        night: 'pending',
      },
    },
  },
];

export const DEFAULT_REMINDERS: HealthReminder[] = [
  {
    id: 'rem-1',
    title: 'Morning Medications (Metformin 500mg & Telmisartan 40mg)',
    type: 'medicine',
    date: getTodayKey(),
    time: '08:00',
    repeat: 'daily',
    notes: 'Take after breakfast with a full glass of water.',
    priority: 'high',
    completed: true,
  },
  {
    id: 'rem-2',
    title: 'Bedtime Medications (Metformin 500mg & Atorvastatin 10mg)',
    type: 'medicine',
    date: getTodayKey(),
    time: '20:30',
    repeat: 'daily',
    notes: 'Take with post-dinner water.',
    priority: 'high',
    completed: false,
  },
  {
    id: 'rem-3',
    title: 'Dr. Anita Rao Follow-up (Diabetic Care & Kidney Check)',
    type: 'doctor_appointment',
    date: '2026-10-18',
    time: '10:30',
    repeat: 'once',
    notes: 'Bring updated HealthLens medication log and recent HbA1c lab report.',
    priority: 'high',
    completed: false,
  },
  {
    id: 'rem-4',
    title: 'Prescription Refill Reminder: Telmisartan & Metformin',
    type: 'refill',
    date: '2026-10-25',
    time: '11:00',
    repeat: 'monthly',
    notes: 'Refill 60-day supply at local pharmacy before running low.',
    priority: 'medium',
    completed: false,
  },
  {
    id: 'rem-5',
    title: 'Fasting Blood Sugar Glucometer Check',
    type: 'blood_test',
    date: getTodayKey(),
    time: '07:30',
    repeat: 'weekly',
    notes: 'Record in health log prior to breakfast.',
    priority: 'medium',
    completed: true,
  },
];

export const DEFAULT_SAMPLE_REPORT: MedicalReportAnalysis = {
  id: 'rep-sample-1',
  reportTitle: 'Comprehensive Metabolic & Lipid Health Report',
  patientName: 'Ramesh Patel',
  reportDate: '2026-09-15',
  summary: 'This blood test panel checks your long-term blood sugar control, kidney filtering capacity, and lipid (cholesterol) profile. It provides a helpful snapshot for your chronic health self-care routine.',
  tests: [
    {
      name: 'HbA1c (Glycated Hemoglobin)',
      result: '7.4 %',
      referenceRange: '< 5.7 % Normal, 5.7 - 6.4 % Pre-diabetes, ≥ 6.5 % Diabetes',
      status: 'high',
      simpleExplanation: 'HbA1c measures your average blood sugar over the last 90 days. A level of 7.4% is elevated and shows that your daily glucose routine may need minor refinement with your physician.'
    },
    {
      name: 'Fasting Blood Glucose',
      result: '138 mg/dL',
      referenceRange: '70 - 99 mg/dL (Normal)',
      status: 'high',
      simpleExplanation: 'This measures sugar after overnight fasting. 138 mg/dL is higher than the standard baseline, showing that glucose remains elevated before morning meals.'
    },
    {
      name: 'LDL Cholesterol ("Bad" Cholesterol)',
      result: '135 mg/dL',
      referenceRange: '< 100 mg/dL (Target for chronic care)',
      status: 'high',
      simpleExplanation: 'LDL can slowly build up on blood vessel walls. Keeping this closer to the 100 mg/dL target helps keep your heart healthy.'
    },
    {
      name: 'Serum Triglycerides',
      result: '185 mg/dL',
      referenceRange: '< 150 mg/dL (Normal: <150, Borderline: 150-199 mg/dL)',
      status: 'borderline',
      simpleExplanation: 'Triglycerides are blood fats sensitive to refined carbohydrates and dietary sugars. 185 mg/dL is in the borderline caution range (Yellow zone).'
    },
    {
      name: 'Vitamin D3 (25-OH)',
      result: '22 ng/mL',
      referenceRange: '30 - 100 ng/mL (Optimal)',
      status: 'low',
      simpleExplanation: 'Vitamin D supports bone mineralization, insulin sensitivity, and immunity. 22 ng/mL indicates mild insufficiency in the caution range (Yellow zone).'
    },
    {
      name: 'HDL Cholesterol ("Good" Cholesterol)',
      result: '46 mg/dL',
      referenceRange: '> 40 mg/dL (Desirable)',
      status: 'normal',
      simpleExplanation: 'HDL carries excess cholesterol back to your liver to be eliminated. Your reading is in the healthy reference range (Green zone).'
    },
    {
      name: 'Serum Creatinine',
      result: '0.95 mg/dL',
      referenceRange: '0.70 - 1.30 mg/dL',
      status: 'normal',
      simpleExplanation: 'A natural muscle waste product filtered out by kidneys. At 0.95 mg/dL, your kidneys are clearing waste properly.'
    },
    {
      name: 'eGFR (Estimated Kidney Filtration Rate)',
      result: '88 mL/min/1.73m²',
      referenceRange: '> 60 mL/min/1.73m²',
      status: 'normal',
      simpleExplanation: 'An estimate of how efficiently your kidneys clean blood. 88 is well within the healthy normal range.'
    }
  ],
  importantFindings: [
    'HbA1c is 7.4%, which is above non-diabetic targets and warrants review of medication timing and carbohydrate intake.',
    'Fasting blood glucose is 138 mg/dL, indicating morning elevated sugar.',
    'LDL cholesterol is 135 mg/dL, slightly above the recommended chronic preventive target.',
    'Kidney filtration markers (Creatinine and eGFR) are completely healthy.'
  ],
  termsExplained: [
    {
      term: 'HbA1c',
      definition: 'A simple blood test measuring how much glucose is attached to your red blood cells, giving a 3-month average.'
    },
    {
      term: 'eGFR',
      definition: 'Estimated Glomerular Filtration Rate: measures how many milliliters of blood your kidneys clean per minute.'
    },
    {
      term: 'LDL & HDL',
      definition: 'Carriers of cholesterol: LDL deposits cholesterol into arteries, while HDL sweeps it away.'
    }
  ],
  questionsForDoctor: [
    'With my HbA1c at 7.4%, should we adjust my current Metformin timing or my meal portions?',
    'What specific LDL cholesterol target would you like me to reach for cardiovascular protection?',
    'When should we repeat this lab panel to evaluate progress?'
  ],
  disclaimer: 'HealthLens is an informational companion for self-care organization. It does not provide medical diagnoses or replace consultations with your doctor.',
  hindiTranslation: {
    summaryHindi: 'यह रक्त परीक्षण आपके 3 महीने के औसत शर्करा स्तर, गुर्दे की कार्यप्रणाली और कोलेस्ट्रॉल की जांच करता है। यह आपके दीर्घकालिक स्वास्थ्य प्रबंधन के लिए महत्वपूर्ण है।',
    findingsHindi: [
      'HbA1c 7.4% है, जो सामान्य से अधिक है और भोजन व दवा पर डॉक्टर से चर्चा करने की आवश्यकता दर्शाता है।',
      'खाली पेट रक्त शर्करा (Fasting Glucose) 138 mg/dL है, जो सामान्य सीमा से ऊपर है।',
      'एलडीएल (खराब कोलेस्ट्रॉल) 135 mg/dL है, जो हृदय स्वास्थ्य के लिए 100 से कम होना चाहिए।',
      'गुर्दे की कार्यप्रणाली (Creatinine एवं eGFR) पूरी तरह सामान्य और स्वस्थ है।'
    ],
    termsHindi: [
      {
        term: 'HbA1c',
        definition: 'रक्त में पिछले 2 से 3 महीनों के औसत शुगर स्तर का माप।'
      },
      {
        term: 'eGFR',
        definition: 'गुर्दे (किडनी) द्वारा रक्त छानने की गति का अनुमान।'
      }
    ],
    questionsHindi: [
      'क्या 7.4% HbA1c के बाद मेरी मेटफॉर्मिन दवा या खुराक में बदलाव की आवश्यकता है?',
      'मेरे हृदय स्वास्थ्य के लिए कोलेस्ट्रॉल का सही लक्ष्य क्या होना चाहिए?'
    ]
  },
  createdAt: '2026-09-15T09:30:00Z',
  rawInputSnippet: 'Comprehensive Metabolic & Lipid Panel - Patient Ramesh Patel'
};

export const DEFAULT_SAMPLE_PRESCRIPTION: PrescriptionAnalysis = {
  id: 'rx-sample-1',
  prescriptionTitle: 'Chronic Care Glycemic & Blood Pressure Regimen',
  doctorOrClinic: 'Metro Care Endocrinology & Heart Clinic (Dr. Anita Rao, MD)',
  prescriptionDate: '2026-09-20',
  summary: 'This prescription outlines a chronic disease management plan targeting blood sugar stabilization, arterial blood pressure protection, and cardiovascular risk reduction.',
  medications: [
    {
      name: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: 'Twice daily (BID)',
      timing: 'After breakfast (08:00 AM) and after dinner (08:00 PM)',
      slots: ['morning', 'night'],
      duration: 'Ongoing / 90 days',
      purpose: 'Reduces glucose production in the liver and enhances muscle sensitivity to insulin to lower blood sugar.',
      mealRelation: 'after_food',
      precautions: [
        'Always take with or after meals to prevent stomach discomfort or nausea',
        'Drink plenty of water throughout the day',
        'Do not skip meals after taking this medicine'
      ],
      notes: 'Swallow whole with water. Do not chew.',
      unclearWarning: null
    },
    {
      name: 'Telmisartan',
      dosage: '40 mg',
      frequency: 'Once daily (OD)',
      timing: 'Morning after breakfast (08:30 AM)',
      slots: ['morning'],
      duration: 'Ongoing / Chronic',
      purpose: 'Relaxes blood vessels to lower elevated blood pressure and protect kidney microvasculature.',
      mealRelation: 'after_food',
      precautions: [
        'Take at the same time each morning for smooth 24-hour pressure coverage',
        'If you feel lightheaded when standing up, pause and rise slowly'
      ],
      notes: 'Store in original moisture-resistant blister packaging.',
      unclearWarning: null
    },
    {
      name: 'Atorvastatin',
      dosage: '10 mg',
      frequency: 'Once daily (QHS)',
      timing: 'Bedtime (09:30 PM)',
      slots: ['night'],
      duration: 'Ongoing / 90 days',
      purpose: 'Lowers LDL cholesterol and stabilizes blood vessels to minimize cardiovascular complications.',
      mealRelation: 'anytime',
      precautions: [
        'Taken at night when the liver naturally produces the most cholesterol during sleep',
        'Report any unexplained muscle pain or severe fatigue to your doctor'
      ],
      notes: 'Avoid excessive grapefruit juice consumption.',
      unclearWarning: null
    }
  ],
  generalPrecautions: [
    'Take medications at the same time every single day to ensure consistent therapeutic benefits.',
    'Never stop blood pressure or diabetes medication abruptly without speaking to your doctor.',
    'Keep an organized pill organizer or tracker updated at all times.'
  ],
  questionsForDoctorOrPharmacist: [
    'What should I do if I ever miss a scheduled morning dose of Telmisartan or Metformin?',
    'Are there any over-the-counter pain medications (like ibuprofen) that might interact with my blood pressure medicine?',
    'When should we review my liver enzymes and kidney numbers again?'
  ],
  disclaimer: 'This explanation is for self-care organization only. Never alter your dosage or discontinue prescribed medications without consulting your healthcare provider.',
  hindiTranslation: {
    summaryHindi: 'यह प्रिस्क्रिप्शन आपके रक्त शर्करा, रक्तचाप और कोलेस्ट्रॉल को नियंत्रित रखने के लिए निर्धारित किया गया है।',
    medicationsHindi: [
      {
        name: 'मेटफॉर्मिन हाइड्रोक्लोराइड (Metformin)',
        dosage: '500 mg',
        timing: 'सुबह नाश्ते के बाद और रात को खाने के बाद',
        purpose: 'रक्त शर्करा को नियंत्रित रखता है।',
        precautions: [
          'पेट की परेशानी से बचने के लिए हमेशा खाने के तुरंत बाद लें',
          'पर्याप्त मात्रा में पानी पिएं'
        ]
      },
      {
        name: 'टेल्मीसार्टन (Telmisartan)',
        dosage: '40 mg',
        timing: 'सुबह नाश्ते के बाद (08:30 बजे)',
        purpose: 'रक्तचाप (BP) को सामान्य रखता है और गुर्दे की सुरक्षा करता है।',
        precautions: ['रोजाना एक ही समय पर लें']
      },
      {
        name: 'एटोर्वास्टेटिन (Atorvastatin)',
        dosage: '10 mg',
        timing: 'रात को सोने से पहले',
        purpose: 'खराब कोलेस्ट्रॉल (LDL) को कम करता है और हृदय की रक्षा करता है।',
        precautions: ['रात को पानी के साथ लें']
      }
    ],
    precautionsHindi: [
      'दवाएं हमेशा नियमित समय पर लें।',
      'डॉक्टर की सलाह के बिना कभी भी दवा बंद न करें।'
    ],
    questionsHindi: [
      'यदि किसी दिन खुराक छूट जाए तो मुझे क्या करना चाहिए?'
    ]
  },
  createdAt: '2026-09-20T11:00:00Z',
  rawInputSnippet: 'Rx: Metformin 500mg BID, Telmisartan 40mg OD, Atorvastatin 10mg QHS'
};

export const DEFAULT_HISTORY: MedicalHistoryRecord[] = [
  {
    id: 'hist-1',
    type: 'report',
    title: DEFAULT_SAMPLE_REPORT.reportTitle,
    date: '2026-09-15',
    shortSummary: 'Comprehensive Metabolic Panel showing HbA1c 7.4%, Fasting Glucose 138 mg/dL, and healthy kidney markers.',
    reportData: DEFAULT_SAMPLE_REPORT,
    createdAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'hist-2',
    type: 'prescription',
    title: DEFAULT_SAMPLE_PRESCRIPTION.prescriptionTitle,
    date: '2026-09-20',
    shortSummary: 'Chronic disease regimen: Metformin 500mg BID, Telmisartan 40mg OD, Atorvastatin 10mg QHS.',
    prescriptionData: DEFAULT_SAMPLE_PRESCRIPTION,
    createdAt: '2026-09-20T11:00:00Z',
  },
];

// Helper functions for persistent storage
export function loadProfile(): PatientProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: PatientProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

export function loadMedications(): MedicationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading medications', e);
  }
  return DEFAULT_MEDICATIONS;
}

export function saveMedications(meds: MedicationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));
  } catch (e) {
    console.error('Error saving medications', e);
  }
}

export function loadReminders(): HealthReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading reminders', e);
  }
  return DEFAULT_REMINDERS;
}

export function saveReminders(reminders: HealthReminder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) {
    console.error('Error saving reminders', e);
  }
}

export function loadHistory(): MedicalHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading history', e);
  }
  return DEFAULT_HISTORY;
}

export function saveHistory(records: MedicalHistoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving history', e);
  }
}

export function loadTheme(): AppTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme;
    if (raw === 'light' || raw === 'dim' || raw === 'dark') return raw;
  } catch (e) {
    console.error('Error loading theme', e);
  }
  return 'light';
}

export function saveTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }
}

export function loadSubscription(): SubscriptionInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (raw) {
      const parsed: SubscriptionInfo = JSON.parse(raw);
      // Check expiration
      if (parsed.expiresAt) {
        const expiry = new Date(parsed.expiresAt).getTime();
        if (Date.now() > expiry) {
          // Expired, revert to free
          const expiredRevert: SubscriptionInfo = {
            tier: 'free',
            selectedModel: 'gemini-2.5-flash',
          };
          saveSubscription(expiredRevert);
          return expiredRevert;
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading subscription', e);
  }
  return DEFAULT_SUBSCRIPTION;
}

export function saveSubscription(sub: SubscriptionInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (e) {
    console.error('Error saving subscription', e);
  }
}

export function resetToDemoData(): void {
  saveProfile(DEFAULT_PROFILE);
  saveMedications(DEFAULT_MEDICATIONS);
  saveReminders(DEFAULT_REMINDERS);
  saveHistory(DEFAULT_HISTORY);
  saveTheme('light');
  saveSubscription(DEFAULT_SUBSCRIPTION);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
  localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
}

