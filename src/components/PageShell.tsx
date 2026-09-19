import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function PageShell({
  children,
  title,
  subtitle,
  hideFooter = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {title && (
          <div className="border-b border-border bg-card">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        )}
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
