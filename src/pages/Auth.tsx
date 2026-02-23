import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Mail, Lock, User as UserIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const { session, signUp, signIn, signInWithSocial, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (session) navigate("/journey");
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (magicLinkMode) {
        await signInWithMagicLink(email);
        toast({ title: t("auth.magicLinkSent"), description: t("auth.magicLinkSent") });
      } else if (isSignUp) {
        await signUp(email, password, displayName);
        navigate("/journey");
      } else {
        await signIn(email, password);
        navigate("/journey");
      }
    } catch (error: any) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    try {
      await signInWithSocial(provider);
    } catch (error: any) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/50 to-warm-brown/30 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
          >
            <BookOpen className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("auth.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}</CardTitle>
            <CardDescription>{isSignUp ? t("auth.startJourney") : t("auth.continueJourney")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Logins */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full gap-3 h-12 border-secondary/20 hover:bg-white hover:text-gray-900 transition-all font-medium shadow-sm"
                onClick={() => signInWithSocial("google")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                {t("auth.google")}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-3 h-12 border-secondary/20 hover:bg-black hover:text-white transition-all font-medium shadow-sm"
                onClick={() => signInWithSocial("apple")}
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                {t("auth.apple")}
              </Button>
            </div>

            <div className="relative flex items-center gap-2 py-2">
              <div className="h-[1px] flex-1 bg-border" />
              <span className="text-[10px] uppercase text-muted-foreground">{t("auth.orContinueWith")}</span>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div key="name" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={t("auth.displayName")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-9" required={isSignUp} autoComplete="name" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required autoComplete="email" />
              </div>

              {!magicLinkMode && (
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required minLength={6} autoComplete={isSignUp ? "new-password" : "current-password"} />
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                {loading ? "..." : magicLinkMode ? t("auth.sendMagicLink") : isSignUp ? t("auth.createAccount") : t("auth.signIn")}
              </Button>
            </form>

            <div className="flex flex-col gap-3 pt-2">
              <button type="button" onClick={() => setMagicLinkMode(!magicLinkMode)} className="text-sm text-primary hover:underline font-medium">
                {magicLinkMode ? t("auth.signIn") : t("auth.magicLink")}
              </button>
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isSignUp ? t("auth.hasAccount") : t("auth.noAccount")}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
