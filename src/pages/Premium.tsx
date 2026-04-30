import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Crown, Check, Sparkles, Download, Music2, Headphones,
  Zap, Heart, Gift, MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import RedeemCodeModal from '@/components/RedeemCodeModal';
import Footer from '@/components/Footer';
import { iosSpring, iosBounce } from '@/lib/animations';
import { usePremium } from '@/hooks/usePremium';
import { useHaptics } from '@/hooks/useHaptics';

const PRICE = '₹49';
const PRICE_SUFFIX = '/month';

const FEATURES = [
  { icon: Music2, title: 'Ad-Free Listening', desc: 'Pure music. No interruptions, ever.' },
  { icon: Download, title: 'Unlimited Downloads', desc: 'Save it all. Listen anywhere, even offline.' },
  { icon: Headphones, title: 'Studio Sound · 320kbps', desc: 'Hear every detail. The way artists intended.' },
  { icon: Sparkles, title: 'Premium-Only Tracks', desc: 'Early drops and exclusive releases.' },
  { icon: Zap, title: 'Instant Play', desc: 'No pre-roll ads. Songs start the moment you tap.' },
  { icon: Crown, title: 'Premium Badge', desc: 'Show your status across the app.' },
  { icon: Heart, title: 'Support Indie Music', desc: 'You directly fund the artists you love.' },
];

