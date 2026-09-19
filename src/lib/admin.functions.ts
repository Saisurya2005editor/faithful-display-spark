/**
 * Admin server functions (Prompt 3): real BIS document ingestion, re-indexing,
 * deletion and usage insights. All require a signed-in admin (user_roles).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { embedTexts } from "./ai-gateway.server";

const IngestInput = z.object({
  fileName: z.string().min(1).max(300),
  contentBase64: z.string().min(1),
  isPdf: z.boolean(),
  standardNumber: z.string().min(1).max(60),
  title: z.string().min(1).max(300),
  division: z.string().max(120).default(""),
  year: z.number().int().min(1900).max(2100).nullable().default(null),
  sourceUrl: z.string().max(500).default(""),
});

async function requireAdmin(supabase: any, userId: string) {
  // RLS lets each user read only their own role rows, so a returned row means admin.
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(`Role check failed: ${error.message}`);
  if (!data) throw new Response("Forbidden: admin role required", { status: 403 });
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

interface Chunk {
  text: string;
  clauseRef: string;
  heading: string;
}

/**
 * Split an Indian Standard into clause-aware chunks. Numbered clause headings
 * ("7.1 Marking and instructions") start a new clause; long clauses are split
 * further into ~1100 character pieces that keep the clause reference.
 */
function chunkText(text: string): Chunk[] {
  const clauses = splitClauses(text);
  const chunks: Chunk[] = [];
  for (const c of clauses) {
    for (const piece of splitLong(c.text)) {
      chunks.push({ text: piece, clauseRef: c.ref, heading: c.heading });
    }
  }
  return chunks.slice(0, 400);
}

const CLAUSE_HEADING = /(?:^|\n)\s*(\d{1,2}(?:\.\d{1,2}){0,3})\s+([A-Z][^\n]{2,90})/g;

/** Segment raw text on numbered clause headings, keeping ref + heading title. */
function splitClauses(raw: string): { ref: string; heading: string; text: string }[] {
  const text = raw.replace(/\r/g, "");
  const marks: { index: number; ref: string; heading: string }[] = [];
  CLAUSE_HEADING.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CLAUSE_HEADING.exec(text))) {
    const heading = m[2]!.trim().replace(/\s+/g, " ");
    // headings are short title-like lines, not sentences
    if (heading.length > 80 || /[.;]$/.test(heading)) continue;
    marks.push({ index: m.index, ref: `Clause ${m[1]}`, heading });
  }
  if (marks.length < 3) {
    return [{ ref: "General", heading: "Extract", text: clean(text) }];
  }
  const out: { ref: string; heading: string; text: string }[] = [];
  const preamble = clean(text.slice(0, marks[0]!.index));
  if (preamble.length > 200) out.push({ ref: "General", heading: "Scope / preamble", text: preamble });
  for (let i = 0; i < marks.length; i++) {
    const body = clean(text.slice(marks[i]!.index, marks[i + 1]?.index ?? text.length));
    if (body.length < 60) continue;
    out.push({ ref: marks[i]!.ref, heading: marks[i]!.heading, text: body });
  }
  return out;
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function splitLong(text: string): string[] {
  if (text.length <= 1400) return text ? [text] : [];
  const sentences = text.split(/(?<=[.!?;])\s+/);
  const pieces: string[] = [];
  let current = "";
  for (const s of sentences) {
    if (current.length + s.length > 1100 && current.length > 300) {
      pieces.push(current.trim());
      current = current.slice(-180) + " " + s;
    } else {
      current += (current ? " " : "") + s;
    }
  }
  if (current.trim()) pieces.push(current.trim());
  return pieces;
}

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: ownAdmin } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const { data: adminExists } = await supabase.rpc("admin_exists");
    return { isAdmin: !!ownAdmin, adminExists: !!adminExists };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(`Could not claim admin: ${error.message}`);
    return { ok: true };
  });

