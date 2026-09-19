import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Languages, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { AdminGate } from "@/components/AdminGate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInsights } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/insights")({
  head: () => ({
    meta: [
      { title: "Admin — Usage insights | BISmart" },
      { name: "description", content: "BISmart usage analytics: questions, languages, confidence, feedback." },
      { property: "og:title", content: "BISmart admin — insights" },
      { property: "og:description", content: "Usage analytics for the BISmart assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsightsPage,
});

interface Insights {
  totalQuestions: number;
  byLang: Record<string, number>;
  topStandards: { standard: string; count: number }[];
  avgConfidence: number | null;
  feedback: { up: number; down: number };
  recent: { question: string; lang: string; confidence: string | null; created_at: string }[];
}

const LANG_LABELS: Record<string, string> = { en: "English", hi: "Hindi", te: "Telugu" };

function InsightsPage() {
  return (
    <AdminGate>
      <InsightsBody />
    </AdminGate>
  );
}

function InsightsBody() {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    void getInsights()
      .then((d) => setData(d as Insights))
      .catch((e: Error) => toast.error(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <BarChart3 className="h-6 w-6 text-accent" aria-hidden />
        Usage insights
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live usage of the assistant. Manage documents on the{" "}
        <Link to="/admin/ingest" className="text-accent-foreground underline underline-offset-4">
          ingestion page
        </Link>
        .
      </p>

      {!data ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<MessageSquare className="h-5 w-5 text-accent" />}
              label="Total questions"
              value={String(data.totalQuestions)}
            />
            <StatCard
              icon={<Languages className="h-5 w-5 text-accent" />}
              label="Languages used"
              value={Object.keys(data.byLang)
                .map((l) => `${LANG_LABELS[l] ?? l} (${data.byLang[l]})`)
                .join(" · ") || "—"}
              small
            />
            <StatCard
              icon={<BarChart3 className="h-5 w-5 text-accent" />}
              label="Average confidence"
              value={data.avgConfidence != null ? `${data.avgConfidence}%` : "—"}
            />
            <StatCard
              icon={<ThumbsUp className="h-5 w-5 text-accent" />}
              label="Feedback"
              value={`${data.feedback.up} up · ${data.feedback.down} down`}
              small
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="card-surface p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Top queried standards
              </h2>
              {data.topStandards.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.topStandards.map((s) => (
                    <li key={s.standard} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 font-mono text-xs font-semibold">{s.standard}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${Math.max(8, (s.count / (data.topStandards[0]?.count ?? 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-muted-foreground">{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card-surface p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recent questions
              </h2>
              {data.recent.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No questions logged yet.</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {data.recent.map((r, i) => (
                    <li key={i} className="border-b border-border pb-2.5 text-sm last:border-0">
                      <p className="line-clamp-1">{r.question}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{LANG_LABELS[r.lang] ?? r.lang}</span>
                        {r.confidence && <span>· {r.confidence} confidence</span>}
                        {r.confidence === "Low" ? (
                          <ThumbsDown className="h-3 w-3" aria-hidden />
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
      <div className="mt-8">
        <Button asChild variant="outline">
          <Link to="/admin/ingest">Go to ingestion</Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span></div>
      <p className={`mt-3 font-bold ${small ? "text-base" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
