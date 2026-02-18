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

const PublicProfile = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { startConversation } = useMessages();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ daysCompleted: 0, prayersOffered: 0, postsMade: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicData = async () => {
            setLoading(true);
            const { data: profileData } = await (supabase.from as any)("profiles")
                .select("*")
                .eq("username", username)
                .maybeSingle();

            if (profileData) {
                setProfile(profileData);

                const [progressRes, prayersRes, postsRes] = await Promise.all([
                    supabase.from("journey_progress").select("id").eq("user_id", profileData.user_id).eq("completed", true),
                    supabase.from("prayer_counts").select("id").eq("user_id", profileData.user_id),
                    supabase.from("community_posts").select("id").eq("user_id", profileData.user_id),
                ]);

                setStats({
                    daysCompleted: progressRes.data?.length || 0,
                    prayersOffered: prayersRes.data?.length || 0,
                    postsMade: postsRes.data?.length || 0,
                });
            }
            setLoading(false);
        };
        fetchPublicData();
    }, [username]);

    const handleStartChat = async () => {
        if (!user) {
            navigate("/auth");
            return;
        }
        if (!profile) return;

        try {
            const convId = await startConversation(profile.user_id);
            navigate("/messages");
        } catch (error) {
            toast({ title: t("general.error"), variant: "destructive" });
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

                                {profile.user_id !== user?.id && (
                                    <Button className="mt-4 w-full gap-2 rounded-xl" onClick={handleStartChat}>
                                        <MessageSquare className="h-4 w-4" /> {t("profile.message")}
                                    </Button>
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
