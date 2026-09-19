import type { Lang } from "@/lib/i18n";

export interface DemoQuery {
  label: string;
  query: string;
  lang: Lang;
}

export const DEMO_QUERIES: DemoQuery[] = [
  {
    label: "Product → Standard",
    query: "I manufacture electric kettles. Which BIS standards and certification apply to me?",
    lang: "en",
  },
  {
    label: "Certification process",
    query: "What are the steps to get an ISI mark licence for my factory?",
    lang: "en",
  },
  {
    label: "Multilingual (Telugu)",
    query: "నేను బంగారు ఆభరణాలు అమ్ముతున్నాను. హాల్‌మార్కింగ్ నియమాలు ఏమిటి?",
    lang: "te",
  },
];

const KEY = "bismart_demo_query";

export function stageDemoQuery(q: DemoQuery) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ query: q.query, lang: q.lang }));
  } catch {
    /* storage unavailable */
  }
}

export function consumeDemoQuery(): { query: string; lang: Lang } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as { query: string; lang: Lang };
  } catch {
    return null;
  }
}
