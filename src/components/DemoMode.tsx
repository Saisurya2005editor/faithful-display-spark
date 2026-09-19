import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, X } from "lucide-react";
import { DEMO_QUERIES, stageDemoQuery } from "@/lib/demo";
import { Button } from "@/components/ui/button";

/**
 * Demo Mode (Shift+D): floating panel with one-click demo queries for judges.
 * Clicking a query hands it to /chat via sessionStorage and sends it there.
 */
export function DemoMode() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const run = (index: number) => {
    const q = DEMO_QUERIES[index]!;
    stageDemoQuery(q);
    setOpen(false);
    navigate({ to: "/chat", search: {} });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-3">
      <div className="card-surface border-2 border-accent/50 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
            Demo Mode
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)} aria-label="Close demo mode">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          One-click demo queries — tap to send them in the chat. Toggle with <kbd className="rounded border border-border px-1 font-mono text-[10px]">Shift+D</kbd>.
        </p>
        <div className="mt-3 space-y-2">
          {DEMO_QUERIES.map((q, i) => (
            <button
              key={q.label}
              onClick={() => run(i)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-accent hover:bg-secondary"
            >
              <span className="block text-xs font-semibold text-accent-foreground">
                {i + 1}. {q.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">{q.query}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
