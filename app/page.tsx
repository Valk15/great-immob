"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Star, TrendingUp, ChevronDown, CheckCircle,
  BarChart3, Lock, Award, ArrowRight, MessageCircle,
  Home, Calendar, Phone, BadgeCheck, Sparkles,
  Users, Building2, Loader2, FileText
} from "lucide-react";

// --- CONFIGURATION ---
const HAMZA_WHATSAPP = "212641553583"; 
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwV6xAtGW-GZ4Yl5kHDne8-uVXcaPgDqDBE5Xz4IkvyilpPQZajxjS-OLyyfixd50wnmg/exec";
const WA = (msg: string) => `https://wa.me/${HAMZA_WHATSAPP}?text=${encodeURIComponent(msg)}`;

type Lang = "fr" | "en" | "ar";

// --- TRANSLATIONS ---
const T = {
  fr: {
    dir: "ltr" as const,
    nav: { proof: "Nos Preuves", simulator: "Simulateur", legal: "100% Légal", cta: "Parler à Hamza" },
    hero: {
      badge1: "Autorisation Officielle", badge2: "Déclaration Police Assurée", badge3: "Guest Favorite Airbnb",
      h1a: "Votre Appartement au Maroc", h1b: "Gagne Trop Peu.",
      sub: "GreatImmob gère votre bien sur Airbnb — pricing dynamique, gestion complète, 100% légal. Résultat : vos revenus doublent. Prouvé.",
      cta1: "Estimer mon revenu — Gratuit", cta2: "Parler à Hamza", scroll: "Voir nos preuves",
    },
    stats: [
      { value: "4.75★", label: "Note Airbnb réelle" },
      { value: "90%+", label: "Taux d'occupation" },
      { value: "3 mois", label: "Pour atteindre Guest Favorite" },
    ],
    calendar: {
      tag: "Preuve Réelle", h2a: "Notre calendrier de Janvier —", h2b: "voyez vous-même.",
      sub: "Des vrais clients, des vraies nuits. Pas du marketing.",
      result: "Résultat :", nights: "26 nuits réservées sur 31 ce mois-là.",
      days: ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
      legend: ["Clients internationaux","Clients locaux","Séjours longue durée"],
    },
    reviews: {
      tag: "Vrais Avis Airbnb", h2: "Ce que disent nos clients.",
      verified: "Vérifié Airbnb", badge: '"Guest Favorite" — Top 10% des logements Airbnb Maroc',
    },
    calc: {
      tag: "Outil Gratuit", h2a: "Combien peut gagner", h2b: "votre appartement ?",
      sub: "Estimation basée sur nos vraies données de marché.",
      label: "Simulateur GreatImmob",
      steps: ["Votre bien","Vos coordonnées","Analyse"],
      quartierLabel: "Votre ville / quartier", quartierPlaceholder: "Ex: Marina Agadir, Guéliz Marrakech...",
      typeLabel: "Type de bien",
      types: ["Studio / 1 Chambre","2 Chambres","3 Chambres"],
      next: "Lancer l'analyse →",
      privacy: "Nous générons une étude comparative (Airbnb vs Booking). Hamza vous l'enverra personnellement.",
      nameLabel: "Votre prénom", namePlaceholder: "Mohamed, Fatima...",
      phoneLabel: "WhatsApp Maroc", phonePlaceholder: "6XX XX XX XX",
      messageLabel: "Détails supplémentaires (optionnel)",
      messagePlaceholder: "Étage, ascenseur, état du bien, disponibilité...",
      reveal: "Recevoir mon rapport complet", back: "← Modifier",
      successTitle: "Analyse en cours !",
      successSub: "Données bien reçues.",
      estTitle: "Augmentation Estimée",
      estRange: "+60% à +120%",
      estSub: "Par rapport à une location classique",
      finalMsg: "Ce chiffre est une moyenne du marché. Pour votre bien, nous utilisons des outils professionnels pour calculer le prix exact à la nuitée.",
      ctaAction: "Hamza finalise votre rapport PDF personnalisé. Surveillez votre WhatsApp !",
      waBtn: "Discuter avec Hamza maintenant →",
      sending: "Envoi en cours...", sent: "✓ Données envoyées",
    },
    legal: {
      tag: "Vos 3 Peurs — Éliminées", h2a: "Légal. Sécurisé.", h2b: "Transparent.",
      sub: "La majorité des propriétaires ont peur de 3 choses : abîmer leur appartement, avoir des problèmes avec la police, et ne pas être payés. Chez GreatImmob, ces 3 problèmes n'existent pas.",
      cta: "Questions ? WhatsApp Hamza",
      points: [
        { title: "Autorisation Officielle", desc: "Notre activité est pleinement autorisée par les autorités marocaines de tourisme." },
        { title: "Déclaration Police Assurée", desc: "Chaque séjour est déclaré à la police comme l'exige la loi marocaine. Vous êtes protégé." },
        { title: "Vérification des Clients", desc: "Chaque client Airbnb est vérifié (identité, avis, profil). Zéro inconnu dans votre appartement." },
        { title: "Rapport Mensuel Détaillé", desc: "Chaque centime est tracé. Virement direct. Rapport PDF chaque 1er du mois." },
      ],
    },
    finalCta: {
      badge: "Réponse garantie sous 1h", h2a: "Votre appartement mérite", h2b: "mieux que la moyenne.",
      sub: "Un message WhatsApp à Hamza suffit. Pas d'engagement, pas de frais cachés.",
      btn: "Parler à Hamza maintenant", footer: "Légal · Déclaré Police · Guest Favorite Airbnb · Géré par Hamza",
    },
    footerCopy: "© 2025 GreatImmob · Conciergerie Airbnb · Maroc",
  },
  en: {
    dir: "ltr" as const,
    nav: { proof: "Our Proof", simulator: "Simulator", legal: "100% Legal", cta: "Talk to Hamza" },
    hero: {
      badge1: "Official Authorization", badge2: "Police Declaration Assured", badge3: "Airbnb Guest Favorite",
      h1a: "Your Apartment in Morocco", h1b: "Earns Too Little.",
      sub: "GreatImmob manages your property on Airbnb — dynamic pricing, full management, 100% legal. Result: your income doubles. Proven.",
      cta1: "Estimate my revenue — Free", cta2: "Talk to Hamza", scroll: "See our proof",
    },
    stats: [
      { value: "4.75★", label: "Real Airbnb rating" },
      { value: "90%+", label: "Occupancy rate" },
      { value: "3 months", label: "To reach Guest Favorite" },
    ],
    calendar: {
      tag: "Real Proof", h2a: "Our January calendar —", h2b: "see for yourself.",
      sub: "Real guests, real nights. No marketing.",
      result: "Result:", nights: "26 nights booked out of 31 that month.",
      days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      legend: ["International guests","Local guests","Long stays"],
    },
    reviews: {
      tag: "Real Airbnb Reviews", h2: "What our guests say.",
      verified: "Verified Airbnb", badge: '"Guest Favorite" — Top 10% of Airbnb listings in Morocco',
    },
    calc: {
      tag: "Free Tool", h2a: "How much can your", h2b: "apartment earn?",
      sub: "Estimate based on real market data.",
      label: "GreatImmob Simulator",
      steps: ["Your property","Your details","Analysis"],
      quartierLabel: "Your city / neighbourhood", quartierPlaceholder: "e.g. Marina Agadir, Marrakech...",
      typeLabel: "Property type",
      types: ["Studio / 1 Bedroom","2 Bedrooms","3 Bedrooms"],
      next: "Start analysis →",
      privacy: "We are generating a comparative study (Airbnb vs Booking). Hamza will send it to you personally.",
      nameLabel: "Your first name", namePlaceholder: "Mohamed, Fatima...",
      phoneLabel: "WhatsApp Morocco", phonePlaceholder: "6XX XX XX XX",
      messageLabel: "Additional details (optional)",
      messagePlaceholder: "Floor, elevator, property condition, availability...",
      reveal: "Receive my full report", back: "← Edit",
      successTitle: "Analysis in progress!",
      successSub: "Data received successfully.",
      estTitle: "Estimated Increase",
      estRange: "+60% to +120%",
      estSub: "Compared to standard rental",
      finalMsg: "This is a market average. For your specific property, we use professional tools to calculate the exact nightly rate.",
      ctaAction: "Hamza is finalizing your custom PDF report. Check your WhatsApp!",
      waBtn: "Chat with Hamza now →",
      sending: "Sending...", sent: "✓ Data sent",
    },
    legal: {
      tag: "Your 3 Fears — Eliminated", h2a: "Legal. Secure.", h2b: "Transparent.",
      sub: "Most owners fear 3 things: damage to their apartment, legal issues with police, and not being paid. At GreatImmob, these 3 problems don't exist.",
      cta: "Questions? WhatsApp Hamza",
      points: [
        { title: "Official Authorization", desc: "Our activity is fully authorized by Moroccan tourism authorities." },
        { title: "Police Declaration Assured", desc: "Every stay is declared to the police as required by Moroccan law. You are protected." },
        { title: "Guest Verification", desc: "Every Airbnb guest is verified (identity, reviews, profile). Zero strangers in your apartment." },
        { title: "Detailed Monthly Report", desc: "Every dirham is tracked. Direct bank transfer. PDF report on the 1st of each month." },
      ],
    },
    finalCta: {
      badge: "Reply guaranteed within 1 hour", h2a: "Your apartment deserves", h2b: "better than average.",
      sub: "One WhatsApp message to Hamza is enough. No commitment, no hidden fees.",
      btn: "Talk to Hamza now", footer: "Legal · Police Declared · Airbnb Guest Favorite · Managed by Hamza",
    },
    footerCopy: "© 2025 GreatImmob · Airbnb Concierge Agency · Morocco",
  },
  ar: {
    dir: "rtl" as const,
    nav: { proof: "إثباتاتنا", simulator: "حاسبة الدخل", legal: "قانوني 100%", cta: "تحدث مع حمزة" },
    hero: {
      badge1: "ترخيص رسمي", badge2: "تصريح الشرطة مضمون", badge3: "ضيف مفضل على Airbnb",
      h1a: "شقتك في المغرب", h1b: "تكسب أقل مما تستحق.",
      sub: "GreatImmob تدير عقارك على Airbnb — تسعير ديناميكي، إدارة كاملة، قانوني 100%. النتيجة: دخلك يتضاعف. مثبت.",
      cta1: "احسب دخلي — مجاناً", cta2: "تحدث مع حمزة", scroll: "شاهد إثباتاتنا",
    },
    stats: [
      { value: "4.75★", label: "تقييم Airbnb الحقيقي" },
      { value: "+90%", label: "معدل الإشغال" },
      { value: "3 أشهر", label: "للوصول إلى ضيف مفضل" },
    ],
    calendar: {
      tag: "إثبات حقيقي", h2a: "تقويم يناير لدينا —", h2b: "اطلع بنفسك.",
      sub: "عملاء حقيقيون، ليالٍ حقيقية. ليس تسويقاً.",
      result: "النتيجة:", nights: "26 ليلة محجوزة من أصل 31 في ذلك الشهر.",
      days: ["إث","ثلا","أرب","خمي","جمع","سبت","أحد"],
      legend: ["عملاء دوليون","عملاء محليون","إقامات طويلة"],
    },
    reviews: {
      tag: "تقييمات Airbnb الحقيقية", h2: "ماذا يقول ضيوفنا.",
      verified: "موثق على Airbnb", badge: '"ضيف مفضل" — أفضل 10% من إعلانات Airbnb في المغرب',
    },
    calc: {
      tag: "أداة مجانية", h2a: "كم يمكن أن تربح", h2b: "شقتك؟",
      sub: "تقدير مبني على بيانات السوق الحقيقية.",
      label: "حاسبة GreatImmob",
      steps: ["عقارك","بياناتك","التحليل"],
      quartierLabel: "مدينتك / حيك السكني", quartierPlaceholder: "مثال: المارينا، مراكش، طنجة...",
      typeLabel: "نوع العقار",
      types: ["استوديو / غرفة واحدة","غرفتان","3 غرف"],
      next: "بدء التحليل ←",
      privacy: "نقوم بإعداد دراسة مقارنة (Airbnb vs Booking). حمزة سيرسلها لك شخصياً.",
      nameLabel: "اسمك الأول", namePlaceholder: "محمد، فاطمة...",
      phoneLabel: "واتساب المغرب", phonePlaceholder: "6XX XX XX XX",
      messageLabel: "تفاصيل إضافية (اختياري)",
      messagePlaceholder: "الطابق، المصعد، حالة العقار، التوفر...",
      reveal: "استلام تقريري الكامل", back: "← تعديل",
      successTitle: "جارٍ تحليل البيانات...",
      successSub: "تم استلام طلبك بنجاح.",
      estTitle: "زيادة متوقعة",
      estRange: "+60% إلى +120%",
      estSub: "مقارنة بالإيجار التقليدي",
      finalMsg: "هذه النسبة هي متوسط السوق. بالنسبة لعقارك، نحن نستخدم أدوات احترافية لحساب السعر الدقيق لليلة.",
      ctaAction: "يقوم حمزة الآن بإعداد تقرير PDF المخصص لك. راقب الواتساب!",
      waBtn: "تواصل مع حمزة الآن ←",
      sending: "جارٍ الإرسال...", sent: "✓ تم الإرسال",
    },
    legal: {
      tag: "مخاوفك الـ3 — تم حلها", h2a: "قانوني. آمن.", h2b: "شفاف.",
      sub: "معظم الملاك يخافون من 3 أشياء: إتلاف شقتهم، مشاكل قانونية مع الشرطة، وعدم الدفع. في GreatImmob، هذه المشاكل الثلاثة غير موجودة.",
      cta: "أسئلة؟ واتساب حمزة",
      points: [
        { title: "ترخيص رسمي", desc: "نشاطنا مرخص رسمياً من قبل السلطات السياحية المغربية." },
        { title: "تصريح الشرطة مضمون", desc: "كل إقامة يتم التصريح بها للشرطة كما يقتضي القانون المغربي. أنت محمي." },
        { title: "التحقق من العملاء", desc: "كل عميل على Airbnb يتم التحقق منه (الهوية، التقييمات، الملف الشخصي). لا غرباء في شقتك." },
        { title: "تقرير شهري مفصل", desc: "كل درهم يتم تتبعه. تحويل مباشر. تقرير PDF في الأول من كل شهر." },
      ],
    },
    finalCta: {
      badge: "رد مضمون خلال ساعة", h2a: "شقتك تستحق", h2b: "أفضل من المتوسط.",
      sub: "رسالة واتساب واحدة لحمزة كافية. لا التزام، لا رسوم خفية.",
      btn: "تحدث مع حمزة الآن", footer: "قانوني · مصرح به للشرطة · ضيف مفضل Airbnb · بإدارة حمزة",
    },
    footerCopy: "© 2025 GreatImmob · وكالة كونسيرج Airbnb · المغرب",
  },
};

