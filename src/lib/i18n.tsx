import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "te";

export const languages: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "HI" },
  { code: "te", label: "తెలుగు", short: "TE" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.chat": "Ask BISmart",
  "nav.recommend": "Find a Standard",
  "nav.certification": "Certification",
  "nav.search": "Search",
  "nav.labs": "Labs",
  "nav.about": "About",
  "nav.theme": "Toggle theme",
  "nav.signin": "Sign in",
  "nav.signout": "Sign out",
  "chat.liveUnavailable": "Live AI is unavailable — answering from the offline sample engine.",
  "auth.title": "Sign in to BISmart",
  "auth.subtitle": "Save your conversations and pick up where you left off.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Sign in",
  "auth.signup": "Create account",
  "auth.google": "Continue with Google",
  "auth.toSignup": "New here? Create an account",
  "auth.toSignin": "Already have an account? Sign in",

  "hero.title": "Find the right Indian Standard in seconds",
  "hero.subtitle":
    "BISmart answers your questions on Indian Standards, ISI marking, CRS, hallmarking and testing — in plain language, with sources you can check.",
  "hero.cta": "Ask BISmart",
  "hero.cta2": "Find a Standard for my Product",
  "hero.badge": "Built for MSMEs, startups, industry, students and consumers",

  "features.title": "What BISmart helps you with",
  "features.subtitle": "Six everyday jobs, one assistant.",
  "f1.title": "Standard Recommendation",
  "f1.body": "Describe your product and get the applicable Indian Standards, ranked.",
  "f2.title": "Certification Guidance",
  "f2.body": "Step-by-step ISI Mark, CRS and FMCS journeys with documents needed.",
  "f3.title": "Hallmarking Help",
  "f3.body": "Gold and silver purity, HUID and jeweller registration explained.",
  "f4.title": "Testing Lab Finder",
  "f4.body": "Find recognized labs by product, standard and state.",
  "f5.title": "Consumer Queries",
  "f5.body": "Check marks, verify purity and know your rights as a buyer.",
  "f6.title": "Multilingual Support",
  "f6.body": "Ask in English, Hindi or Telugu and get answers in the same language.",

  "how.title": "How it works",
  "how.s1.title": "Ask",
  "how.s1.body": "Type or speak your question in your language.",
  "how.s2.title": "We retrieve from BIS sources",
  "how.s2.body": "Relevant standards, clauses and scheme documents are pulled in.",
  "how.s3.title": "You get answers with citations",
  "how.s3.body": "Every claim carries a standard number and clause you can verify.",

  "examples.title": "Try an example",
  "footer.disclaimer": "BISmart is an assistant. Always verify with official BIS sources.",
  "footer.sample": "Demo runs on clearly marked sample data.",

  "chat.title": "Ask BISmart",
  "chat.newChat": "New chat",
  "chat.searchChats": "Search conversations",
  "chat.rename": "Rename",
  "chat.delete": "Delete",
  "chat.placeholder": "Ask about a standard, certification, hallmarking or labs…",
  "chat.send": "Send",
  "chat.mic": "Voice input",
  "chat.note": "Answers are generated from indexed BIS sources.",
  "chat.sources": "Sources",
  "chat.viewSource": "View source",
  "chat.confidence": "Confidence",
  "chat.followups": "Suggested follow-ups",
  "chat.copy": "Copy answer",
  "chat.share": "Share",
  "chat.pdf": "Export PDF",
  "chat.empty.title": "What would you like to know?",
  "chat.empty.body": "Pick a quick action or ask anything about Indian Standards.",
  "chat.thinking": "Retrieving from BIS sources…",
  "chat.noSource": "No relevant source found",

  "qa.recommend": "Recommend Standard",
  "qa.certification": "Certification Process",
  "qa.hallmark": "Hallmarking",
  "qa.lab": "Find Lab",
  "qa.consumer": "Consumer Help",

  "rec.title": "Product to Standard Recommender",
  "rec.subtitle": "Describe what you make. We map it to applicable Indian Standards.",
  "rec.product": "Product description",
  "rec.productPh": "e.g. I manufacture 1.5 L stainless steel electric kettles for retail",
  "rec.category": "Product category",
  "rec.market": "Intended market",
  "rec.manufacturer": "Manufacturer type",
  "rec.submit": "Get recommendations",
  "rec.results": "Applicable standards",
  "rec.match": "Match",
  "rec.why": "Why it applies",
  "rec.tests": "Testing requirements",
  "rec.related": "Related standards",
  "rec.followup": "Ask a follow-up in chat",
  "rec.empty": "No matching standard found in the sample data. Try different wording or check bis.gov.in.",

  "cert.title": "Certification Guide",
  "cert.subtitle": "Schemes, eligibility, documents and timelines.",
  "cert.view": "View steps",
  "cert.ask": "Ask about this",
  "cert.eligibility": "Eligibility",
  "cert.docs": "Documents required",
  "cert.steps": "Step-by-step process",

  "search.title": "BIS Document Search",
  "search.subtitle": "Search standards by product, number, sector or keyword.",
  "search.placeholder": "Search e.g. helmet, IS 1786, packaged water",
  "search.filters": "Filters",
  "search.relevance": "Relevance",
  "search.empty": "No documents matched your filters.",
  "search.details": "Details",

  "labs.title": "Testing Lab Finder",
  "labs.subtitle": "Recognized laboratories by product scope and location.",
  "labs.searchPh": "Search by product or standard",
  "labs.state": "State",
  "labs.scope": "Recognized scope",
  "labs.map": "Map view",
  "labs.mapNote": "Interactive map is a placeholder in this demo.",
  "labs.empty": "No labs matched. Try another product or state.",

  "about.title": "How BISmart works",
  "common.all": "All",
  "common.reset": "Reset",
  "common.copied": "Copied to clipboard",
  "common.sample": "Sample data",
  "common.high": "High",
  "common.medium": "Medium",
  "common.low": "Low",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.chat": "BISmart से पूछें",
  "nav.recommend": "मानक खोजें",
  "nav.certification": "प्रमाणन",
  "nav.search": "खोज",
  "nav.labs": "प्रयोगशालाएँ",
  "nav.about": "परिचय",
  "nav.theme": "थीम बदलें",
  "nav.signin": "साइन इन करें",
  "nav.signout": "साइन आउट",
  "chat.liveUnavailable": "लाइव AI उपलब्ध नहीं है — ऑफ़लाइन नमूना इंजन से उत्तर दिया जा रहा है।",
  "auth.title": "BISmart में साइन इन करें",
  "auth.subtitle": "अपनी बातचीत सहेजें और जहाँ छोड़ा था वहाँ से जारी रखें।",
  "auth.email": "ईमेल",
  "auth.password": "पासवर्ड",
  "auth.signin": "साइन इन करें",
  "auth.signup": "खाता बनाएँ",
  "auth.google": "Google से जारी रखें",
  "auth.toSignup": "नए हैं? खाता बनाएँ",
  "auth.toSignin": "पहले से खाता है? साइन इन करें",

  "hero.title": "सही भारतीय मानक कुछ सेकंड में खोजें",
  "hero.subtitle":
    "BISmart भारतीय मानकों, ISI मार्क, CRS, हॉलमार्किंग और परीक्षण से जुड़े सवालों के उत्तर सरल भाषा में देता है — स्रोतों के साथ।",
  "hero.cta": "BISmart से पूछें",
  "hero.cta2": "मेरे उत्पाद का मानक खोजें",
  "hero.badge": "MSME, स्टार्टअप, उद्योग, विद्यार्थियों और उपभोक्ताओं के लिए",

  "features.title": "BISmart किसमें मदद करता है",
  "features.subtitle": "छह रोज़मर्रा के काम, एक सहायक।",
  "f1.title": "मानक सिफ़ारिश",
  "f1.body": "अपने उत्पाद का विवरण दें और लागू भारतीय मानक प्राप्त करें।",
  "f2.title": "प्रमाणन मार्गदर्शन",
  "f2.body": "ISI मार्क, CRS और FMCS की चरणबद्ध प्रक्रिया व दस्तावेज़।",
  "f3.title": "हॉलमार्किंग सहायता",
  "f3.body": "सोने-चाँदी की शुद्धता, HUID और जौहरी पंजीकरण।",
  "f4.title": "परीक्षण प्रयोगशाला खोज",
  "f4.body": "उत्पाद, मानक और राज्य के अनुसार मान्यता प्राप्त प्रयोगशालाएँ।",
  "f5.title": "उपभोक्ता प्रश्न",
  "f5.body": "मार्क जाँचें, शुद्धता सत्यापित करें, अधिकार जानें।",
  "f6.title": "बहुभाषी सहायता",
  "f6.body": "अंग्रेज़ी, हिंदी या तेलुगु में पूछें, उसी भाषा में उत्तर पाएँ।",

  "how.title": "यह कैसे काम करता है",
  "how.s1.title": "पूछें",
  "how.s1.body": "अपनी भाषा में प्रश्न लिखें या बोलें।",
  "how.s2.title": "हम BIS स्रोतों से जानकारी लाते हैं",
  "how.s2.body": "संबंधित मानक, खंड और योजना दस्तावेज़ खोजे जाते हैं।",
  "how.s3.title": "उत्तर स्रोतों के साथ",
  "how.s3.body": "हर दावे के साथ मानक संख्या और खंड दिया जाता है।",

  "examples.title": "एक उदाहरण आज़माएँ",
  "footer.disclaimer": "BISmart एक सहायक है। आधिकारिक BIS स्रोतों से पुष्टि अवश्य करें।",
  "footer.sample": "यह डेमो स्पष्ट रूप से चिह्नित नमूना डेटा पर चलता है।",

  "chat.title": "BISmart से पूछें",
  "chat.newChat": "नई चैट",
  "chat.searchChats": "बातचीत खोजें",
  "chat.rename": "नाम बदलें",
  "chat.delete": "हटाएँ",
  "chat.placeholder": "मानक, प्रमाणन, हॉलमार्किंग या प्रयोगशाला के बारे में पूछें…",
  "chat.send": "भेजें",
  "chat.mic": "वॉइस इनपुट",
  "chat.note": "उत्तर अनुक्रमित BIS स्रोतों से बनाए जाते हैं।",
  "chat.sources": "स्रोत",
  "chat.viewSource": "स्रोत देखें",
  "chat.confidence": "विश्वास स्तर",
  "chat.followups": "सुझाए गए अगले प्रश्न",
  "chat.copy": "उत्तर कॉपी करें",
  "chat.share": "साझा करें",
  "chat.pdf": "PDF निकालें",
  "chat.empty.title": "आप क्या जानना चाहेंगे?",
  "chat.empty.body": "कोई क्विक ऐक्शन चुनें या भारतीय मानकों पर कुछ भी पूछें।",
  "chat.thinking": "BIS स्रोतों से जानकारी ला रहे हैं…",
  "chat.noSource": "कोई संबंधित स्रोत नहीं मिला",

  "qa.recommend": "मानक सुझाएँ",
  "qa.certification": "प्रमाणन प्रक्रिया",
  "qa.hallmark": "हॉलमार्किंग",
  "qa.lab": "प्रयोगशाला खोजें",
  "qa.consumer": "उपभोक्ता सहायता",

  "rec.title": "उत्पाद से मानक सिफ़ारिश",
  "rec.subtitle": "बताएँ आप क्या बनाते हैं। हम लागू भारतीय मानक बताएँगे।",
  "rec.product": "उत्पाद विवरण",
  "rec.productPh": "उदा. मैं 1.5 लीटर स्टेनलेस स्टील इलेक्ट्रिक केटल बनाता हूँ",
  "rec.category": "उत्पाद श्रेणी",
  "rec.market": "लक्षित बाज़ार",
  "rec.manufacturer": "निर्माता प्रकार",
  "rec.submit": "सिफ़ारिश पाएँ",
  "rec.results": "लागू मानक",
  "rec.match": "मेल",
  "rec.why": "क्यों लागू है",
  "rec.tests": "परीक्षण आवश्यकताएँ",
  "rec.related": "संबंधित मानक",
  "rec.followup": "चैट में आगे पूछें",
  "rec.empty": "नमूना डेटा में कोई मानक नहीं मिला। दूसरे शब्द आज़माएँ या bis.gov.in देखें।",

  "cert.title": "प्रमाणन मार्गदर्शिका",
  "cert.subtitle": "योजनाएँ, पात्रता, दस्तावेज़ और समय-सीमा।",
  "cert.view": "चरण देखें",
  "cert.ask": "इस पर पूछें",
  "cert.eligibility": "पात्रता",
  "cert.docs": "आवश्यक दस्तावेज़",
  "cert.steps": "चरणबद्ध प्रक्रिया",

  "search.title": "BIS दस्तावेज़ खोज",
  "search.subtitle": "उत्पाद, संख्या, क्षेत्र या कीवर्ड से मानक खोजें।",
  "search.placeholder": "खोजें उदा. helmet, IS 1786, packaged water",
  "search.filters": "फ़िल्टर",
  "search.relevance": "प्रासंगिकता",
  "search.empty": "आपके फ़िल्टर से कोई दस्तावेज़ मेल नहीं खाया।",
  "search.details": "विवरण",

  "labs.title": "परीक्षण प्रयोगशाला खोज",
  "labs.subtitle": "स्कोप और स्थान के अनुसार मान्यता प्राप्त प्रयोगशालाएँ।",
  "labs.searchPh": "उत्पाद या मानक से खोजें",
  "labs.state": "राज्य",
  "labs.scope": "मान्यता प्राप्त स्कोप",
  "labs.map": "मैप व्यू",
  "labs.mapNote": "इस डेमो में मैप केवल प्लेसहोल्डर है।",
  "labs.empty": "कोई प्रयोगशाला नहीं मिली। दूसरा उत्पाद या राज्य आज़माएँ।",

  "about.title": "BISmart कैसे काम करता है",
  "common.all": "सभी",
  "common.reset": "रीसेट",
  "common.copied": "कॉपी हो गया",
  "common.sample": "नमूना डेटा",
  "common.high": "उच्च",
  "common.medium": "मध्यम",
  "common.low": "निम्न",
};

