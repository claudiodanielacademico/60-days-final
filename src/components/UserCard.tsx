import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "@/components/FollowButton";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/userUtils";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";

interface UserCardProps {
    userId: string;
    username: string;
    userCode: string;
    displayName: string;
    avatarUrl: string | null;
    bio?: string | null;
    followerCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    showFollowButton?: boolean;
}

export const UserCard = ({
    userId,
    username,
    userCode,
    displayName,
    avatarUrl,
    bio,
    followerCount,
    followingCount,
    isFollowing = false,
    showFollowButton = true,
}: UserCardProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleCopyCode = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await copyToClipboard(userCode);
        if (success) {
            toast({
                title: "Copied!",
                description: `User code ${userCode} copied to clipboard`,
            });
        }
    };

    const handleCardClick = () => {
        navigate(`/user/${username}`);
    };

    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4" onClick={handleCardClick}>
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary overflow-hidden flex-shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                displayName[0]?.toUpperCase() || "?"
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                            <p className="text-xs text-muted-foreground">@{username}</p>

                            {/* User Code with Copy */}
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                    {userCode}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-0.5 hover:bg-accent rounded transition-colors"
                                >
                                    <Copy className="h-3 w-3 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Bio Preview */}
                            {bio && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                    {bio}
                                </p>
                            )}

                            {/* Stats */}
                            {(followerCount !== undefined || followingCount !== undefined) && (
                                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                    {followerCount !== undefined && (
                                        <span>
                                            <strong className="text-foreground">{followerCount}</strong>{" "}
                                            followers
                                        </span>
                                    )}
                                    {followingCount !== undefined && (
                                        <span>
                                            <strong className="text-foreground">{followingCount}</strong>{" "}
                                            following
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Follow Button */}
                        {showFollowButton && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <FollowButton
                                    targetUserId={userId}
                                    initialFollowing={isFollowing}
                                    variant="compact"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
