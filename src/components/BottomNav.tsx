import { useRef, useEffect, useState } from "react";
import { BookOpen, Users, Heart, User, Search, MessageSquare } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.scrollWidth;
      const viewWidth = containerRef.current.offsetWidth;
      setConstraints({ left: -(width - viewWidth), right: 0 });
    }
  }, [tabs]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div
        ref={containerRef}
        className="mx-auto max-w-lg overflow-hidden flex items-center"
      >
        <motion.div
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.2}
          dragMomentum={true}
          className="flex items-center justify-start px-4 py-2 gap-2 cursor-grab active:cursor-grabbing"
        >
          {tabs.map(({ path, labelKey, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] min-w-[72px] transition-all duration-200 shrink-0 select-none",
                  active ? "text-primary font-semibold translate-y-[-2px]" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} strokeWidth={active ? 2.5 : 1.8} />
                <span className="whitespace-nowrap">{t(labelKey)}</span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
};

export default BottomNav;
