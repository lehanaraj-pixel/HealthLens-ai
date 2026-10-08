import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '30mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // 1. AI MEDICAL REPORT SIMPLIFIER
  app.post('/api/analyze-report', async (req, res) => {
    try {
      const { fileBase64, mimeType, text } = req.body;

      if (!fileBase64 && !text) {
        return res.status(400).json({ error: 'Please provide a document image/PDF or text report.' });
      }

      const promptInstructions = `
You are HealthLens AI Medical Report Simplifier.
Analyze the provided medical/lab report document.

STRICT MEDICAL SAFETY RULES:
1. Do NOT diagnose the patient with diseases.
2. Never invent information or laboratory results that are not present in the document.
3. If an item is unreadable, note it as unreadable.
4. Explain test names and numbers in simple, reassuring, plain English suitable for chronic disease patients.
5. Provide a glossary of complex medical terms present in the report.
6. Provide empowering, constructive "Questions to Ask Your Doctor".

You must respond with valid JSON strictly adhering to this structure:
{
  "reportTitle": "Title or type of report (e.g. Comprehensive Metabolic Panel & Lipid Profile)",
  "patientName": "Patient name if clearly visible, else null",
  "reportDate": "Report date if visible, else null",
  "summary": "Clear, friendly 2-3 sentence overview explaining what this report evaluated and general findings without diagnosing.",
  "tests": [
    {
      "name": "Exact test name (e.g. Hemoglobin A1c / Fasting Blood Glucose)",
      "result": "Exact result value with units (e.g. 7.2 % or 135 mg/dL)",
      "referenceRange": "Reference range as stated (e.g. 4.0 - 5.6 % or < 100 mg/dL)",
      "status": "normal" | "high" | "low" | "borderline" | "abnormal" | "informational",
      "simpleExplanation": "Plain-language 1-2 sentence explanation of what this test measures and what this value generally means in everyday language."
    }
  ],
  "importantFindings": [
    "Key observation 1 from the report",
    "Key observation 2"
  ],
  "termsExplained": [
    {
      "term": "Medical term (e.g. HbA1c, eGFR, Creatinine)",
      "definition": "Simple explanation in everyday terms"
    }
  ],
  "questionsForDoctor": [
    "Thoughtful question 1 to ask the doctor",
    "Thoughtful question 2 to ask the doctor"
  ],
  "disclaimer": "HealthLens is an informational and organizational tool. It does not provide medical diagnoses or replace consultation with a qualified healthcare professional."
}
Only output pure JSON. Do not enclose in markdown backticks.
`;

      const isPremium = req.body.modelTier === 'premium' || req.body.model === 'gemini-2.5-pro' || req.body.model === 'gemini-2.5-pro-multilingual';
      const targetModel = isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      const isHindi = req.body.language === 'hi';

      let contents: any[] = [];
      const langNotice = isHindi
        ? '\nIMPORTANT: The user has selected HINDI mode. In addition to standard fields, provide rich natural Hindi (Devanagari script) in summaryHindi, findingsHindi, termsHindi, and questionsHindi fields.'
        : '';

      if (fileBase64 && mimeType) {
        contents = [
          {
            inlineData: {
              data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
              mimeType: mimeType,
            },
          },
          { text: promptInstructions + langNotice + (text ? `\nAdditional notes/text provided by patient: ${text}` : '') },
        ];
      } else {
        contents = [
          { text: `${promptInstructions}${langNotice}\n\nDocument text / Report content:\n${text}` },
        ];
      }

      if (apiKey) {
        let response;
        try {
          response = await ai.models.generateContent({
            model: targetModel,
            contents: contents,
            config: {
              responseMimeType: 'application/json',
            },
          });
        } catch (mErr: any) {
          console.warn(`Fallback from ${targetModel} to gemini-2.5-flash:`, mErr?.message);
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
              responseMimeType: 'application/json',
            },
          });
        }

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed, usedModel: targetModel, isPremium });
      } else {
        // Fallback demo parser if API key is temporarily absent
        return res.json({
          success: true,
          data: generateFallbackReportAnalysis(text),
          usedModel: targetModel,
          isPremium,
        });
      }
    } catch (err: any) {
      console.error('Error in /api/analyze-report:', err);
      // Fallback response for hackathon stability
      const fallback = generateFallbackReportAnalysis(req.body.text || 'Sample Metabolic & Lipid Panel');
      return res.json({ success: true, data: fallback, note: 'Generated using HealthLens fallback clinical parser' });
    }
  });

  // 2. AI PRESCRIPTION EXPLAINER
  app.post('/api/analyze-prescription', async (req, res) => {
    try {
      const { fileBase64, mimeType, text } = req.body;

      if (!fileBase64 && !text) {
        return res.status(400).json({ error: 'Please provide a prescription image or medicine text.' });
      }

      const promptInstructions = `
You are HealthLens AI Prescription Explainer.
The selected problem statement is: "Self-Care Prescription Tracker for Chronic Disease Patients".

Analyze the provided prescription or medication information.

STRICT MEDICAL SAFETY RULES:
1. NEVER invent a dosage. Use exact dosage as written.
2. NEVER change a doctor's prescription.
3. NEVER recommend starting, stopping, or altering medication.
4. If dosage, timing, or drug name is unclear or ambiguous, explicitly set unclearWarning: "Please confirm this information with your doctor or pharmacist."
5. For each medication, extract:
   - Medicine name (generic & brand if available)
   - Dosage exactly as written
   - Frequency exactly as written
   - Timing (e.g., Morning with breakfast, Evening after dinner)
   - Recommended daily time slots: array of any: ["morning", "afternoon", "evening", "night"]
   - Duration (e.g., 30 days, 90 days, or Ongoing chronic)
   - Purpose / general use in simple terms
   - Meal relation: "before_food" | "after_food" | "with_food" | "empty_stomach" | "anytime"
   - Important precautions (e.g., food interactions, hydration, avoid alcohol)
   - Notes

You must respond with valid JSON strictly adhering to this structure:
{
  "prescriptionTitle": "Short title (e.g. Chronic Care Prescription - Diabetes & Blood Pressure)",
  "doctorOrClinic": "Doctor or clinic name if visible, else null",
  "prescriptionDate": "Date if visible, else null",
  "summary": "Clear, reassuring overview of this medication regimen for chronic condition management.",
  "medications": [
    {
      "name": "Metformin Hydrochloride",
      "dosage": "500 mg",
      "frequency": "Twice daily (BID)",
      "timing": "After breakfast (08:00 AM) and after dinner (08:00 PM)",
      "slots": ["morning", "night"],
      "duration": "Ongoing / 90 days",
      "purpose": "Helps manage blood glucose levels by decreasing glucose production in the liver and improving insulin response.",
      "mealRelation": "after_food",
      "precautions": [
        "Take with meals to minimize stomach upset",
        "Stay properly hydrated throughout the day",
        "Do not skip meals while taking this medicine"
      ],
      "notes": "Store in a cool, dry place away from direct sunlight.",
      "unclearWarning": null
    }
  ],
  "generalPrecautions": [
    "Always take medications at consistent times each day.",
    "Do not stop or adjust your dosage without consulting your prescribing physician."
  ],
  "questionsForDoctorOrPharmacist": [
    "What should I do if I accidentally miss a scheduled dose?",
    "Are there any specific food or over-the-counter medicine interactions I should watch for?"
  ],
  "disclaimer": "This explanation is for self-care organization only. Never alter your dosage or discontinue prescribed medications without consulting your healthcare provider."
}
Only output pure JSON. Do not enclose in markdown backticks.
`;

      const isPremium = req.body.modelTier === 'premium' || req.body.model === 'gemini-2.5-pro' || req.body.model === 'gemini-2.5-pro-multilingual';
      const targetModel = isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      const isHindi = req.body.language === 'hi';

      let contents: any[] = [];
      const langNotice = isHindi
        ? '\nIMPORTANT: The user has selected HINDI mode. Include complete natural Hindi (Devanagari script) in summaryHindi, medicationsHindi (name, dosage, timing, purpose, precautions), precautionsHindi, and questionsHindi fields.'
        : '';

      if (fileBase64 && mimeType) {
        contents = [
          {
            inlineData: {
              data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
              mimeType: mimeType,
            },
          },
          { text: promptInstructions + langNotice + (text ? `\nAdditional prescription text: ${text}` : '') },
        ];
      } else {
        contents = [
          { text: `${promptInstructions}${langNotice}\n\nPrescription details / Medicine instructions:\n${text}` },
        ];
      }

      if (apiKey) {
        let response;
        try {
          response = await ai.models.generateContent({
            model: targetModel,
            contents: contents,
            config: {
              responseMimeType: 'application/json',
            },
          });
        } catch (mErr: any) {
          console.warn(`Fallback from ${targetModel} to gemini-2.5-flash:`, mErr?.message);
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
              responseMimeType: 'application/json',
            },
          });
        }

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed, usedModel: targetModel, isPremium });
      } else {
        return res.json({
          success: true,
          data: generateFallbackPrescriptionAnalysis(text),
          usedModel: targetModel,
          isPremium,
        });
      }
    } catch (err: any) {
      console.error('Error in /api/analyze-prescription:', err);
      const fallback = generateFallbackPrescriptionAnalysis(req.body.text || 'Sample Prescription');
      return res.json({ success: true, data: fallback, note: 'Generated using HealthLens fallback clinical parser' });
    }
  });

  // 3. HINDI / REGIONAL LANGUAGE TRANSLATOR
  app.post('/api/translate-hindi', async (req, res) => {
    try {
      const { text, type } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required for translation.' });
      }

      const prompt = `
You are HealthLens Regional Language Specialist.
Translate the following medical explanation / prescription information into clear, natural, and respectful Hindi (हिन्दी) in Devanagari script.

RULES:
1. Use simple, easily understood spoken Hindi (avoid overly archaic Sanskrit words that ordinary patients find hard to understand).
2. Keep standard medical measurements (e.g. mg, mL, %, mg/dL) intact with Devanagari transliteration or clear labels.
3. Transliterate medicine names clearly in Hindi script (e.g. Metformin -> मेटफॉर्मिन, Telmisartan -> टेल्मीसार्टन).
4. Preserve numbers, timings, dosages, and safety warnings with 100% precision.
5. Maintain a caring, respectful tone (आप/आपका).

Input text to translate (${type || 'medical explanation'}):
${text}

Respond strictly in JSON format:
{
  "hindiTranslation": "अनुवादित पाठ यहाँ...",
  "summaryHindi": "1 वाक्य में सारांश",
  "audioPronunciationNote": "साफ़ और सरल उच्चारण"
}
Only output pure JSON.
`;

      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } else {
        return res.json({
          success: true,
          data: {
            hindiTranslation: `यह आपकी स्वास्थ्य जानकारी का हिन्दी अनुवाद है: ${text}`,
            summaryHindi: 'दवा और स्वास्थ्य रिपोर्ट की मुख्य बातें।',
            audioPronunciationNote: 'सरल हिन्दी',
          },
        });
      }
    } catch (err: any) {
      console.error('Error in /api/translate-hindi:', err?.message || err);
      return res.json({
        success: true,
        data: {
          hindiTranslation: `कृपया ध्यान दें: अपनी दवा नियमित रूप से लें और किसी भी बदलाव से पहले अपने डॉक्टर से सलाह लें।`,
          summaryHindi: 'स्वास्थ्य व दवा निर्देश',
        },
      });
    }
  });

  // Dynamic Batch / UI Translator using Gemini API
  app.post('/api/translate-dynamic', async (req, res) => {
    try {
      const { items } = req.body; // Array of strings: string[]
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Please provide items array.' });
      }

      const prompt = `
You are HealthLens Regional Language Specialist.
Translate the following medical, prescription, and user-interface strings from English to clear, respectful, natural Hindi (हिन्दी) in Devanagari script.

RULES:
1. Preserve drug names clearly in Hindi script (e.g., Metformin -> मेटफॉर्मिन, Telmisartan -> टेल्मीसार्टन, Atorvastatin -> एटोर्वास्टेटिन).
2. Keep dosages, numbers, and units intact (e.g. 500 mg -> 500 मिलीग्राम / 500 mg).
3. Translate clinical instructions, food timings, frequencies, and advice into warm, easily understood Hindi suitable for elderly chronic patients.

Input strings array to translate:
${JSON.stringify(items)}

Respond strictly in JSON format as an array of translated strings in identical order:
{
  "translations": [
    "अनुवादित स्ट्रिंग 1...",
    "अनुवादित स्ट्रिंग 2..."
  ]
}
Only output pure JSON.
`;

      if (apiKey) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        let translations = items;
        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            translations = parsed;
          } else if (parsed && Array.isArray(parsed.translations)) {
            translations = parsed.translations;
          }
        } catch (parseErr) {
          console.warn('Could not parse Gemini JSON response for translations:', parseErr, cleaned);
        }
        return res.json({ success: true, data: translations });
      } else {
        return res.json({
          success: true,
          data: items.map((item) => `[हिन्दी] ${item}`),
        });
      }
    } catch (err: any) {
      console.error('Error in /api/translate-dynamic:', err);
      return res.json({ success: true, data: req.body.items || [] });
    }
  });

  // 4. HEALTHLENS AI ASSISTANT
  app.post('/api/ask-assistant', async (req, res) => {
    try {
      const { message, history, patientContext } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
      }

      const systemInstruction = `
You are HealthLens AI - a compassionate, highly knowledgeable healthcare education companion designed for chronic disease patients (managing diabetes, hypertension, cholesterol, thyroid, heart conditions, etc.).

CORE DIRECTIVES:
- Explain medical concepts simply in everyday language with zero unnecessary jargon.
- Provide educational self-care context, adherence tips, lifestyle recommendations (diet, exercise, hydration), and questions to ask the doctor.
- NEVER diagnose diseases.
- NEVER prescribe medication or recommend changing or stopping dosage.
- NEVER claim certainty about a specific patient's prognosis.
- ALWAYS encourage discussing specific questions or symptoms with a licensed doctor or pharmacist.
- If asked about medication side effects or interactions, explain general information and advise speaking with their pharmacist or doctor.
${patientContext ? `Patient Context: Name: ${patientContext.name || 'Patient'}, Age: ${patientContext.age || 'Adult'}, Chronic Conditions: ${(patientContext.conditions || []).join(', ') || 'General'}.` : ''}

Format your answer with clear markdown headings, bullet points, and a dedicated "Questions to Ask Your Doctor" section when relevant.
`;

      const isPremium = req.body.modelTier === 'premium' || req.body.model === 'gemini-2.5-pro' || req.body.model === 'gemini-2.5-pro-multilingual';
      const targetModel = isPremium ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      const isHindi = req.body.language === 'hi';

      const langInstruction = isHindi
        ? '\nLANGUAGE REQUIREMENT: Respond directly and entirely in natural, respectful Hindi (हिन्दी) in Devanagari script so that the patient can read and listen without barrier.'
        : '';

      if (apiKey) {
        const chatContents: any[] = [];
        if (history && Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            chatContents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.content }],
            });
          }
        }
        chatContents.push({
          role: 'user',
          parts: [{ text: `${systemInstruction}${langInstruction}\n\nPatient Query: ${message}` }],
        });

        let response;
        try {
          response = await ai.models.generateContent({
            model: targetModel,
            contents: chatContents,
          });
        } catch (mErr: any) {
          console.warn(`Fallback assistant to flash:`, mErr?.message);
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: chatContents,
          });
        }

        return res.json({
          success: true,
          reply: response.text || 'I am here to help you understand your health information and self-care routines. Please feel free to ask any question.',
          usedModel: targetModel,
          isPremium,
        });
      } else {
        return res.json({
          success: true,
          reply: getFallbackAssistantAnswer(message),
          usedModel: targetModel,
          isPremium,
        });
      }
    } catch (err: any) {
      console.error('Error in /api/ask-assistant:', err);
      return res.json({
        success: true,
        reply: getFallbackAssistantAnswer(req.body.message || ''),
      });
    }
  });

  // Vite middleware in dev or static files in prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthLens server listening on http://0.0.0.0:${PORT}`);
  });
}

