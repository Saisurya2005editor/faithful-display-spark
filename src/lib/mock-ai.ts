/**
 * Mocked BISmart answer engine.
 *
 * Produces realistic, citation-backed answers from the sample dataset.
 * Prompt 2 replaces this with a real RAG pipeline; the shapes here match
 * what the backend will return (answer, citations, confidence, followups).
 */
import { findStandards, getScheme, labs, schemes, type BISStandard } from "@/data/bis-data";
import type { Lang } from "@/lib/i18n";

export type Confidence = "High" | "Medium" | "Low";

export interface Citation {
  standardNumber: string;
  title: string;
  clauseRef: string;
  excerpt: string;
  sourceUrl: string;
  origin: "Sample" | "Verified source";
}

export interface RetrievedChunk {
  standardNumber: string;
  clauseRef: string;
  title: string;
  score: number;
  excerpt: string;
  origin: "Sample" | "Verified source";
}

export interface AnswerPayload {
  answer: string;
  citations: Citation[];
  confidence: Confidence;
  followups: string[];
  retrievedCount: number;
  retrieved?: RetrievedChunk[];
}

const L = (lang: Lang, en: string, hi: string, te: string) => (lang === "hi" ? hi : lang === "te" ? te : en);

const citationsFor = (list: BISStandard[]): Citation[] =>
  list.flatMap((s) =>
    s.clauses.slice(0, 2).map((c) => ({
      standardNumber: s.standardNumber,
      title: s.title,
      clauseRef: c.ref,
      excerpt: c.excerpt,
      sourceUrl: s.sourceUrl,
      origin: "Sample" as const,
    })),
  );

const enforcementLine = (s: BISStandard, lang: Lang) => {
  const mandatory = s.enforcement !== "Voluntary";
  return L(
    lang,
    `${s.standardNumber} — ${s.title}. Status: ${mandatory ? `${s.enforcement}` : "Voluntary"}.`,
    `${s.standardNumber} — ${s.title}. स्थिति: ${mandatory ? s.enforcement : "स्वैच्छिक"}।`,
    `${s.standardNumber} — ${s.title}. స్థితి: ${mandatory ? s.enforcement : "స్వచ్ఛందం"}.`,
  );
};

