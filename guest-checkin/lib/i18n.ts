export type GuestLocale = "fr" | "en" | "de" | "ar";

export const GUEST_LOCALES: { id: GuestLocale; native: string }[] = [
  { id: "fr", native: "Français" },
  { id: "en", native: "English" },
  { id: "de", native: "Deutsch" },
  { id: "ar", native: "العربية" },
];

export function parseLocale(raw: unknown): GuestLocale {
  const v = String(raw || "").toLowerCase();
  if (v === "en" || v === "de" || v === "ar" || v === "fr") return v;
  return "fr";
}

export function localeFromBrowser(headerOrNav?: string) {
  const raw = (headerOrNav || "").toLowerCase();
  if (raw.startsWith("ar")) return "ar" as const;
  if (raw.startsWith("de")) return "de" as const;
  if (raw.startsWith("en")) return "en" as const;
  return "fr" as const;
}

export type GuestCopy = {
  dir: "ltr" | "rtl";
  lang: string;
  language: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  dates: (checkIn: string, checkOut: string) => string;
  steps: [string, string, string, string];
  tenant: string;
  lastName: string;
  firstName: string;
  cin: string;
  gender: string;
  genderChoose: string;
  genderMale: string;
  genderFemale: string;
  nationality: string;
  phone: string;
  email: string;
  cohabitants: string;
  cohabitantsHint: string;
  addCohabitant: string;
  idTitle: string;
  idHint: string;
  idFront: string;
  idBack: string;
  contractTitle: string;
  contractKind: string;
  staySummary: (from: string, to: string, n: number, landlord: string) => string;
  acceptRules: string;
  signTitle: string;
  signLabel: string;
  signHint: string;
  signClear: string;
  back: string;
  continue: string;
  sending: string;
  signSend: string;
  signMissing: string;
  sendFail: string;
  doneEyebrow: string;
  doneTitle: string;
  doneBoth: string;
  doneGuestOnly: string;
  download: string;
  downloadHint: string;
  closed: string;
  whatsapp: string;
  houseRules: string[];
  errors: {
    identity: string;
    gender: string;
    rules: string;
    signature: string;
    idRecto: string;
    tooHeavy: string;
    versoHeavy: string;
    closed: string;
    invalid: string;
    pdf: string;
  };
  contract: {
    title: string;
    subtitle: string;
    city: string;
    date: string;
    place: string;
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    lastName: string;
    firstName: string;
    cin: string;
    nationality: string;
    address: string;
    phone: string;
    gender: string;
    male: string;
    female: string;
    none: string;
    noCohabitants: string;
    headers: [string, string, string, string, string];
    apartment: string;
    duration: (from: string, to: string) => string;
    guests: string;
    channel: string;
    airbnb: string;
    classique: string;
    landlord: string;
    tenant: string;
    landlordNationality: string;
    footer: string;
  };
};

