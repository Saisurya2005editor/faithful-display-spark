import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const KEY = "bismart_tour_done";

interface Step {
  titleKey: string;
  bodyKey: string;
  cta?: { labelKey: string; to: string };
}

const STEPS: Step[] = [
  { titleKey: "tour.1.title", bodyKey: "tour.1.body", cta: { labelKey: "tour.1.cta", to: "/chat" } },
  { titleKey: "tour.2.title", bodyKey: "tour.2.body", cta: { labelKey: "tour.2.cta", to: "/recommend" } },
  { titleKey: "tour.3.title", bodyKey: "tour.3.body" },
];

/** First-visit onboarding tour: 3 short steps, skippable, shown once per device. */
export function OnboardingTour() {
  const [step, setStep] = useState<number | null>(null);
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY) && location.pathname === "/") {
        const timer = window.setTimeout(() => setStep(0), 900);
        return () => window.clearTimeout(timer);
      }
    } catch {
      /* storage unavailable */
    }
    return undefined;
  }, [location.pathname]);

  if (step === null) return null;
  const s = STEPS[step]!;
  const last = step === STEPS.length - 1;

  const finish = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setStep(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:bottom-6">
      <div className="card-surface w-full max-w-md border-2 border-accent/50 p-5 shadow-xl animate-in fade-in slide-in-from-bottom-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            {t(s.titleKey)}
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={finish} aria-label={t("tour.skip")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t(s.bodyKey)}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i === step ? "bg-accent" : "bg-border"}`}
                aria-hidden
              />
            ))}
          </div>
          <div className="flex gap-2">
            {s.cta && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  finish();
                  navigate({ to: s.cta!.to });
                }}
              >
                {t(s.cta.labelKey)}
              </Button>
            )}
            <Button size="sm" onClick={() => (last ? finish() : setStep(step + 1))}>
              {last ? t("tour.done") : t("tour.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
