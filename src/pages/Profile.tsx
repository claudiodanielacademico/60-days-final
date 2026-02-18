import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { LogOut, BookOpen, Heart, Users, TrendingUp, Pencil, Camera, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard, formatUserCode } from "@/lib/userUtils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabaseRetry } from "@/lib/supabaseRetry";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string | null; bio: string; username: string; user_code: string } | null>(null);
  const [personalStats, setPersonalStats] = useState({ daysCompleted: 0, prayersOffered: 0, postsMade: 0 });
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [communityStats, setCommunityStats] = useState({ totalPrayers: 0, totalSteps: 0 });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const [profileRes, progressRes, prayersRes, postsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url, bio, username, user_code").eq("user_id", user.id).maybeSingle(),
      supabase.from("journey_progress").select("id").eq("user_id", user.id).eq("completed", true).eq("completion_date", todayStr),
      supabase.from("prayer_counts").select("id").eq("user_id", user.id),
      supabase.from("community_posts").select("id").eq("user_id", user.id),
    ]);
    if (profileRes.data) {
      const data = profileRes.data as any;
      setProfile(data);
      setEditName(data.display_name || "");
      setEditUsername(data.username || "");
      setEditBio(data.bio || "");
    }
    setPersonalStats({
      daysCompleted: progressRes.data?.length || 0,
      prayersOffered: prayersRes.data?.length || 0,
      postsMade: postsRes.data?.length || 0,
    });

    const { count: followersCount } = await supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id);
    const { count: followingCount } = await supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id);

    setFollowStats({
      followers: followersCount || 0,
      following: followingCount || 0,
    });

    const [totalPrayersRes, totalStepsRes] = await Promise.all([
      supabase.from("prayer_counts").select("id", { count: "exact", head: true }),
      supabase.from("journey_progress").select("id", { count: "exact", head: true }).eq("completed", true).eq("completion_date", todayStr),
    ]);
    setCommunityStats({ totalPrayers: totalPrayersRes.count || 0, totalSteps: totalStepsRes.count || 0 });
  };

  useEffect(() => {
    if (!user) return;
    fetchData();

    // Real-time listener for profile changes (global sync)
    const channel = supabase
      .channel(`profile-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const data = payload.new as any;
            setProfile(prev => ({ ...prev, ...data }));
            setEditName(data.display_name || "");
            setEditBio(data.bio || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  const handleCopyUserCode = async () => {
    if (!profile?.user_code) return;
    const success = await copyToClipboard(profile.user_code);
    if (success) {
      toast({ title: t("profile.updated") || "Copied!", description: `User code ${profile.user_code} copied to clipboard` });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    // Upload with retry logic
    const { error: uploadError } = await supabaseRetry(() =>
      supabase.storage.from("community-photos").upload(path, file, { upsert: true })
    );

    if (uploadError) {
      toast({ title: t("general.error"), description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from("community-photos").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();

    // Update profile with retry logic
    const { error: updateError } = await supabaseRetry(() =>
      supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id)
    );

    if (updateError) {
      toast({ title: t("general.error"), description: updateError.message, variant: "destructive" });
    } else {
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      toast({ title: t("profile.updated") });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabaseRetry(() =>
      supabase.from("profiles").update({ display_name: editName, bio: editBio } as any).eq("user_id", user.id)
    );

    if (error) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    } else {
      // Optimistic update already handled by real-time in some cases, 
      // but here we force local state update for immediate feedback
      setProfile(prev => prev ? { ...prev, display_name: editName, bio: editBio } : prev);
      setEditing(false);
      toast({ title: t("profile.updated") });
    }
    setSaving(false);
  };

  const progressPercent = (personalStats.daysCompleted / 60) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed TikTok Announcement Banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-primary px-4 py-3 text-center border-b border-accent/20">
        <p className="text-sm font-bold text-accent">
          Para acessar o aplicativo entre no link do perfil Caminhos da Fé no TikTok
        </p>
      </div>

      <div className="sticky top-[45px] z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">{t("profile.title")}</h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> {t("profile.signOut")}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-lg p-4 pt-[60px] space-y-4">
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-primary to-primary/70" />
            <CardContent className="p-4 -mt-10">
              <div className="flex flex-col items-center gap-2 mb-4">
                <button onClick={() => fileInputRef.current?.click()} className="relative group">
                  <div className="h-24 w-24 rounded-2xl bg-card shadow-lg flex items-center justify-center text-3xl font-display font-bold text-primary border-4 border-card overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      profile?.display_name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>

                {profile?.user_code && (
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
                    <span className="text-xs font-mono font-bold text-primary">
                      {formatUserCode(profile.user_code)}
                    </span>
                    <button
                      onClick={handleCopyUserCode}
                      className="p-1 hover:bg-accent rounded-full transition-colors"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  {editing ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" placeholder={t("profile.displayName")} />
                  ) : (
                    <>
                      <h2 className="font-display text-lg font-bold">{profile?.display_name || "User"}</h2>
                      <p className="text-xs text-muted-foreground">
                        @{profile?.username || "username"} • {user?.email}
                      </p>
                    </>
                  )}
                </div>
                {!editing && (
                  <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {editing && (
                <div className="mt-3 space-y-2">
                  <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder={t("profile.bioPlaceholder")} rows={3} className="text-sm" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>{t("profile.title")}</Button>
                    <Button size="sm" onClick={saveProfile} disabled={saving}>
                      {saving ? t("profile.saving") : t("profile.save")}
                    </Button>
                  </div>
                </div>
              )}

              {!editing && profile?.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>
              )}

              {/* Follow Stats */}
              <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-border/50">
                <button
                  onClick={() => navigate(`/user/${profile?.username}/followers`)}
                  className="text-center group"
                >
                  <p className="text-lg font-bold group-hover:text-primary transition-colors">{followStats.followers}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.followers") || "Followers"}</p>
                </button>
                <button
                  onClick={() => navigate(`/user/${profile?.username}/following`)}
                  className="text-center group"
                >
                  <p className="text-lg font-bold group-hover:text-primary transition-colors">{followStats.following}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.following") || "Following"}</p>
                </button>
              </div>

              <div className="mt-6 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("profile.journeyProgress")}</span>
                  <span>{personalStats.daysCompleted}/60 {t("profile.days").toLowerCase()}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-2">{t("profile.yourStats")}</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: BookOpen, label: t("profile.days"), value: personalStats.daysCompleted },
              { icon: Heart, label: t("profile.prayers"), value: personalStats.prayersOffered },
              { icon: Users, label: t("profile.posts"), value: personalStats.postsMade },
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> {t("profile.communityImpact")}
          </h3>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-soft-yellow/20 to-warm-brown/20">
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{communityStats.totalPrayers}</p>
                <p className="text-xs text-muted-foreground">{t("profile.prayersOffered")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{communityStats.totalSteps}</p>
                <p className="text-xs text-muted-foreground">{t("profile.stepsCompleted")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
