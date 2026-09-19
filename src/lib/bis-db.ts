import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  labs as localLabs,
  schemes as localSchemes,
  standards as localStandards,
  type BISScheme,
  type BISStandard,
  type Enforcement,
  type StandardStatus,
  type TestingLab,
} from "@/data/bis-data";
import { listStandards } from "@/lib/bis.functions";

/**
 * Read reference data (labs, schemes) from Lovable Cloud when available,
 * falling back to the bundled sample data. All rows are publicly readable
 * reference data marked "Sample" until real BIS sources are ingested.
 */

interface LabRow {
  lab_key: string;
  name: string;
  city: string;
  state: string;
  recognized_scope: string[];
  source_url: string;
  data_origin: string;
}

interface SchemeRow {
  scheme_key: string;
  name: string;
  short_name: string;
  description: string;
  eligibility: string;
  steps: { title: string; detail: string; duration: string }[];
  documents_required: string[];
  source_url: string;
  data_origin: string;
}

export function useLabs(): TestingLab[] {
  const [remote, setRemote] = useState<TestingLab[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("labs")
        .select("lab_key,name,city,state,recognized_scope,source_url,data_origin");
      if (cancelled || error || !data || data.length === 0) return;
      setRemote(
        (data as unknown as LabRow[]).map((r) => ({
          id: r.lab_key,
          name: r.name,
          city: r.city,
          state: r.state,
          recognizedScope: r.recognized_scope ?? [],
          // Contact details are intentionally not exposed by the public API.
          contact: "",
          email: "",
          sourceUrl: r.source_url,
          dataOrigin: (r.data_origin === "Verified source" ? "Verified source" : "Sample") as const,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return remote ?? localLabs;
}

export function useSchemes(): BISScheme[] {
  const [remote, setRemote] = useState<BISScheme[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("schemes")
        .select("scheme_key,name,short_name,description,eligibility,steps,documents_required,source_url,data_origin");
      if (cancelled || error || !data || data.length === 0) return;
      setRemote(
        (data as unknown as SchemeRow[]).map((r) => ({
          id: r.scheme_key,
          name: r.name,
          shortName: r.short_name,
          description: r.description,
          eligibility: r.eligibility,
          steps: Array.isArray(r.steps) ? r.steps : [],
          documentsRequired: r.documents_required ?? [],
          sourceUrl: r.source_url,
          dataOrigin: (r.data_origin === "Verified source" ? "Verified source" : "Sample") as const,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return remote ?? localSchemes;
}

const STATUSES: StandardStatus[] = ["Active", "Superseded", "Under revision"];
const ENFORCEMENTS: Enforcement[] = [
  "ISI Mark (Mandatory)",
  "CRS (Mandatory)",
  "Hallmarking (Mandatory)",
  "Voluntary",
];

/**
 * The indexed Indian Standards from Lovable Cloud, shaped like the local
 * BISStandard records so existing UI keeps working. Falls back to the bundled
 * sample set only if the database cannot be reached.
 */
export function useStandards(): { standards: BISStandard[]; loading: boolean } {
  const [remote, setRemote] = useState<BISStandard[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    void listStandards()
      .then(({ standards }) => {
        if (cancelled || standards.length === 0) return;
        setRemote(
          standards.map((s) => ({
            id: s.id,
            standardNumber: s.standardNumber,
            title: s.title,
            division: s.division,
            sector: s.sector,
            year: s.year,
            status: (STATUSES.find((v) => v === s.status) ?? "Active") as StandardStatus,
            enforcement: (ENFORCEMENTS.find((v) => v === s.enforcement) ?? "Voluntary") as Enforcement,
            summary: s.summary,
            tags: s.tags,
            productKeywords: s.tags,
            tests: [],
            clauses: s.clauses,
            relatedStandards: [],
            schemeId: s.enforcement.startsWith("CRS")
              ? "scheme-ii-crs"
              : s.enforcement.startsWith("Hallmarking")
                ? "hallmarking"
                : "scheme-i",
            sourceUrl: s.sourceUrl,
            dataOrigin: s.dataOrigin,
          })),
        );
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { standards: remote ?? localStandards, loading: loading && remote === null };
}

/** Keyword match over a standards list (number, title, summary, tags). */
export function matchStandards(list: BISStandard[], query: string): BISStandard[] {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  if (words.length === 0) return list;
  const scored = list.map((s) => {
    const haystack = [s.standardNumber, s.title, s.summary, s.sector, s.division, ...s.tags]
      .join(" ")
      .toLowerCase();
    const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
    return { s, score };
  });
  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.s);
}
