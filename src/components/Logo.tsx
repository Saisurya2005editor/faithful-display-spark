import { ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="BISmart home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <ShieldCheck className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight">
          BIS<span className="text-accent">mart</span>
        </span>
      )}
    </Link>
  );
}