export const listIndexedDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { data: docs, error } = await supabase
      .from("documents")
      .select("id, standard_number, title, division, year, source_url, summary, data_origin, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not list documents: ${error.message}`);
    // Page through chunks: a plain select is capped at 1000 rows, which silently
    // reported 0 clauses for documents beyond that cap.
    const counts = new Map<string, number>();
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data: chunkRows, error: cErr } = await supabase
        .from("chunks")
        .select("document_id")
        .range(from, from + pageSize - 1);
      if (cErr) throw new Error(`Could not count chunks: ${cErr.message}`);
      for (const row of chunkRows ?? []) {
        counts.set(row.document_id, (counts.get(row.document_id) ?? 0) + 1);
      }
      if (!chunkRows || chunkRows.length < pageSize) break;
    }
    return (docs ?? []).map((d: any) => ({ ...d, chunkCount: counts.get(d.id) ?? 0 }));
  });

export const ingestDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IngestInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const steps: string[] = [];

    // 1. Parse
    let text: string;
    if (data.isPdf) {
      const { extractText } = await import("unpdf");
      const result = await extractText(base64ToBytes(data.contentBase64), {
        mergePages: true,
      });
      text = result.text ?? "";
    } else {
      text = new TextDecoder().decode(base64ToBytes(data.contentBase64));
    }
    if (text.trim().length < 200) {
      throw new Error(
        "Could not extract enough text from this file. Scanned PDFs need OCR first — please use a text-based PDF.",
      );
    }
    steps.push(`Parsed ${data.fileName} (${text.length.toLocaleString()} characters)`);

    // 2. Chunk
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error("No usable text chunks produced from this file.");
    steps.push(`Split into ${chunks.length} chunks`);

    // 3. Embed (batches of 16)
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += 16) {
      const batch = chunks.slice(i, i + 16).map((c) => c.text.slice(0, 6000));
      embeddings.push(...(await embedTexts(batch)));
    }
    steps.push(`Generated ${embeddings.length} embeddings`);

    // 4. Store
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({
        standard_number: data.standardNumber,
        title: data.title,
        division: data.division || null,
        year: data.year,
        source_url: data.sourceUrl || null,
        full_text: text.slice(0, 200000),
        data_origin: "Verified source",
      })
      .select("id")
      .single();
    if (docErr) throw new Error(`Could not store document: ${docErr.message}`);

    const rows = chunks.map((c, i) => ({
      document_id: doc.id,
      chunk_text: c.text,
      clause_ref: c.clauseRef,
      heading: c.heading,
      embedding: `[${embeddings[i]!.join(",")}]`,
      language: "en",
    }));
    for (let i = 0; i < rows.length; i += 50) {
      const { error } = await supabase.from("chunks").insert(rows.slice(i, i + 50));
      if (error) throw new Error(`Could not store chunks: ${error.message}`);
    }
    steps.push("Stored in the knowledge base");

    return { steps, documentId: doc.id as string, chunkCount: chunks.length };
  });

const UpdateInput = z.object({
  documentId: z.string().uuid(),
  standardNumber: z.string().min(1).max(60),
  title: z.string().min(1).max(300),
  division: z.string().max(120).default(""),
  year: z.number().int().min(1900).max(2100).nullable().default(null),
  sourceUrl: z.string().max(500).default(""),
  summary: z.string().max(2000).default(""),
});

/** Edit the metadata of an indexed document (chunks and embeddings are untouched). */
export const updateDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { error } = await supabase
      .from("documents")
      .update({
        standard_number: data.standardNumber,
        title: data.title,
        division: data.division || null,
        year: data.year,
        source_url: data.sourceUrl || null,
        summary: data.summary || null,
      })
      .eq("id", data.documentId);
    if (error) throw new Error(`Could not update document: ${error.message}`);
    return { ok: true };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ documentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { error } = await supabase.from("documents").delete().eq("id", data.documentId);
    if (error) throw new Error(`Could not delete document: ${error.message}`);
    return { ok: true };
  });

