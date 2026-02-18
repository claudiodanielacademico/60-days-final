import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
    targetUserId: string;
    initialFollowing?: boolean;
    variant?: "default" | "compact";
    onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton = ({
    targetUserId,
    initialFollowing = false,
    variant = "default",
    onFollowChange,
}: FollowButtonProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    // Don't show button if viewing own profile
    if (!user || user.id === targetUserId) return null;

    const toggleFollow = async () => {
        setLoading(true);

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from("follows")
                    .delete()
                    .eq("follower_id", user.id)
                    .eq("following_id", targetUserId);

                if (error) throw error;

                setIsFollowing(false);
                onFollowChange?.(false);
            } else {
                // Follow
                const { error } = await supabase
                    .from("follows")
                    .insert({
                        follower_id: user.id,
                        following_id: targetUserId,
                    });

                if (error) throw error;

                setIsFollowing(true);
                onFollowChange?.(true);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update follow status",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (variant === "compact") {
        return (
            <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={toggleFollow}
                disabled={loading}
                className="h-7 text-xs"
            >
                {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : isFollowing ? (
                    "Following"
                ) : (
                    "Follow"
                )}
            </Button>
        );
    }

    return (
        <Button
            variant={isFollowing ? "secondary" : "default"}
            onClick={toggleFollow}
            disabled={loading}
            className={cn("min-w-[120px]")}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                </>
            ) : isFollowing ? (
                <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                </>
            )}
        </Button>
    );
};
