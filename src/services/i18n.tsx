import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MedicationItem,
  HealthReminder,
  MedicalReportAnalysis,
  PrescriptionAnalysis,
  TestItem,
  TermItem,
} from '../types';

export type Language = 'en' | 'hi';

const LANGUAGE_KEY = 'healthlens_language_v1';
const DYNAMIC_CACHE_KEY = 'healthlens_i18n_cache_v1';

// Static translation dictionary for ALL UI labels & clinical concepts
export const UI_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  // Navigation
  nav_dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  nav_tracker: { en: 'Prescription Tracker', hi: 'दवा ट्रैकर' },
  nav_rx_explainer: { en: 'AI Prescription Explainer', hi: 'प्रिस्क्रिप्शन विश्लेषक' },
  nav_report_simplifier: { en: 'AI Medical Report', hi: 'मेडिकल रिपोर्ट विश्लेषक' },
  nav_reminders: { en: 'Health Reminders', hi: 'स्वास्थ्य अनुस्मारक' },
  nav_history: { en: 'Medical History', hi: 'चिकित्सा इतिहास' },
  nav_assistant: { en: 'HealthLens AI', hi: 'हेल्थलेन्स AI' },
  nav_insights: { en: 'Self-Care Insights', hi: 'स्व-देखभाल ज्ञान' },
  nav_premium: { en: 'Premium Plans', hi: 'प्रीमियम प्लान' },
  nav_result_view: { en: 'Result View', hi: 'परिणाम दर्शक' },
  nav_translation: { en: 'Translation', hi: 'चिकित्सा अनुवाद' },
  nav_lab_guide: { en: 'Lab & Vitals Guide', hi: 'लैब व वाइटल्स गाइड' },
  nav_medical_terms: { en: 'Medical Terms', hi: 'मेडिकल शब्दावली' },
  nav_health_education: { en: 'Health Education', hi: 'स्वास्थ्य शिक्षा' },
  nav_offline_mode: { en: 'Offline Mode', hi: 'ऑफलाइन मोड' },
  nav_about_us: { en: 'About Us', hi: 'हमारे बारे में' },
  nav_settings_privacy: { en: 'Settings & Privacy', hi: 'सेटिंग्स एवं गोपनीयता' },
  all_15_pages: { en: 'All 15 Pages', hi: 'सभी 15 पेज' },

  // Header & Global tools
  app_title: { en: 'HEALTHLENS', hi: 'हेल्थलेन्स' },
  app_subtitle: {
    en: 'Prescription Tracker & Medical Companion',
    hi: 'दीर्घकालिक रोगियों के लिए प्रिस्क्रिप्शन ट्रैकर एवं साथी',
  },
  try_demo: { en: 'Try Demo', hi: 'डेमो देखें' },
  theme_light: { en: 'Light', hi: 'लाइट' },
  theme_dim: { en: 'Dim', hi: 'डिम' },
  theme_dark: { en: 'Dark', hi: 'डार्क' },
  lang_toggle_en: { en: 'English', hi: 'अंग्रेज़ी' },
  lang_toggle_hi: { en: 'हिन्दी', hi: 'हिन्दी' },
  lang_active_notice: {
    en: 'Hindi Language Mode Active',
    hi: 'हिन्दी भाषा मोड सक्रिय है (सभी निर्देश, दवाइयां व रिपोर्ट हिन्दी में हैं)',
  },

  // Problem statement callout
  problem_callout_title: {
    en: 'Official Problem Statement Solution',
    hi: 'आधिकारिक स्वास्थ्य समस्या का समाधान',
  },
  problem_callout_heading: {
    en: 'Self-Care Prescription Tracker',
    hi: 'दीर्घकालिक रोगियों के लिए स्व-देखभाल प्रिस्क्रिप्शन ट्रैकर',
  },
  problem_callout_desc: {
    en: 'A dedicated adherence companion for chronic conditions (Diabetes, Hypertension, Heart, Thyroid). Record doctor-prescribed regimens, view clear daily dosage schedules, and maintain lifelong medication adherence.',
    hi: 'दीर्घकालिक बीमारियों (मधुमेह, उच्च रक्तचाप, हृदय, थायरॉइड) के लिए विशेष दवा ट्रैकर। डॉक्टर के पर्चे दर्ज करें, दैनिक खुराक का समय देखें और अपनी दवा कभी न भूलें।',
  },

  // Buttons & Actions
  btn_add_medicine: { en: 'Add Prescribed Medicine', hi: 'नई निर्धारित दवा जोड़ें' },
  btn_scan_prescription: { en: 'Scan & Import Prescription with AI', hi: 'AI से पर्चा स्कैन व आयात करें' },
  btn_simplify_report: { en: 'Simplify Medical Report', hi: 'मेडिकल रिपोर्ट सरल बनाएं' },
  btn_explain_prescription: { en: 'Explain Prescription', hi: 'प्रिस्क्रिप्शन समझें' },
  btn_read_aloud: { en: 'Read Aloud', hi: 'बोलकर सुनें' },
  btn_read_aloud_hi: { en: 'Read Aloud in हिन्दी', hi: 'हिन्दी में बोलकर सुनें' },
  btn_translate_hi: { en: 'Translate to हिन्दी', hi: 'हिन्दी में अनुवाद करें' },
  btn_copy: { en: 'Copy', hi: 'कॉपी करें' },
  btn_copied: { en: 'Copied!', hi: 'कॉपी हो गया!' },
  btn_take: { en: 'Take', hi: 'दवा लें' },
  btn_taken: { en: 'Taken', hi: 'ले ली गई' },
  btn_skipped: { en: 'Skipped', hi: 'छोड़ दी' },
  btn_mark_done: { en: 'Mark Done', hi: 'पूर्ण चिह्नित करें' },
  btn_snooze: { en: 'Snooze', hi: 'स्नूज़ करें' },
  btn_cancel: { en: 'Cancel', hi: 'रद्द करें' },
  btn_save: { en: 'Save', hi: 'सुरक्षित करें' },
  btn_edit: { en: 'Edit', hi: 'संपादित करें' },
  btn_delete: { en: 'Delete', hi: 'हटाएं' },
  btn_clear: { en: 'Clear', hi: 'साफ़ करें' },
  btn_download_summary: { en: 'Download Summary', hi: 'सारांश डाउनलोड करें' },
  btn_try_sample_rx: { en: 'Try Sample Chronic Prescription', hi: 'नमूना क्रोनिक पर्चा देखें' },
  btn_try_sample_lab: { en: 'Try Sample Blood Report', hi: 'नमूना ब्लड टेस्ट रिपोर्ट देखें' },
  btn_add_all_to_tracker: { en: 'Add All to Tracker', hi: 'सभी दवाएं ट्रैकर में जोड़ें' },
  btn_add_to_tracker: { en: 'Add to My Tracker', hi: 'मेरे ट्रैकर में जोड़ें' },
  btn_create_reminder: { en: 'Create New Reminder', hi: 'नया अनुस्मारक बनाएं' },
  btn_enable_notifications: { en: 'Enable Browser Notifications', hi: 'ब्राउज़र सूचनाएं चालू करें' },
  btn_test_chime: { en: 'Test Chime Alert', hi: 'अलर्ट ध्वनि परीक्षण' },
  btn_upgrade_premium: { en: 'Upgrade to Premium', hi: 'प्रीमियम में अपग्रेड करें' },
  btn_view_details: { en: 'View Details', hi: 'विवरण देखें' },
  btn_close: { en: 'Close', hi: 'बंद करें' },
  btn_pause: { en: 'Pause Audio', hi: 'ऑडियो रोकें' },
  btn_resume: { en: 'Resume Audio', hi: 'ऑडियो जारी रखें' },
  btn_stop: { en: 'Stop Audio', hi: 'ऑडियो बंद करें' },

  // Dashboard Cards & Metrics
  today_progress_title: { en: "Today's Self-Care Progress", hi: 'आज की स्व-देखभाल प्रगति' },
  today_progress_adherence: { en: 'Adherence', hi: 'नियमितता' },
  medicines_scheduled: { en: 'Medicines Scheduled', hi: 'निर्धारित दवाइयां' },
  medicines_taken: { en: 'Medicines Marked Taken', hi: 'ली गई दवाइयां' },
  upcoming_checkups: { en: 'Upcoming Check-ups', hi: 'आगामी डॉक्टर जांच/मुलाकातें' },
  active_reminders: { en: 'Health Reminders', hi: 'सक्रिय अनुस्मारक' },
  today_schedule: { en: "Today's Medication Schedule", hi: 'आज की दवाइयों का समय' },
  active_prescriptions_count: { en: 'Active Prescribed Medicines', hi: 'सक्रिय निर्धारित दवाइयां' },
  all_tasks_completed: {
    en: 'All scheduled medicines and self-care tasks completed today!',
    hi: 'शाबाश! आज की सभी निर्धारित दवाइयां और स्वास्थ्य कार्य पूर्ण हो गए हैं।',
  },
  welcome_back: { en: 'Welcome back', hi: 'स्वागत है' },
  monitoring_conditions: { en: 'Monitoring:', hi: 'सक्रिय निगरानी:' },
  personal_goal: { en: 'Goal:', hi: 'व्यक्तिगत लक्ष्य:' },
  edit_profile_btn: { en: 'Edit Profile & Goals', hi: 'प्रोफ़ाइल व लक्ष्य बदलें' },
  recent_documents: { en: 'Recent Processed Documents', hi: 'हाल ही में जांची गई रिपोर्ट व पर्चे' },
  recent_reports: { en: 'Recent Lab Reports', hi: 'हालिया लैब टेस्ट रिपोर्ट' },
  recent_prescriptions: { en: 'Recent Prescriptions', hi: 'हालिया डॉक्टर पर्चे' },
  view_history_link: { en: 'View History', hi: 'पूरा इतिहास देखें' },
  open_full_tracker: { en: 'Open Full Tracker', hi: 'पूरा दवा ट्रैकर खोलें' },
  no_meds_scheduled_today: { en: 'No medicines scheduled for today.', hi: 'आज के लिए कोई दवा निर्धारित नहीं है।' },
  no_upcoming_appts: { en: 'No upcoming appointments scheduled.', hi: 'कोई आगामी डॉक्टर मुलाकात या जांच निर्धारित नहीं है।' },
  no_recent_reports_found: { en: 'No lab reports analyzed yet.', hi: 'अभी तक कोई लैब रिपोर्ट विश्लेषण नहीं की गई है।' },
  no_recent_prescriptions_found: { en: 'No prescriptions analyzed yet.', hi: 'अभी तक कोई डॉक्टर पर्चा विश्लेषण नहीं किया गया है।' },
  quick_actions_title: { en: 'Quick Self-Care Actions', hi: 'त्वरित स्व-देखभाल क्रियाएं' },
  action_track_meds: { en: 'Track Daily Medicines', hi: 'दैनिक दवाइयां दर्ज करें' },
  action_scan_rx: { en: 'Scan Doctor Prescription', hi: 'डॉक्टर का पर्चा स्कैन करें' },
  action_simplify_lab: { en: 'Simplify Blood Test', hi: 'ब्लड टेस्ट रिपोर्ट सरल करें' },
  action_set_reminder: { en: 'Set Pill Reminder', hi: 'दवा का समय व अलार्म लगाएं' },
  daily_doses_label: { en: 'Daily doses', hi: 'दैनिक खुराक' },
  on_time_label: { en: '% on time', hi: '% समय पर' },
  appointments_count_label: { en: 'Appointments', hi: 'जांच / मुलाकातें' },
  tasks_remaining_suffix: { en: 'self-care tasks remaining for today.', hi: 'कार्य आज शेष हैं।' },
  tasks_completed_suffix: { en: 'scheduled self-care tasks completed', hi: 'स्वास्थ्य कार्य पूर्ण हुए' },
  chronic_companion_badge: { en: 'Self-Care Chronic Companion', hi: 'दीर्घकालिक स्व-देखभाल साथी' },
  adherence_tracker_tag: { en: 'Adherence Tracker', hi: 'दवा नियमितता ट्रैकर' },
  today_badge: { en: 'Today', hi: 'आज' },

  // Time slots
  slot_morning: { en: 'Morning', hi: 'सुबह (प्रातः)' },
  slot_afternoon: { en: 'Afternoon', hi: 'दोपहर' },
  slot_evening: { en: 'Evening', hi: 'शाम (सायं)' },
  slot_night: { en: 'Night / Bedtime', hi: 'रात (सोने से पहले)' },

  // Meal timing instructions
  meal_after_food: { en: 'After food / meals', hi: 'भोजन / नाश्ते के बाद' },
  meal_before_food: { en: 'Before food', hi: 'भोजन से पहले' },
  meal_with_food: { en: 'With food', hi: 'भोजन के साथ' },
  meal_empty_stomach: { en: 'On empty stomach', hi: 'खाली पेट' },
  meal_anytime: { en: 'Any time with water', hi: 'पानी के साथ कभी भी' },

  // Frequencies
  freq_od: { en: 'Once daily (OD)', hi: 'दिन में एक बार (OD)' },
  freq_bid: { en: 'Twice daily (BID)', hi: 'दिन में दो बार (BID)' },
  freq_tid: { en: 'Three times daily (TID)', hi: 'दिन में तीन बार (TID)' },
  freq_prn: { en: 'As needed (SOS / PRN)', hi: 'आवश्यकतानुसार (SOS)' },
  freq_weekly: { en: 'Weekly', hi: 'साप्ताहिक' },

  // Clinical Safety Boundary
  disclaimer_clinical_text: {
    en: 'Important Clinical Boundary: This tracker is exclusively designed for recording and organizing medications prescribed by your licensed doctor. It does NOT prescribe, alter dosages, or recommend stopping/starting medicines. Consult your physician or pharmacist for medical advice.',
    hi: 'महत्वपूर्ण चिकित्सकीय सूचना: यह ट्रैकर केवल आपके डॉक्टर द्वारा लिखी गई दवाइयों को व्यवस्थित करने के लिए है। यह कोई दवा निर्धारित नहीं करता और न ही खुराक बदलने की सलाह देता है। किसी भी बदलाव के लिए अपने डॉक्टर से परामर्श लें।',
  },
  clinical_boundary_title: {
    en: 'Important Clinical Boundary',
    hi: 'महत्वपूर्ण चिकित्सकीय सीमा',
  },

  // Reminder Types
  rem_type_medicine: { en: 'Medicine', hi: 'दवा खुराक' },
  rem_type_doctor: { en: 'Doctor Appointment', hi: 'डॉक्टर से मुलाकात' },
  rem_type_checkup: { en: 'Check-up', hi: 'स्वास्थ्य जांच' },
  rem_type_blood_test: { en: 'Blood Test / Lab', hi: 'रक्त परीक्षण / लैब जांच' },
  rem_type_refill: { en: 'Prescription Refill', hi: 'दवा पुनः खरीद (रिफिल)' },
  rem_type_custom: { en: 'Custom Self-Care', hi: 'अन्य स्वास्थ्य कार्य' },

  // Repeat schedules
  repeat_daily: { en: 'Daily', hi: 'प्रतिदिन' },
  repeat_once: { en: 'Once only', hi: 'एक बार' },
  repeat_weekly: { en: 'Weekly', hi: 'साप्ताहिक' },
  repeat_monthly: { en: 'Monthly', hi: 'मासिक' },

  // Upload card & Simplifiers
  upload_prescription_heading: {
    en: 'Upload Prescription or Enter Medicine Details',
    hi: 'पर्चे की फोटो अपलोड करें या दवा का नाम लिखें',
  },
  upload_prescription_sub: {
    en: 'Supports photos (JPG/PNG), doctor slips, clinic printouts, or typed instructions',
    hi: 'डॉक्टर की पर्ची (JPG/PNG/PDF) या लिखी हुई दवाइयों का समर्थन करता है',
  },
  upload_drop_prompt: {
    en: 'Upload Prescription Image or PDF',
    hi: 'पर्चे की फोटो (JPG/PNG) या PDF यहाँ अपलोड करें',
  },
  paste_prescription_prompt: {
    en: "Or Paste Prescription Text / Doctor's Notes",
    hi: 'या डॉक्टर द्वारा लिखे गए निर्देश यहाँ पेस्ट करें',
  },
  upload_report_heading: {
    en: 'Upload Report File or Paste Lab Results',
    hi: 'लैब रिपोर्ट की फाइल अपलोड करें या टेस्ट वैल्यू लिखें',
  },
  upload_report_sub: {
    en: 'Supports Blood tests, Lipid panels, Kidney/Liver panels, CBC, Thyroid profiles (PDF, JPG, PNG)',
    hi: 'ब्लड शुगर, लिपिड, किडनी/लिवर प्रोफाइल, थायरॉइड रिपोर्ट का समर्थन करता है',
  },
  upload_report_drop_prompt: {
    en: 'Upload Report File (PDF / Image)',
    hi: 'लैब रिपोर्ट फाइल (PDF / फोटो) यहाँ अपलोड करें',
  },
  paste_report_prompt: {
    en: 'Or Paste Lab Report Text',
    hi: 'या लैब रिपोर्ट के टेस्ट परिणाम यहाँ लिखें',
  },

  // Sections
  tests_extracted_title: {
    en: 'Test Values & Simple Explanations',
    hi: 'परीक्षण परिणाम एवं सरल व्याख्या',
  },
  important_findings_title: {
    en: 'Important Findings',
    hi: 'महत्वपूर्ण मुख्य निष्कर्ष',
  },
  terms_explained_title: {
    en: 'Medical Terms Explained',
    hi: 'चिकित्सीय शब्दों की सरल परिभाषा',
  },
  questions_for_doctor_title: {
    en: 'Questions to Ask Your Doctor at Your Next Visit',
    hi: 'अगली मुलाकात में डॉक्टर से पूछने के लिए अनुशंसित प्रश्न',
  },
  medications_explained_title: {
    en: 'Prescribed Medicines Explained',
    hi: 'निर्धारित दवाइयों की विस्तृत जानकारी',
  },
  regimen_overview: {
    en: 'Regimen Overview',
    hi: 'दवा नियम का संपूर्ण सारांश',
  },
  chronic_principles: {
    en: 'Chronic Self-Care Principles',
    hi: 'दीर्घकालिक स्व-देखभाल के महत्वपूर्ण नियम',
  },

  // Patient Profile
  profile_title: { en: 'Patient Profile', hi: 'रोगी प्रोफ़ाइल' },
  profile_conditions: { en: 'Active Health Conditions', hi: 'सक्रिय स्वास्थ्य स्थितियां' },
  profile_goal: { en: 'Personal Self-Care Goal', hi: 'व्यक्तिगत स्वास्थ्य लक्ष्य' },
  full_name: { en: 'Full Name', hi: 'पूरा नाम' },
  age_label: { en: 'Age', hi: 'उम्र' },
  gender_label: { en: 'Gender', hi: 'लिंग' },
  male: { en: 'Male', hi: 'पुरुष' },
  female: { en: 'Female', hi: 'महिला' },
  other_gender: { en: 'Other', hi: 'अन्य' },

  // Assistant
  assistant_banner_title: {
    en: 'Ask Questions About Your Health & Medicines',
    hi: 'अपनी सेहत व दवाइयों से जुड़े कोई भी सवाल पूछें',
  },
  assistant_banner_sub: {
    en: 'Get clear, jargon-free explanations for chronic conditions, lab values, and medicine routines. Supports Hindi translation and Read Aloud.',
    hi: 'दीर्घकालिक बीमारियों, टेस्ट रिपोर्ट और दवाइयों की सरल भाषा में जानकारी प्राप्त करें। बोलकर सुनने की सुविधा उपलब्ध है।',
  },
  suggested_questions: {
    en: 'Suggested Questions for Chronic Patients:',
    hi: 'रोगियों द्वारा अक्सर पूछे जाने वाले उपयोगी प्रश्न:',
  },
  assistant_input_placeholder: {
    en: 'Ask about medications, test results, doctor questions...',
    hi: 'दवा, टेस्ट परिणाम, या डॉक्टर से क्या पूछें, यहाँ लिखें...',
  },
  btn_send: { en: 'Send', hi: 'भेजें' },

  // Subscription / Premium
  premium_modal_title: { en: 'HealthLens Premium Models & Access', hi: 'हेल्थलेन्स प्रीमियम मॉडल एवं एक्सेस' },
  premium_modal_sub: {
    en: 'Choose flexible Single-Day access for clinic visits or Monthly Chronic Care subscription.',
    hi: 'अस्पताल जाने के लिए 1-दिन का पास चुनें या मासिक क्रोनिक केयर सब्सक्रिप्शन लें।',
  },
  plan_free_name: { en: 'Free Chronic Plan', hi: 'निःशुल्क बुनियादी प्लान' },
  plan_day_name: { en: 'Single Day Pass (24-Hours)', hi: '1-दिन का पास (दैनिक एक्सेस)' },
  plan_month_name: { en: 'Monthly Chronic Care', hi: 'मासिक क्रोनिक केयर सब्सक्रिप्शन' },
  plan_day_badge: { en: 'Perfect for Doctor Visits Today', hi: 'आज डॉक्टर से मिलने के लिए सर्वोत्तम' },
  plan_month_badge: { en: 'Best Value for Long-term Patients', hi: 'दीर्घकालिक रोगियों के लिए सर्वोत्तम' },
  plan_active_btn: { en: 'Active Plan', hi: 'वर्तमान सक्रिय प्लान' },
  plan_select_btn: { en: 'Select Plan', hi: 'यह प्लान चुनें' },
  plan_subscribed_toast: { en: 'Subscription Activated Successfully!', hi: 'सब्सक्रिप्शन सफलतापूर्वक सक्रिय हो गया!' },
  model_selection_title: { en: 'Select Active AI Medical Model', hi: 'सक्रिय AI मेडिकल मॉडल चुनें' },
  model_flash_desc: { en: 'Fast Clinical Model. Fast, lightweight analysis for daily self-care.', hi: 'फास्ट क्लिनिकल मॉडल। दैनिक स्व-देखभाल के लिए त्वरित विश्लेषण।' },
  model_pro_desc: { en: 'Deep Clinical Reasoning & Vision. Decodes complex handwritten scripts, drug interactions & rich lab correlation.', hi: 'गहन क्लिनिकल रीज़निंग एवं विज़न। कठिन लिखावट वाले पर्चे व दवाओं के दुष्प्रभाव समझता है।' },
  model_multilingual_desc: { en: 'Native Hindi Medical Engine. Fluent clinical Hindi explanations without medical translation loss.', hi: 'शुद्ध हिन्दी क्लिनिकल इंजन। बिना किसी त्रुटि के शुद्ध हिन्दी में डॉक्टरी सलाह समझें।' },

  // Table & Form Labels
  table_col_name: { en: 'Medicine Name', hi: 'दवा का नाम' },
  table_col_dosage: { en: 'Dosage & Frequency', hi: 'खुराक एवं बारंबारता' },
  table_col_timing: { en: 'Timing & Food Instruction', hi: 'समय एवं भोजन निर्देश' },
  table_col_doctor_note: { en: "Doctor's Note", hi: 'डॉक्टर का निर्देश' },
  table_col_status: { en: 'Status', hi: 'स्थिति' },
  table_col_actions: { en: 'Actions', hi: 'क्रियाएं' },
  test_name_col: { en: 'Test Name', hi: 'परीक्षण का नाम' },
  test_result_col: { en: 'Result', hi: 'परिणाम' },
  test_ref_col: { en: 'Reference Range', hi: 'सामान्य संदर्भ सीमा' },
  test_explanation_col: { en: 'Simple Explanation', hi: 'सरल व्याख्या' },
  status_normal: { en: 'Normal', hi: 'सामान्य' },
  status_high: { en: 'High', hi: 'उच्च (बढ़ा हुआ)' },
  status_low: { en: 'Low', hi: 'निम्न (कम)' },
  status_borderline: { en: 'Borderline', hi: 'सीमा रेखा पर' },
  status_abnormal: { en: 'Abnormal', hi: 'असामान्य' },
  unclear_warning_text: {
    en: 'Please confirm this information with your doctor or pharmacist.',
    hi: 'कृपया इस जानकारी की पुष्टि अपने डॉक्टर या फार्मासिस्ट से करें।',
  },
  filter_all: { en: 'All', hi: 'सभी' },
  filter_active: { en: 'Active Only', hi: 'केवल सक्रिय' },
  filter_paused: { en: 'Paused / Completed', hi: 'रोकी गई / पूर्ण' },
  start_date_label: { en: 'Start Date', hi: 'शुरू करने की तिथि' },
  end_date_label: { en: 'End Date / Duration', hi: 'समाप्ति तिथि / अवधि' },
  reminder_alerts_label: { en: 'Reminder Alerts', hi: 'अलर्ट अनुस्मारक' },
  enabled_label: { en: 'Enabled', hi: 'चालू है' },
  disabled_label: { en: 'Disabled', hi: 'बंद है' },

  // Reminders Manager
  reminders_page_title: { en: 'Health & Medication Reminders', hi: 'स्वास्थ्य एवं दवा अनुस्मारक' },
  reminders_page_sub: {
    en: 'Never miss a dose, doctor appointment, lab test, or prescription refill. Set timely audio chimes and notifications.',
    hi: 'दवा की खुराक, डॉक्टर से मुलाकात, लैब टेस्ट या रिफिल कभी न भूलें। समय पर अलार्म और अलर्ट प्राप्त करें।',
  },
  new_reminder_heading: { en: 'Create New Health Reminder', hi: 'नया स्वास्थ्य अनुस्मारक जोड़ें' },
  edit_reminder_heading: { en: 'Edit Health Reminder', hi: 'स्वास्थ्य अनुस्मारक संपादित करें' },
  reminder_title_label: { en: 'Reminder Title', hi: 'अनुस्मारक का नाम' },
  reminder_type_label: { en: 'Category / Type', hi: 'श्रेणी / प्रकार' },
  reminder_date_label: { en: 'Date', hi: 'तारीख' },
  reminder_time_label: { en: 'Time', hi: 'समय' },
  reminder_repeat_label: { en: 'Repeat Schedule', hi: 'दोहराव (Repeat)' },
  reminder_notes_label: { en: 'Notes & Instructions', hi: 'निर्देश व सावधानियां' },
  reminder_audio_chime: { en: 'Notification Chime Alert Enabled', hi: 'ध्वनि अलर्ट सूचना चालू है' },

  // Medical History
  history_page_title: { en: 'Medical Report & Prescription History', hi: 'चिकित्सा रिपोर्ट एवं पर्चा इतिहास' },
  history_page_sub: {
    en: 'Securely saved prescriptions, blood reports, and AI explanations on your local device. Open anytime, even during doctor visits.',
    hi: 'आपके सभी पर्चे, ब्लड रिपोर्ट और AI व्याख्याएं आपके डिवाइस पर सुरक्षित हैं। डॉक्टर से मिलने के समय कभी भी खोलें।',
  },
  search_history_placeholder: { en: 'Search past reports, prescriptions, or dates...', hi: 'पुराने पर्चे, टेस्ट रिपोर्ट या तारीख खोजें...' },
  filter_all_records: { en: 'All Records', hi: 'सभी रिकॉर्ड' },
  filter_prescriptions_only: { en: 'Prescriptions', hi: 'डॉक्टर पर्चे' },
  filter_reports_only: { en: 'Lab Reports', hi: 'लैब रिपोर्ट' },
  no_history_records: { en: 'No medical records saved in history yet.', hi: 'अभी तक कोई चिकित्सा रिकॉर्ड सहेजा नहीं गया है।' },
  clear_all_history_btn: { en: 'Clear History', hi: 'इतिहास साफ़ करें' },
  details_modal_title: { en: 'Saved Document Details', hi: 'सहेजे गए दस्तावेज़ का विवरण' },

  // Self-Care Insights
  insights_page_title: { en: 'Chronic Self-Care & Medical Guide', hi: 'दीर्घकालिक स्व-देखभाल एवं मेडिकल गाइड' },
  insights_page_sub: {
    en: 'Plain-language, evidence-backed self-care principles for managing diabetes, high blood pressure, cholesterol, and kidney health.',
    hi: 'मधुमेह, उच्च रक्तचाप, कोलेस्ट्रॉल और गुर्दे की देखभाल के लिए सरल और प्रामाणिक स्वास्थ्य मार्गदर्शन।',
  },
};

