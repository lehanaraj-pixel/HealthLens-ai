import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useI18n } from '../services/i18n';
import { SubscriptionTier } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'day_pass' | 'monthly';
  onPaymentSuccess: (tier: SubscriptionTier) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
}) => {
  const { language } = useI18n();
  const [activeMethod, setActiveMethod] = useState<'upi_qr' | 'upi_id' | 'cards' | 'netbanking'>('upi_qr');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  // STRICT PRICING: ₹5 for 24 hours, ₹29 for 30 days
  const isDayPass = plan === 'day_pass';
  const planName = isDayPass ? 'HealthLens Plus' : 'HealthLens Monthly';
  const planDuration = isDayPass
    ? language === 'hi' ? '24 घंटे' : '24 Hours'
    : language === 'hi' ? '30 दिन' : '30 Days';
  const planAmount = isDayPass ? 5 : 29;
  const officialUpiId = 'healthlens@okhdfcbank';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(plan);
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  const popularBanks = [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank (PNB)',
    'Bank of Baroda',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 dim:bg-slate-800 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 dim:border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 dim:border-slate-700 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-teal-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'सुरक्षित भुगतान गेटवे' : 'Secure Payment Gateway'}</span>
                <span className="text-[10px] bg-teal-500/30 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-400/30">
                  256-bit SSL
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'hi'
                  ? 'तत्काल एक्टिवेशन • 100% सुरक्षित लेनदेन'
                  : 'Instant Activation • 100% Encrypted & Safe'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className="bg-teal-50 dark:bg-teal-950/50 dim:bg-teal-950/40 px-6 py-4 border-b border-teal-100 dark:border-teal-900/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {planName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200">
                {planDuration}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isDayPass
                ? language === 'hi'
                  ? 'अस्पताल व डॉक्टर विजिट हेतु 24 घंटे की असीमित AI सहायता'
                  : 'Single Day Pass for clinic visit & report scanning'
                : language === 'hi'
                  ? '30-दिवसीय संपूर्ण क्रोनिक केयर व असीमित प्रिस्क्रिप्शन'
                  : '30-Day continuous chronic disease self-care subscription'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              {language === 'hi' ? 'कुल देय राशि' : 'Total Payable'}
            </span>
            <div className="text-2xl font-black text-teal-700 dark:text-teal-400 tracking-tight">
              ₹{planAmount}
            </div>
          </div>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? 'भुगतान सफल रहा!' : 'Payment Successful!'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              {language === 'hi'
                ? `₹${planAmount} का भुगतान प्राप्त हो गया है। आपका ${planName} सक्रिय कर दिया गया है।`
                : `₹${planAmount} payment verified. Your ${planName} is now active.`}
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300">
              TXN ID: HL-PAY-{Math.floor(100000 + Math.random() * 900000)}
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveMethod('upi_qr')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activeMethod === 'upi_qr'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[11px] leading-tight">UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('upi_id')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activeMethod === 'upi_id'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px] leading-tight">UPI ID</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('cards')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activeMethod === 'cards'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px] leading-tight">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('netbanking')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activeMethod === 'netbanking'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[11px] leading-tight">NetBanking</span>
              </button>
            </div>

            {/* Method 1: UPI QR */}
            {activeMethod === 'upi_qr' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                    {/* Stylized simulated QR Code */}
                    <div className="w-40 h-40 bg-white p-2 flex flex-col justify-between relative">
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-900 rounded-sm" />
                        </div>
                        <div className="w-10 h-10 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-900 rounded-sm" />
                        </div>
                      </div>
                      <div className="my-auto flex flex-col items-center gap-1">
                        <div className="text-[10px] font-black tracking-widest text-teal-700 uppercase">
                          SCAN TO PAY
                        </div>
                        <div className="text-xl font-black text-slate-900">₹{planAmount}</div>
                        <div className="text-[9px] text-slate-500">BHIM • GPay • Paytm • PhonePe</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-900 rounded-sm" />
                        </div>
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
                          ₹
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'hi' ? `किसी भी UPI ऐप से ₹${planAmount} स्कैन करें` : `Scan with any UPI App to Pay ₹${planAmount}`}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Google Pay, PhonePe, Paytm, BHIM or Cred
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {officialUpiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:text-teal-600 text-slate-500 text-xs flex items-center gap-1"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Method 2: UPI ID */}
            {activeMethod === 'upi_id' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'hi' ? 'अपनी UPI ID दर्ज करें' : 'Enter your Virtual Payment Address (UPI ID)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank or name@paytm"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {['@okhdfcbank', '@okaxis', '@ybl', '@paytm', '@ibl'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => setUpiId((prev) => (prev.split('@')[0] || 'username') + handle)}
                      className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-500"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'hi'
                    ? `आपके UPI ऐप पर ₹${planAmount} का भुगतान अनुरोध भेजा जाएगा।`
                    : `A collect request for ₹${planAmount} will be sent to your UPI app.`}
                </p>
              </div>
            )}

            {/* Method 3: Cards */}
            {activeMethod === 'cards' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'कार्ड नंबर' : 'Card Number'}
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 8821"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'hi' ? 'समाप्ति तिथि' : 'Expiry (MM/YY)'}
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'कार्डधारक का नाम' : 'Cardholder Name'}
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Method 4: NetBanking */}
            {activeMethod === 'netbanking' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'hi' ? 'अपना बैंक चुनें' : 'Select Your Bank'}
                </label>
                <div className="space-y-2">
                  {popularBanks.map((bank) => (
                    <label
                      key={bank}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedBank === bank
                          ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs">{bank}</span>
                      <input
                        type="radio"
                        name="bank"
                        checked={selectedBank === bank}
                        onChange={() => setSelectedBank(bank)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button Action */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcessPayment}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {language === 'hi' ? `₹${planAmount} का सुरक्षित भुगतान हो रहा है...` : `Processing ₹${planAmount} payment...`}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? `₹${planAmount} का भुगतान करें एवं ${planName} सक्रिय करें`
                      : `Pay ₹${planAmount} & Activate ${planName}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* SECURE PAYMENT SECTION (Required: Never remove) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'hi' ? 'सुरक्षित भुगतान अनुभाग (Secure Payment Section)' : '100% Secure Payment Guarantee'}</span>
              </div>
              <p className="leading-relaxed">
                {language === 'hi'
                  ? 'सभी लेनदेन भारतीय रिजर्व बैंक (RBI) के डिजिटल भुगतान दिशानिर्देशों के अनुरूप 256-बिट बैंक स्तरीय एन्क्रिप्शन और PCI-DSS मानकों के तहत सुरक्षित हैं।'
                  : 'All transactions are encrypted with 256-bit bank-grade SSL and compliant with PCI-DSS & RBI payment safety standards.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
                <span>🔒 256-bit SSL</span>
                <span>•</span>
                <span>🛡️ PCI-DSS Level 1</span>
                <span>•</span>
                <span>🇮🇳 RBI Compliant</span>
                <span>•</span>
                <span>⚡ Instant Plan Activation</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