function hallmarkAnswer(lang: Lang): AnswerPayload {
  const gold = findStandards("gold jewellery hallmarking");
  const scheme = getScheme("scheme-hallmark")!;
  const answer = L(
    lang,
    `**Hallmarking of gold jewellery** is mandatory for registered jewellers in notified districts.

- Purity must be one of the permitted finenesses under **IS 1417** — 14K (585), 18K (750), 20K (833), 22K (916), 23K (958) [IS 1417, Clause 4.1].
- Each article carries a three-part hallmark: the BIS mark, the purity grade, and the six-digit alphanumeric **HUID** [IS 1417, Clause 6].
- Silver jewellery follows **IS 2112** finenesses such as 925 and 990 [IS 2112, Clause 4].
- As a jeweller you register once on the BIS portal (free), then get articles assayed and marked at a recognized Assaying and Hallmarking Centre before sale.

**Your next steps:** ${scheme.steps
      .slice(0, 3)
      .map((s, i) => `${i + 1}. ${s.title} — ${s.detail}`)
      .join(" ")}`,
    `**सोने के आभूषणों की हॉलमार्किंग** अधिसूचित जिलों में पंजीकृत जौहरियों के लिए अनिवार्य है।

- शुद्धता **IS 1417** की अनुमत श्रेणियों में होनी चाहिए — 14K (585), 18K (750), 20K (833), 22K (916), 23K (958) [IS 1417, Clause 4.1]।
- प्रत्येक वस्तु पर तीन भाग होते हैं: BIS मार्क, शुद्धता ग्रेड और छह अंकों का **HUID** [IS 1417, Clause 6]।
- चाँदी के लिए **IS 2112** की श्रेणियाँ जैसे 925 और 990 लागू हैं [IS 2112, Clause 4]।
- जौहरी के रूप में BIS पोर्टल पर एक बार निःशुल्क पंजीकरण करें, फिर बिक्री से पहले मान्यता प्राप्त AHC से हॉलमार्क कराएँ।`,
    `**బంగారు ఆభరణాల హాల్‌మార్కింగ్** నోటిఫై చేసిన జిల్లాల్లో రిజిస్టర్ అయిన జ్యువెలర్లకు తప్పనిసరి.

- స్వచ్ఛత **IS 1417** అనుమతించిన స్థాయిలలో ఉండాలి — 14K (585), 18K (750), 20K (833), 22K (916), 23K (958) [IS 1417, Clause 4.1].
- ప్రతి వస్తువుపై మూడు భాగాలు: BIS మార్క్, స్వచ్ఛత గ్రేడ్, ఆరు అంకెల **HUID** [IS 1417, Clause 6].
- వెండికి **IS 2112** స్థాయిలు 925, 990 వర్తిస్తాయి [IS 2112, Clause 4].
- జ్యువెలర్‌గా BIS పోర్టల్‌లో ఒకసారి ఉచితంగా నమోదు చేసుకోండి, అమ్మకానికి ముందు గుర్తింపు పొందిన AHC వద్ద హాల్‌మార్క్ చేయించండి.`,
  );

  return {
    answer,
    citations: citationsFor(gold.slice(0, 2)),
    confidence: "High",
    followups: L(
      lang,
      "How do I register as a jeweller?|What is HUID and how do I verify it?|Which AHC is nearest to me?",
      "जौहरी पंजीकरण कैसे करें?|HUID क्या है और कैसे सत्यापित करें?|मेरे नज़दीक कौन सा AHC है?",
      "జ్యువెలర్‌గా ఎలా నమోదు చేసుకోవాలి?|HUID ఏమిటి, ఎలా ధృవీకరించాలి?|నాకు దగ్గరలో ఏ AHC ఉంది?",
    ).split("|"),
    retrievedCount: 4,
  };
}

function certificationAnswer(lang: Lang, isCRS: boolean): AnswerPayload {
  const scheme = getScheme(isCRS ? "scheme-crs" : "scheme-isi")!;
  const steps = scheme.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.detail} _(${s.duration})_`).join("\n");
  const answer = L(
    lang,
    `**${scheme.name}** applies here. ${scheme.description}

**Eligibility:** ${scheme.eligibility}

**Process**
${steps}

**Documents you will need:** ${scheme.documentsRequired.join("; ")}.

Testing must be done against the relevant Indian Standard in a BIS recognized laboratory — see the Labs page to find one near you.`,
    `यहाँ **${scheme.name}** लागू होती है। ${scheme.description}

**पात्रता:** ${scheme.eligibility}

**प्रक्रिया**
${steps}

**आवश्यक दस्तावेज़:** ${scheme.documentsRequired.join("; ")}।

परीक्षण संबंधित भारतीय मानक के अनुसार BIS मान्यता प्राप्त प्रयोगशाला में होना चाहिए।`,
    `ఇక్కడ **${scheme.name}** వర్తిస్తుంది. ${scheme.description}

**అర్హత:** ${scheme.eligibility}

**ప్రక్రియ**
${steps}

**అవసరమైన పత్రాలు:** ${scheme.documentsRequired.join("; ")}.

