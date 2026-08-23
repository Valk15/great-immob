/** Presentation-form reshape so Arabic joins in pdf-lib (no HarfBuzz). */
const FORMS: Record<string, [string, string, string, string]> = {
  ا: ["\uFE8D", "\uFE8D", "\uFE8E", "\uFE8E"],
  أ: ["\uFE83", "\uFE83", "\uFE84", "\uFE84"],
  إ: ["\uFE87", "\uFE87", "\uFE88", "\uFE88"],
  آ: ["\uFE81", "\uFE81", "\uFE82", "\uFE82"],
  ب: ["\uFE8F", "\uFE91", "\uFE90", "\uFE92"],
  ت: ["\uFE95", "\uFE97", "\uFE96", "\uFE98"],
  ث: ["\uFE99", "\uFE9B", "\uFE9A", "\uFE9C"],
  ج: ["\uFE9D", "\uFE9F", "\uFE9E", "\uFEA0"],
  ح: ["\uFEA1", "\uFEA3", "\uFEA2", "\uFEA4"],
  خ: ["\uFEA5", "\uFEA7", "\uFEA6", "\uFEA8"],
  د: ["\uFEA9", "\uFEA9", "\uFEAA", "\uFEAA"],
  ذ: ["\uFEAB", "\uFEAB", "\uFEAC", "\uFEAC"],
  ر: ["\uFEAD", "\uFEAD", "\uFEAE", "\uFEAE"],
  ز: ["\uFEAF", "\uFEAF", "\uFEB0", "\uFEB0"],
  س: ["\uFEB1", "\uFEB3", "\uFEB2", "\uFEB4"],
  ش: ["\uFEB5", "\uFEB7", "\uFEB6", "\uFEB8"],
  ص: ["\uFEB9", "\uFEBB", "\uFEBA", "\uFEBC"],
  ض: ["\uFEBD", "\uFEBF", "\uFEBE", "\uFEC0"],
  ط: ["\uFEC1", "\uFEC3", "\uFEC2", "\uFEC4"],
  ظ: ["\uFEC5", "\uFEC7", "\uFEC6", "\uFEC8"],
  ع: ["\uFEC9", "\uFECB", "\uFECA", "\uFECC"],
  غ: ["\uFECD", "\uFECF", "\uFECE", "\uFED0"],
  ف: ["\uFED1", "\uFED3", "\uFED2", "\uFED4"],
  ق: ["\uFED5", "\uFED7", "\uFED6", "\uFED8"],
  ك: ["\uFED9", "\uFEDB", "\uFEDA", "\uFEDC"],
  ل: ["\uFEDD", "\uFEDF", "\uFEDE", "\uFEE0"],
  م: ["\uFEE1", "\uFEE3", "\uFEE2", "\uFEE4"],
  ن: ["\uFEE5", "\uFEE7", "\uFEE6", "\uFEE8"],
  ه: ["\uFEE9", "\uFEEB", "\uFEEA", "\uFEEC"],
  و: ["\uFEED", "\uFEED", "\uFEEE", "\uFEEE"],
  ي: ["\uFEF1", "\uFEF3", "\uFEF2", "\uFEF4"],
  ى: ["\uFEEF", "\uFEEF", "\uFEF0", "\uFEF0"],
  ة: ["\uFE93", "\uFE93", "\uFE94", "\uFE94"],
  ء: ["\uFE80", "\uFE80", "\uFE80", "\uFE80"],
  ئ: ["\uFE89", "\uFE8B", "\uFE8A", "\uFE8C"],
  ؤ: ["\uFE85", "\uFE85", "\uFE86", "\uFE86"],
};

const DUAL = new Set("بتثجحخسشصضطظعغفقكلمنهويئ");
const LIGATURES: [string, string][] = [
  ["\uFEDF\uFE8E", "\uFEFC"],
  ["\uFEE0\uFE8E", "\uFEFB"],
];

function isArabicChar(ch: string) {
  const c = ch.charCodeAt(0);
  return (c >= 0x0600 && c <= 0x06ff) || (c >= 0xfb50 && c <= 0xfdff) || (c >= 0xfe70 && c <= 0xfeff);
}

export function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function formIndex(connectsPrev: boolean, connectsNext: boolean) {
  if (connectsPrev && connectsNext) return 3;
  if (!connectsPrev && connectsNext) return 1;
  if (connectsPrev && !connectsNext) return 2;
  return 0;
}

export function reshapeArabic(input: string) {
  const chars = [...input];
  const out: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const forms = FORMS[ch];
    if (!forms) {
      out.push(ch);
      continue;
    }
    const prev = i > 0 ? chars[i - 1] : "";
    const next = i < chars.length - 1 ? chars[i + 1] : "";
    const prevConnects = Boolean(FORMS[prev] && DUAL.has(prev));
    const nextConnects = Boolean(FORMS[next]);
    out.push(forms[formIndex(prevConnects, nextConnects && DUAL.has(ch))]);
  }
  let s = out.join("");
  for (const [from, to] of LIGATURES) s = s.replaceAll(from, to);
  return s;
}

/** Visual order for pdf-lib (draws left-to-right). */
export function arabicForPdf(text: string) {
  return reshapeArabic(text)
    .split(/(\s+)/)
    .map((part) => (isArabicChar(part[0] || "") ? [...part].reverse().join("") : part))
    .reverse()
    .join("");
}