/** Re-index: re-embed existing chunk texts (e.g. after an embedding model change). */
export const reindexDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ documentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { data: chunkRows, error } = await supabase
      .from("chunks")
      .select("id, chunk_text")
      .eq("document_id", data.documentId);
    if (error) throw new Error(`Could not load chunks: ${error.message}`);
    const rows = chunkRows ?? [];
    for (let i = 0; i < rows.length; i += 16) {
      const batch = rows.slice(i, i + 16);
      const embs = await embedTexts(batch.map((c: any) => (c.chunk_text as string).slice(0, 6000)));
      for (let j = 0; j < batch.length; j++) {
        await supabase
          .from("chunks")
          .update({ embedding: `[${embs[j]!.join(",")}]` })
          .eq("id", batch[j]!.id);
      }
    }
    return { ok: true, reindexed: rows.length };
  });

export const getInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("question, lang, confidence, retrieved_count, top_standard, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(`Could not load analytics: ${error.message}`);

    const { data: feedbackRows } = await supabase.from("feedback").select("rating").limit(2000);

    const rows = events ?? [];
    const byLang: Record<string, number> = {};
    const byStandard: Record<string, number> = {};
    let confSum = 0;
    let confN = 0;
    const confValue: Record<string, number> = { High: 1, Medium: 0.66, Low: 0.33 };
    for (const e of rows as any[]) {
      byLang[e.lang] = (byLang[e.lang] ?? 0) + 1;
      if (e.top_standard) byStandard[e.top_standard] = (byStandard[e.top_standard] ?? 0) + 1;
      if (e.confidence && confValue[e.confidence] !== undefined) {
        confSum += confValue[e.confidence]!;
        confN++;
      }
    }
    const fb = feedbackRows ?? [];
    const up = fb.filter((f: any) => f.rating > 0).length;
    const down = fb.filter((f: any) => f.rating < 0).length;

    return {
      totalQuestions: rows.length,
      byLang,
      topStandards: Object.entries(byStandard)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([standard, count]) => ({ standard, count })),
      avgConfidence: confN ? Math.round((confSum / confN) * 100) : null,
      feedback: { up, down },
      recent: rows.slice(0, 10),
    };
  });

/* ------------------------------------------------------------------ *
 * Clause → test requirements, and product ⇄ standard links.
 * ------------------------------------------------------------------ */

const TEST_HINT = /\b(test|tests|testing|requirement|limit|tolerance|shall not exceed|minimum|maximum|sampling)\b/i;
const METHOD_RE = /\bIS\s?\d{2,5}(?:\s?\(\s?Part\s?\d+\s?\))?(?:\s?[:\-]\s?\d{4})?/i;
const LIMIT_RE =
  /\b\d+(?:\.\d+)?\s?(?:%|per\s?cent|mg\/l|mg\/kg|ppm|µm|um|mm|cm|m|kg|g|n\/mm2|mpa|kpa|kv|v|a|ma|w|kw|hz|°c|deg\s?c|min|minutes|h|hours|s|seconds|litre|l)\b/i;

