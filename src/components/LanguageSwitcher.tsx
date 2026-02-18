import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const flags: Record<Language, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" };
const labels: Record<Language, string> = { pt: "PT", en: "EN", es: "ES" };

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const langs: Language[] = ["pt", "en", "es"];

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-0.5">
      {langs.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
            language === lang
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{flags[lang]}</span>
          <span>{labels[lang]}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