const FR: GuestCopy = {
  dir: "ltr",
  lang: "fr",
  language: "Langue du contrat",
  eyebrow: "Check-in · GreatImmob",
  title: "Contrat de location",
  titleAccent: " courte durée.",
  dates: (a, b) => `Du ${a} au ${b}`,
  steps: ["Identité", "Pièce", "Contrat", "Signature"],
  tenant: "Le locataire",
  lastName: "Nom",
  firstName: "Prénom",
  cin: "N° CIN / Passeport",
  gender: "Genre",
  genderChoose: "Choisir",
  genderMale: "Homme",
  genderFemale: "Femme",
  nationality: "Nationalité",
  phone: "Téléphone",
  email: "E-mail (optionnel)",
  cohabitants: "Cohabitants",
  cohabitantsHint: "Les autres personnes du séjour, s'il y en a.",
  addCohabitant: "Ajouter un cohabitant",
  idTitle: "Pièce d'identité",
  idHint: "Photo nette, JPG ou PNG. Recto obligatoire. Verso si CIN.",
  idFront: "Recto",
  idBack: "Verso (optionnel)",
  contractTitle: "Contrat",
  contractKind: "Location saisonnière / courte durée",
  staySummary: (from, to, n, landlord) =>
    `Du ${from} au ${to} · ${n} personne(s) · Bailleur ${landlord}`,
  acceptRules: "J'ai lu le règlement intérieur et j'accepte ce contrat de location courte durée.",
  signTitle: "Signature du locataire",
  signLabel: "Signez ici",
  signHint: "Dessinez dans le cadre — souris, stylet ou doigt.",
  signClear: "Effacer et redessiner",
  back: "Retour",
  continue: "Continuer",
  sending: "Envoi…",
  signSend: "Signer et envoyer",
  signMissing: "Signez avec le doigt dans le cadre.",
  sendFail: "Envoi impossible. Réessayez.",
  doneEyebrow: "Check-in reçu",
  doneTitle: "Votre contrat est prêt.",
  doneBoth: "Le PDF porte votre signature et celle de Hamza. Conservez une copie.",
  doneGuestOnly: "Téléchargez votre exemplaire. Hamza ajoutera sa signature ensuite si besoin.",
  download: "Télécharger mon contrat signé (PDF)",
  downloadHint: "Contrat uniquement",
  closed: "Check-in déjà envoyé. Téléchargez votre exemplaire du contrat signé.",
  whatsapp: "WhatsApp Hamza : +212 641 553 583",
  houseRules: [
    "L'appartement est uniquement destiné à un usage de location courte durée.",
    "Toute activité commerciale est strictement interdite.",
    "Les fêtes, événements ou rassemblements sont strictement interdits.",
    "Toute forme de tournage vidéo, film ou shooting est interdite sans autorisation.",
    "Les couples marocains non mariés ne sont pas autorisés.",
    "Il est strictement interdit de fumer à l'intérieur de l'appartement (uniquement près de la fenêtre ou à l'extérieur du bâtiment).",
    "Les animaux sont interdits.",
    "Le respect du voisinage est obligatoire.",
    "Toute dégradation sera facturée au locataire.",
    "Les ordures doivent être déposées dans les espaces prévus.",
  ],
  errors: {
    identity: "Champs identité incomplets.",
    gender: "Genre requis.",
    rules: "Le règlement doit être accepté.",
    signature: "Signature manuscrite manquante.",
    idRecto: "Photo d'identité (recto) requise.",
    tooHeavy: "Image trop lourde (max 8 Mo).",
    versoHeavy: "Verso trop lourd.",
    closed: "Ce séjour est déjà clôturé.",
    invalid: "Lien invalide",
    pdf: "Le contrat n'a pas pu être généré. Réessayez dans un instant.",
  },
  contract: {
    title: "CONTRAT DE LOCATION COURTE DUREE",
    subtitle: "LOCATION SAISONNIERE / COURTE DUREE",
    city: "Agadir - Maroc",
    date: "Date",
    place: "Lieu",
    section1: "1  |  INFORMATIONS SUR LE BAILLEUR  ·  INFORMATIONS SUR LE LOCATAIRE",
    section2: "2  |  INFORMATIONS SUR LES COHABITANTS",
    section3: "3  |  INFORMATIONS SUR LA LOCATION",
    section4: "4  |  REGLEMENT INTERIEUR",
    lastName: "Nom",
    firstName: "Prenom",
    cin: "N° CIN / Passeport",
    nationality: "Nationalite",
    address: "Adresse",
    phone: "Telephone",
    gender: "Genre",
    male: "Homme",
    female: "Femme",
    none: "-",
    noCohabitants: "Aucun cohabitant declare.",
    headers: ["NOM", "PRENOM", "CIN / PASSEPORT", "NATIONALITE", "TELEPHONE"],
    apartment: "Adresse de l'appartement",
    duration: (from, to) => `Duree d'hebergement    Du : ${from}    au : ${to}`,
    guests: "Nombre de personnes",
    channel: "Canal de reservation",
    airbnb: "Airbnb",
    classique: "Classique",
    landlord: "LE BAILLEUR",
    tenant: "LE LOCATAIRE",
    landlordNationality: "Marocaine",
    footer:
      "Signature manuscrite sur ecran · document genere par GreatImmob · ne remplace pas un acte notarie.",
  },
};