పరీక్షలు సంబంధిత భారతీయ ప్రమాణం ప్రకారం BIS గుర్తింపు పొందిన ల్యాబ్‌లో జరగాలి.`,
  );

  return {
    answer,
    citations: [
      {
        standardNumber: isCRS ? "CRS Scheme" : "Scheme-I, BIS Conformity Assessment Regulations",
        title: scheme.name,
        clauseRef: "Scheme document",
        excerpt: scheme.description,
        sourceUrl: scheme.sourceUrl,
        origin: "Sample",
      },
      ...citationsFor(findStandards(isCRS ? "led lamp" : "electric kettle").slice(0, 1)),
    ],
    confidence: "High",
    followups: L(
      lang,
      "What does the factory inspection check?|How much are the fees?|Which lab can test my product?",
      "फ़ैक्टरी निरीक्षण में क्या देखा जाता है?|शुल्क कितना है?|कौन सी प्रयोगशाला परीक्षण कर सकती है?",
      "ఫ్యాక్టరీ తనిఖీలో ఏమి చూస్తారు?|ఫీజు ఎంత?|ఏ ల్యాబ్ పరీక్షించగలదు?",
    ).split("|"),
    retrievedCount: 5,
  };
}

function labAnswer(lang: Lang, query: string): AnswerPayload {
  const q = query.toLowerCase();
  const matched = labs.filter((l) =>
    l.recognizedScope.some((s) => q.split(/[^a-z]+/).some((w) => w.length > 3 && s.toLowerCase().includes(w))),
  );
  const list = (matched.length ? matched : labs).slice(0, 4);
  const answer = L(
    lang,
    `Here are BIS recognized laboratories from the sample dataset that cover your request:

${list.map((l) => `- **${l.name}**, ${l.city}, ${l.state} — ${l.recognizedScope.join(", ")} — ${l.contact}`).join("\n")}

Testing must be against the relevant Indian Standard; confirm the lab's recognized scope covers your exact product before sending samples.`,
    `आपके अनुरोध से मेल खाती नमूना डेटा की BIS मान्यता प्राप्त प्रयोगशालाएँ:

${list.map((l) => `- **${l.name}**, ${l.city}, ${l.state} — ${l.recognizedScope.join(", ")} — ${l.contact}`).join("\n")}

नमूने भेजने से पहले प्रयोगशाला का स्कोप आपके उत्पाद को कवर करता है, यह पुष्टि करें।`,
    `మీ అభ్యర్థనకు సరిపోయే నమూనా డేటాలోని BIS గుర్తింపు ల్యాబ్‌లు:

${list.map((l) => `- **${l.name}**, ${l.city}, ${l.state} — ${l.recognizedScope.join(", ")} — ${l.contact}`).join("\n")}

శాంపిల్స్ పంపే ముందు ల్యాబ్ స్కోప్ మీ ఉత్పత్తిని కవర్ చేస్తుందో నిర్ధారించండి.`,
  );

  return {
    answer,
    citations: [
      {
        standardNumber: "Lab Recognition Scheme",
        title: "BIS Laboratory Recognition Scheme",
        clauseRef: "Recognized labs directory",
        excerpt: "Laboratories recognized by BIS to test samples for certification and surveillance within a defined scope.",
        sourceUrl: schemes.find((s) => s.id === "scheme-lab")!.sourceUrl,
        origin: "Sample",
      },
    ],
    confidence: matched.length ? "High" : "Medium",
    followups: L(
      lang,
      "What tests will the lab run?|How long does testing take?|Do I need in-house test facilities too?",
      "प्रयोगशाला कौन से परीक्षण करेगी?|परीक्षण में कितना समय लगता है?|क्या इन-हाउस सुविधा भी चाहिए?",
      "ల్యాబ్ ఏ పరీక్షలు చేస్తుంది?|పరీక్షకు ఎంత సమయం పడుతుంది?|ఇన్-హౌస్ సౌకర్యాలు కూడా కావాలా?",
    ).split("|"),
    retrievedCount: list.length,
  };
}

const clauseOf = (s: BISStandard) => s.clauses[0] ?? { ref: "General", heading: "General", excerpt: s.summary };

