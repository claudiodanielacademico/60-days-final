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

import { useNavigate } from "react-router-dom";
import { supabaseRetry } from "@/lib/supabaseRetry";

interface Post {
  id: string; user_id: string; content: string; image_url: string | null; created_at: string;
  profiles?: { display_name: string; avatar_url: string | null; username: string } | null;
  likes_count: number; comments_count: number; user_liked: boolean;
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchPosts = async () => {
    const { data: postsData } = await (supabase.from as any)("community_posts")
      .select("*, profiles!community_posts_user_id_fkey(display_name, avatar_url, username)")
      .order("created_at", { ascending: false }).limit(50);
    if (!postsData) return;
    const postIds = postsData.map((p: any) => p.id);
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
    setPosts(postsData.map((p: any) => ({
      ...p,
      profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
      likes_count: likeCounts[p.id] || 0,
      comments_count: commentCounts[p.id] || 0,
      user_liked: userLikedSet.has(p.id),
    })));
  };

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();

    // Real-time listener for community updates
    const channel = supabase
      .channel("community-global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_posts" },
        () => fetchPosts() // Refetch for simplicity and data integrity (e.g. includes proper profiles join)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const submitPost = async () => {
    if (!user || !newPost.trim()) return;
    setPosting(true);

    const tempId = crypto.randomUUID();
    const tempPost: Post = {
      id: tempId,
      user_id: user.id,
      content: newPost.trim(),
      image_url: null,
      created_at: new Date().toISOString(),
      profiles: {
        display_name: profile?.display_name || user.email?.split('@')[0] || "User",
        avatar_url: profile?.avatar_url || null,
        username: profile?.username || "user"
      },
      likes_count: 0,
      comments_count: 0,
      user_liked: false
    };

    // Optimistic update
    setPosts(prev => [tempPost, ...prev]);
    setNewPost("");
    setShowCompose(false);

    const { data: insertedPost, error } = await supabaseRetry(() =>
      (supabase.from as any)("community_posts")
        .insert({ user_id: user.id, content: tempPost.content })
        .select("*, profiles!community_posts_user_id_fkey(display_name, avatar_url, username)")
        .single() as any
    );

    if (error) {
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
      // Rollback on error
      setPosts(prev => prev.filter(p => p.id !== tempId));
      setNewPost(tempPost.content);
      setShowCompose(true);
    } else if (insertedPost) {
      toast({ title: t("community.post") || "Shared!", description: t("community.share") });
      // Replace optimistic post with real post from DB
      setPosts(prev => prev.map(p => p.id === tempId ? {
        ...insertedPost,
        profiles: Array.isArray(insertedPost.profiles) ? insertedPost.profiles[0] : insertedPost.profiles,
        likes_count: 0,
        comments_count: 0,
        user_liked: false
      } : p));
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

    const operation = liked
      ? () => supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id) as any
      : () => supabase.from("likes").insert({ post_id: postId, user_id: user.id }) as any;

    const { error } = await supabaseRetry(operation);

    if (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        user_liked: liked,
        likes_count: liked ? p.likes_count + 1 : p.likes_count - 1
      } : p));
      toast({ title: t("general.error"), description: error.message, variant: "destructive" });
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
                  <button
                    onClick={() => navigate(`/user/${post.profiles?.username}`)}
                    className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      post.profiles?.display_name?.[0]?.toUpperCase() || "?"
                    )}
                  </button>
                  <div className="flex-1 text-left">
                    <button
                      onClick={() => navigate(`/user/${post.profiles?.username}`)}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {post.profiles?.display_name || "Anonymous"}
                    </button>
                    <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                      {post.profiles?.username && `@${post.profiles.username} • `}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
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
