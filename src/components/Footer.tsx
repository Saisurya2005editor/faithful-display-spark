import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              AI assistant for Indian Standards and BIS services — for industries and consumers.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <Link to="/chat" className="text-muted-foreground hover:text-foreground">
              {t("nav.chat")}
            </Link>
            <Link to="/recommend" className="text-muted-foreground hover:text-foreground">
              {t("nav.recommend")}
            </Link>
            <Link to="/certification" className="text-muted-foreground hover:text-foreground">
              {t("nav.certification")}
            </Link>
            <Link to="/search" className="text-muted-foreground hover:text-foreground">
              {t("nav.search")}
            </Link>
            <Link to="/labs" className="text-muted-foreground hover:text-foreground">
              {t("nav.labs")}
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              {t("nav.about")}
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" aria-hidden />
            {t("footer.disclaimer")}
          </p>
          <p>{t("footer.sample")}</p>
        </div>
      </div>
    </footer>
  );
}