const EN: GuestCopy = {
  dir: "ltr",
  lang: "en",
  language: "Contract language",
  eyebrow: "Check-in · GreatImmob",
  title: "Short-term rental",
  titleAccent: " contract.",
  dates: (a, b) => `From ${a} to ${b}`,
  steps: ["Identity", "ID", "Contract", "Signature"],
  tenant: "The tenant",
  lastName: "Last name",
  firstName: "First name",
  cin: "ID / Passport no.",
  gender: "Gender",
  genderChoose: "Select",
  genderMale: "Male",
  genderFemale: "Female",
  nationality: "Nationality",
  phone: "Phone",
  email: "Email (optional)",
  cohabitants: "Other guests",
  cohabitantsHint: "Anyone else staying, if applicable.",
  addCohabitant: "Add another guest",
  idTitle: "Identity document",
  idHint: "Clear photo, JPG or PNG. Front required. Back if it is a national ID.",
  idFront: "Front",
  idBack: "Back (optional)",
  contractTitle: "Contract",
  contractKind: "Seasonal / short-term rental",
  staySummary: (from, to, n, landlord) =>
    `From ${from} to ${to} · ${n} guest(s) · Landlord ${landlord}`,
  acceptRules: "I have read the house rules and I accept this short-term rental contract.",
  signTitle: "Tenant signature",
  signLabel: "Sign here",
  signHint: "Draw in the box — mouse, stylus or finger.",
  signClear: "Erase and redraw",
  back: "Back",
  continue: "Continue",
  sending: "Sending…",
  signSend: "Sign and send",
  signMissing: "Please sign with your finger in the box.",
  sendFail: "Could not send. Please try again.",
  doneEyebrow: "Check-in received",
  doneTitle: "Your contract is ready.",
  doneBoth: "The PDF has your signature and Hamza’s. Keep a copy.",
  doneGuestOnly: "Download your copy. Hamza will add his signature if needed.",
  download: "Download my signed contract (PDF)",
  downloadHint: "Contract only",
  closed: "Check-in already sent. Download your signed contract.",
  whatsapp: "WhatsApp Hamza: +212 641 553 583",
  houseRules: [
    "The apartment is for short-term rental use only.",
    "Any commercial activity is strictly forbidden.",
    "Parties, events or gatherings are strictly forbidden.",
    "Any video filming, movie or photoshoot is forbidden without authorization.",
    "Unmarried Moroccan couples are not allowed.",
    "Smoking inside the apartment is strictly forbidden (only by the window or outside the building).",
    "Pets are not allowed.",
    "Respect for neighbours is mandatory.",
    "Any damage will be charged to the tenant.",
    "Rubbish must be placed in the designated areas.",
  ],
  errors: {
    identity: "Identity fields are incomplete.",
    gender: "Gender is required.",
    rules: "The house rules must be accepted.",
    signature: "Handwritten signature is missing.",
    idRecto: "ID photo (front) is required.",
    tooHeavy: "Image too large (max 8 MB).",
    versoHeavy: "Back image too large.",
    closed: "This stay is already closed.",
    invalid: "Invalid link",
    pdf: "The contract could not be generated. Please try again shortly.",
  },
  contract: {
    title: "SHORT-TERM RENTAL AGREEMENT",
    subtitle: "SEASONAL / SHORT-TERM RENTAL",
    city: "Agadir - Morocco",
    date: "Date",
    place: "Place",
    section1: "1  |  LANDLORD INFORMATION  ·  TENANT INFORMATION",
    section2: "2  |  OTHER GUESTS",
    section3: "3  |  RENTAL INFORMATION",
    section4: "4  |  HOUSE RULES",
    lastName: "Last name",
    firstName: "First name",
    cin: "ID / Passport no.",
    nationality: "Nationality",
    address: "Address",
    phone: "Phone",
    gender: "Gender",
    male: "Male",
    female: "Female",
    none: "-",
    noCohabitants: "No other guests declared.",
    headers: ["LAST NAME", "FIRST NAME", "ID / PASSPORT", "NATIONALITY", "PHONE"],
    apartment: "Apartment address",
    duration: (from, to) => `Length of stay    From: ${from}    to: ${to}`,
    guests: "Number of guests",
    channel: "Booking channel",
    airbnb: "Airbnb",
    classique: "Direct",
    landlord: "THE LANDLORD",
    tenant: "THE TENANT",
    landlordNationality: "Moroccan",
    footer:
      "Handwritten on-screen signature · document generated by GreatImmob · not a notarised deed.",
  },
};

