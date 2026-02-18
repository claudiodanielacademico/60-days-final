import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchUsers } from "@/lib/userUtils";

export interface SearchUser {
    user_id: string;
    username: string;
    user_code: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
}

export interface SearchPost {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: { username: string; display_name: string; avatar_url: string | null } | null;
}

export interface SearchPrayer {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: { username: string; display_name: string } | null;
}

export interface SearchResults {
    users: SearchUser[];
    posts: SearchPost[];
    prayers: SearchPrayer[];
}

export const useSearch = (query: string, debounceMs: number = 300) => {
    const [results, setResults] = useState<SearchResults>({
        users: [],
        posts: [],
        prayers: [],
    });
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce the search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, debounceMs);

        return () => clearTimeout(handler);
    }, [query, debounceMs]);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ users: [], posts: [], prayers: [] });
            return;
        }

        setLoading(true);

        try {
            const trimmedQuery = searchQuery.trim();

            // Smart pattern detection
            const startsWithAt = trimmedQuery.startsWith("@");
            const isExactly10Chars = trimmedQuery.length === 10 && /^[A-Z0-9]+$/i.test(trimmedQuery);

            let usersData: SearchUser[] = [];
            let postsData: SearchPost[] = [];
            let prayersData: SearchPrayer[] = [];

            // Pattern 1: @ prefix - prioritize username search
            if (startsWithAt) {
                const usernameQuery = trimmedQuery.substring(1).toLowerCase();
                const { data } = await supabase
                    .from("profiles")
                    .select("user_id, username, user_code, display_name, avatar_url, bio")
                    .ilike("username", `%${usernameQuery}%`)
                    .limit(20);
                usersData = data || [];
            }
            // Pattern 2: Exactly 10 alphanumeric chars - prioritize ID search
            else if (isExactly10Chars) {
                const codeQuery = trimmedQuery.toUpperCase();
                // First try exact match on user_code
                const { data: exactMatch } = await supabase
                    .from("profiles")
                    .select("user_id, username, user_code, display_name, avatar_url, bio")
                    .eq("user_code", codeQuery)
                    .maybeSingle();

                if (exactMatch) {
                    usersData = [exactMatch];
                } else {
                    // Fallback to partial match if no exact match
                    const { data: partialMatches } = await supabase
                        .from("profiles")
                        .select("user_id, username, user_code, display_name, avatar_url, bio")
                        .ilike("user_code", `%${codeQuery}%`)
                        .limit(10);
                    usersData = partialMatches || [];
                }
            }
            // Pattern 3: Keywords - search content (posts and prayers)
            else {
                // Still search users, but also search content
                const { data: userData } = await searchUsers(trimmedQuery, 10);
                usersData = userData || [];

                // Search posts by content
                const { data: postsResults } = await supabase
                    .from("community_posts")
                    .select("id, user_id, content, created_at, profiles!community_posts_user_id_fkey(username, display_name, avatar_url)")
                    .ilike("content", `%${trimmedQuery}%`)
                    .order("created_at", { ascending: false })
                    .limit(15);

                // Search prayers by content
                const { data: prayersResults } = await supabase
                    .from("prayer_requests")
                    .select("id, user_id, content, created_at, profiles!prayer_requests_user_id_fkey(username, display_name)")
                    .ilike("content", `%${trimmedQuery}%`)
                    .order("created_at", { ascending: false })
                    .limit(15);

                postsData = (postsResults || []).map(p => ({
                    ...p,
                    profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
                }));

                prayersData = (prayersResults || []).map(p => ({
                    ...p,
                    profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
                }));
            }

            setResults({
                users: usersData,
                posts: postsData,
                prayers: prayersData,
            });
        } catch (error) {
            console.error("Search error:", error);
            setResults({ users: [], posts: [], prayers: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, performSearch]);

    return { results, loading, performSearch };
};
