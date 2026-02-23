import { BookOpen, Users, Heart, User, Search, MessageSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const tabs = [
  { path: "/journey", labelKey: "nav.journey" as const, icon: BookOpen },
  { path: "/community", labelKey: "nav.community" as const, icon: Users },
  { path: "/messages", labelKey: "nav.messages" as const, icon: MessageSquare },
  { path: "/prayers", labelKey: "nav.prayers" as const, icon: Heart },
  { path: "/search", labelKey: "nav.search" as const, icon: Search },
  { path: "/profile", labelKey: "nav.profile" as const, icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center overflow-x-auto no-scrollbar px-4 py-2 gap-1 scroll-smooth">
        {tabs.map(({ path, labelKey, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] min-w-[72px] transition-all duration-200 shrink-0",
                active ? "text-primary font-semibold translate-y-[-2px]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} strokeWidth={active ? 2.5 : 1.8} />
              <span className="whitespace-nowrap">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
