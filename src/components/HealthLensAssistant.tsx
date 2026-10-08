import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Volume2,
  Languages,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  HelpCircle,
  ShieldAlert,
  Cpu,
  Crown,
} from 'lucide-react';
import { ChatMessage, PatientProfile, SubscriptionInfo } from '../types';
import { speechService } from '../services/speech';
import { useI18n } from '../services/i18n';

interface HealthLensAssistantProps {
  profile: PatientProfile;
  subscription?: SubscriptionInfo;
  onOpenPremium?: () => void;
}

const SUGGESTED_QUESTIONS_EN = [
  'What does HbA1c mean in simple terms?',
  'What is considered a normal blood pressure reading?',
  'Why do doctors prescribe Metformin for blood sugar?',
  'What questions should I ask my doctor at my diabetes check-up?',
  'How do I organize my daily morning and night medications?',
];

const SUGGESTED_QUESTIONS_HI = [
  'सरल शब्दों में HbA1c का क्या मतलब है?',
  'सामान्य ब्लड प्रेशर (रक्तचाप) कितना होना चाहिए?',
  'डॉक्टर शुगर के लिए मेटफॉर्मिन क्यों लिखते हैं?',
  'अगली जांच में डॉक्टर से क्या सवाल पूछने चाहिए?',
  'सुबह और रात की दवाइयों का समय कैसे व्यवस्थित करें?',
];