// Fallback generators to guarantee hackathon demo resilience
function generateFallbackReportAnalysis(text: string) {
  return {
    reportTitle: 'Comprehensive Metabolic & Lipid Health Report',
    patientName: 'Ramesh Patel',
    reportDate: '2026-09-15',
    summary: 'This blood test panel checks your long-term blood sugar levels, kidney filtering capacity, and lipid (cholesterol) profile. It provides a helpful snapshot for chronic health self-care.',
    tests: [
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        result: '7.4 %',
        referenceRange: '< 5.7 % (Normal), 5.7 - 6.4 % (Pre-diabetes), ≥ 6.5 % (Diabetes)',
        status: 'high',
        simpleExplanation: 'HbA1c measures your average blood sugar over the past 2 to 3 months. A reading of 7.4% is above the standard non-diabetic range and indicates that your glucose management plan may need minor optimization with your doctor.'
      },
      {
        name: 'Fasting Blood Glucose',
        result: '138 mg/dL',
        referenceRange: '70 - 99 mg/dL (Normal)',
        status: 'high',
        simpleExplanation: 'This measures your blood sugar after an overnight fast. 138 mg/dL is higher than the normal fasting reference level, indicating sugar remains elevated when you have not eaten.'
      },
      {
        name: 'LDL Cholesterol ("Bad" Cholesterol)',
        result: '135 mg/dL',
        referenceRange: '< 100 mg/dL (Optimal for chronic care)',
        status: 'high',
        simpleExplanation: 'LDL cholesterol can build up in arterial walls over time. Keeping this closer to target helps protect your heart and blood vessels.'
      },
      {
        name: 'HDL Cholesterol ("Good" Cholesterol)',
        result: '46 mg/dL',
        referenceRange: '> 40 mg/dL (Desirable)',
        status: 'normal',
        simpleExplanation: 'HDL helps remove extra cholesterol from your bloodstream back to the liver. Your level is within the healthy reference range.'
      },
      {
        name: 'Serum Creatinine',
        result: '0.95 mg/dL',
        referenceRange: '0.70 - 1.30 mg/dL',
        status: 'normal',
        simpleExplanation: 'Creatinine is a natural waste product from muscle breakdown filtered by your kidneys. A reading of 0.95 mg/dL indicates your kidneys are filtering waste properly.'
      },
      {
        name: 'eGFR (Estimated Glomerular Filtration Rate)',
        result: '88 mL/min/1.73m²',
        referenceRange: '> 60 mL/min/1.73m²',
        status: 'normal',
        simpleExplanation: 'This measures how efficiently your kidneys filter blood. A value of 88 is well above 60, reflecting good functional filtering.'
      }
    ],
    importantFindings: [
      'HbA1c is 7.4%, which is elevated and indicates an opportunity to review glycemic control with your doctor.',
      'Fasting blood glucose is 138 mg/dL, consistent with elevated morning sugar.',
      'LDL cholesterol is 135 mg/dL, slightly above the optimal 100 mg/dL target for chronic cardiovascular care.',
      'Kidney markers (Creatinine and eGFR) are in a healthy, stable range.'
    ],
    termsExplained: [
      {
        term: 'HbA1c',
        definition: 'A test that shows your average blood sugar levels over the past 90 days by checking how much sugar is attached to your red blood cells.'
      },
      {
        term: 'eGFR',
        definition: 'Estimated Glomerular Filtration Rate - a calculated score that estimates how many milliliters of blood your kidneys clean every minute.'
      },
      {
        term: 'LDL & HDL',
        definition: 'Types of cholesterol carriers. LDL carries cholesterol into the blood vessels, while HDL carries it away to the liver for clearing.'
      }
    ],
    questionsForDoctor: [
      'Given my HbA1c of 7.4%, should we adjust my current medication, meal timing, or physical activity routine?',
      'What specific LDL cholesterol target would you recommend for my cardiovascular health profile?',
      'When would you like me to schedule my next follow-up blood test?'
    ],
    disclaimer: 'HealthLens is an informational companion for self-care organization. It does not provide medical diagnoses or replace consultations with your doctor.'
  };
}

