import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { getScheme, productCategories, type BISStandard } from "@/data/bis-data";
import { matchStandards, useStandards } from "@/lib/bis-db";
import { recommendProduct } from "@/lib/bis.functions";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "Product to Standard Recommender — BISmart" },
      {
        name: "description",
        content:
          "Describe your product and get a ranked list of applicable Indian Standards, mandatory or voluntary status, certification scheme and testing requirements.",
      },
      { property: "og:title", content: "Find the Indian Standard for your product — BISmart" },
      {
        property: "og:description",
        content: "Ranked Indian Standards with match score, ISI/CRS status and required tests for your product.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecommendPage,
});

interface Ranked {
  standard: BISStandard;
  score: number;
}

function RecommendPage() {
  const { t, lang } = useI18n();
  const { standards } = useStandards();
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("all");
  const [market, setMarket] = useState("domestic");
  const [maker, setMaker] = useState("msme");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Ranked[] | null>(null);

  const fallbackLocal = (text: string): Ranked[] => {
    const matched = matchStandards(standards, `${text} ${category === "all" ? "" : category}`).filter((s) =>
      category === "all" ? true : s.sector === category,
    );
    const pool = matched.length ? matched : matchStandards(standards, text);
    return pool.slice(0, 6).map((standard, i) => ({ standard, score: Math.max(58, 96 - i * 8) }));
  };

  const run = () => {
    const text = product.trim();
    if (!text) return;
    setLoading(true);
    setResults(null);
    void (async () => {
      try {
        const { ranked } = await recommendProduct({ data: { product: text, lang } });
        const mapped = ranked
          .map((r) => {
            const standard = standards.find((s) => s.standardNumber === r.standardNumber);
            return standard ? { standard, score: r.score } : null;
          })
          .filter((r): r is Ranked => r !== null)
          .filter((r) => (category === "all" ? true : r.standard.sector === category));
        setResults(mapped.length ? mapped : fallbackLocal(text));
      } catch {
        setResults(fallbackLocal(text));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <PageShell title={t("rec.title")} subtitle={t("rec.subtitle")}>
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <div className="card-surface h-fit space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="product">{t("rec.product")}</Label>
            <Textarea
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder={t("rec.productPh")}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("rec.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {productCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("rec.market")}</Label>
            <Select value={market} onValueChange={setMarket}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic">Domestic (India)</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("rec.manufacturer")}</Label>
            <Select value={maker} onValueChange={setMaker}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="msme">MSME</SelectItem>
                <SelectItem value="large">Large manufacturer</SelectItem>
                <SelectItem value="importer">Importer</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={run} disabled={!product.trim() || loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t("rec.submit")}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="card-surface space-y-3 p-5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </>
          )}

          {!loading && results === null && (
            <div className="card-surface flex flex-col items-center gap-3 p-12 text-center">
              <ScrollText className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">{t("rec.subtitle")}</p>
            </div>
          )}

          {!loading && results?.length === 0 && (
            <div className="card-surface p-8 text-center text-sm text-muted-foreground">{t("rec.empty")}</div>
          )}

          {!loading && results && results.length > 0 && (
            <>
              <h2 className="text-lg font-semibold">{t("rec.results")}</h2>
              {results.map(({ standard: s, score }) => {
                const scheme = getScheme(s.schemeId);
                const mandatory = s.enforcement !== "Voluntary";
                return (
                  <article key={s.id} className="card-surface p-5">
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-semibold">{s.standardNumber}</p>
                        <h3 className="mt-1 text-base font-semibold leading-snug">{s.title}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={mandatory ? "bg-success text-success-foreground" : ""} variant={mandatory ? "default" : "outline"}>
                          {s.enforcement}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t("rec.match")} {score}%
                        </span>
                      </div>
                    </header>

                    <p className="mt-3 text-sm text-muted-foreground">{s.summary}</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("rec.why")}
                        </p>
                        <p className="mt-1.5 text-sm">
                          Matches your product description in the {s.sector.toLowerCase()} sector.{" "}
                          {mandatory
                            ? `Certification is mandatory via ${scheme?.shortName ?? "BIS"}.`
                            : "Conformity is voluntary but recommended."}
                          {market === "export" ? " For export, buyer-country standards may also apply." : ""}
                          {maker === "importer" && mandatory ? " Importers need the foreign factory certified (FMCS/CRS)." : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("rec.tests")}
                        </p>
                        <ul className="mt-1.5 space-y-1 text-sm">
                          {s.tests.map((test) => (
                            <li key={test} className="flex gap-2">
                              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              {test}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        {t("rec.related")}: {s.relatedStandards.join(", ")}
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          to="/chat"
                          search={{
                            q: `I make ${product.trim()}. Tell me more about ${s.standardNumber} and the certification process.`,
                          }}
                        >
                          {t("rec.followup")}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </Button>
                    </footer>
                  </article>
                );
              })}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
