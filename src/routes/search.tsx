import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileSearch, MessageSquare, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { findStandards, standards, type BISStandard } from "@/data/bis-data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "BIS Document Search — Indian Standards by product and sector" },
      {
        name: "description",
        content:
          "Search Indian Standards by product, standard number, division, year or status. See summaries, clauses, tests and related standards.",
      },
      { property: "og:title", content: "Search Indian Standards — BISmart" },
      {
        property: "og:description",
        content: "Filter Indian Standards by type, sector, year and status with relevance scoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const sectors = Array.from(new Set(standards.map((s) => s.sector))).sort();
const divisions = Array.from(new Set(standards.map((s) => s.division))).sort();
const years = Array.from(new Set(standards.map((s) => s.year))).sort((a, b) => b - a);

function SearchPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [division, setDivision] = useState("all");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<BISStandard | null>(null);

  const results = useMemo(() => {
    const base = query.trim() ? findStandards(query) : standards;
    return base
      .filter((s) => (sector === "all" ? true : s.sector === sector))
      .filter((s) => (division === "all" ? true : s.division === division))
      .filter((s) => (year === "all" ? true : String(s.year) === year))
      .filter((s) => (status === "all" ? true : s.status === status))
      .map((s, i) => ({ s, relevance: query.trim() ? Math.max(52, 97 - i * 6) : 100 - i }));
  }, [query, sector, division, year, status]);

  const reset = () => {
    setQuery("");
    setSector("all");
    setDivision("all");
    setYear("all");
    setStatus("all");
  };

  return (
    <PageShell title={t("search.title")} subtitle={t("search.subtitle")}>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            className="h-12 pl-11 text-base"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Superseded">Superseded</SelectItem>
                <SelectItem value="Under revision">Under revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{results.length} documents</p>
          <Button variant="ghost" size="sm" onClick={reset}>
            {t("common.reset")}
          </Button>
        </div>

        {results.length === 0 ? (
          <div className="card-surface mt-6 flex flex-col items-center gap-3 p-12 text-center">
            <FileSearch className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{t("search.empty")}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {results.map(({ s, relevance }) => (
              <article key={s.id} className="card-interactive p-5">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">{s.standardNumber}</p>
                    <h2 className="mt-1 text-sm font-semibold leading-snug">{s.title}</h2>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {relevance}%
                  </Badge>
                </header>
                <p className="mt-2.5 text-sm text-muted-foreground">{s.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{s.sector}</Badge>
                  <Badge variant="secondary">{s.year}</Badge>
                  <Badge variant="secondary">{s.status}</Badge>
                  {s.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                    {t("search.details")}
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/chat" search={{ q: `Explain ${s.standardNumber} in simple terms.` }}>
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      {t("cert.ask")}
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.standardNumber}</SheetTitle>
                <SheetDescription>{selected.title}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Division</dt>
                  <dd className="mt-0.5">{selected.division}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Sector</dt>
                  <dd className="mt-0.5">{selected.sector}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Year</dt>
                  <dd className="mt-0.5">{selected.year}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-0.5">{selected.status}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Enforcement</dt>
                  <dd className="mt-0.5">{selected.enforcement}</dd>
                </div>
              </dl>

              <section className="mt-6">
                <h3 className="text-sm font-semibold">Key clauses</h3>
                <div className="mt-2 space-y-3">
                  {selected.clauses.map((c) => (
                    <div key={c.ref} className="rounded-lg border border-border p-3">
                      <p className="font-mono text-xs text-muted-foreground">{c.ref}</p>
                      <p className="mt-1 text-sm font-medium">{c.heading}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.excerpt}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-6 pb-10">
                <h3 className="text-sm font-semibold">{t("rec.related")}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{selected.relatedStandards.join(", ")}</p>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-block text-sm underline decoration-accent decoration-2 underline-offset-4"
                >
                  {t("chat.viewSource")}
                </a>
              </section>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