/** Heuristic test/limit suggestions mined from a document's indexed clauses. */
export const suggestTests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ documentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("chunks")
      .select("clause_ref, heading, chunk_text")
      .eq("document_id", data.documentId)
      .limit(400);
    if (error) throw new Error(`Could not read clauses: ${error.message}`);

    const seen = new Set<string>();
    const suggestions: { testName: string; clauseRef: string; requirement: string; method: string }[] = [];
    for (const r of (rows ?? []) as any[]) {
      const text: string = r.chunk_text ?? "";
      const heading: string = (r.heading ?? "").trim();
      const clause: string = (r.clause_ref ?? "").trim();
      // Front matter (foreword, scope, publisher lines) carries no testable requirement.
      if (/^clause\s*0\b/i.test(clause)) continue;
      if (/^(foreword|scope|contents|bis\b|bureau of indian standards)/i.test(heading)) continue;
      if (!TEST_HINT.test(`${heading} ${text}`)) continue;
      const sentence =
        text
          .split(/(?<=[.;])\s+/)
          .find((s: string) => /\bshall\b/i.test(s) && (LIMIT_RE.test(s) || TEST_HINT.test(s))) ?? "";
      if (!sentence) continue;
      // Only use the clause heading when it reads like a title, otherwise fall
      // back to the clause reference so names never look truncated.
      const name = /^[A-Z][A-Za-z]/.test(heading)
        ? heading.replace(/\s+/g, " ")
        : `Requirement at ${r.clause_ref ?? "General"}`;
      const key = `${r.clause_ref}|${name}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push({
        testName: name.slice(0, 120),
        clauseRef: r.clause_ref ?? "General",
        requirement: sentence.slice(0, 400),
        method: sentence.match(METHOD_RE)?.[0] ?? "",
      });
      if (suggestions.length >= 25) break;
    }
    return { suggestions };
  });

const TestRow = z.object({
  id: z.string().uuid().optional(),
  documentId: z.string().uuid().nullable().default(null),
  standardNumber: z.string().min(1).max(60),
  productCategory: z.string().max(120).default(""),
  testName: z.string().min(1).max(200),
  clauseRef: z.string().max(60).default(""),
  requirement: z.string().max(1000).default(""),
  method: z.string().max(200).default(""),
});

export const listTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ standardNumber: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("standard_tests")
      .select("id, standard_number, product_category, test_name, clause_ref, requirement, method")
      .eq("standard_number", data.standardNumber)
      .order("clause_ref", { ascending: true });
    if (error) throw new Error(`Could not load tests: ${error.message}`);
    return rows ?? [];
  });

/** Insert or update one or more test requirements for a standard. */
export const saveTests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ tests: z.array(TestRow).min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    let saved = 0;
    for (const t of data.tests) {
      const payload = {
        document_id: t.documentId,
        standard_number: t.standardNumber,
        product_category: t.productCategory || null,
        test_name: t.testName,
        clause_ref: t.clauseRef || null,
        requirement: t.requirement || null,
        method: t.method || null,
        data_origin: "Verified source",
      };
      const { error } = t.id
        ? await supabase.from("standard_tests").update(payload).eq("id", t.id)
        : await supabase.from("standard_tests").insert(payload);
      if (error) throw new Error(`Could not save test: ${error.message}`);
      saved++;
    }
    return { saved };
  });

export const deleteTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { error } = await supabase.from("standard_tests").delete().eq("id", data.id);
    if (error) throw new Error(`Could not delete test: ${error.message}`);
    return { ok: true };
  });

export const listProductLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ standardNumber: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("products_map")
      .select("id, standard_number, product_category, product_keywords, mandatory, scheme_key")
      .eq("standard_number", data.standardNumber);
    if (error) throw new Error(`Could not load product links: ${error.message}`);
    return rows ?? [];
  });

export const saveProductLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        standardNumber: z.string().min(1).max(60),
        productCategory: z.string().min(1).max(120),
        keywords: z.array(z.string().min(1).max(60)).max(30).default([]),
        mandatory: z.boolean().default(false),
        schemeKey: z.string().max(60).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const payload = {
      standard_number: data.standardNumber,
      product_category: data.productCategory,
      product_keywords: data.keywords.length ? data.keywords : [data.productCategory.toLowerCase()],
      mandatory: data.mandatory,
      scheme_key: data.schemeKey || null,
    };
    const { error } = data.id
      ? await supabase.from("products_map").update(payload).eq("id", data.id)
      : await supabase.from("products_map").insert(payload);
    if (error) throw new Error(`Could not save product link: ${error.message}`);
    return { ok: true };
  });

export const deleteProductLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await requireAdmin(supabase, userId);
    const { error } = await supabase.from("products_map").delete().eq("id", data.id);
    if (error) throw new Error(`Could not delete product link: ${error.message}`);
    return { ok: true };
  });