const DE: GuestCopy = {
  dir: "ltr",
  lang: "de",
  language: "Vertragssprache",
  eyebrow: "Check-in · GreatImmob",
  title: "Kurzzeitmietvertrag",
  titleAccent: ".",
  dates: (a, b) => `Vom ${a} bis ${b}`,
  steps: ["Identität", "Ausweis", "Vertrag", "Unterschrift"],
  tenant: "Der Mieter",
  lastName: "Nachname",
  firstName: "Vorname",
  cin: "Ausweis- / Reisepassnr.",
  gender: "Geschlecht",
  genderChoose: "Bitte wählen",
  genderMale: "Mann",
  genderFemale: "Frau",
  nationality: "Staatsangehörigkeit",
  phone: "Telefon",
  email: "E-Mail (optional)",
  cohabitants: "Mitbewohner",
  cohabitantsHint: "Weitere Personen des Aufenthalts, falls vorhanden.",
  addCohabitant: "Mitbewohner hinzufügen",
  idTitle: "Ausweisdokument",
  idHint: "Deutliches Foto, JPG oder PNG. Vorderseite Pflicht. Rückseite bei Personalausweis.",
  idFront: "Vorderseite",
  idBack: "Rückseite (optional)",
  contractTitle: "Vertrag",
  contractKind: "Saison- / Kurzzeitmiete",
  staySummary: (from, to, n, landlord) =>
    `Vom ${from} bis ${to} · ${n} Person(en) · Vermieter ${landlord}`,
  acceptRules: "Ich habe die Hausordnung gelesen und akzeptiere diesen Kurzzeitmietvertrag.",
  signTitle: "Unterschrift des Mieters",
  signLabel: "Hier unterschreiben",
  signHint: "Im Feld zeichnen — Maus, Stift oder Finger.",
  signClear: "Löschen und neu zeichnen",
  back: "Zurück",
  continue: "Weiter",
  sending: "Senden…",
  signSend: "Unterschreiben und senden",
  signMissing: "Bitte im Feld mit dem Finger unterschreiben.",
  sendFail: "Senden nicht möglich. Bitte erneut versuchen.",
  doneEyebrow: "Check-in eingegangen",
  doneTitle: "Ihr Vertrag ist fertig.",
  doneBoth: "Das PDF trägt Ihre Unterschrift und die von Hamza. Bitte eine Kopie behalten.",
  doneGuestOnly: "Laden Sie Ihr Exemplar herunter. Hamza fügt seine Unterschrift bei Bedarf hinzu.",
  download: "Meinen unterschriebenen Vertrag herunterladen (PDF)",
  downloadHint: "Nur der Vertrag",
  closed: "Check-in bereits gesendet. Laden Sie Ihren unterschriebenen Vertrag herunter.",
  whatsapp: "WhatsApp Hamza: +212 641 553 583",
  houseRules: [
    "Die Wohnung darf nur für Kurzzeitvermietung genutzt werden.",
    "Jede gewerbliche Nutzung ist streng untersagt.",
    "Feiern, Veranstaltungen oder Zusammenkünfte sind streng untersagt.",
    "Filmaufnahmen, Dreharbeiten oder Shootings ohne Genehmigung sind untersagt.",
    "Unverheiratete marokkanische Paare sind nicht gestattet.",
    "Rauchen in der Wohnung ist streng untersagt (nur am Fenster oder außerhalb des Gebäudes).",
    "Tiere sind nicht erlaubt.",
    "Rücksichtnahme auf die Nachbarn ist Pflicht.",
    "Jede Beschädigung wird dem Mieter in Rechnung gestellt.",
    "Müll ist an den vorgesehenen Stellen zu entsorgen.",
  ],
  errors: {
    identity: "Angaben zur Identität unvollständig.",
    gender: "Geschlecht ist erforderlich.",
    rules: "Die Hausordnung muss akzeptiert werden.",
    signature: "Handschriftliche Unterschrift fehlt.",
    idRecto: "Ausweisfoto (Vorderseite) ist erforderlich.",
    tooHeavy: "Bild zu groß (max. 8 MB).",
    versoHeavy: "Rückseite zu groß.",
    closed: "Dieser Aufenthalt ist bereits abgeschlossen.",
    invalid: "Ungültiger Link",
    pdf: "Der Vertrag konnte nicht erstellt werden. Bitte gleich erneut versuchen.",
  },
  contract: {
    title: "KURZZEITMIETVERTRAG",
    subtitle: "SAISON- / KURZZEITMIETE",
    city: "Agadir - Marokko",
    date: "Datum",
    place: "Ort",
    section1: "1  |  ANGABEN ZUM VERMIETER  ·  ANGABEN ZUM MIETER",
    section2: "2  |  MITBEWOHNER",
    section3: "3  |  ANGABEN ZUR MIETE",
    section4: "4  |  HAUSORDNUNG",
    lastName: "Nachname",
    firstName: "Vorname",
    cin: "Ausweis / Reisepass",
    nationality: "Staatsangehorigkeit",
    address: "Adresse",
    phone: "Telefon",
    gender: "Geschlecht",
    male: "Mann",
    female: "Frau",
    none: "-",
    noCohabitants: "Keine Mitbewohner angegeben.",
    headers: ["NACHNAME", "VORNAME", "AUSWEIS / PASS", "STAATSANGEH.", "TELEFON"],
    apartment: "Adresse der Wohnung",
    duration: (from, to) => `Aufenthaltsdauer    Von: ${from}    bis: ${to}`,
    guests: "Anzahl der Personen",
    channel: "Buchungskanal",
    airbnb: "Airbnb",
    classique: "Direkt",
    landlord: "DER VERMIETER",
    tenant: "DER MIETER",
    landlordNationality: "Marokkanisch",
    footer:
      "Handschriftliche Unterschrift am Bildschirm · erstellt von GreatImmob · kein notarieller Akt.",
  },
};