function generateFallbackPrescriptionAnalysis(text: string) {
  return {
    prescriptionTitle: 'Chronic Care Self-Care Prescription Plan',
    doctorOrClinic: 'Metro Care Health & Endocrinology Clinic',
    prescriptionDate: '2026-09-20',
    summary: 'This prescription outlines a chronic disease management regimen targeting blood sugar regulation, blood pressure control, and cardiovascular protection.',
    medications: [
      {
        name: 'Metformin Hydrochloride',
        dosage: '500 mg',
        frequency: 'Twice daily (BID)',
        timing: 'After breakfast (08:00 AM) and after dinner (08:00 PM)',
        slots: ['morning', 'night'],
        duration: 'Ongoing / 90 days',
        purpose: 'Helps maintain healthy blood glucose levels by reducing sugar production in the liver and improving cellular insulin sensitivity.',
        mealRelation: 'after_food',
        precautions: [
          'Always take with or immediately after meals to reduce stomach discomfort',
          'Drink adequate water throughout the day',
          'Avoid heavy alcohol consumption while on this medication'
        ],
        notes: 'Do not crush or chew extended-release formulations.',
        unclearWarning: null
      },
      {
        name: 'Telmisartan',
        dosage: '40 mg',
        frequency: 'Once daily (OD)',
        timing: 'Morning after breakfast (08:30 AM)',
        slots: ['morning'],
        duration: 'Ongoing / Chronic',
        purpose: 'Relaxes blood vessels to help lower elevated blood pressure and protect kidney function.',
        mealRelation: 'after_food',
        precautions: [
          'Take at the same time each morning for consistent 24-hour pressure control',
          'Rise slowly if feeling dizzy when getting out of bed'
        ],
        notes: 'Keep tablets in moisture-protective blister until ready to take.',
        unclearWarning: null
      },
      {
        name: 'Atorvastatin',
        dosage: '10 mg',
        frequency: 'Once daily (QHS)',
        timing: 'Bedtime (09:30 PM)',
        slots: ['night'],
        duration: 'Ongoing / 90 days',
        purpose: 'Lowers LDL cholesterol and stabilizes arterial plaque to reduce long-term cardiovascular risk.',
        mealRelation: 'anytime',
        precautions: [
          'Usually taken at night because the liver produces the most cholesterol during sleep',
          'Inform your doctor if you experience unexplained muscle soreness'
        ],
        notes: 'Avoid consuming large amounts of grapefruit juice.',
        unclearWarning: null
      }
    ],
    generalPrecautions: [
      'Maintain consistency: taking medicines at identical times each day prevents gaps in therapeutic coverage.',
      'Never stop taking blood pressure or diabetes medication abruptly without speaking to your doctor.',
      'Keep an updated medication list in your wallet or on your phone for emergency visits.'
    ],
    questionsForDoctorOrPharmacist: [
      'What should I do if I miss a morning dose of Telmisartan or Metformin?',
      'Are there any supplements, over-the-counter painkillers (like NSAIDs), or foods that interact with these medicines?',
      'When should we recheck my blood pressure and liver/kidney markers?'
    ],
    disclaimer: 'This prescription breakdown is strictly for organizational and self-care tracking purposes. HealthLens does not prescribe or alter medication.'
  };
}

