import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages, useI18n, type Lang } from "@/lib/i18n";

export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
      <SelectTrigger className={className ?? "h-9 w-[132px]"} aria-label="Select language">
        <Globe className="mr-1 h-4 w-4 opacity-70" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
