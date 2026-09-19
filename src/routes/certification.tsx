import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, CheckCircle2, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { type BISScheme } from "@/data/bis-data";
import { useSchemes } from "@/lib/bis-db";

export const Route = createFileRoute("/certification")({
  head: () => ({
    meta: [
      { title: "BIS Certification Guide — ISI Mark, CRS, Hallmarking, FMCS" },
      {
        name: "description",
        content:
          "Step-by-step guides for BIS schemes: ISI Mark product certification, CRS registration, hallmarking, FMCS, lab recognition, standards clubs and training.",
      },
      { property: "og:title", content: "BIS Certification Guide — BISmart" },
      {
        property: "og:description",
        content: "Eligibility, documents, timelines and steps for every major BIS certification scheme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CertificationPage,
});

function CertificationPage() {
  const { t } = useI18n();
  const schemes = useSchemes();
  const [selected, setSelected] = useState<BISScheme | null>(null);

  return (
    <PageShell title={t("cert.title")} subtitle={t("cert.subtitle")}>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((s) => (
            <article key={s.id} className="card-interactive flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <BadgeCheck className="h-5 w-5" aria-hidden />
                </span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {t("common.sample")}
                </Badge>
              </div>
              <h2 className="mt-4 text-base font-semibold leading-snug">{s.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setSelected(s)}>
                  {t("cert.view")}
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/chat" search={{ q: `Explain the ${s.name} process, documents and timeline.` }}>
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    {t("cert.ask")}
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.description}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-7 pb-10">
                <section>
                  <h3 className="text-sm font-semibold">{t("cert.eligibility")}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{selected.eligibility}</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold">{t("cert.docs")}</h3>
                  <ul className="mt-2 space-y-2">
                    {selected.documentsRequired.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-muted-foreground">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-semibold">{t("cert.steps")}</h3>
                  <ol className="mt-3 space-y-0">
                    {selected.steps.map((step, i) => (
                      <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                        {i < selected.steps.length - 1 && (
                          <span aria-hidden className="absolute left-[15px] top-8 h-full w-0.5 bg-border" />
                        )}
                        <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            {step.duration}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                <Button asChild className="w-full">
                  <Link to="/chat" search={{ q: `I need help with ${selected.name}. Where do I start?` }}>
                    {t("cert.ask")}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
