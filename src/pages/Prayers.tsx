import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PrayerRequest {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { display_name: string; avatar_url: string | null; username: string } | null;
  prayer_count: number;
  user_prayed: boolean;
}

const Prayers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPrayers = async () => {
    if (!user) return;

    const { data: prayerData, error } = await supabase
      .from("prayer_requests")
      .select("*, profiles!prayer_requests_user_id_fkey(display_name, avatar_url, username)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50) as any;

    if (error) {
      console.error("Error fetching prayers:", error);
      return;
    }

    if (!prayerData) return;
    const ids = prayerData.map((p) => p.id);

    // If no prayers yet, just clear and return
    if (ids.length === 0) {
      setRequests([]);
      return;
    }

    const [countsRes, userPrayedRes] = await Promise.all([
      supabase.from("prayer_counts").select("prayer_request_id").in("prayer_request_id", ids),
      supabase.from("prayer_counts").select("prayer_request_id").eq("user_id", user.id).in("prayer_request_id", ids),
    ]);

    const counts: Record<string, number> = {};
    countsRes.data?.forEach((c) => { counts[c.prayer_request_id] = (counts[c.prayer_request_id] || 0) + 1; });
    const prayedSet = new Set(userPrayedRes.data?.map((c) => c.prayer_request_id));

    setRequests(prayerData.map((p) => ({
      ...p,
      profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
      prayer_count: counts[p.id] || 0,
      user_prayed: prayedSet.has(p.id),
    })));
  };

  useEffect(() => {
    fetchPrayers();

    // Subscribe only to user's own changes for privacy and efficiency
    const prayerChannel = supabase
      .channel("user-prayers")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "prayer_requests",
        filter: `user_id=eq.${user?.id}`
      }, () => fetchPrayers())
      .subscribe();

    return () => {
      supabase.removeChannel(prayerChannel);
    };
  }, [user]);

  const submitPost = async () => {
    if (!user || !newPrayer.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("prayer_requests").insert({ user_id: user.id, content: newPrayer.trim() });
    if (error) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    } else {
      setNewPrayer(""); setShowForm(false);
      toast({ title: "Oração enviada", description: "Sua oração foi registrada no mural." });
      // Real-time listener will trigger fetchPrayers
    }
    setSubmitting(false);
  };

  const togglePrayed = async (requestId: string, prayed: boolean) => {
    if (!user) return;
    // Optimistic update
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      user_prayed: !prayed,
      prayer_count: prayed ? r.prayer_count - 1 : r.prayer_count + 1
    } : r));
    if (prayed) {
      await supabase.from("prayer_counts").delete().eq("prayer_request_id", requestId).eq("user_id", user.id);
    } else {
      await supabase.from("prayer_counts").insert({ prayer_request_id: requestId, user_id: user.id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">{t("prayers.myPrayers") || "My Prayers"}</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"}>
          <Plus className="h-4 w-4 mr-1" /> {t("prayers.request")}
        </Button>
      </div>
      <div className="mx-auto max-w-lg p-4 space-y-4">
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <Textarea placeholder={t("prayers.placeholder")} value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} rows={3} />
                <div className="flex justify-end">
                  <Button onClick={submitPost} disabled={submitting || !newPrayer.trim()} size="sm">
                    {submitting ? t("prayers.submitting") : t("prayers.submit")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {requests.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p>{t("prayers.noPersonalPrayers") || "Ainda não há pedidos de oração"}</p>
            <p className="text-xs mt-1">{t("prayers.beFirst")}</p>
          </div>
        )}
        {requests.map((req, i) => (
          <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn("border-0 shadow-sm", req.user_id === user?.id && "ring-1 ring-accent/30 bg-accent/5")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden">
                    {req.profiles?.avatar_url ? (
                      <img src={req.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      req.profiles?.display_name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-none">
                      {req.profiles?.display_name || "Anonymous"}
                      {req.user_id === user?.id && <span className="ml-2 text-[10px] text-accent uppercase font-bold tracking-wider">(Sua)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{req.content}</p>
                <AnimatePresence mode="wait">
                  <motion.button
                    key={req.user_prayed ? "joined" : "join"}
                    onClick={() => togglePrayed(req.id, req.user_prayed)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                      req.user_prayed
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                    )}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    whileTap={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {req.user_prayed ? t("prayers.joined") : t("prayers.joinPrayer")}
                    {req.prayer_count > 0 && ` (${req.prayer_count})`}
                  </motion.button>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Prayers;
