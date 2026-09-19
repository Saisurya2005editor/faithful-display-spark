import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useTheme } from "@/components/theme";
import { useI18n } from "@/lib/i18n";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/chat", key: "nav.chat" },
  { to: "/recommend", key: "nav.recommend" },
  { to: "/guide", key: "nav.guide" },
  { to: "/certification", key: "nav.certification" },
  { to: "/search", key: "nav.search" },
  { to: "/labs", key: "nav.labs" },
  { to: "/about", key: "nav.about" },
] as const;

export function Navbar() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
          {user && (
            <Link
              to="/admin/ingest"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelect className="hidden h-9 w-[128px] sm:flex" />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("nav.theme")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void signOut()}
              className="hidden gap-1.5 sm:inline-flex"
              title={user.email ?? undefined}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              {t("nav.signout")}
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="hidden gap-1.5 sm:inline-flex">
              <Link to="/auth">
                <UserRound className="h-3.5 w-3.5" aria-hidden />
                {t("nav.signin")}
              </Link>
            </Button>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/chat">{t("hero.cta")}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {t(l.key)}
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/admin/ingest"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Admin
                  </Link>
                )}
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {t("nav.signout")}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {t("nav.signin")}
                  </Link>
                )}
                <div className="mt-4">
                  <LanguageSelect className="h-9 w-full" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