const AR: GuestCopy = {
  dir: "rtl",
  lang: "ar",
  language: "لغة العقد",
  eyebrow: "تسجيل الوصول · GreatImmob",
  title: "عقد كراء",
  titleAccent: " قصير المدة.",
  dates: (a, b) => `من ${a} إلى ${b}`,
  steps: ["الهوية", "الوثيقة", "العقد", "التوقيع"],
  tenant: "المستأجر",
  lastName: "الاسم العائلي",
  firstName: "الاسم الشخصي",
  cin: "رقم البطاقة / جواز السفر",
  gender: "الجنس",
  genderChoose: "اختيار",
  genderMale: "رجل",
  genderFemale: "امرأة",
  nationality: "الجنسية",
  phone: "الهاتف",
  email: "البريد الإلكتروني (اختياري)",
  cohabitants: "المرافقون",
  cohabitantsHint: "باقي الأشخاص في الإقامة، إن وُجدوا.",
  addCohabitant: "إضافة مرافق",
  idTitle: "وثيقة الهوية",
  idHint: "صورة واضحة، JPG أو PNG. الوجه الأمامي إلزامي. الخلف عند البطاقة الوطنية.",
  idFront: "الوجه",
  idBack: "الظهر (اختياري)",
  contractTitle: "العقد",
  contractKind: "كراء موسمي / قصير المدة",
  staySummary: (from, to, n, landlord) =>
    `من ${from} إلى ${to} · ${n} شخص · المكري ${landlord}`,
  acceptRules: "قرأت النظام الداخلي وأوافق على عقد الكراء القصير المدة.",
  signTitle: "توقيع المستأجر",
  signLabel: "وقّع هنا",
  signHint: "ارسم في الإطار — فأرة أو قلم أو إصبع.",
  signClear: "مسح وإعادة التوقيع",
  back: "رجوع",
  continue: "متابعة",
  sending: "جاري الإرسال…",
  signSend: "توقيع وإرسال",
  signMissing: "وقّع بإصبعك داخل الإطار.",
  sendFail: "تعذر الإرسال. أعد المحاولة.",
  doneEyebrow: "تم تسجيل الوصول",
  doneTitle: "عقدك جاهز.",
  doneBoth: "يحمل ملف PDF توقيعك وتوقيع حمزة. احتفظ بنسخة.",
  doneGuestOnly: "حمّل نسختك. سيضيف حمزة توقيعه عند الحاجة.",
  download: "تحميل عقدي الموقع (PDF)",
  downloadHint: "العقد فقط",
  closed: "تم إرسال تسجيل الوصول. حمّل نسخة العقد الموقع.",
  whatsapp: "واتساب حمزة : ‎+212 641 553 583",
  houseRules: [
    "الشقة مخصصة فقط للاستعمال في إطار الكراء القصير المدة.",
    "يمنع منعا كليا أي نشاط تجاري.",
    "تمنع الحفلات والفعاليات والتجمعات منعا كليا.",
    "يمنع أي تصوير فيديو أو فيلم أو جلسة تصوير دون ترخيص.",
    "لا يسمح للازواج المغاربة غير المتزوجين.",
    "يمنع التدخين داخل الشقة منعا كليا (فقط قرب النافذة أو خارج المبنى).",
    "تمنع الحيوانات.",
    "احترام الجيران إلزامي.",
    "أي إتلاف يفوتر على المستأجر.",
    "يجب وضع الأزبال في الأماكن المخصصة.",
  ],
  contract: {
    title: "عقد كراء قصير المدة",
    subtitle: "كراء موسمي / قصير المدة",
    city: "أكادير - المغرب",
    date: "التاريخ",
    place: "المكان",
    section1: "1  |  بيانات المكري  ·  بيانات المستأجر",
    section2: "2  |  بيانات المرافقين",
    section3: "3  |  بيانات الإقامة",
    section4: "4  |  النظام الداخلي",
    lastName: "الاسم العائلي",
    firstName: "الاسم الشخصي",
    cin: "البطاقة / جواز السفر",
    nationality: "الجنسية",
    address: "العنوان",
    phone: "الهاتف",
    gender: "الجنس",
    male: "رجل",
    female: "امرأة",
    none: "-",
    noCohabitants: "لا يوجد مرافقون.",
    headers: ["العائلي", "الشخصي", "البطاقة", "الجنسية", "الهاتف"],
    apartment: "عنوان الشقة",
    duration: (from, to) => `مدة الإقامة    من: ${from}    إلى: ${to}`,
    guests: "عدد الأشخاص",
    channel: "قناة الحجز",
    airbnb: "Airbnb",
    classique: "مباشر",
    landlord: "المكري",
    tenant: "المستأجر",
    landlordNationality: "مغربية",
    footer: "توقيع بخط اليد على الشاشة · وثيقة صادرة عن GreatImmob · ليست عقدا موثقا.",
  },
  errors: {
    identity: "بيانات الهوية غير مكتملة.",
    gender: "الجنس مطلوب.",
    rules: "يجب قبول النظام الداخلي.",
    signature: "التوقيع بخط اليد ناقص.",
    idRecto: "صورة الهوية (الوجه) مطلوبة.",
    tooHeavy: "الصورة ثقيلة جدا (الحد 8 ميغا).",
    versoHeavy: "صورة الظهر ثقيلة جدا.",
    closed: "هذا الإقامة مغلقة مسبقا.",
    invalid: "رابط غير صالح",
    pdf: "تعذر إنشاء العقد. أعد المحاولة بعد لحظات.",
  },
};

const ALL: Record<GuestLocale, GuestCopy> = { fr: FR, en: EN, de: DE, ar: AR };

export function guestCopy(locale: GuestLocale): GuestCopy {
  return ALL[locale] || FR;
}

export function countryLabel(code: string, locale: GuestLocale) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export function nationalityForLocale(raw: string, locale: GuestLocale) {
  const code = String(raw || "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code)) return countryLabel(code, locale);
  return String(raw || "").trim();
}
