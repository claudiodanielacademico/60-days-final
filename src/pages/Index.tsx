import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Star, ArrowRight, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";
import { getLocalMidnight } from "@/lib/dateUtils";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const todayStr = new Date().toISOString().split('T')[0];

      // Fetch profile for display name
      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      setProfile(prof);

      // Fetch progress for today
      const { data: progress } = await supabase.from("journey_progress")
        .select("day_number, completed")
        .eq("user_id", user.id)
        .eq("completion_date", todayStr);

      if (progress) {
        const completedCount = progress.filter(p => p.completed).length;
        setCompletedSteps(completedCount);
        setIsCompletedToday(completedCount === 60);

        // Next step is the first non-completed one
        const completedNums = progress.map(p => p.day_number);
        let next = 1;
        while (completedNums.includes(next) && next <= 60) {
          next++;
        }
        setCurrentDay(Math.min(next, 60));
      } else {
        setError("Não foi possível carregar seu progresso. Verifique a conexão.");
      }
    };

    fetchData();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header / Hero */}
      <div className="relative overflow-hidden bg-primary px-6 pt-12 pb-20 text-white">
        <div className="absolute top-0 left-0 h-full w-full opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="text-primary-foreground/80 font-medium">{greeting()},</p>
          <h1 className="font-display text-4xl font-bold mt-1">
            {profile?.display_name || user?.email?.split('@')[0]}
          </h1>
          <p className="mt-4 text-primary-foreground/90 max-w-xs text-sm leading-relaxed">
            {isCompletedToday
              ? "Você concluiu sua missão de hoje! Continue brilhando sua luz."
              : "Sua jornada espiritual continua hoje. Um novo passo te espera."}
          </p>
        </motion.div>
      </div>

      <div className="mx-auto -mt-10 max-w-lg space-y-6 px-6 relative z-20">
        {/* Today's Mission Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Missão de Hoje
                  </span>
                </div>

                {error ? (
                  <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
                    {error}
                  </div>
                ) : (
                  <>
                    <h3 className="font-display text-2xl font-bold">Passo {currentDay} de 60</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {isCompletedToday
                        ? "Incrível! Você concluiu todos os 60 passos de hoje."
                        : "Sua jornada diária continua. Que tal dar o próximo passo agora?"}
                    </p>
                  </>
                )}

                <Button
                  onClick={() => navigate("/journey")}
                  variant={isCompletedToday ? "secondary" : "default"}
                  className="w-full mt-6 h-12 shadow-lg gap-2"
                >
                  {isCompletedToday ? "Rever Missão" : "Iniciar Agora"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Simple Progress Bar on Card Bottom */}
              <div className="bg-muted px-6 py-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Progresso Total</span>
                <span className="text-[10px] font-bold text-primary">{Math.round((completedSteps / 60) * 100)}%</span>
              </div>
              <Progress value={(completedSteps / 60) * 100} className="h-1 rounded-none bg-muted" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links / Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-accent/5"
            onClick={() => navigate("/community")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="mb-2 rounded-full bg-accent/10 p-2">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-bold">{t("nav.community")}</span>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-spiritual/5"
            onClick={() => navigate("/prayers")}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="mb-2 rounded-full bg-primary/10 p-2">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold">{t("nav.prayers")}</span>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Quote */}
        <div className="py-6 text-center">
          <p className="text-sm italic text-muted-foreground font-serif">
            "Pois eu bem sei os planos que tenho para vocês", diz o Senhor, "planos de prosperidade e não de mal, para lhes dar um futuro e uma esperança."
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Jeremias 29:11</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
