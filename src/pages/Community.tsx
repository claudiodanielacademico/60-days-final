import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Post {
  id: string; user_id: string; content: string; image_url: string | null; created_at: string;
  profiles?: { display_name: string; avatar_url: string | null } | null;
  likes_count: number; comments_count: number; user_liked: boolean;
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*, profiles!community_posts_user_id_fkey(display_name, avatar_url)")
      .order("created_at", { ascending: false }).limit(50);
    if (!postsData) return;
    const postIds = postsData.map((p) => p.id);
    const [likesRes, commentsRes, userLikesRes] = await Promise.all([
      supabase.from("likes").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      user ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds) : Promise.resolve({ data: [] }),
    ]);
    const likeCounts: Record<string, number> = {};
    likesRes.data?.forEach((l) => { likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
    const commentCounts: Record<string, number> = {};
    commentsRes.data?.forEach((c) => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });
    const userLikedSet = new Set(userLikesRes.data?.map((l) => l.post_id));
    setPosts(postsData.map((p) => ({
      ...p,
      profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
      likes_count: likeCounts[p.id] || 0,
      comments_count: commentCounts[p.id] || 0,
      user_liked: userLikedSet.has(p.id),
    })));
  };

  useEffect(() => { fetchPosts(); }, [user]);

  const submitPost = async () => {
    if (!user || !newPost.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("community_posts").insert({ user_id: user.id, content: newPost.trim() });
    if (error) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
    } else {
      setNewPost(""); setShowCompose(false); fetchPosts();
    }
    setPosting(false);
  };

  const toggleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      user_liked: !liked,
      likes_count: liked ? p.likes_count - 1 : p.likes_count + 1
    } : p));
    if (liked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">{t("community.title")}</h1>
        <Button size="sm" onClick={() => setShowCompose(!showCompose)} variant={showCompose ? "secondary" : "default"}>
          <Send className="h-4 w-4 mr-1" /> {t("community.post")}
        </Button>
      </div>
      <div className="mx-auto max-w-lg p-4 space-y-4">
        {showCompose && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <Textarea placeholder={t("community.placeholder")} value={newPost} onChange={(e) => setNewPost(e.target.value)} rows={3} />
                <div className="flex justify-end">
                  <Button onClick={submitPost} disabled={posting || !newPost.trim()} size="sm">
                    {posting ? t("community.posting") : t("community.share")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {posts.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p>{t("community.noPosts")}</p>
          </div>
        )}
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      post.profiles?.display_name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.profiles?.display_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                {post.image_url && <img src={post.image_url} alt="" className="mt-3 rounded-lg w-full object-cover max-h-64" />}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <motion.button
                    onClick={() => toggleLike(post.id, post.user_liked)}
                    className={cn("flex items-center gap-1 transition-colors", post.user_liked ? "text-red-500" : "hover:text-red-400")}
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Heart className={cn("h-4 w-4", post.user_liked && "fill-current")} /> {post.likes_count}
                  </motion.button>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" /> {post.comments_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Community;
