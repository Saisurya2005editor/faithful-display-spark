import { ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Citation } from "@/lib/mock-ai";

export function CitationCard({ citation }: { citation: Citation }) {
  return (
    <article className="card-interactive p-3.5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <span className="font-mono text-sm font-semibold">{citation.standardNumber}</span>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wide">
          {citation.origin}
        </Badge>
      </header>
      <p className="mt-2 text-xs font-medium text-foreground">{citation.title}</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{citation.clauseRef}</p>
      <blockquote className="mt-2 border-l-2 border-accent/60 pl-3 text-xs leading-relaxed text-muted-foreground">
        {citation.excerpt}
      </blockquote>
      <a
        href={citation.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-foreground underline decoration-accent decoration-2 underline-offset-4 hover:opacity-80"
      >
        View source
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
    </article>
  );
}