const REVIEWS = [
  { name: "Marie Flora", flag: "🇫🇷", stars: 5, text: "I had an amazing stay. The apartment is well located, very clean and extremely well equipped. The host was very responsive and available. I highly recommend this place!!!", date: "Il y a 5 jours" },
  { name: "Juliette", flag: "🇫🇷", stars: 5, text: "Impeccable accommodation, with everything you need and well located. Very welcoming and available host, he accompanied us throughout the stay from the airport to the daily newspapers! I recommend ++ especially if it's your first trip to Morocco.", date: "Il y a 2 semaines" },
  { name: "Elena", flag: "🇷🇺", stars: 4, text: "Very good apartment.", date: "Il y a 1 semaine" },
];

const CALENDAR_BOOKINGS = [
  { guest: "Ouaassou", days: 3, start: 1, color: "#d4af37" },
  { guest: "Juliette 🇫🇷", days: 5, start: 5, color: "#0f172a" },
  { guest: "Marveen", days: 4, start: 7, color: "#0f172a" },
  { guest: "Juliette 🇫🇷", days: 2, start: 10, color: "#0f172a" },
  { guest: "Séjour", days: 7, start: 11, color: "#6b7280" },
  { guest: "Séjour", days: 7, start: 18, color: "#6b7280" },
  { guest: "Zrioui", days: 4, start: 27, color: "#d4af37" },
  { guest: "Elena 🇷🇺", days: 3, start: 31, color: "#0f172a" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #d4af37, #b8962e)" }}>
        <Building2 size={16} color="#0f172a" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-black tracking-tight" style={{ fontFamily: "Georgia, serif", color: "#0f172a" }}>
        GREAT<span style={{ color: "#d4af37" }}>IMMOB</span>
      </span>
    </div>
  );
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: "rgba(15,23,42,0.06)" }}>
      {([["fr","FR"],["en","EN"],["ar","ع"]] as [Lang,string][]).map(([code, label]) => (
        <button key={code} onClick={() => setLang(code)}
          className="w-8 h-7 rounded-full text-xs font-bold transition-all duration-200"
          style={{ background: lang === code ? "#0f172a" : "transparent", color: lang === code ? "#d4af37" : "#6b7280" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Navbar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const t = T[lang];
  return (
    <motion.header initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
      className="fixed top-0 left-0 right-0 z-50" dir={t.dir}
      style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 2px 24px rgba(15,23,42,0.06)" }}>
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "#374151" }}>
          <a href="#preuves" className="hover:opacity-60 transition-opacity">{t.nav.proof}</a>
          <a href="#calculator" className="hover:opacity-60 transition-opacity">{t.nav.simulator}</a>
          <a href="#legal" className="hover:opacity-60 transition-opacity">{t.nav.legal}</a>
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitcher lang={lang} setLang={setLang} />
          <a href={WA("Bonjour Hamza 👋")} target="_blank" rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: "#0f172a", color: "#d4af37" }}>
            <MessageCircle size={14} />{t.nav.cta}
          </a>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          <div className="w-5 h-0.5 mb-1" style={{ background: "#0f172a" }} />
          <div className="w-5 h-0.5 mb-1" style={{ background: "#0f172a" }} />
          <div className="w-5 h-0.5" style={{ background: "#0f172a" }} />
        </button>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
          <a href="#calculator" className="text-sm font-medium pt-3" style={{ color: "#374151" }}>{t.nav.simulator}</a>
          <a href={WA("Bonjour Hamza 👋")} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
            style={{ background: "#0f172a", color: "#d4af37" }}>
            <MessageCircle size={14} />{t.nav.cta}
          </a>
        </div>
      )}
    </motion.header>
  );
}