const PremiumPage = memo(function PremiumPage() {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const haptics = useHaptics();
  const [showRedeem, setShowRedeem] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleUpgrade = useCallback(() => {
    haptics.medium();
    setShowCheckout(true);
  }, [haptics]);

  return (
    <PageTransition>
      <motion.div
        className="min-h-screen bg-background pb-44 relative overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      >
        {/* Static editorial backdrop */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.55), transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.5), transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Header */}
        <motion.header
          className="sticky top-0 z-30 px-2 pt-4 pb-3 flex items-center safe-area-pt"
          style={{
            background: 'hsl(var(--background) / 0.85)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={iosSpring}
        >
          <motion.button
            onClick={() => { haptics.light(); navigate(-1); }}
            className="flex items-center gap-1 px-2 py-2 -ml-1 text-primary"
            whileTap={{ scale: 0.95, opacity: 0.7 }} transition={iosBounce}
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[17px]">Back</span>
          </motion.button>
          <h1 className="text-[17px] font-semibold absolute left-1/2 -translate-x-1/2">
            Premium
          </h1>
        </motion.header>

        <main className="relative px-5 pt-2 space-y-8">
          {/* Editorial wordmark */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.05 }}
            className="text-center pt-8 pb-2"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ ...iosSpring, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{
                background: 'hsl(var(--primary) / 0.12)',
                border: '0.5px solid hsl(var(--primary) / 0.3)',
              }}
            >
              <Crown className="w-3.5 h-3.5 text-primary" fill="currentColor" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
                Universflow Premium
              </span>
            </motion.div>

            <h1 className="text-[44px] font-bold leading-[0.95] tracking-tight mb-4">
              Music,<br />
              <span style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>uninterrupted.</span>
            </h1>
            <p className="text-muted-foreground text-[15px] max-w-[320px] mx-auto leading-relaxed">
              One plan. Everything unlocked. Made for people who actually listen.
            </p>
          </motion.section>

          {/* THE pricing card — hero of the page */}
          {!isPremium && (
            <motion.section
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...iosSpring, delay: 0.15 }}
            >
              <div
                className="relative rounded-[28px] p-7 overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, hsl(var(--primary) / 0.22) 0%, hsl(var(--card) / 0.7) 50%, hsl(var(--accent) / 0.15) 100%)',
                  border: '1px solid hsl(var(--primary) / 0.35)',
                  boxShadow: '0 30px 80px -20px hsl(var(--primary) / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.1)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                }}
              >
                {/* corner shine */}
                <div
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-50 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)', filter: 'blur(30px)' }}
                />

                <div className="relative">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-[14px] font-semibold text-muted-foreground">Just</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span
                      className="text-[88px] font-bold leading-none tracking-tighter"
                      style={{
                        background: 'linear-gradient(180deg, hsl(var(--foreground)), hsl(var(--primary)))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {PRICE}
                    </span>
                    <span className="text-[20px] font-medium text-muted-foreground">
                      {PRICE_SUFFIX}
                    </span>
                  </div>
                  <p className="text-center text-[13px] text-muted-foreground mb-6">
                    Less than a coffee. Cancel anytime.
                  </p>

                  <motion.button
                    onClick={handleUpgrade}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-[18px] rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                      color: 'hsl(var(--primary-foreground))',
                      boxShadow: '0 15px 40px -10px hsl(var(--primary) / 0.7)',
                    }}
                  >
                    Get Premium
                    <Sparkles className="w-5 h-5" fill="currentColor" />
                  </motion.button>

                  <button
                    onClick={() => { haptics.light(); setShowRedeem(true); }}
                    className="w-full mt-3 py-3 text-[14px] font-semibold text-primary flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    I have a redeem code
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {isPremium && (
            <motion.section
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={iosSpring}
              className="rounded-3xl p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.15))',
                border: '1px solid hsl(var(--primary) / 0.4)',
              }}
            >
              <Crown className="w-12 h-12 text-primary mx-auto mb-3" fill="currentColor" />
              <p className="text-xl font-bold mb-1">You're Premium 💜</p>
              <p className="text-sm text-muted-foreground">Thanks for keeping the music alive.</p>
            </motion.section>
          )}

          {/* What's included — editorial list */}
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...iosSpring, delay: 0.25 }}
          >
            <div className="flex items-baseline justify-between mb-5 px-1">
              <h2 className="text-[22px] font-bold tracking-tight">What's inside</h2>
              <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                {FEATURES.length} perks
              </span>
            </div>

            <div className="space-y-2">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04, ...iosSpring }}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{
                    background: 'hsl(var(--card) / 0.5)',
                    border: '0.5px solid hsl(var(--border) / 0.5)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.08))',
                    }}
                  >
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] leading-tight">{f.title}</p>
                    <p className="text-[12.5px] text-muted-foreground leading-snug mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-primary shrink-0" strokeWidth={3} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Editorial closing */}
          {!isPremium && (
            <motion.section
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...iosSpring, delay: 0.5 }}
              className="text-center py-6"
            >
              <p className="text-[24px] font-bold tracking-tight leading-tight mb-4">
                Ready when you are.
              </p>
              <motion.button
                onClick={handleUpgrade}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[16px]"
                style={{
                  background: 'hsl(var(--foreground))',
                  color: 'hsl(var(--background))',
                }}
              >
                Start for {PRICE}{PRICE_SUFFIX}
              </motion.button>
              <p className="text-[11px] text-muted-foreground mt-4">
                Cancel anytime · No hidden fees · Instant activation
              </p>
            </motion.section>
          )}

          <Footer />
        </main>

        <BottomNav />

        <RedeemCodeModal isOpen={showRedeem} onClose={() => setShowRedeem(false)} />

        <AnimatePresence>
          {showCheckout && (
            <CheckoutSheet
              onClose={() => setShowCheckout(false)}
              onRedeem={() => { setShowCheckout(false); setShowRedeem(true); }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
});

const TELEGRAM_URL = 'https://t.me/ERRORMATRIXx';

interface CheckoutSheetProps {
  onClose: () => void;
  onRedeem: () => void;
}

const CheckoutSheet = memo(function CheckoutSheet({ onClose, onRedeem }: CheckoutSheetProps) {
  const haptics = useHaptics();

  const handleTelegram = () => {
    haptics.medium();
    window.open(
      `${TELEGRAM_URL}?text=${encodeURIComponent(
        `Hi! I want to upgrade to Universflow Premium (${PRICE}${PRICE_SUFFIX}).`
      )}`,
      '_blank'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={iosSpring}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl p-6 pb-10"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card)), hsl(var(--background)))',
          border: '0.5px solid hsl(var(--border))',
        }}
      >
        <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-5" />

        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
          >
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-[22px] font-bold">Universflow Premium</h3>
          <p className="text-[32px] font-bold mt-1">
            {PRICE}<span className="text-[16px] font-medium text-muted-foreground">{PRICE_SUFFIX}</span>
          </p>
        </div>

        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: 'hsl(var(--primary) / 0.1)', border: '0.5px solid hsl(var(--primary) / 0.2)' }}
        >
          <p className="text-[13px] text-foreground/90 leading-relaxed">
            <strong className="text-primary">Quick & secure:</strong> Tap below to message us on Telegram. We'll send your activation code in minutes.
          </p>
        </div>

        <button
          onClick={handleTelegram}
          className="w-full py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 mb-3"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            color: 'hsl(var(--primary-foreground))',
            boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.5)',
          }}
        >
          <MessageCircle className="w-5 h-5" />
          Continue on Telegram
        </button>

        <button
          onClick={onRedeem}
          className="w-full py-3.5 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 mb-2"
          style={{
            background: 'hsl(var(--muted) / 0.5)',
            border: '0.5px solid hsl(var(--border) / 0.5)',
          }}
        >
          <Gift className="w-4 h-4 text-primary" />
          Already have a code? Redeem
        </button>

        <button onClick={onClose} className="w-full py-3 text-sm text-muted-foreground">
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
});

export default PremiumPage;
