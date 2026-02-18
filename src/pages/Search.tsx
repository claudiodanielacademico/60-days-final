import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/SearchBar";
import { UserCard } from "@/components/UserCard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search as SearchIcon, Users, MessageSquare, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const { results, loading, performSearch } = useSearch(query);

    const totalResults =
        results.users.length + results.posts.length + results.prayers.length;

    useEffect(() => {
        if (query && query !== searchParams.get("q")) {
            setSearchParams({ q: query });
        }
    }, [query, searchParams, setSearchParams]);

    useEffect(() => {
        if (!query) return;

        // Real-time listener to refresh search results if global data changes
        const channel = supabase
            .channel("search-refresh")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "profiles" },
                () => performSearch(query)
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "community_posts" },
                () => performSearch(query)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [query, performSearch]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4">
                <h1 className="font-display text-xl font-bold mb-3">
                    {t("search.title")}
                </h1>
                <SearchBar
                    onSearch={setQuery}
                    placeholder={t("search.placeholder")}
                    autoFocus
                />
            </div>

            <div className="mx-auto max-w-2xl p-4">
                {!query ? (
                    // Empty state
                    <div className="py-20 text-center text-muted-foreground">
                        <SearchIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium">{t("search.smartSearch")}</p>
                        <div className="text-sm mt-3 space-y-1">
                            <p>• <strong>@username</strong> - {t("search.users")}</p>
                            <p>• <strong>10-digit code</strong> - {t("profile.title")} ID</p>
                            <p>• <strong>Keywords</strong> - {t("search.posts")} & {t("search.prayers")}</p>
                        </div>
                    </div>
                ) : loading ? (
                    // Loading state
                    <div className="py-20 text-center">
                        <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">{t("search.searching")}</p>
                    </div>
                ) : totalResults === 0 ? (
                    // No results
                    <div className="py-20 text-center text-muted-foreground">
                        <SearchIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="text-lg font-medium">{t("search.noResults")}</p>
                    </div>
                ) : (
                    // Results with tabs
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                            <TabsTrigger value="all">
                                {t("search.all")} ({totalResults})
                            </TabsTrigger>
                            <TabsTrigger value="users">
                                <Users className="h-4 w-4 mr-1" />
                                {t("search.users")} ({results.users.length})
                            </TabsTrigger>
                            <TabsTrigger value="posts">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {t("search.posts")} ({results.posts.length})
                            </TabsTrigger>
                            <TabsTrigger value="prayers">
                                <Heart className="h-4 w-4 mr-1" />
                                {t("search.prayers")} ({results.prayers.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* All Results */}
                        <TabsContent value="all" className="space-y-6">
                            {results.users.length > 0 && (
                                <div>
                                    <h3 className="font-display text-sm font-semibold mb-2">Users</h3>
                                    <div className="space-y-2">
                                        {results.users.map((user, i) => (
                                            <motion.div
                                                key={user.user_id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <UserCard
                                                    userId={user.user_id}
                                                    username={user.username}
                                                    userCode={user.user_code}
                                                    displayName={user.display_name}
                                                    avatarUrl={user.avatar_url}
                                                    bio={user.bio}
                                                    showFollowButton
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.posts.length > 0 && (
                                <div>
                                    <h3 className="font-display text-sm font-semibold mb-2">Posts</h3>
                                    <div className="space-y-2">
                                        {results.posts.map((post, i) => (
                                            <motion.div
                                                key={post.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: (results.users.length + i) * 0.05 }}
                                            >
                                                <Card
                                                    className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => navigate("/community")}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium">
                                                                    {post.profiles?.display_name || "Anonymous"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    @{post.profiles?.username}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm line-clamp-3">{post.content}</p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.prayers.length > 0 && (
                                <div>
                                    <h3 className="font-display text-sm font-semibold mb-2">
                                        Prayer Requests
                                    </h3>
                                    <div className="space-y-2">
                                        {results.prayers.map((prayer, i) => (
                                            <motion.div
                                                key={prayer.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay:
                                                        (results.users.length + results.posts.length + i) * 0.05,
                                                }}
                                            >
                                                <Card
                                                    className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => navigate("/prayers")}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                                                {prayer.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium">
                                                                    {prayer.profiles?.display_name || "Anonymous"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    @{prayer.profiles?.username}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm line-clamp-3">{prayer.content}</p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {new Date(prayer.created_at).toLocaleDateString()}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Users Only */}
                        <TabsContent value="users" className="space-y-2">
                            {results.users.map((user, i) => (
                                <motion.div
                                    key={user.user_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <UserCard
                                        userId={user.user_id}
                                        username={user.username}
                                        userCode={user.user_code}
                                        displayName={user.display_name}
                                        avatarUrl={user.avatar_url}
                                        bio={user.bio}
                                        showFollowButton
                                    />
                                </motion.div>
                            ))}
                        </TabsContent>

                        {/* Posts Only */}
                        <TabsContent value="posts" className="space-y-2">
                            {results.posts.map((post, i) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card
                                        className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate("/community")}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium">
                                                        {post.profiles?.display_name || "Anonymous"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @{post.profiles?.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm">{post.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </TabsContent>

                        {/* Prayers Only */}
                        <TabsContent value="prayers" className="space-y-2">
                            {results.prayers.map((prayer, i) => (
                                <motion.div
                                    key={prayer.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card
                                        className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate("/prayers")}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                                    {prayer.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium">
                                                        {prayer.profiles?.display_name || "Anonymous"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @{prayer.profiles?.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm">{prayer.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(prayer.created_at).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default Search;