function standardsAnswer(lang: Lang, matches: BISStandard[]): AnswerPayload {
  const top = matches.slice(0, 3);
  const primary = top[0];
  if (!primary) return noSourceAnswer(lang);
  const pc = clauseOf(primary);
  const scheme = getScheme(primary.schemeId);
  const bullets = top.map((s) => `- ${enforcementLine(s, lang)} [${s.standardNumber}, ${clauseOf(s).ref}]`).join("\n");
  const answer = L(
    lang,
    `Based on the indexed BIS sources, these Indian Standards apply:

${bullets}

**Key requirement:** ${pc.excerpt} [${primary.standardNumber}, ${pc.ref}]

**Typical tests:** ${primary.tests.join(", ")}.

${
  primary.enforcement === "Voluntary"
    ? "This standard is voluntary, but conforming to it strengthens quality claims and tender eligibility."
    : `Certification route: **${scheme?.shortName ?? "BIS certification"}** — ${scheme?.description ?? ""}`
}`,
    `अनुक्रमित BIS स्रोतों के अनुसार ये भारतीय मानक लागू होते हैं:

${bullets}

**मुख्य आवश्यकता:** ${pc.excerpt} [${primary.standardNumber}, ${pc.ref}]

**सामान्य परीक्षण:** ${primary.tests.join(", ")}।

${
  primary.enforcement === "Voluntary"
    ? "यह मानक स्वैच्छिक है, फिर भी अनुपालन गुणवत्ता दावों को मजबूत करता है।"
    : `प्रमाणन मार्ग: **${scheme?.shortName ?? "BIS प्रमाणन"}**`
}`,
    `ఇండెక్స్ చేసిన BIS మూలాల ప్రకారం ఈ భారతీయ ప్రమాణాలు వర్తిస్తాయి:

${bullets}

**ప్రధాన అవసరం:** ${pc.excerpt} [${primary.standardNumber}, ${pc.ref}]

**సాధారణ పరీక్షలు:** ${primary.tests.join(", ")}.

${
  primary.enforcement === "Voluntary"
    ? "ఇది స్వచ్ఛంద ప్రమాణం, అయినా పాటించడం నాణ్యతను బలపరుస్తుంది."
    : `సర్టిఫికేషన్ మార్గం: **${scheme?.shortName ?? "BIS సర్టిఫికేషన్"}**`
}`,
  );

  return {
    answer,
    citations: citationsFor(top),
    confidence: matches.length > 1 ? "High" : "Medium",
    followups: L(
      lang,
      `What is the certification process for ${primary.sector.toLowerCase()}?|Which labs test to ${primary.standardNumber}?|What documents do I need to apply?`,
      `${primary.sector} के लिए प्रमाणन प्रक्रिया क्या है?|${primary.standardNumber} के लिए कौन सी प्रयोगशालाएँ हैं?|आवेदन के लिए कौन से दस्तावेज़ चाहिए?`,
      `${primary.sector} కోసం సర్టిఫికేషన్ ప్రక్రియ ఏమిటి?|${primary.standardNumber} కోసం ఏ ల్యాబ్‌లు ఉన్నాయి?|దరఖాస్తుకు ఏ పత్రాలు కావాలి?`,
    ).split("|"),
    retrievedCount: top.length * 2,
  };
}

function noSourceAnswer(lang: Lang): AnswerPayload {
  return {
    answer: L(
      lang,
      "I could not find a relevant BIS source in the indexed sample data for that question, so I will not guess. Please rephrase with the product name, or check the official portal at bis.gov.in. Never rely on an unverified standard number.",
      "इस प्रश्न के लिए अनुक्रमित नमूना डेटा में कोई संबंधित BIS स्रोत नहीं मिला, इसलिए मैं अनुमान नहीं लगाऊँगा। उत्पाद का नाम लिखकर दोबारा पूछें या bis.gov.in देखें।",
      "ఈ ప్రశ్నకు ఇండెక్స్ చేసిన నమూనా డేటాలో సంబంధిత BIS మూలం కనబడలేదు, కాబట్టి ఊహించను. ఉత్పత్తి పేరుతో మళ్లీ అడగండి లేదా bis.gov.in చూడండి.",
    ),
    citations: [],
    confidence: "Low",
    followups: L(
      lang,
      "Which BIS standard applies to electric kettles?|How do I get an ISI mark?|Hallmarking rules for gold jewellery",
      "इलेक्ट्रिक केटल पर कौन सा मानक लागू है?|ISI मार्क कैसे लें?|सोने के आभूषण की हॉलमार्किंग नियम",
      "ఎలక్ట్రిక్ కెటిల్‌కు ఏ ప్రమాణం వర్తిస్తుంది?|ISI మార్క్ ఎలా పొందాలి?|బంగారు ఆభరణాల హాల్‌మార్కింగ్ నియమాలు",
    ).split("|"),
    retrievedCount: 0,
  };
}