export const HealthLensAssistant: React.FC<HealthLensAssistantProps> = ({
  profile,
  subscription,
  onOpenPremium,
}) => {
  const { language, t, tr } = useI18n();

  const getInitialWelcome = () => {
    if (language === 'hi') {
      return `नमस्ते ${profile.name}! मैं **हेल्थलेन्स AI** हूँ, आपका व्यक्तिगत स्वास्थ्य शिक्षा साथी।

मैं आपकी इन विषयों में सहायता कर सकता हूँ:
- जटिल मेडिकल शब्दों और टेस्ट रिपोर्ट (जैसे HbA1c, eGFR, ब्लड प्रेशर) को सरल भाषा में समझना
- डॉक्टर द्वारा लिखी गई दवाइयों के उपयोग, समय और भोजन के नियम जानना
- डॉक्टर से मुलाकात के समय पूछने के लिए महत्वपूर्ण प्रश्न तैयार करना

*महत्वपूर्ण सूचना: मैं कोई बीमारी डायग्नोज़ नहीं करता और न ही डॉक्टर की जगह लेता हूँ।*

आज मैं आपकी क्या सहायता कर सकता हूँ?`;
    }
    return `Hello ${profile.name}! I am **HealthLens AI**, your educational self-care companion.

I can help you:
- Understand complicated medical terms and lab tests (like HbA1c, eGFR, BP)
- Learn general purposes and food instructions for prescribed medications
- Formulate clear questions to bring to your next doctor appointment

*Important safety note: I do not diagnose diseases, prescribe medication, or replace your doctor.*

How can I help you today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: getInitialWelcome(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  // Update welcome on language change if only welcome exists
  React.useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome') {
        return [
          {
            ...prev[0],
            content: getInitialWelcome(),
          },
        ];
      }
      return prev;
    });
  }, [language]);

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          patientContext: {
            name: profile.name,
            age: profile.age,
            conditions: profile.conditions,
          },
          modelTier: subscription?.tier,
          model: subscription?.selectedModel,
          language: language,
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        (language === 'hi'
          ? 'मैं आपकी स्वास्थ्य जानकारी समझने में मदद के लिए यहाँ हूँ। किसी भी चिकित्सकीय निर्णय के लिए अपने डॉक्टर से परामर्श लें।'
          : 'I am here to help you understand your health information and self-care routine. Please consult your physician for specific medical concerns.');

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackAi: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content:
          language === 'hi'
            ? `### स्वास्थ्य परामर्श एवं जानकारी
अपनी दवाइयां समय पर लेना और संतुलित खानपान रखना दीर्घकालिक स्वास्थ्य के लिए सबसे आवश्यक है।

**मुख्य सुझाव:**
1. दवा का समय निश्चित रखें और कभी खुराक न छोड़ें।
2. कोई भी नया लक्षण दिखने पर अपने हेल्थलेन्स लॉग में दर्ज करें।
3. अगली मुलाकात में अपने डॉक्टर से इस विषय पर विस्तार से चर्चा करें।

*हेल्थलेन्स केवल स्वास्थ्य शिक्षा प्रदान करता है। यह कोई दवा नहीं लिखता।*`
            : `### Understanding Your Health Query
Taking care of your health with routine medication schedules and healthy meals is the most effective approach to long-term chronic condition management.

**Recommendations:**
1. Maintain consistent medication timing.
2. Record any unusual symptoms in your HealthLens log.
3. Bring this question to your primary doctor or pharmacist during your next visit.

*HealthLens provides health education only and does not diagnose or prescribe.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAi]);
    } finally {
      setIsLoading(false);
    }
  };

  const translateMessageToHindi = async (msgId: string, text: string) => {
    setTranslatingId(msgId);
    try {
      const res = await fetch('/api/translate-hindi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: 'HealthLens AI explanation' }),
      });
      const data = await res.json();
      const hindi = data.data?.hindiTranslation || text;

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, hindiTranslation: hindi } : m))
      );
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setTranslatingId(null);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const playVoice = (text: string, isHindi: boolean = false) => {
    speechService.speak(text, isHindi ? 'hi' : 'en');
  };

  const questionsList = language === 'hi' ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-300 bg-teal-800/40 px-3 py-1 rounded-full mb-3 border border-teal-500/30">
              <Bot className="w-3.5 h-3.5" />
              {t('nav_assistant')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {t('assistant_banner_title')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t('assistant_banner_sub')}
            </p>
          </div>

          {/* Active model pill */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {subscription?.tier === 'day_pass' || subscription?.tier === 'monthly'
                  ? (subscription.selectedModel === 'gemini-2.5-pro-multilingual'
                      ? 'HealthLens AI Multilingual'
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
                  ? (language === 'hi' ? '1-दिन का पास सक्रिय' : '1-Day Pass Active')
                  : (language === 'hi' ? 'मासिक सब्सक्रिप्शन सक्रिय' : 'Monthly Care Active')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
          {t('suggested_questions')}
        </span>
        <div className="flex flex-wrap gap-2">
          {questionsList.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 dim:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-all text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-800 dim:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[520px]">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const displayText =
              language === 'hi' && msg.hindiTranslation ? msg.hindiTranslation : msg.content;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-900 text-teal-400 dark:bg-slate-800'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 shadow-xs ${
                    isUser
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{displayText}</div>

                  {!isUser && (
                    <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span>{msg.timestamp}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => playVoice(displayText, language === 'hi')}
                          className="p-1 hover:text-teal-600 transition-colors"
                          title={t('btn_read_aloud')}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => copyText(displayText, msg.id)}
                          className="p-1 hover:text-teal-600 transition-colors"
                          title={t('btn_copy')}
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {!msg.hindiTranslation && language !== 'hi' && (
                          <button
                            onClick={() => translateMessageToHindi(msg.id, msg.content)}
                            disabled={translatingId === msg.id}
                            className="p-1 hover:text-teal-600 transition-colors flex items-center gap-1"
                            title="Translate to Hindi"
                          >
                            <Languages className="w-3.5 h-3.5" />
                            {translatingId === msg.id ? '...' : 'हिन्दी'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin text-teal-600" />
                <span>
                  {language === 'hi'
                    ? 'हेल्थलेन्स AI आपके प्रश्न का विश्लेषण कर रहा है...'
                    : 'HealthLens AI is formulating a clear medical explanation...'}
                </span>
              </div>
            </div>
          )}
        </div>

          {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputMsg);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={t('assistant_input_placeholder')}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('btn_send')}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">{t('clinical_boundary_title')}:</span>
          <span>{t('disclaimer_clinical_text')}</span>
        </div>
      </div>
    </div>
  );
};
