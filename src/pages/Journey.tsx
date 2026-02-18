import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock, Play, BookOpen, ChevronLeft, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabaseRetry } from "@/lib/supabaseRetry";

import { getLocalMidnight, getContentVersionIndex } from "@/lib/dateUtils";

interface DayContent {
  day_number: number;
  title: string;
  prayer: string;
  scripture: string;
  reflection: string;
  task: string;
  duration_min: number;
  seasonal_theme?: string;
}
interface ProgressEntry { day_number: number; completed: boolean; }

const Confetti = () => {
  const particles = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600 - 200,
            opacity: 0,
            scale: Math.random() * 0.5 + 0.5,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute h-3 w-3 rounded-sm"
          style={{
            backgroundColor: ["#D4AF37", "#1A2B3C", "#8FBC8F", "#F5E6A3"][i % 4],
          }}
        />
      ))}
    </div>
  );
};

const Journey = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [content, setContent] = useState<DayContent[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedDays, setUnlockedDays] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const [contentRes, progressRes] = await Promise.all([
      supabase.from("daily_content")
        .select("*")
        .order("day_number"),
      supabase.from("journey_progress")
        .select("day_number, completed")
        .eq("user_id", user.id)
        .eq("completion_date", todayStr),
    ]);

    if (contentRes.error) setFetchError(contentRes.error.message);
    if (progressRes.error) setFetchError(progressRes.error.message);

    if (contentRes.data) setContent(contentRes.data as any);
    if (progressRes.data) setProgress(progressRes.data);

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchData();

    // Real-time listener for journey progress (cross-device sync)
    const channel = supabase
      .channel(`journey-progress-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journey_progress",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const completedDays = progress.filter((p) => p.completed).length;
  const progressPercent = (completedDays / 60) * 100;
  const isDayCompleted = (dayNum: number) => progress.some((p) => p.day_number === dayNum && p.completed);

  // Sequential unlocking logic: No more time/join-date limit, only sequential completion
  const isDayUnlocked = (dayNum: number) => {
    if (dayNum === 1) return true;
    return isDayCompleted(dayNum - 1);
  };

  const markComplete = async (dayNumber: number) => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];

    // Resilient upsert with retry logic
    const { error } = await supabaseRetry(() =>
      supabase.from("journey_progress").upsert(
        {
          user_id: user.id,
          day_number: dayNumber,
          completed: true,
          completed_at: new Date().toISOString(),
          completion_date: todayStr
        },
        { onConflict: "user_id,day_number,completion_date" }
      ) as any
    );

    if (error) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    } else {
      // Optimitistic update
      setProgress((prev) => {
        const existing = prev.find((p) => p.day_number === dayNumber);
        if (existing) return prev.map((p) => (p.day_number === dayNumber ? { ...p, completed: true } : p));
        return [...prev, { day_number: dayNumber, completed: true }];
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({ title: t("journey.dayCompleted"), description: t("journey.keepWalking") });
    }
  };

  const [completedSubSteps, setCompletedSubSteps] = useState<string[]>([]);

  const toggleSubStep = (stepId: string) => {
    setCompletedSubSteps(prev =>
      prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId]
    );
  };

  const isAllSubStepsDone = completedSubSteps.length >= 4;

  if (selectedDay) {
    const steps = [
      { id: "opening-prayer", label: t("journey.openingPrayer"), content: "Pai, entro em Tua presença com o coração aberto. Guia meus passos hoje conforme a Tua vontade. Amém.", icon: Heart },
      { id: "reading", label: t("journey.reading"), content: selectedDay.reflection, scripture: selectedDay.scripture, icon: BookOpen },
      { id: "devotional-prayer", label: "Oração Devocional", content: selectedDay.prayer, icon: Star },
      { id: "task", label: t("journey.practicalAction"), content: selectedDay.task, icon: Play },
    ];

    const isDayAlreadyCompleted = isDayCompleted(selectedDay.day_number);

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <button onClick={() => { setSelectedDay(null); setCompletedSubSteps([]); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> {t("journey.back")}
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {t("journey.dayOf", selectedDay.day_number)}
          </span>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-lg p-4 pb-24 space-y-6">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-primary leading-tight">
              {selectedDay.title}
            </h1>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isDone = completedSubSteps.includes(step.id) || isDayAlreadyCompleted;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "border-2 transition-all duration-300 overflow-hidden",
                    isDone ? "border-sage/30 bg-sage/5" : "border-primary/5 bg-card"
                  )}>
                    <CardContent className="p-0">
                      <div
                        className="p-4 flex items-start gap-4 cursor-pointer"
                        onClick={() => !isDayAlreadyCompleted && toggleSubStep(step.id)}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                          isDone ? "bg-sage text-white" : "bg-primary/10 text-primary"
                        )}>
                          {isDone ? <Check className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className={cn("font-bold text-sm", isDone ? "text-sage" : "text-foreground")}>
                            {step.label}
                          </h3>
                          <div className="mt-2 text-sm leading-relaxed text-muted-foreground space-y-3">
                            <p>{step.content}</p>
                            {step.scripture && (
                              <p className="font-medium italic text-xs border-l-2 border-primary/20 pl-3 py-1">
                                — {step.scripture}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-10">
            <div className="mx-auto max-w-lg">
              {!isDayAlreadyCompleted ? (
                <Button
                  disabled={!isAllSubStepsDone}
                  onClick={() => markComplete(selectedDay.day_number)}
                  className={cn(
                    "w-full h-16 text-lg font-bold gap-3 shadow-xl btn-rounded transition-all active:scale-95",
                    isAllSubStepsDone
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#F5E6A3] to-[#D4AF37] text-[#1A2B3C] border-2 border-[#D4AF37]/20 btn-pulse scale-[1.02]"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Check className={cn("h-6 w-6", isAllSubStepsDone && "animate-bounce")} />
                  {isAllSubStepsDone ? t("journey.markComplete") : "Realize todos os passos"}
                </Button>
              ) : (
                <div className="h-14 flex items-center justify-center gap-2 text-sage font-bold">
                  <Check className="h-5 w-5" /> {t("journey.completed")}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti />}
      <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-primary">{t("journey.title")}</h1>
          <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
            {completedDays} / 60 {t("journey.steps") || "Steps"}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground">
            <span>{t("journey.progress") || "Your Progression"}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>
      </div>
      <div className="mx-auto max-w-lg space-y-2 p-4">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">{t("journey.loading")}</div>
        ) : fetchError ? (
          <div className="py-20 text-center text-destructive">
            <p className="font-bold">Erro de Conexão:</p>
            <p className="text-sm">{fetchError}</p>
            <Button onClick={fetchData} variant="outline" size="sm" className="mt-4">Tentar Novamente</Button>
          </div>
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
