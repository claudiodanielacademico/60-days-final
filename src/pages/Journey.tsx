import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock, Play, BookOpen, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DayContent { day_number: number; title: string; scripture: string; reflection: string; task: string; }
interface ProgressEntry { day_number: number; completed: boolean; }

const Journey = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [content, setContent] = useState<DayContent[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedDays, setUnlockedDays] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [contentRes, progressRes] = await Promise.all([
        supabase.from("daily_content").select("*").order("day_number"),
        supabase.from("journey_progress").select("day_number, completed").eq("user_id", user.id),
      ]);
      if (contentRes.data) setContent(contentRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setUnlockedDays(Math.min(diffDays, 60));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const completedDays = progress.filter((p) => p.completed).length;
  const progressPercent = (completedDays / 60) * 100;
  const isDayCompleted = (dayNum: number) => progress.some((p) => p.day_number === dayNum && p.completed);
  const isDayUnlocked = (dayNum: number) => dayNum <= unlockedDays;

  const markComplete = async (dayNumber: number) => {
    if (!user) return;
    const { error } = await supabase.from("journey_progress").upsert(
      { user_id: user.id, day_number: dayNumber, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,day_number" }
    );
    if (error) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    } else {
      setProgress((prev) => {
        const existing = prev.find((p) => p.day_number === dayNumber);
        if (existing) return prev.map((p) => (p.day_number === dayNumber ? { ...p, completed: true } : p));
        return [...prev, { day_number: dayNumber, completed: true }];
      });
      toast({ title: t("journey.dayCompleted"), description: t("journey.keepWalking") });
    }
  };

  if (selectedDay) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3">
          <button onClick={() => setSelectedDay(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> {t("journey.back")}
          </button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-lg p-4 space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {t("journey.dayOf", selectedDay.day_number)}
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold">{selectedDay.title}</h1>
          </div>
          <Card className="border-0 bg-soft-yellow/30 shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent">
                <BookOpen className="h-4 w-4" /> {t("journey.scripture")}
              </h3>
              <p className="font-display text-base italic leading-relaxed">{selectedDay.scripture}</p>
            </CardContent>
          </Card>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">{t("journey.reflection")}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{selectedDay.reflection}</p>
          </div>
          <Card className="border-0 bg-primary/5 shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-2 text-sm font-semibold text-primary">{t("journey.todayTask")}</h3>
              <p className="text-sm leading-relaxed">{selectedDay.task}</p>
            </CardContent>
          </Card>
          {!isDayCompleted(selectedDay.day_number) && (
            <Button onClick={() => markComplete(selectedDay.day_number)} className="w-full gap-2" size="lg">
              <Check className="h-4 w-4" /> {t("journey.markComplete")}
            </Button>
          )}
          {isDayCompleted(selectedDay.day_number) && (
            <div className="rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">{t("journey.completed")}</div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4">
        <h1 className="font-display text-xl font-bold">{t("journey.title")}</h1>
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("journey.dayOf", completedDays)}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
      <div className="mx-auto max-w-lg space-y-2 p-4">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">{t("journey.loading")}</div>
        ) : content.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p>{t("journey.preparing")}</p>
            <p className="mt-1 text-xs">{t("journey.checkBack")}</p>
          </div>
        ) : (
          content.map((day, i) => {
            const unlocked = isDayUnlocked(day.day_number);
            const completed = isDayCompleted(day.day_number);
            const isCurrent = unlocked && !completed && !progress.some((p) => p.day_number === day.day_number);
            return (
              <motion.div key={day.day_number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <button disabled={!unlocked} onClick={() => unlocked && setSelectedDay(day)} className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all", unlocked ? "bg-card shadow-sm hover:shadow-md" : "bg-muted/50 opacity-60", isCurrent && "ring-2 ring-primary/30")}>
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", completed ? "bg-green-100 text-green-700" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {completed ? <Check className="h-4 w-4" /> : !unlocked ? <Lock className="h-3.5 w-3.5" /> : day.day_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{day.title}</p>
                    <p className="text-xs text-muted-foreground">{t("journey.dayOf", day.day_number)}</p>
                  </div>
                  {isCurrent && <Play className="h-4 w-4 text-primary" />}
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Journey;
