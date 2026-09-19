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
}

export function useLabs(): TestingLab[] {
  const [remote, setRemote] = useState<TestingLab[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("labs")
        .select("lab_key,name,city,state,recognized_scope,source_url");
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
          dataOrigin: "Sample" as const,
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
        .select("scheme_key,name,short_name,description,eligibility,steps,documents_required,source_url");
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
          dataOrigin: "Sample" as const,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return remote ?? localSchemes;
}