const HALLMARK_HINTS = ["hallmark", "gold", "jewell", "huid", "silver", "सोना", "आभूषण", "हॉलमार्क", "బంగారు", "ఆభరణ", "హాల్"];
const CERT_HINTS = ["isi mark", "isi licence", "isi license", "certification", "certificate", "licence", "license", "प्रमाणन", "लाइसेंस", "సర్టిఫికేషన్", "లైసెన్స్"];
const CRS_HINTS = ["crs", "registration scheme", "electronics", "led", "power bank", "battery", "laptop"];
const LAB_HINTS = ["lab", "laborator", "testing centre", "test center", "प्रयोगशाला", "ల్యాబ్"];

export function generateAnswer(query: string, lang: Lang): AnswerPayload {
  const q = query.toLowerCase();
  const has = (hints: string[]) => hints.some((h) => q.includes(h));

  if (has(HALLMARK_HINTS)) return hallmarkAnswer(lang);
  if (has(LAB_HINTS)) return labAnswer(lang, q);
  if (has(CERT_HINTS)) return certificationAnswer(lang, has(CRS_HINTS));

  const matches = findStandards(query);
  if (matches.length) return standardsAnswer(lang, matches);
  if (has(CRS_HINTS)) return certificationAnswer(lang, true);
  return noSourceAnswer(lang);
}

export const quickActionPrompts: Record<string, Record<Lang, string>> = {
  recommend: {
    en: "I manufacture electric kettles. Which BIS standards and certification apply to me?",
    hi: "मैं इलेक्ट्रिक केटल बनाता हूँ। मुझ पर कौन से BIS मानक और प्रमाणन लागू होंगे?",
    te: "నేను ఎలక్ట్రిక్ కెటిల్స్ తయారు చేస్తాను. నాకు ఏ BIS ప్రమాణాలు, సర్టిఫికేషన్ వర్తిస్తాయి?",
  },
  certification: {
    en: "What are the steps to get an ISI mark licence for my factory?",
    hi: "मेरी फ़ैक्टरी के लिए ISI मार्क लाइसेंस लेने के चरण क्या हैं?",
    te: "నా ఫ్యాక్టరీకి ISI మార్క్ లైసెన్స్ పొందే దశలు ఏమిటి?",
  },
  hallmark: {
    en: "What are the hallmarking rules for selling gold jewellery?",
    hi: "सोने के आभूषण बेचने के लिए हॉलमार्किंग नियम क्या हैं?",
    te: "బంగారు ఆభరణాలు అమ్మడానికి హాల్‌మార్కింగ్ నియమాలు ఏమిటి?",
  },
  lab: {
    en: "Which labs can test helmets to IS 4151?",
    hi: "IS 4151 के अनुसार हेलमेट परीक्षण कौन सी प्रयोगशालाएँ करती हैं?",
    te: "IS 4151 ప్రకారం హెల్మెట్లను ఏ ల్యాబ్‌లు పరీక్షిస్తాయి?",
  },
  consumer: {
    en: "How do I check if a packaged drinking water bottle is BIS certified?",
    hi: "पैकेज्ड ड्रिंकिंग वाटर BIS प्रमाणित है, यह कैसे जाँचें?",
    te: "ప్యాక్ చేసిన తాగునీరు BIS ధృవీకరించబడిందో ఎలా తనిఖీ చేయాలి?",
  },
};
