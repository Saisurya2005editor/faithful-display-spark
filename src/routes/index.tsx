import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  FlaskConical,
  Gem,
  Languages,
  MessageSquareQuote,
  ScrollText,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { exampleQueries } from "@/data/bis-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BISmart — Find the right Indian Standard in seconds" },
      {
        name: "description",
        content:
          "BISmart is an AI assistant for Indian Standards and BIS services: standard recommendations, ISI mark and CRS guidance, hallmarking help and testing labs, with citations.",
      },
      { property: "og:title", content: "BISmart — AI assistant for Indian Standards" },
      {
        property: "og:description",
        content: "Ask about Indian Standards, certification, hallmarking and testing labs — answers with verifiable citations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: ScrollText, t: "f1.title", b: "f1.body" },
  { icon: BadgeCheck, t: "f2.title", b: "f2.body" },
  { icon: Gem, t: "f3.title", b: "f3.body" },
  { icon: FlaskConical, t: "f4.title", b: "f4.body" },
  { icon: Users, t: "f5.title", b: "f5.body" },
  { icon: Languages, t: "f6.title", b: "f6.body" },
];

function Landing() {
  const { t } = useI18n();

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-success/20 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 gap-1.5 bg-primary-foreground/15 text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-primary-foreground sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/chat">
                  {t("hero.cta")}
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/recommend">{t("hero.cta2")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("features.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("features.subtitle")}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.t} className="card-interactive p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <f.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold">{t(f.t)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(f.b)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("how.title")}</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: 1, t: "how.s1.title", b: "how.s1.body", icon: MessageSquareQuote },
              { n: 2, t: "how.s2.title", b: "how.s2.body", icon: Search },
              { n: 3, t: "how.s3.title", b: "how.s3.body", icon: BadgeCheck },
            ].map((s) => (
              <li key={s.n} className="relative rounded-xl border border-border bg-background p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.n}
                </span>
                <h3 className="mt-4 flex items-center gap-2 text-base font-semibold">
                  <s.icon className="h-4 w-4 text-accent" aria-hidden />
                  {t(s.t)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.b)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Example chips */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("examples.title")}</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {exampleQueries.map((q) => (
            <Link
              key={q}
              to="/chat"
              search={{ q }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
