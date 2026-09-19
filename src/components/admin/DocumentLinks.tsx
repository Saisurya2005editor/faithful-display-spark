/**
 * Admin panel: manage the test requirements extracted from a standard's clauses
 * and the product categories that the standard applies to.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  deleteProductLink,
  deleteTest,
  listProductLinks,
  listTests,
  saveProductLink,
  saveTests,
  suggestTests,
} from "@/lib/admin.functions";

interface TestRow {
  id?: string;
  test_name: string;
  clause_ref: string | null;
  requirement: string | null;
  method: string | null;
  product_category?: string | null;
}

interface LinkRow {
  id: string;
  product_category: string | null;
  product_keywords: string[] | null;
  mandatory: boolean | null;
  scheme_key: string | null;
}

export function DocumentLinks({
  documentId,
  standardNumber,
}: {
  documentId: string;
  standardNumber: string;
}) {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<TestRow>({ test_name: "", clause_ref: "", requirement: "", method: "" });
  const [newLink, setNewLink] = useState({ category: "", keywords: "", mandatory: false, scheme: "" });

  const refresh = useCallback(() => {
    setLoading(true);
    void Promise.all([listTests({ data: { standardNumber } }), listProductLinks({ data: { standardNumber } })])
      .then(([t, l]) => {
        setTests(t as TestRow[]);
        setLinks(l as LinkRow[]);
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [standardNumber]);

  useEffect(refresh, [refresh]);

  const extract = async () => {
    setBusy(true);
    try {
      const { suggestions } = await suggestTests({ data: { documentId } });
      if (suggestions.length === 0) {
        toast.info("No test-like clauses found in this document.");
        return;
      }
      await saveTests({
        data: {
          tests: suggestions.map((s) => ({
            documentId,
            standardNumber,
            testName: s.testName,
            clauseRef: s.clauseRef,
            requirement: s.requirement,
            method: s.method,
            productCategory: "",
          })),
        },
      });
      toast.success(`Added ${suggestions.length} test requirements from clauses.`);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addTest = async () => {
    if (!draft.test_name.trim()) {
      toast.error("Give the test a name.");
      return;
    }
    setBusy(true);
    try {
      await saveTests({
        data: {
          tests: [
            {
              documentId,
              standardNumber,
              testName: draft.test_name.trim(),
              clauseRef: draft.clause_ref ?? "",
              requirement: draft.requirement ?? "",
              method: draft.method ?? "",
              productCategory: "",
            },
          ],
        },
      });
      setDraft({ test_name: "", clause_ref: "", requirement: "", method: "" });
      toast.success("Test requirement saved.");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeTest = async (id: string) => {
    setBusy(true);
    try {
      await deleteTest({ data: { id } });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addLink = async () => {
    if (!newLink.category.trim()) {
      toast.error("Enter a product category.");
      return;
    }
    setBusy(true);
    try {
      await saveProductLink({
        data: {
          standardNumber,
          productCategory: newLink.category.trim(),
          keywords: newLink.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          mandatory: newLink.mandatory,
          schemeKey: newLink.scheme.trim(),
        },
      });
      setNewLink({ category: "", keywords: "", mandatory: false, scheme: "" });
      toast.success("Product link saved.");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeLink = async (id: string) => {
    setBusy(true);
    try {
      await deleteProductLink({ data: { id } });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading links…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products */}
      <section>
        <h3 className="text-sm font-semibold">Products covered by {standardNumber}</h3>
        <div className="mt-2 space-y-2">
          {links.length === 0 && <p className="text-sm text-muted-foreground">No product linked yet.</p>}
          {links.map((l) => (
            <div key={l.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{l.product_category ?? "—"}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(l.product_keywords ?? []).slice(0, 8).map((k) => (
                    <Badge key={k} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                  {l.mandatory && <Badge>Mandatory</Badge>}
                  {l.scheme_key && <Badge variant="outline">{l.scheme_key}</Badge>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                disabled={busy}
                onClick={() => void removeLink(l.id)}
                aria-label="Remove product link"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="pl-cat">Product category</Label>
            <Input
              id="pl-cat"
              value={newLink.category}
              onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
              placeholder="Wires and Cables"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pl-kw">Keywords (comma separated)</Label>
            <Input
              id="pl-kw"
              value={newLink.keywords}
              onChange={(e) => setNewLink({ ...newLink, keywords: e.target.value })}
              placeholder="house wire, pvc cable"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pl-scheme">Scheme key</Label>
            <Input
              id="pl-scheme"
              value={newLink.scheme}
              onChange={(e) => setNewLink({ ...newLink, scheme: e.target.value })}
              placeholder="scheme-i"
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="pl-mand"
                checked={newLink.mandatory}
                onCheckedChange={(v) => setNewLink({ ...newLink, mandatory: v })}
              />
              <Label htmlFor="pl-mand">Mandatory</Label>
            </div>
            <Button size="sm" disabled={busy} onClick={() => void addLink()}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Link product
            </Button>
          </div>
        </div>
      </section>

      {/* Tests */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Test requirements ({tests.length})</h3>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void extract()}>
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            Extract from clauses
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {tests.length === 0 && <p className="text-sm text-muted-foreground">No test requirement recorded yet.</p>}
          {tests.map((x) => (
            <div key={x.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{x.test_name}</p>
                <p className="mt-0.5 font-mono text-xs text-accent">{x.clause_ref ?? "—"}</p>
                {x.requirement && <p className="mt-1 text-sm text-muted-foreground">{x.requirement}</p>}
                {x.method && <p className="mt-1 font-mono text-xs text-muted-foreground">Method: {x.method}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive"
                disabled={busy}
                onClick={() => x.id && void removeTest(x.id)}
                aria-label="Remove test"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="t-name">Test name</Label>
            <Input id="t-name" value={draft.test_name} onChange={(e) => setDraft({ ...draft, test_name: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-clause">Clause</Label>
            <Input
              id="t-clause"
              value={draft.clause_ref ?? ""}
              onChange={(e) => setDraft({ ...draft, clause_ref: e.target.value })}
              placeholder="Clause 7.1"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-req">Acceptable limit / requirement</Label>
            <Input
              id="t-req"
              value={draft.requirement ?? ""}
              onChange={(e) => setDraft({ ...draft, requirement: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-method">Test method</Label>
            <Input
              id="t-method"
              value={draft.method ?? ""}
              onChange={(e) => setDraft({ ...draft, method: e.target.value })}
              placeholder="IS 10810"
            />
          </div>
        </div>
        <Button size="sm" className="mt-3" disabled={busy} onClick={() => void addTest()}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add test requirement
        </Button>
      </section>
    </div>
  );
}
