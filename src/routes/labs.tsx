import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, MapPin, MessageSquare, Phone, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { labs } from "@/data/bis-data";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "Testing Lab Finder — BIS recognized laboratories in India" },
      {
        name: "description",
        content:
          "Find BIS recognized testing laboratories by product, standard, state and city, with recognized scope and contact details.",
      },
      { property: "og:title", content: "Testing Lab Finder — BISmart" },
      {
        property: "og:description",
        content: "Search recognized laboratories by product scope and location across Indian states.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabsPage,
});

const states = Array.from(new Set(labs.map((l) => l.state))).sort();

function LabsPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return labs
      .filter((l) => (state === "all" ? true : l.state === state))
      .filter((l) =>
        q
          ? l.recognizedScope.some((s) => s.toLowerCase().includes(q)) ||
            l.name.toLowerCase().includes(q) ||
            l.city.toLowerCase().includes(q)
          : true,
      );
  }, [query, state]);

  return (
    <PageShell title={t("labs.title")} subtitle={t("labs.subtitle")}>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("labs.searchPh")}
              aria-label={t("labs.searchPh")}
              className="h-11 pl-11"
            />
          </div>
          <div>
            <Label className="sr-only">{t("labs.state")}</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="card-surface p-12 text-center text-sm text-muted-foreground">{t("labs.empty")}</div>
            ) : (
              results.map((l) => (
                <article key={l.id} className="card-interactive p-5">
                  <header className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold">{l.name}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                        {l.city}, {l.state}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {t("common.sample")}
                    </Badge>
                  </header>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("labs.scope")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {l.recognizedScope.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>

                  <footer className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {l.contact}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                      {l.email}
                    </span>
                    <Button asChild size="sm" variant="ghost" className="ml-auto">
                      <Link to="/chat" search={{ q: `What tests does ${l.name} do and how do I send samples?` }}>
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        {t("cert.ask")}
                      </Link>
                    </Button>
                  </footer>
                </article>
              ))
            )}
          </div>

          <aside className="card-surface h-fit p-5">
            <h2 className="text-sm font-semibold">{t("labs.map")}</h2>
            <div className="mt-3 flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted">
              <div className="text-center">
                <MapPin className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden />
                <p className="mt-2 px-6 text-xs text-muted-foreground">{t("labs.mapNote")}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              {results.slice(0, 6).map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {l.city}, {l.state}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
