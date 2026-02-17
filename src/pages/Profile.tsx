import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogOut, BookOpen, Heart, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);
  const [personalStats, setPersonalStats] = useState({ daysCompleted: 0, prayersOffered: 0, postsMade: 0 });
  const [communityStats, setCommunityStats] = useState({ totalPrayers: 0, totalSteps: 0, activeUsers: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [profileRes, progressRes, prayersRes, postsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("journey_progress").select("id").eq("user_id", user.id).eq("completed", true),
        supabase.from("prayer_counts").select("id").eq("user_id", user.id),
        supabase.from("community_posts").select("id").eq("user_id", user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setPersonalStats({
        daysCompleted: progressRes.data?.length || 0,
        prayersOffered: prayersRes.data?.length || 0,
        postsMade: postsRes.data?.length || 0,
      });

      // Community stats
      const [totalPrayersRes, totalStepsRes] = await Promise.all([
        supabase.from("prayer_counts").select("id", { count: "exact", head: true }),
        supabase.from("journey_progress").select("id", { count: "exact", head: true }).eq("completed", true),
      ]);

      setCommunityStats({
        totalPrayers: totalPrayersRes.count || 0,
        totalSteps: totalStepsRes.count || 0,
        activeUsers: 0,
      });
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const progressPercent = (personalStats.daysCompleted / 60) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Profile</h1>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-1" /> Sign Out
        </Button>
      </div>

      <div className="mx-auto max-w-lg p-4 space-y-4">
        {/* User Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary to-primary/70" />
            <CardContent className="p-4 -mt-10">
              <div className="flex items-end gap-3">
                <div className="h-16 w-16 rounded-2xl bg-card shadow-lg flex items-center justify-center text-2xl font-display font-bold text-primary border-4 border-card">
                  {profile?.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">{profile?.display_name || "User"}</h2>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Journey Progress</span>
                  <span>{personalStats.daysCompleted}/60 days</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-2">Your Stats</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: BookOpen, label: "Days", value: personalStats.daysCompleted },
              { icon: Heart, label: "Prayers", value: personalStats.prayersOffered },
              { icon: Users, label: "Posts", value: personalStats.postsMade },
            ].map(({ icon: Icon, label, value }) => (
              <Card key={label} className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <Icon className="mx-auto h-5 w-5 text-primary mb-1" />
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Community Impact */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Community Impact
          </h3>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-soft-yellow/20 to-warm-brown/20">
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{communityStats.totalPrayers}</p>
                <p className="text-xs text-muted-foreground">Prayers Offered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{communityStats.totalSteps}</p>
                <p className="text-xs text-muted-foreground">Steps Completed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