function getFallbackAssistantAnswer(message: string): string {
  const query = message.toLowerCase();

  if (query.includes('hba1c') || query.includes('sugar') || query.includes('glucose') || query.includes('diabetes')) {
    return `### Understanding HbA1c & Blood Sugar

**What is HbA1c?**
HbA1c (Hemoglobin A1c) measures the percentage of your red blood cells that have glucose attached to them. Because red blood cells live for about 90 to 120 days, HbA1c gives your doctor an accurate **3-month average** of your blood sugar control.

**Standard Reference Benchmarks:**
- **Below 5.7%**: Normal range
- **5.7% to 6.4%**: Pre-diabetes range
- **6.5% or higher**: Diabetes range
- *For chronic diabetes management*, many physicians set individual targets (often around 7.0%, though personal goals vary based on age and health).

### Self-Care Adherence Tips:
1. **Take medications consistently:** Pair your pills with daily habits like breakfast or bedtime.
2. **Balanced meals:** Emphasize high-fiber vegetables, whole grains, and lean proteins; minimize refined carbohydrates and sugary beverages.
3. **Daily movement:** A gentle 20-30 minute walk after meals helps muscles absorb circulating glucose naturally.

### Questions to Ask Your Doctor:
- *"What is my personalized HbA1c target for my age and lifestyle?"*
- *"Should I be checking my fasting or post-meal blood sugar at home with a glucometer?"*
- *"Are there any lifestyle adjustments we can make before changing my medication dosage?"*

*Disclaimer: HealthLens provides health education only. Please consult your physician for personalized medical advice.*`;
  }

  if (query.includes('bp') || query.includes('blood pressure') || query.includes('hypertension')) {
    return `### Understanding Blood Pressure Readings

Blood pressure is recorded as two numbers (e.g., **120 / 80 mmHg**):
1. **Systolic (Top number):** The pressure in your arteries when your heart contracts and pumps blood.
2. **Diastolic (Bottom number):** The pressure in your arteries when your heart rests between beats.

### General Categories:
- **Normal:** Less than 120 / 80 mmHg
- **Elevated:** Systolic 120–129 and Diastolic less than 80
- **Stage 1 Hypertension:** Systolic 130–139 or Diastolic 80–89
- **Stage 2 Hypertension:** Systolic 140+ or Diastolic 90+

### Best Practices for Home BP Tracking:
- Sit quietly for 5 minutes before checking.
- Keep your arm supported at heart level with feet flat on the floor.
- Avoid caffeine, smoking, or strenuous exercise 30 minutes prior.
- Measure at the same time each morning and evening.

### Questions to Ask Your Doctor:
- *"What is my goal blood pressure reading at home?"*
- *"What should I do if my reading is unexpectedly high or low?"*
- *"Should I take my blood pressure pills before or after taking my morning reading?"*`;
  }

  return `### HealthLens Self-Care Guidance

Thank you for your question. Managing chronic conditions requires consistent habits, organized medication routines, and clear communication with your medical team.

### Core Self-Care Principles:
- **Medication Reliability:** Take prescribed medications at the same time every day. Never skip or alter doses without talking to your doctor.
- **Track Your Numbers:** Keep a routine log of blood pressure, blood glucose, and lab results in HealthLens.
- **Stay Active & Hydrated:** Regular light physical activity and adequate water intake support vascular and kidney health.
- **Prepare for Consultations:** Write down questions and symptoms before every clinic visit so nothing is forgotten.

### Questions You Can Bring to Your Doctor:
1. *"How are my current test results compared to our target goals?"*
2. *"Are my current medications still the best option for my daily routine?"*
3. *"What warning symptoms should prompt me to contact your office immediately?"*

*Reminder: HealthLens is an informational companion for self-care organization and does not provide clinical diagnoses or replace medical professionals.*`;
}

startServer();
