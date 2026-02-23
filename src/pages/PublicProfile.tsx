import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, MessageSquare, Heart, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useMessages } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { formatUserCode } from "@/lib/userUtils";
import { cn } from "@/lib/utils";

const PublicProfile = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { startConversation } = useMessages();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ daysCompleted: 0, prayersOffered: 0, postsMade: 0 });
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    const fetchPublicData = async () => {
        setLoading(true);
        const { data: profileData, error: profileError } = await (supabase.from as any)("profiles")
            .select("*")
            .eq("username", username)
            .maybeSingle();

        if (profileError) {
            console.error("Error fetching profile base data:", profileError);
            setLoading(false); // Ensure loading is set to false even on error
            return;
        }

        if (!profileData) {
            console.log("No profile found for username:", username);
            setProfile(null); // Explicitly set profile to null if not found
            setLoading(false); // Ensure loading is set to false
            return;
        }

        setProfile(profileData);

        const [progressRes, prayersRes, postsRes, followersRes, followingRes, checkFollowRes] = await Promise.all([
            supabase.from("journey_progress").select("id").eq("user_id", profileData.user_id).eq("completed", true),
            supabase.from("prayer_counts").select("id").eq("user_id", profileData.user_id),
            supabase.from("community_posts").select("id").eq("user_id", profileData.user_id),
            supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profileData.user_id),
            supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profileData.user_id),
            user ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", profileData.user_id).maybeSingle() : Promise.resolve({ data: null, error: null })
        ]);

        if (followersRes.error) console.error("Error fetching followers count:", followersRes.error);
        if (followingRes.error) console.error("Error fetching following count:", followingRes.error);

        setStats({
            daysCompleted: progressRes.data?.length || 0,
            prayersOffered: prayersRes.data?.length || 0,
            postsMade: postsRes.data?.length || 0
        });

        setFollowStats({
            followers: followersRes.count || 0,
            following: followingRes.count || 0
        });

        setIsFollowing(!!checkFollowRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPublicData();
    }, [username, user?.id]);

    const handleFollowAction = async () => {
        if (!user) {
            navigate("/auth");
            return;
        }
        if (!profile) return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.user_id });
                if (error) throw error;
            }
            // Re-fetch all data to ensure counts are accurate from DB
            await fetchPublicData();
            toast({ title: isFollowing ? t("profile.updated") : t("profile.updated") });
        } catch (error: any) {
            console.error("Follow action error:", error);
            toast({ title: t("general.error"), variant: "destructive" });
        } finally {
            setFollowLoading(false);
        }
    };

    const handleStartChat = async () => {
        if (!user) {
            navigate("/auth");
            return;
        }
        if (!profile) return;

        try {
            const convId = await startConversation(profile.user_id);
            navigate("/messages", { state: { selectedConversationId: convId } });
        } catch (error: any) {
            console.error("Chat start error:", error);
            toast({
                title: t("general.error"),
                description: error.message || "Erro ao iniciar conversa",
                variant: "destructive"
            });
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!profile) return <div className="p-20 text-center">User not found</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 mt-[45px]">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" /> {t("journey.back")}
                </button>
            </div>

            <div className="mx-auto max-w-lg p-4 space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-0 shadow-md overflow-hidden">
                        <div className="h-20 bg-gradient-to-r from-primary/80 to-primary/40" />
                        <CardContent className="p-4 -mt-10 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-24 w-24 rounded-2xl bg-card shadow-lg flex items-center justify-center text-3xl font-display font-bold text-primary border-4 border-card overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        profile.display_name?.[0]?.toUpperCase() || "?"
                                    )}
                                </div>

                                <div className="bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
                                    <span className="text-xs font-mono font-bold text-primary">
                                        {formatUserCode(profile.user_code)}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <h2 className="font-display text-xl font-bold">{profile.display_name}</h2>
                                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                </div>

                                {/* Follow Stats */}
                                <div className="flex justify-center gap-6 mt-2">
                                    <button
                                        onClick={() => navigate(`/user/${profile.username}/followers`)}
                                        className="text-center group"
                                    >
                                        <p className="text-base font-bold group-hover:text-primary transition-colors">{followStats.followers}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.followers") || "Followers"}</p>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/user/${profile.username}/following`)}
                                        className="text-center group"
                                    >
                                        <p className="text-base font-bold group-hover:text-primary transition-colors">{followStats.following}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("profile.following") || "Following"}</p>
                                    </button>
                                </div>

                                {profile.user_id !== user?.id && (
                                    <div className="flex gap-2 w-full mt-4">
                                        <Button
                                            className={cn(
                                                "flex-1 gap-2 rounded-xl transition-all",
                                                isFollowing ? "bg-secondary/20 text-primary hover:bg-secondary/30 border border-primary/20" : ""
                                            )}
                                            variant={isFollowing ? "outline" : "default"}
                                            onClick={handleFollowAction}
                                            disabled={followLoading}
                                        >
                                            <Users className="h-4 w-4" />
                                            {isFollowing ? t("profile.unfollow") : t("profile.follow")}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-2 rounded-xl px-4"
                                            onClick={handleStartChat}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {profile.bio && (
                                <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-3 gap-2">
                    {[
                        { icon: BookOpen, label: t("profile.days"), value: stats.daysCompleted },
                        { icon: Heart, label: t("profile.prayers"), value: stats.prayersOffered },
                        { icon: Users, label: t("profile.posts"), value: stats.postsMade },
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
            </div>
        </div>
    );
};

export default PublicProfile;