const te: Dict = {
  "nav.home": "హోమ్",
  "nav.chat": "BISmart ని అడగండి",
  "nav.recommend": "ప్రమాణం కనుక్కోండి",
  "nav.certification": "సర్టిఫికేషన్",
  "nav.search": "వెతుకు",
  "nav.labs": "ల్యాబ్‌లు",
  "nav.about": "గురించి",
  "nav.theme": "థీమ్ మార్చు",
  "nav.signin": "సైన్ ఇన్",
  "nav.signout": "సైన్ అవుట్",
  "chat.liveUnavailable": "ప్రత్యక్ష AI అందుబాటులో లేదు — ఆఫ్‌లైన్ నమూనా ఇంజిన్ నుండి సమాధానం.",
  "auth.title": "BISmart లోకి సైన్ ఇన్ చేయండి",
  "auth.subtitle": "మీ సంభాషణలను సేవ్ చేసుకొని ఆగిన చోట నుండి కొనసాగండి.",
  "auth.email": "ఇమెయిల్",
  "auth.password": "పాస్వర్డ్",
  "auth.signin": "సైన్ ఇన్",
  "auth.signup": "ఖాతా సృష్టించండి",
  "auth.google": "Google తో కొనసాగండి",
  "auth.toSignup": "కొత్తవారా? ఖాతా సృష్టించండి",
  "auth.toSignin": "ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి",

  "hero.title": "సరైన భారతీయ ప్రమాణాన్ని సెకన్లలో కనుక్కోండి",
  "hero.subtitle":
    "భారతీయ ప్రమాణాలు, ISI మార్క్, CRS, హాల్‌మార్కింగ్, పరీక్షల గురించి BISmart సులభ భాషలో, ఆధారాలతో సమాధానం ఇస్తుంది.",
  "hero.cta": "BISmart ని అడగండి",
  "hero.cta2": "నా ఉత్పత్తికి ప్రమాణం కనుక్కోండి",
  "hero.badge": "MSMEలు, స్టార్టప్‌లు, పరిశ్రమలు, విద్యార్థులు, వినియోగదారుల కోసం",

  "features.title": "BISmart ఎలా సహాయపడుతుంది",
  "features.subtitle": "ఆరు రోజువారీ పనులు, ఒక సహాయకుడు.",
  "f1.title": "ప్రమాణ సిఫారసు",
  "f1.body": "మీ ఉత్పత్తిని వివరించండి, వర్తించే ప్రమాణాలు పొందండి.",
  "f2.title": "సర్టిఫికేషన్ మార్గదర్శకం",
  "f2.body": "ISI మార్క్, CRS, FMCS దశలవారీ ప్రక్రియ, పత్రాలు.",
  "f3.title": "హాల్‌మార్కింగ్ సహాయం",
  "f3.body": "బంగారం, వెండి స్వచ్ఛత, HUID, జ్యువెలర్ రిజిస్ట్రేషన్.",
  "f4.title": "టెస్టింగ్ ల్యాబ్ ఫైండర్",
  "f4.body": "ఉత్పత్తి, ప్రమాణం, రాష్ట్రం ప్రకారం గుర్తింపు పొందిన ల్యాబ్‌లు.",
  "f5.title": "వినియోగదారు ప్రశ్నలు",
  "f5.body": "మార్క్‌లు తనిఖీ చేయండి, స్వచ్ఛత ధృవీకరించండి, హక్కులు తెలుసుకోండి.",
  "f6.title": "బహుభాషా మద్దతు",
  "f6.body": "ఇంగ్లీష్, హిందీ లేదా తెలుగులో అడిగి అదే భాషలో సమాధానం పొందండి.",

  "how.title": "ఇది ఎలా పనిచేస్తుంది",
  "how.s1.title": "అడగండి",
  "how.s1.body": "మీ భాషలో ప్రశ్న టైప్ చేయండి లేదా మాట్లాడండి.",
  "how.s2.title": "BIS మూలాల నుండి సమాచారం",
  "how.s2.body": "సంబంధిత ప్రమాణాలు, క్లాజులు, పథక పత్రాలు తీసుకుంటాము.",
  "how.s3.title": "ఆధారాలతో సమాధానాలు",
  "how.s3.body": "ప్రతి విషయానికి ప్రమాణ సంఖ్య మరియు క్లాజ్ ఇవ్వబడుతుంది.",

  "examples.title": "ఒక ఉదాహరణ ప్రయత్నించండి",
  "footer.disclaimer": "BISmart ఒక సహాయకుడు మాత్రమే. అధికారిక BIS మూలాలతో ధృవీకరించండి.",
  "footer.sample": "ఈ డెమో స్పష్టంగా గుర్తించిన నమూనా డేటాపై నడుస్తుంది.",

  "chat.title": "BISmart ని అడగండి",
  "chat.newChat": "కొత్త చాట్",
  "chat.searchChats": "సంభాషణలు వెతకండి",
  "chat.rename": "పేరు మార్చు",
  "chat.delete": "తొలగించు",
  "chat.placeholder": "ప్రమాణం, సర్టిఫికేషన్, హాల్‌మార్కింగ్ లేదా ల్యాబ్ గురించి అడగండి…",
  "chat.send": "పంపు",
  "chat.mic": "వాయిస్ ఇన్‌పుట్",
  "chat.note": "సమాధానాలు ఇండెక్స్ చేసిన BIS మూలాల నుండి తయారవుతాయి.",
  "chat.sources": "మూలాలు",
  "chat.viewSource": "మూలం చూడండి",
  "chat.confidence": "విశ్వాస స్థాయి",
  "chat.followups": "సూచించిన తదుపరి ప్రశ్నలు",
  "chat.copy": "సమాధానం కాపీ",
  "chat.share": "షేర్",
  "chat.pdf": "PDF ఎగుమతి",
  "chat.empty.title": "మీరు ఏమి తెలుసుకోవాలి?",
  "chat.empty.body": "క్విక్ యాక్షన్ ఎంచుకోండి లేదా ఏదైనా అడగండి.",
  "chat.thinking": "BIS మూలాల నుండి తీసుకుంటున్నాము…",
  "chat.noSource": "సంబంధిత మూలం కనబడలేదు",

  "qa.recommend": "ప్రమాణం సిఫారసు",
  "qa.certification": "సర్టిఫికేషన్ ప్రక్రియ",
  "qa.hallmark": "హాల్‌మార్కింగ్",
  "qa.lab": "ల్యాబ్ కనుక్కోండి",
  "qa.consumer": "వినియోగదారు సహాయం",

  "rec.title": "ఉత్పత్తి నుండి ప్రమాణం సిఫారసు",
  "rec.subtitle": "మీరు ఏమి తయారు చేస్తారో చెప్పండి. వర్తించే ప్రమాణాలు చూపుతాము.",
  "rec.product": "ఉత్పత్తి వివరణ",
  "rec.productPh": "ఉదా. నేను 1.5 లీటర్ స్టెయిన్‌లెస్ స్టీల్ ఎలక్ట్రిక్ కెటిల్స్ తయారు చేస్తాను",
  "rec.category": "ఉత్పత్తి విభాగం",
  "rec.market": "లక్ష్య మార్కెట్",
  "rec.manufacturer": "తయారీదారు రకం",
  "rec.submit": "సిఫారసులు పొందండి",
  "rec.results": "వర్తించే ప్రమాణాలు",
  "rec.match": "సరిపోలిక",
  "rec.why": "ఎందుకు వర్తిస్తుంది",
  "rec.tests": "పరీక్ష అవసరాలు",
  "rec.related": "సంబంధిత ప్రమాణాలు",
  "rec.followup": "చాట్‌లో మరింత అడగండి",
  "rec.empty": "నమూనా డేటాలో ప్రమాణం కనబడలేదు. వేరే పదాలు ప్రయత్నించండి లేదా bis.gov.in చూడండి.",

  "cert.title": "సర్టిఫికేషన్ గైడ్",
  "cert.subtitle": "పథకాలు, అర్హత, పత్రాలు, కాలవ్యవధి.",
  "cert.view": "దశలు చూడండి",
  "cert.ask": "దీని గురించి అడగండి",
  "cert.eligibility": "అర్హత",
  "cert.docs": "అవసరమైన పత్రాలు",
  "cert.steps": "దశలవారీ ప్రక్రియ",

  "search.title": "BIS పత్రాల శోధన",
  "search.subtitle": "ఉత్పత్తి, సంఖ్య, రంగం లేదా కీవర్డ్‌తో వెతకండి.",
  "search.placeholder": "ఉదా. helmet, IS 1786, packaged water",
  "search.filters": "ఫిల్టర్లు",
  "search.relevance": "ప్రాముఖ్యత",
  "search.empty": "మీ ఫిల్టర్లకు పత్రాలు సరిపోలలేదు.",
  "search.details": "వివరాలు",

  "labs.title": "టెస్టింగ్ ల్యాబ్ ఫైండర్",
  "labs.subtitle": "స్కోప్ మరియు ప్రాంతం ప్రకారం గుర్తింపు పొందిన ల్యాబ్‌లు.",
  "labs.searchPh": "ఉత్పత్తి లేదా ప్రమాణంతో వెతకండి",
  "labs.state": "రాష్ట్రం",
  "labs.scope": "గుర్తింపు పొందిన స్కోప్",
  "labs.map": "మ్యాప్ వ్యూ",
  "labs.mapNote": "ఈ డెమోలో మ్యాప్ ప్లేస్‌హోల్డర్ మాత్రమే.",
  "labs.empty": "ల్యాబ్‌లు కనబడలేదు. వేరే ఉత్పత్తి లేదా రాష్ట్రం ప్రయత్నించండి.",

  "about.title": "BISmart ఎలా పనిచేస్తుంది",
  "common.all": "అన్నీ",
  "common.reset": "రీసెట్",
  "common.copied": "కాపీ చేయబడింది",
  "common.sample": "నమూనా డేటా",
  "common.high": "ఎక్కువ",
  "common.medium": "మధ్యస్థం",
  "common.low": "తక్కువ",
};

const dictionaries: Record<Lang, Dict> = { en, hi, te };

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("bismart-lang") as Lang | null;
    if (stored && stored in dictionaries) setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("bismart-lang", l);
  }, []);

  const t = useCallback((key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
