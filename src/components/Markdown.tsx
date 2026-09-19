import { Fragment } from "react";

/** Minimal, safe markdown renderer: paragraphs, bullets, **bold**, _italic_. */
function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return (
        <em key={key} className="text-muted-foreground">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function Markdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const isList = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
        const isOrdered = lines.length > 0 && lines.every((l) => /^\s*\d+\.\s+/.test(l));

        if (isList) {
          return (
            <ul key={bi} className="space-y-1.5 pl-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{inline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (isOrdered) {
          return (
            <ol key={bi} className="space-y-1.5">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                    {li + 1}
                  </span>
                  <span>{inline(l.replace(/^\s*\d+\.\s+/, ""), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ol>
          );
        }

        return <p key={bi}>{inline(block.replace(/\n/g, " "), String(bi))}</p>;
      })}
    </div>
  );
}
