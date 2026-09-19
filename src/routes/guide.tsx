import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, FlaskConical, MapPin, MessageSquare, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { getProductGuide, listGuideOptions, type GuideOption, type GuideResult } from "@/lib/bis.functions";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Product Guide — required BIS tests, limits and labs" },
      {
        name: "description",
        content:
          "Choose a product and an Indian Standard to see the required tests, acceptable limits, clause references and BIS recognized laboratories that can test it.",
      },
      { property: "og:title", content: "BIS Product Guide — tests, limits and labs" },
      {
        property: "og:description",
        content: "Product plus standard, mapped to required tests with acceptable limits, clauses and testing labs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const { t } = useI18n();
  const [options, setOptions] = useState<GuideOption[] | null>(null);
  const [product, setProduct] = useState("");
  const [standard, setStandard] = useState("");
  const [result, setResult] = useState<GuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void listGuideOptions()
      .then(({ options: o }) => {
        if (cancelled) return;
        setOptions(o);
        if (o.length > 0) {
          setProduct(o[0]!.productCategory);
          setStandard(o[0]!.standards[0]?.standardNumber ?? "");
        }
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const standards = useMemo(
    () => options?.find((o) => o.productCategory === product)?.standards ?? [],
    [options, product],
  );

  useEffect(() => {
    if (!standard || !standards.some((s) => s.standardNumber === standard)) {
      setStandard(standards[0]?.standardNumber ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, standards]);

  useEffect(() => {
    if (!standard) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    void getProductGuide({ data: { standardNumber: standard, productCategory: product } })
      .then((r) => !cancelled && setResult(r))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [standard, product]);

  const selected = standards.find((s) => s.standardNumber === standard);

  return (
    <PageShell title={t("guide.title")} subtitle={t("guide.subtitle")}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="card-surface grid gap-4 p-5 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="guide-product">{t("guide.product")}</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger id="guide-product" className="h-11">
                <SelectValue placeholder={t("guide.pickPrompt")} />
              </SelectTrigger>
              <SelectContent>
                {(options ?? []).map((o) => (
                  <SelectItem key={o.productCategory} value={o.productCategory}>
                    {o.productCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="guide-standard">{t("guide.standard")}</Label>
            <Select value={standard} onValueChange={setStandard} disabled={standards.length === 0}>
              <SelectTrigger id="guide-standard" className="h-11">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {standards.map((s) => (
                  <SelectItem key={s.standardNumber} value={s.standardNumber}>
                    {s.standardNumber} — {s.title.slice(0, 48)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {loading && <p className="mt-6 text-sm text-muted-foreground">{t("guide.loading")}</p>}

        {result && !loading && (
          <div className="mt-8 space-y-8">
            <header className="card-surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-sm font-bold text-accent">{result.standardNumber}</h2>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {t(result.origin === "Verified source" ? "common.verified" : "common.sample")}
                </Badge>
                {selected?.mandatory && (
                  <Badge className="gap-1 text-[10px] uppercase">
                    <ShieldCheck className="h-3 w-3" aria-hidden /> Mandatory
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-base font-semibold">{result.title}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={result.sourceUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Source
                  </a>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link
                    to="/chat"
                    search={{ q: `What tests and limits apply to ${product} under ${result.standardNumber}?` }}
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden /> {t("cert.ask")}
                  </Link>
                </Button>
              </div>
            </header>

            {/* Required tests and limits */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FlaskConical className="h-5 w-5 text-accent" aria-hidden />
                {t("guide.tests")} ({result.tests.length})
              </h2>
              {result.tests.length === 0 ? (
                <p className="mt-3 card-surface p-6 text-sm text-muted-foreground">{t("guide.noTests")}</p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">{t("guide.tests")}</th>
                        <th className="px-4 py-2.5">{t("guide.clause")}</th>
                        <th className="px-4 py-2.5">{t("guide.limit")}</th>
                        <th className="px-4 py-2.5">{t("guide.method")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.tests.map((x, i) => (
                        <tr key={`${x.clauseRef}-${i}`} className="border-t border-border align-top">
                          <td className="px-4 py-3 font-medium">{x.testName}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{x.clauseRef}</td>
                          <td className="px-4 py-3 text-muted-foreground">{x.requirement}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{x.method || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Clause evidence */}
            {result.clauses.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <BookOpen className="h-5 w-5 text-accent" aria-hidden />
                  {t("guide.clauses")}
                </h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {result.clauses.map((c, i) => (
                    <article key={`${c.ref}-${i}`} className="card-surface p-4">
                      <p className="font-mono text-xs font-semibold text-accent">{c.ref}</p>
                      <p className="mt-0.5 text-sm font-medium">{c.heading}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{c.excerpt}…</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Labs */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-accent" aria-hidden />
                {t("guide.labs")}
              </h2>
              {result.labs.length === 0 ? (
                <p className="mt-3 card-surface p-6 text-sm text-muted-foreground">{t("guide.noLabs")}</p>
              ) : (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {result.labs.map((l) => (
                    <article key={l.name} className="card-interactive p-4">
                      <h3 className="text-sm font-semibold">{l.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {l.city}, {l.state}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {l.scope.slice(0, 5).map((s) => (
                          <Badge key={s} variant="secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <Button asChild variant="ghost" size="sm" className="mt-3">
                <Link to="/labs">{t("nav.labs")}</Link>
              </Button>
            </section>
          </div>
        )}
      </div>
    </PageShell>
  );
}