// Rich Medical Terms & Condition Translation Dictionary
export const MEDICAL_DICTIONARY_HI: Record<string, string> = {
  // Conditions
  'Type 2 Diabetes': 'टाइप 2 मधुमेह (डायबिटीज)',
  'Hypertension': 'उच्च रक्तचाप (हाई ब्लड प्रेशर)',
  'Dyslipidemia': 'कोलेस्ट्रॉल असंतुलन (डिस्लिपिडेमिया)',
  'Asthma': 'अस्थमा (दमा)',
  'Chronic Kidney Disease': 'दीर्घकालिक गुर्दा रोग (CKD)',
  'Heart Disease': 'हृदय रोग (हार्ट प्रॉब्लम)',
  'Thyroid Disorder': 'थायरॉइड विकार',
  'Hypothyroidism': 'हाइपोथायरायडिज्म (सुस्त थायरॉइड)',
  'Hyperthyroidism': 'हाइपरथायरायडिज्म (अतिसक्रिय थायरॉइड)',

  // Common Medicines
  'Metformin': 'मेटफॉर्मिन',
  'Metformin Hydrochloride': 'मेटफॉर्मिन हाइड्रोक्लोराइड',
  'Telmisartan': 'टेल्मीसार्टन',
  'Atorvastatin': 'एटोर्वास्टेटिन',
  'Glimepiride': 'ग्लिमेपिराइड',
  'Amlodipine': 'एम्लोडिपिन',
  'Losartan': 'लोसार्टन',
  'Levothyroxine': 'लेवोथायरोक्सिन',
  'Aspirin': 'एस्पिरिन',
  'Insulin': 'इंसुलिन',
  'Rosuvastatin': 'रोसुवास्टेटिन',
  'Pantoprazole': 'पैंटोप्राजोल',

  // Tests
  'HbA1c (Glycated Hemoglobin)': 'एचबीए1सी (HbA1c - 3 माह की औसत शुगर)',
  'HbA1c': 'एचबीए1सी (3 महीने की औसत शुगर)',
  'Fasting Blood Glucose': 'फास्टिंग ब्लड ग्लूकोज (खाली पेट शुगर)',
  'Postprandial Blood Glucose': 'भोजन के 2 घंटे बाद ब्लड शुगर (PPBS)',
  'Serum Creatinine': 'सीरम क्रिएटिनिन (गुर्दा अपशिष्ट स्तर)',
  'eGFR (Estimated GFR)': 'ईजीएफआर (किडनी कार्यक्षमता दर)',
  'eGFR': 'ईजीएफआर (किडनी दर)',
  'Blood Pressure': 'रक्तचाप (ब्लड प्रेशर)',
  'Total Cholesterol': 'कुल कोलेस्ट्रॉल',
  'Triglycerides': 'ट्राइग्लिसराइड्स (रक्त में वसा)',
  'LDL Cholesterol': 'एलडीएल (खराब कोलेस्ट्रॉल)',
  'HDL Cholesterol': 'एचडीएल (अच्छा कोलेस्ट्रॉल)',
  'Urine Albumin': 'मूत्र एल्ब्यूमिन (माइक्रोएल्ब्यूमिन्यूरिया)',
  'TSH (Thyroid Stimulating Hormone)': 'टीएसएच (थायरॉइड हार्मोन)',

  // Meal instructions
  'after_food': 'भोजन / नाश्ते के बाद',
  'before_food': 'भोजन से पहले',
  'with_food': 'भोजन के साथ',
  'empty_stomach': 'खाली पेट',
  'anytime': 'पानी के साथ कभी भी',
  'After breakfast': 'सुबह नाश्ते के बाद',
  'After dinner': 'रात के भोजन के बाद',
  'After breakfast and after dinner': 'सुबह नाश्ते के बाद एवं रात के खाने के बाद',
  'Morning after breakfast': 'सुबह नाश्ते के बाद',
  'At bedtime with a glass of water': 'रात को सोने से पहले पानी के साथ',
  'Take with or immediately after food to avoid gastric irritation. Stay well hydrated.':
    'पेट की परेशानी से बचने के लिए भोजन के तुरंत बाद लें। पर्याप्त पानी पिएं।',
  'Keep taking consistently every morning to maintain 24-hour arterial pressure control.':
    '24 घंटे रक्तचाप सामान्य रखने के लिए रोजाना सुबह एक ही समय पर लें।',
  'Taken at night when cholesterol synthesis in the liver is highest.':
    'रात को सोने से पहले लें जब शरीर में कोलेस्ट्रॉल अधिक बनता है।',

  // Frequencies
  'Twice daily (BID)': 'दिन में दो बार (BID)',
  'Once daily (OD)': 'दिन में एक बार (OD)',
  'Three times daily (TID)': 'दिन में तीन बार (TID)',
  'As needed (SOS / PRN)': 'आवश्यकतानुसार (SOS)',
  'Once daily (QHS)': 'रात को सोने से पहले (QHS)',
  'Ongoing': 'निरंतर (जारी रखें)',
  'Active': 'सक्रिय',
  'Paused': 'रोकी गई',
  'Completed': 'पूर्ण',

  // Statuses
  'taken': 'ले ली गई',
  'pending': 'बाकी है',
  'skipped': 'छोड़ दी गई',
  'normal': 'सामान्य',
  'high': 'उच्च (बढ़ा हुआ)',
  'low': 'निम्न (कम)',
  'borderline': 'सीमा पर',
  'abnormal': 'असामान्य',

  // Days & Months
  'Monday': 'सोमवार',
  'Tuesday': 'मंगलवार',
  'Wednesday': 'बुधवार',
  'Thursday': 'गुरुवार',
  'Friday': 'शुक्रवार',
  'Saturday': 'शनिवार',
  'Sunday': 'रविवार',
};