function Hero({ lang }: { lang: Lang }) {
  const t = T[lang].hero;
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden"
      dir={T[lang].dir} style={{ background: "linear-gradient(160deg, #ffffff 0%, #faf8f2 60%, #f3edd8 100%)" }}>
      <div className="absolute top-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }} />
      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex flex-wrap justify-center gap-2 mb-10">
          {[t.badge1, t.badge2, t.badge3].map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#0f172a" }}>
              <span style={{ color: "#d4af37" }}>
                {i === 0 ? <Shield size={12} /> : i === 1 ? <Lock size={12} /> : <BadgeCheck size={12} />}
              </span>{b}
            </div>
          ))}
        </motion.div>
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="font-black leading-tight mb-5"
          style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem, 6vw, 4.8rem)", color: "#0f172a", letterSpacing: "-0.02em" }}>
          {t.h1a}<br /><span style={{ color: "#d4af37" }}>{t.h1b}</span>
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "#4b5563" }}>
          {t.sub}
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#calculator"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all hover:scale-105"
            style={{ background: "#d4af37", color: "#0f172a", boxShadow: "0 8px 32px rgba(212,175,55,0.4)" }}>
            <BarChart3 size={18} />{t.cta1}
          </a>
          <a href={WA("Bonjour Hamza 👋")} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base border-2 transition-all hover:scale-105"
            style={{ borderColor: "#0f172a", color: "#0f172a" }}>
            {t.cta2} <ArrowRight size={16} />
          </a>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="mt-20 flex flex-col items-center gap-1 opacity-30">
          <span className="text-xs tracking-widest uppercase" style={{ color: "#0f172a" }}>{t.scroll}</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={18} style={{ color: "#0f172a" }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsBar({ lang }: { lang: Lang }) {
  const stats = T[lang].stats;
  const icons = [<Star size={22} key="s" />, <Calendar size={22} key="c" />, <Award size={22} key="a" />];
  return (
    <section style={{ background: "#0f172a" }} dir={T[lang].dir}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i}
              className="flex flex-col items-center text-center py-10 px-6 relative">
              {i < 2 && <div className="hidden md:block absolute right-0 top-1/4 h-1/2 w-px" style={{ background: "rgba(212,175,55,0.2)" }} />}
              <span style={{ color: "#d4af37" }} className="mb-3">{icons[i]}</span>
              <span className="text-4xl font-black mb-1" style={{ color: "#d4af37", fontFamily: "Georgia, serif" }}>{s.value}</span>
              <span className="text-xs tracking-wider uppercase font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalendarProof({ lang }: { lang: Lang }) {
  const t = T[lang].calendar;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weeks: number[][] = [];
  let week: number[] = [];
  for (let i = 0; i < 3; i++) week.push(0);
  days.forEach((d) => { week.push(d); if (week.length === 7) { weeks.push(week); week = []; } });
  if (week.length) { while (week.length < 7) week.push(0); weeks.push(week); }
  const getBooking = (day: number) => day === 0 ? null : CALENDAR_BOOKINGS.find((b) => day >= b.start && day < b.start + b.days) || null;
  return (
    <section id="preuves" className="py-24" dir={T[lang].dir} style={{ background: "#ffffff" }}>
      <div className="max-w-5xl mx-auto px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: "#d4af37" }}>{t.tag}</p>
          <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "Georgia, serif", color: "#0f172a" }}>
            {t.h2a}<br /><span style={{ color: "#d4af37" }}>{t.h2b}</span>
          </h2>
          <p className="text-base" style={{ color: "#6b7280" }}>{t.sub}</p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          className="rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 20px 60px rgba(15,23,42,0.08)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: "#0f172a" }}>
            <span className="font-bold text-lg" style={{ color: "#ffffff", fontFamily: "Georgia, serif" }}>Janvier 2025</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: "rgba(212,175,55,0.2)", color: "#d4af37" }}>Agadir</span>
          </div>
          <div className="grid grid-cols-7 px-4 pt-3 pb-1" style={{ background: "#fafaf8" }}>
            {t.days.map((d) => <div key={d} className="text-center text-xs font-bold py-1" style={{ color: "#9ca3af" }}>{d}</div>)}
          </div>
          <div style={{ background: "#fafaf8" }} className="px-4 pb-4">
            {weeks.map((wk, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {wk.map((day, di) => {
                  const booking = getBooking(day);
                  const isStart = booking && day === booking.start;
                  return (
                    <div key={di} className="relative h-14 rounded-xl flex flex-col items-start justify-start p-1.5 overflow-hidden"
                      style={{ background: day === 0 ? "transparent" : "#ffffff", border: day === 0 ? "none" : "1px solid #f3f4f6" }}>
                      {day > 0 && (<>
                        <span className="text-xs font-bold z-10 relative" style={{ color: booking ? "#ffffff" : "#374151" }}>{day}</span>
                        {booking && (
                          <div className="absolute inset-0 flex items-center px-2" style={{ background: booking.color, borderRadius: "10px" }}>
                            {isStart && <span className="text-xs font-bold truncate" style={{ color: booking.color === "#d4af37" ? "#0f172a" : "#ffffff" }}>{booking.guest}</span>}
                          </div>
                        )}
                      </>)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 flex items-center gap-6 flex-wrap" style={{ borderTop: "1px solid rgba(212,175,55,0.15)", background: "#fafaf8" }}>
            {[{ color: "#0f172a", label: t.legend[0] }, { color: "#d4af37", label: t.legend[1] }, { color: "#6b7280", label: t.legend[2] }].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: "#6b7280" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
          className="text-center mt-4 text-sm font-medium" style={{ color: "#9ca3af" }}>
          {t.result} <strong style={{ color: "#0f172a" }}>{t.nights}</strong>
        </motion.p>
      </div>
    </section>
  );
}

function RealReviews({ lang }: { lang: Lang }) {
  const t = T[lang].reviews;
  return (
    <section className="py-24" dir={T[lang].dir} style={{ background: "#f9f7f2" }}>
      <div className="max-w-5xl mx-auto px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: "#d4af37" }}>{t.tag}</p>
          <h2 className="text-4xl font-black" style={{ fontFamily: "Georgia, serif", color: "#0f172a" }}>{t.h2}</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <motion.div key={r.name} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              className="p-6 rounded-2xl"
              style={{ background: "#ffffff", border: "1px solid rgba(212,175,55,0.15)", boxShadow: "0 4px 24px rgba(15,23,42,0.05)" }}>
              <div className="flex mb-3">{[...Array(r.stars)].map((_, j) => <Star key={j} size={13} fill="#d4af37" style={{ color: "#d4af37" }} />)}</div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#374151" }}>"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#0f172a", color: "#d4af37" }}>{r.name[0]}</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#0f172a" }}>{r.flag} {r.name}</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>{t.verified} · {r.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: "#ffffff", border: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
            <BadgeCheck size={18} style={{ color: "#d4af37" }} />
            <span className="text-sm font-bold" style={{ color: "#0f172a" }}>{t.badge}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// --- FINAL FIXED CALCULATOR ---
function Calculator({ lang }: { lang: Lang }) {
  const t = T[lang].calc;
  const [quartier, setQuartier] = useState("");
  const [type, setType] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent">("idle");

  const canStep1 = quartier.trim().length >= 2 && type;
  const canStep2 = name.length >= 2 && phone.length >= 9;

  const sendToSheets = async () => {
    setSubmitState("sending");
    try {
      await fetch(SHEETS_URL, {
        method: "POST", mode: "no-cors",
        // !!! CRITICAL FIX: text/plain to bypass Google blocking !!!
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ name, phone, quartier, type, estimation: "Requested Estimate (+60-120%)", message }),
      });
    } catch (_) {}
    setSubmitState("sent");
  };

  const handleReveal = async () => {
    if (!canStep2) return;
    setStep(3);
    await sendToSheets();
  };

  const waMsg = lang === "ar"
    ? `مرحبا حمزة 👋 اسمي ${name}. قمت بطلب تقدير لـ (${type} في ${quartier}). رقمي: +212${phone}. أنتظر تقريري. ${message ? `. ملاحظات: ${message}` : ""}`
    : lang === "en"
    ? `Hello Hamza 👋 My name is ${name}. I requested an estimate for (${type} in ${quartier}). My number: +212${phone}. I am waiting for my report. ${message ? `. Notes: ${message}` : ""}`
    : `Bonjour Hamza 👋 Je m'appelle ${name}. J'ai demandé une estimation pour (${type} à ${quartier}). Mon numéro : +212${phone}. J'attends mon rapport. ${message ? `. Détails : ${message}` : ""}`;

  return (
    <section id="calculator" className="py-24" dir={T[lang].dir} style={{ background: "linear-gradient(160deg, #ffffff 0%, #f9f7f2 100%)" }}>
      <div className="max-w-2xl mx-auto px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: "#d4af37" }}>{t.tag}</p>
          <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "Georgia, serif", color: "#0f172a" }}>{t.h2a}<br />{t.h2b}</h2>
          <p className="text-base" style={{ color: "#6b7280" }}>{t.sub}</p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          className="rounded-3xl overflow-hidden"
          style={{ background: "#ffffff", boxShadow: "0 24px 80px rgba(15,23,42,0.10), 0 0 0 1px rgba(212,175,55,0.15)" }}>
          <div className="px-7 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} style={{ color: "#d4af37" }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#d4af37" }}>{t.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {[1,2,3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{ background: step >= s ? "#d4af37" : "#f3f4f6", color: step >= s ? "#0f172a" : "#9ca3af" }}>
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  {s < 3 && <div className="h-px w-6" style={{ background: step > s ? "#d4af37" : "#e5e7eb" }} />}
                </div>
              ))}
              <span className="text-xs ml-2" style={{ color: "#9ca3af" }}>{t.steps[step - 1]}</span>
            </div>
          </div>
          <div className="p-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#0f172a" }}>
                      <Building2 size={14} className="inline mr-1.5" style={{ color: "#d4af37" }} />{t.quartierLabel}
                    </label>
                    <input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder={t.quartierPlaceholder}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: quartier.trim().length >= 2 ? "#d4af37" : "#e5e7eb", color: "#0f172a", boxShadow: quartier.trim().length >= 2 ? "0 0 0 3px rgba(212,175,55,0.12)" : "none" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-3" style={{ color: "#0f172a" }}>
                      <Home size={14} className="inline mr-1.5" style={{ color: "#d4af37" }} />{t.typeLabel}
                    </label>
                    <div className="flex flex-col gap-2">
                      {t.types.map((tp) => (
                        <button key={tp} onClick={() => setType(tp)}
                          className="py-3 px-4 rounded-xl text-sm font-semibold border-2 text-left transition-all"
                          style={{ borderColor: type === tp ? "#d4af37" : "#e5e7eb", background: type === tp ? "rgba(212,175,55,0.08)" : "#fafafa", color: type === tp ? "#0f172a" : "#6b7280" }}>
                          {tp}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => canStep1 && setStep(2)} disabled={!canStep1}
                    className="w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 hover:scale-[1.01]"
                    style={{ background: canStep1 ? "#d4af37" : "#e5e7eb", color: canStep1 ? "#0f172a" : "#9ca3af", boxShadow: canStep1 ? "0 8px 24px rgba(212,175,55,0.3)" : "none" }}>
                    {t.next}
                  </button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
                  <div className="p-4 rounded-xl flex gap-3" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <Lock size={15} style={{ color: "#d4af37", flexShrink: 0, marginTop: 2 }} />
                    <p className="text-sm" style={{ color: "#4b5563" }}>{t.privacy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#0f172a" }}>{t.nameLabel}</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: name.length >= 2 ? "#d4af37" : "#e5e7eb", color: "#0f172a", boxShadow: name.length >= 2 ? "0 0 0 3px rgba(212,175,55,0.12)" : "none" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#0f172a" }}>{t.phoneLabel}</label>
                    <div className="flex gap-2">
                      <div className="px-4 py-3 rounded-xl border text-sm font-medium" style={{ borderColor: "#e5e7eb", background: "#f9fafb", color: "#6b7280" }}>🇲🇦 +212</div>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder={t.phonePlaceholder}
                        className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                        style={{ borderColor: phone.length >= 9 ? "#d4af37" : "#e5e7eb", color: "#0f172a", boxShadow: phone.length >= 9 ? "0 0 0 3px rgba(212,175,55,0.12)" : "none" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "#9ca3af" }}>{t.messageLabel}</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} rows={3}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
                      style={{ borderColor: "#e5e7eb", color: "#0f172a" }} />
                  </div>
                  <button onClick={handleReveal} disabled={!canStep2 || submitState === "sending"}
                    className="w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 hover:scale-[1.01]"
                    style={{ background: canStep2 ? "#d4af37" : "#e5e7eb", color: canStep2 ? "#0f172a" : "#9ca3af", boxShadow: canStep2 ? "0 8px 24px rgba(212,175,55,0.3)" : "none" }}>
                    {submitState === "sending" ? t.sending : t.reveal}
                  </button>
                  <button onClick={() => setStep(1)} className="w-full text-sm text-center hover:opacity-60 transition-opacity" style={{ color: "#9ca3af" }}>{t.back}</button>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }} className="space-y-6 text-center">
                  
                  {/* SUCCESS HEADER */}
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(34,197,94,0.1)" }}>
                       {submitState === "sent" 
                         ? <CheckCircle size={32} style={{ color: "#16a34a" }} />
                         : <Loader2 size={32} className="animate-spin" style={{ color: "#d4af37" }} />
                       }
                     </div>
                     <h3 className="text-2xl font-black" style={{ color: "#0f172a", fontFamily: "Georgia, serif" }}>{t.successTitle}</h3>
                     <p className="text-sm font-medium mt-1" style={{ color: "#d4af37" }}>{t.successSub}</p>
                  </div>

                  {/* PERCENTAGE CARD */}
                  <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background: "#0f172a", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ background: "radial-gradient(circle, #d4af37, transparent)" }} />
                    <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>{t.estTitle}</p>
                    <p className="text-5xl font-black mb-1" style={{ color: "#d4af37", fontFamily: "Georgia, serif" }}>{t.estRange}</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{t.estSub}</p>
                  </div>

                  {/* DISCLAIMER BOX */}
                  <div className="p-5 rounded-xl text-left" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="flex gap-3">
                      <FileText size={20} className="shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: "#334155" }}>
                          {t.finalMsg}
                        </p>
                        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
                          {t.ctaAction}
                        </p>
                      </div>
                    </div>
                  </div>

                  <a href={WA(waMsg)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] animate-pulse"
                    style={{ background: "#25D366", color: "#ffffff", boxShadow: "0 8px 28px rgba(37,211,102,0.3)" }}>
                    <MessageCircle size={18} />{t.waBtn}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LegalSection({ lang }: { lang: Lang }) {
  const t = T[lang].legal;
  const icons = [<Shield size={20} key="s" />, <Lock size={20} key="l" />, <Users size={20} key="u" />, <TrendingUp size={20} key="t" />];
  return (
    <section id="legal" className="py-24" dir={T[lang].dir} style={{ background: "#0f172a" }}>
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: "#d4af37" }}>{t.tag}</p>
            <h2 className="text-4xl font-black mb-5 leading-tight" style={{ fontFamily: "Georgia, serif", color: "#ffffff" }}>
              {t.h2a}<br /><span style={{ color: "#d4af37" }}>{t.h2b}</span>
            </h2>
            <p className="text-base leading-relaxed mb-7" style={{ color: "rgba(255,255,255,0.6)" }}>{t.sub}</p>
            <a href={WA("Bonjour Hamza, j'ai des questions sur la sécurité et la légalité.")} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "#d4af37", color: "#0f172a" }}>
              {t.cta} <ArrowRight size={14} />
            </a>
          </motion.div>
          <div className="space-y-3">
            {t.points.map((p, i) => (
              <motion.div key={p.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}
                className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.12)", color: "#d4af37" }}>{icons[i]}</div>
                <div>
                  <h4 className="font-bold text-sm mb-1" style={{ color: "#ffffff" }}>{p.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ lang }: { lang: Lang }) {
  const t = T[lang].finalCta;
  return (
    <section className="py-24 relative overflow-hidden" dir={T[lang].dir} style={{ background: "linear-gradient(160deg, #faf8f2 0%, #ffffff 100%)" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }} />
      <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-8"
            style={{ background: "rgba(212,175,55,0.1)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.25)" }}>
            <Phone size={12} />{t.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight" style={{ fontFamily: "Georgia, serif", color: "#0f172a" }}>
            {t.h2a}<br /><span style={{ color: "#d4af37" }}>{t.h2b}</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: "#6b7280" }}>{t.sub}</p>
          <a href={WA("Bonjour Hamza 👋 Je souhaite confier mon appartement à GreatImmob.")} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-black text-lg transition-all hover:scale-105"
            style={{ background: "#0f172a", color: "#d4af37", boxShadow: "0 16px 48px rgba(15,23,42,0.2)" }}>
            <MessageCircle size={22} />{t.btn}
          </a>
          <p className="mt-5 text-xs" style={{ color: "#9ca3af" }}>{t.footer}</p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="py-8" dir={T[lang].dir} style={{ background: "#0a1020", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
      <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)" }}>{T[lang].footerCopy}</p>
        <a href={WA("Bonjour Hamza")} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: "#d4af37" }}>WhatsApp →</a>
      </div>
    </footer>
  );
}

export default function Page() {
  const [lang, setLang] = useState<Lang>("fr");
  return (
    <main className="min-h-screen antialiased" style={{ fontFamily: "system-ui, sans-serif" }}>
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <StatsBar lang={lang} />
      <CalendarProof lang={lang} />
      <RealReviews lang={lang} />
      <Calculator lang={lang} />
      <LegalSection lang={lang} />
      <FinalCTA lang={lang} />
      <Footer lang={lang} />
    </main>
  );
}