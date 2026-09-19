import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Database, MessageSquare, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { labs, schemes, standards } from "@/data/bis-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BISmart — architecture, data sources and disclaimer" },
      {
        name: "description",
        content:
          "How BISmart retrieves BIS knowledge and cites it, what sample data the demo uses, and the disclaimer for verifying answers with official BIS sources.",
      },
      { property: "og:title", content: "About BISmart" },
      {
        property: "og:description",
        content: "Retrieval-augmented architecture, sample dataset scope and demo disclaimer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const pipeline = [
  { icon: MessageSquare, title: "Question", body: "The user asks in English, Hindi or Telugu. Non-English queries are translated for retrieval." },
  { icon: Search, title: "Retrieve", body: "Relevant standards, clauses and scheme documents are matched and ranked." },
  { icon: Sparkles, title: "Generate", body: "The assistant answers only from retrieved context, citing standard number and clause." },
  { icon: Database, title: "Cite and score", body: "Citations, source links and a confidence level are returned with the answer." },
];

function AboutPage() {
  const { t } = useI18n();

  return (
    <PageShell title={t("about.title")} subtitle="Architecture, data sources and the demo disclaimer.">
      <div className="mx-auto w-full max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        <section>
          <h2 className="text-lg font-semibold">Retrieval pipeline</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((p, i) => (
              <div key={p.title} className="card-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-3 text-xs font-mono text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 text-sm font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>

          <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted p-5 text-[11px] leading-relaxed text-muted-foreground">
{`  User question (EN / HI / TE)
          |
          v
  +-------------------+      +--------------------------+
  |  Query processing | ---> |  Retrieval over BIS docs |
  |  (detect language)|      |  standards | clauses     |
  +-------------------+      |  schemes   | labs        |
          |                  +--------------------------+
          |                              |
          v                              v
  +---------------------------------------------------+
  |  Answer generation — grounded in retrieved context |
  |  cites [standard number, clause] for every claim   |
  +---------------------------------------------------+
          |
          v
  Answer + citation cards + confidence + follow-ups`}
          </pre>
        </section>

        <section>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">Demo data</h2>
            <Badge variant="outline" className="uppercase">
              {t("common.sample")}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This demo runs entirely on a curated sample dataset that mirrors real BIS content. Nothing here should be
            treated as an official record.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { n: standards.length, label: "Sample standards across electrical, construction, food, toys and precious metals" },
              { n: schemes.length, label: "Certification and recognition schemes with steps and documents" },
              { n: labs.length, label: "Sample testing laboratories across Indian states" },
            ].map((s) => (
              <div key={s.label} className="card-surface p-5">
                <p className="text-3xl font-bold">{s.n}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-accent/40 bg-accent/10 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-accent" aria-hidden />
            Disclaimer
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("footer.disclaimer")} Standard numbers, clause references and certification requirements change over time.
            For legally binding information, refer to the official Bureau of Indian Standards portal at bis.gov.in.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
