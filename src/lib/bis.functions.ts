/**
 * Server functions for the BISmart RAG pipeline (Prompt 2).
 *
 * - askBis: multilingual question -> retrieve -> citation-backed answer.
 * - recommendProduct: product description -> ranked applicable standards.
 * - searchDocuments: semantic search over indexed standard chunks.
 * - saveFeedback: thumbs up/down on an answer.
 *
 * Reads go through a publishable, session-less client; reference tables are
 * world-readable by RLS policy.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { chatComplete, embedTexts, translateToEnglish } from "./ai-gateway.server";

function db() {
  return createClient(
    import.meta.env["VITE_SUPABASE_URL"]!,
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

type Lang = "en" | "hi" | "te";

export interface RagCitation {
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

export interface RagAnswer {
  answer: string;
  citations: RagCitation[];
  confidence: "High" | "Medium" | "Low";
  followups: string[];
  retrievedCount: number;
  retrieved: RetrievedChunk[];
}

interface MatchedChunk {
  standard_number: string;
  title: string;
  clause_ref: string;
  chunk_text: string;
  source_url: string;
  data_origin: string;
  score: number;
}

const LANG_NAMES: Record<Lang, string> = { en: "English", hi: "Hindi", te: "Telugu" };

async function retrieve(queryEn: string, matchCount: number): Promise<MatchedChunk[]> {
  const [embedding] = await embedTexts([queryEn]);
  if (!embedding) throw new Error("Embedding service returned no vector");
  const { data, error } = await db().rpc("match_chunks", {
    query_embedding: `[${embedding.join(",")}]`,
    query_text: queryEn,
    match_count: matchCount,
  });
  if (error) throw new Error(`Retrieval failed: ${error.message}`);
  return (data ?? []) as MatchedChunk[];
}

const HistoryMsg = z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) });

export const askBis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().min(1).max(2000),
        lang: z.enum(["en", "hi", "te"]),
        history: z.array(HistoryMsg).max(12).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<RagAnswer> => {
    const { query, lang } = data;
    const queryEn = lang === "en" ? query : await translateToEnglish(query);

    const chunks = await retrieve(queryEn, 8).catch(() => [] as MatchedChunk[]);

    const context = chunks
      .map(
        (c, i) =>
          `[Source ${i + 1}] ${c.standard_number} — ${c.title} — ${c.clause_ref}\n${c.chunk_text}\nURL: ${c.source_url}`,
      )
      .join("\n\n");

    const system = `You are BISmart, an assistant for Indian Standards (BIS). Answer in ${LANG_NAMES[lang]}.

Rules:
- Use ONLY the sources listed below. If none are relevant, say clearly that no matching BIS source was found in the indexed data and suggest bis.gov.in — never invent a standard number, clause, fee or rule.
- Keep standard numbers (e.g. IS 302-2-201) and clause references (e.g. Clause 4.1) in English, even in Hindi/Telugu answers.
- Cite claims inline like [IS 14543, Clause 3.2].
- Use short markdown: a bold headline, then bullets or numbered steps. Keep it under 220 words.
- After the answer, output a line containing exactly ---FOLLOWUPS--- followed by 3 short follow-up questions in ${LANG_NAMES[lang]} separated by |.

${context ? `SOURCES:\n${context}` : "SOURCES: (none retrieved)"}`;

    const history = data.history.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    const raw = await chatComplete({ system, messages: [...history, { role: "user", content: query }] });

    let answer = raw;
    let followups: string[] = [];
    const marker = raw.indexOf("---FOLLOWUPS---");
    if (marker >= 0) {
      answer = raw.slice(0, marker).trim();
      followups = raw
        .slice(marker + "---FOLLOWUPS---".length)
        .split("|")
        .map((f) => f.trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    const citations: RagCitation[] = [];
    const seen = new Set<string>();
    for (const c of chunks) {
      const key = `${c.standard_number}|${c.clause_ref}`;
      if (seen.has(key)) continue;
      seen.add(key);
      citations.push({
        standardNumber: c.standard_number,
        title: c.title,
        clauseRef: c.clause_ref,
        excerpt: c.chunk_text,
        sourceUrl: c.source_url,
        origin: "Sample",
      });
      if (citations.length >= 4) break;
    }

    const topScore = chunks[0]?.score ?? 0;
    const confidence: RagAnswer["confidence"] =
      chunks.length >= 3 && topScore > 0.35 ? "High" : chunks.length >= 1 ? "Medium" : "Low";

    return { answer, citations, confidence, followups, retrievedCount: chunks.length };
  });

export const recommendProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        product: z.string().min(1).max(1000),
        lang: z.enum(["en", "hi", "te"]).default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const queryEn = data.lang === "en" ? data.product : await translateToEnglish(data.product);
    const words = new Set(queryEn.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));

    const { data: maps, error } = await db()
      .from("products_map")
      .select("product_keywords, standard_number, mandatory, scheme_key");
    if (error) throw new Error(`Product map lookup failed: ${error.message}`);

    const scored = new Map<string, { score: number; mandatory: boolean; schemeKey: string | null }>();
    for (const row of maps ?? []) {
      let hits = 0;
      for (const kw of row.product_keywords as string[]) {
        const kwWords = kw.toLowerCase().split(/[^a-z0-9]+/);
        if (kwWords.some((w) => w.length > 2 && words.has(w))) hits += kwWords.length;
      }
      if (hits > 0) {
        const prev = scored.get(row.standard_number);
        const score = hits * 10;
        if (!prev || score > prev.score) {
          scored.set(row.standard_number, {
            score,
            mandatory: row.mandatory,
            schemeKey: row.scheme_key,
          });
        }
      }
    }

    // Blend in semantic retrieval so phrasing without exact keywords still matches.
    const semantic = await retrieve(queryEn, 6).catch(() => [] as MatchedChunk[]);
    for (const chunk of semantic) {
      const prev = scored.get(chunk.standard_number);
      const boost = Math.round(chunk.score * 30);
      if (prev) prev.score += boost;
      else scored.set(chunk.standard_number, { score: boost, mandatory: false, schemeKey: null });
    }

    const ranked = [...scored.entries()]
      .map(([standardNumber, v]) => ({
        standardNumber,
        score: Math.min(97, 52 + v.score),
        mandatory: v.mandatory,
        schemeKey: v.schemeKey,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return { queryEn, ranked };
  });

export const searchDocuments = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ query: z.string().min(1).max(500), lang: z.enum(["en", "hi", "te"]).default("en") })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const queryEn = data.lang === "en" ? data.query : await translateToEnglish(data.query);
    const chunks = await retrieve(queryEn, 10);
    const byStandard = new Map<string, number>();
    for (const c of chunks) {
      byStandard.set(c.standard_number, Math.max(byStandard.get(c.standard_number) ?? 0, c.score));
    }
    const ranked = [...byStandard.entries()]
      .map(([standardNumber, score]) => ({ standardNumber, relevance: Math.min(99, Math.round(40 + score * 60)) }))
      .sort((a, b) => b.relevance - a.relevance);
    return { ranked };
  });

export const saveFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string().min(1).max(4000),
        answer: z.string().max(8000).default(""),
        rating: z.enum(["up", "down"]),
        lang: z.enum(["en", "hi", "te"]).default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await db().from("feedback").insert({
      rating: data.rating === "up" ? 1 : -1,
      comment: `Lang: ${data.lang}\nQ: ${data.question}\n\nA: ${data.answer}`.slice(0, 6000),
    });
    if (error) throw new Error(`Could not save feedback: ${error.message}`);
    return { ok: true };
  });