// Hindi translations for sample chronic medications
export const TRANSLATED_MEDICATIONS_HI: Record<string, { name: string; note: string; timing: string }> = {
  'med-1': {
    name: 'मेटफॉर्मिन हाइड्रोक्लोराइड (Metformin 500mg)',
    note: 'पेट की परेशानी से बचने के लिए हमेशा भोजन के बाद लें। भरपूर पानी पिएं।',
    timing: 'सुबह नाश्ते के बाद और रात को खाने के बाद',
  },
  'med-2': {
    name: 'टेल्मीसार्टन (Telmisartan 40mg)',
    note: '24 घंटे रक्तचाप नियंत्रण के लिए रोजाना सुबह एक ही समय पर लें।',
    timing: 'सुबह नाश्ते के बाद',
  },
  'med-3': {
    name: 'एटोर्वास्टेटिन (Atorvastatin 10mg)',
    note: 'रात को सोने से पहले लें जब शरीर में कोलेस्ट्रॉल का निर्माण अधिक होता है।',
    timing: 'रात को सोने से पहले पानी के साथ',
  },
};

// Hindi translations for sample reminders
export const TRANSLATED_REMINDERS_HI: Record<string, { title: string; notes: string }> = {
  'rem-1': {
    title: 'सुबह की दवाइयां (मेटफॉर्मिन 500mg एवं टेल्मीसार्टन 40mg)',
    notes: 'नाश्ते के तुरंत बाद एक गिलास पानी के साथ लें।',
  },
  'rem-2': {
    title: 'रात की दवाइयां (मेटफॉर्मिन 500mg एवं एटोर्वास्टेटिन 10mg)',
    notes: 'रात के भोजन के बाद पानी के साथ लें।',
  },
  'rem-3': {
    title: 'डॉ. अनिता राव से फॉलो-अप मुलाकात (शुगर व किडनी जांच)',
    notes: 'हेल्थलेन्स की दवा सूची और हालिया HbA1c रिपोर्ट साथ ले जाएं।',
  },
  'rem-4': {
    title: 'दवा पुनः खरीद (रिफिल): टेल्मीसार्टन व मेटफॉर्मिन',
    notes: 'दवा खत्म होने से 7 दिन पहले फार्मेसी से खरीदें।',
  },
  'rem-5': {
    title: 'खाली पेट रक्त शर्करा (Fasting Sugar) ग्लूकोमीटर जांच',
    notes: 'नाश्ते से पहले जांच कर हेल्थलेन्स में दर्ज करें।',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  tr: (text: string) => string;
  translateDynamicText: (text: string) => Promise<string>;
  translateBatchStrings: (items: string[]) => Promise<string[]>;
  translateMedicationItem: (med: MedicationItem) => MedicationItem;
  translateReminderItem: (rem: HealthReminder) => HealthReminder;
  translateCondition: (cond: string) => string;
  translateSlot: (slot: string) => string;
  translateMealRelation: (meal: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === 'hi' || saved === 'en') return saved;
    }
    return 'en';
  });

  const [dynamicCache, setDynamicCache] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(DYNAMIC_CACHE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return {};
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, lang);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  // Lookup translated string from static dictionary
  const t = (key: string, fallback?: string): string => {
    const entry = UI_TRANSLATIONS[key];
    if (entry) {
      return entry[language] || entry.en;
    }
    if (language === 'hi') {
      if (MEDICAL_DICTIONARY_HI[key]) return MEDICAL_DICTIONARY_HI[key];
      if (dynamicCache[key]) return dynamicCache[key];
    }
    return fallback || key;
  };

  // Smart translator for any phrase, clinical label, or symptom
  const tr = (text: string): string => {
    if (!text) return '';
    if (language === 'en') return text;
    // 1. Check exact UI keys
    if (UI_TRANSLATIONS[text]) return UI_TRANSLATIONS[text].hi;
    // 2. Check medical dictionary
    if (MEDICAL_DICTIONARY_HI[text]) return MEDICAL_DICTIONARY_HI[text];
    // 3. Check dynamic cache
    if (dynamicCache[text]) return dynamicCache[text];

    // Check partial matches for conditions
    for (const [key, val] of Object.entries(MEDICAL_DICTIONARY_HI)) {
      if (text.toLowerCase() === key.toLowerCase()) return val;
    }

    return text;
  };

  const translateCondition = (cond: string): string => {
    if (language !== 'hi') return cond;
    return MEDICAL_DICTIONARY_HI[cond] || cond;
  };

  const translateSlot = (slot: string): string => {
    if (language !== 'hi') {
      return slot.charAt(0).toUpperCase() + slot.slice(1);
    }
    const map: Record<string, string> = {
      morning: 'सुबह (प्रातः)',
      afternoon: 'दोपहर',
      evening: 'शाम (सायं)',
      night: 'रात (सोने से पहले)',
    };
    return map[slot] || slot;
  };

  const translateMealRelation = (meal: string): string => {
    if (language !== 'hi') {
      const mapEn: Record<string, string> = {
        after_food: 'After food',
        before_food: 'Before food',
        with_food: 'With food',
        empty_stomach: 'Empty stomach',
        anytime: 'Anytime with water',
      };
      return mapEn[meal] || meal;
    }
    const mapHi: Record<string, string> = {
      after_food: 'भोजन / नाश्ते के बाद',
      before_food: 'भोजन से पहले',
      with_food: 'भोजन के साथ',
      empty_stomach: 'खाली पेट',
      anytime: 'पानी के साथ कभी भी',
    };
    return mapHi[meal] || meal;
  };

  // Helper to translate a medication object into Hindi view
  const translateMedicationItem = (med: MedicationItem): MedicationItem => {
    if (language !== 'hi') return med;
    const hiOverride = TRANSLATED_MEDICATIONS_HI[med.id];
    if (hiOverride) {
      return {
        ...med,
        name: hiOverride.name,
        doctorNote: hiOverride.note,
        timingDescription: hiOverride.timing,
        frequency: tr(med.frequency),
        conditionTag: med.conditionTag ? translateCondition(med.conditionTag) : undefined,
      };
    }
    // Dynamic dictionary fallback
    return {
      ...med,
      name: tr(med.name),
      doctorNote: med.doctorNote ? tr(med.doctorNote) : undefined,
      timingDescription: tr(med.timingDescription),
      frequency: tr(med.frequency),
      conditionTag: med.conditionTag ? translateCondition(med.conditionTag) : undefined,
    };
  };

  // Helper to translate a reminder object into Hindi view
  const translateReminderItem = (rem: HealthReminder): HealthReminder => {
    if (language !== 'hi') return rem;
    const hiOverride = TRANSLATED_REMINDERS_HI[rem.id];
    if (hiOverride) {
      return {
        ...rem,
        title: hiOverride.title,
        notes: hiOverride.notes,
        repeat: tr(rem.repeat) as any,
      };
    }
    return {
      ...rem,
      title: tr(rem.title),
      notes: rem.notes ? tr(rem.notes) : undefined,
    };
  };

  const translateDynamicText = async (text: string): Promise<string> => {
    if (!text || language === 'en') return text;
    if (dynamicCache[text]) return dynamicCache[text];
    if (MEDICAL_DICTIONARY_HI[text]) return MEDICAL_DICTIONARY_HI[text];

    try {
      const res = await fetch('/api/translate-hindi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: 'Dynamic UI or Medication content' }),
      });
      const data = await res.json();
      const hindi = data.data?.hindiTranslation || text;

      const newCache = { ...dynamicCache, [text]: hindi };
      setDynamicCache(newCache);
      localStorage.setItem(DYNAMIC_CACHE_KEY, JSON.stringify(newCache));
      return hindi;
    } catch {
      return text;
    }
  };

  const translateBatchStrings = async (items: string[]): Promise<string[]> => {
    if (!items || items.length === 0 || language === 'en') return items;

    const missingItems = items.filter((item) => !dynamicCache[item] && !MEDICAL_DICTIONARY_HI[item]);
    if (missingItems.length === 0) {
      return items.map((item) => dynamicCache[item] || MEDICAL_DICTIONARY_HI[item] || item);
    }

    try {
      const res = await fetch('/api/translate-dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: missingItems }),
      });
      const data = await res.json();
      const translations: string[] = Array.isArray(data.data) ? data.data : missingItems;

      const updatedCache = { ...dynamicCache };
      missingItems.forEach((orig, idx) => {
        updatedCache[orig] = translations[idx] || orig;
      });

      setDynamicCache(updatedCache);
      localStorage.setItem(DYNAMIC_CACHE_KEY, JSON.stringify(updatedCache));

      return items.map((item) => updatedCache[item] || MEDICAL_DICTIONARY_HI[item] || item);
    } catch {
      return items;
    }
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tr,
        translateDynamicText,
        translateBatchStrings,
        translateMedicationItem,
        translateReminderItem,
        translateCondition,
        translateSlot,
        translateMealRelation,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
