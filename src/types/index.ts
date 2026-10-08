export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export type MealRelation = 'before_food' | 'after_food' | 'with_food' | 'empty_stomach' | 'anytime';

export type ReminderType =
  | 'medicine'
  | 'doctor_appointment'
  | 'checkup'
  | 'blood_test'
  | 'refill'
  | 'custom';

export type ReminderRepeat = 'once' | 'daily' | 'weekly' | 'monthly';

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  healthGoal: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timingDescription: string;
  slots: TimeSlot[];
  targetTimes: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
  };
  startDate: string;
  endDate: string; // or 'Ongoing'
  doctorNote?: string;
  mealRelation: MealRelation;
  reminderEnabled: boolean;
  status: 'active' | 'completed' | 'paused';
  conditionTag?: string; // e.g., 'Diabetes', 'Hypertension'
  // log by date (YYYY-MM-DD) -> slot -> status
  logs: Record<string, Record<string, 'taken' | 'skipped' | 'pending'>>;
}

export interface TestItem {
  name: string;
  result: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'borderline' | 'abnormal' | 'informational';
  simpleExplanation: string;
}

export interface TermItem {
  term: string;
  definition: string;
}

export interface MedicalReportAnalysis {
  id: string;
  reportTitle: string;
  patientName?: string | null;
  reportDate?: string | null;
  summary: string;
  tests: TestItem[];
  importantFindings: string[];
  termsExplained: TermItem[];
  questionsForDoctor: string[];
  disclaimer: string;
  hindiTranslation?: {
    summaryHindi: string;
    findingsHindi: string[];
    termsHindi: Array<{ term: string; definition: string }>;
    questionsHindi: string[];
  };
  createdAt: string;
  rawInputSnippet?: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  slots: TimeSlot[];
  duration: string;
  purpose: string;
  mealRelation: MealRelation;
  precautions: string[];
  notes?: string;
  unclearWarning?: string | null;
}

export interface PrescriptionAnalysis {
  id: string;
  prescriptionTitle: string;
  doctorOrClinic?: string | null;
  prescriptionDate?: string | null;
  summary: string;
  medications: PrescriptionMedication[];
  generalPrecautions: string[];
  questionsForDoctorOrPharmacist: string[];
  disclaimer: string;
  hindiTranslation?: {
    summaryHindi: string;
    medicationsHindi: Array<{
      name: string;
      dosage: string;
      timing: string;
      purpose: string;
      precautions: string[];
    }>;
    precautionsHindi: string[];
    questionsHindi: string[];
  };
  createdAt: string;
  rawInputSnippet?: string;
}

export interface HealthReminder {
  id: string;
  title: string;
  type: ReminderType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  repeat: ReminderRepeat;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  snoozedUntil?: string | null; // ISO timestamp
}

export interface MedicalHistoryRecord {
  id: string;
  type: 'report' | 'prescription';
  title: string;
  date: string;
  shortSummary: string;
  reportData?: MedicalReportAnalysis;
  prescriptionData?: PrescriptionAnalysis;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hindiTranslation?: string;
}

export type AppTheme = 'light' | 'dim' | 'dark';

export type AIModelId = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-pro-multilingual';
export type SubscriptionTier = 'free' | 'day_pass' | 'monthly';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  selectedModel: AIModelId;
  activatedAt?: string;
  expiresAt?: string;
}
