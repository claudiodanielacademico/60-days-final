import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const FollowList = () => {
    const { username, type } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            // Get profile first
            const { data: profileData } = await (supabase.from as any)("profiles")
                .select("id, user_id, display_name")
                .eq("username", username)
                .single();

            if (!profileData) {
                setLoading(false);
                return;
            }
            setProfile(profileData);

            let followData;
            if (type === "followers") {
                const { data } = await supabase.from("follows").select("follower_id").eq("following_id", profileData.user_id);
                followData = data;
            } else {
                const { data } = await supabase.from("follows").select("following_id").eq("follower_id", profileData.user_id);
                followData = data;
            }

            if (followData && followData.length > 0) {
                const userIds = followData.map((f: any) => type === "followers" ? f.follower_id : f.following_id);
                const { data: profileList, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .in("user_id", userIds);

                if (!profileError && profileList) {
                    setUsers(profileList);
                }
            }
            setLoading(false);
        };
        fetchList();
    }, [username, type]);

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4 mt-[45px]">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="font-display text-lg font-bold">
                            {type === "followers" ? (t("profile.followers") || "Followers") : (t("profile.following") || "Following")}
                        </h1>
                        {profile && <p className="text-[10px] text-muted-foreground uppercase">@{username}</p>}
                    </div>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-120px)] p-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <p>{t("search.noResults")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {users.map((u) => (
                            <UserCard
                                key={u.user_id}
                                userId={u.user_id}
                                username={u.username}
                                userCode={u.user_code}
                                displayName={u.display_name}
                                avatarUrl={u.avatar_url}
                                bio={u.bio}
                                showFollowButton={false}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default FollowList;
