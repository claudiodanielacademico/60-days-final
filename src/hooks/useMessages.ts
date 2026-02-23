import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    created_at: string;
    last_message_at: string;
    members: { user_id: string; profiles: { display_name: string; avatar_url: string | null; username: string } }[];
}

export const useMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        if (!user) return;
        setLoading(true);

        const { data: convData, error } = await (supabase.from as any)("conversations")
            .select(`
        *,
        conversation_members (
          user_id,
          profiles (
            display_name,
            avatar_url,
            username
          )
        )
      `)
            .order("last_message_at", { ascending: false });

        if (error) {
            console.error("Error fetching conversations:", error);
        } else {
            setConversations(convData.map((c: any) => ({
                ...c,
                members: c.conversation_members
            })));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConversations();

        // Subscribe to new messages or conversation updates
        const channel = supabase.channel("messages_updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "conversations" },
                () => fetchConversations()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "messages" },
                () => fetchConversations()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const sendMessage = async (conversationId: string, content: string) => {
        if (!user) return;
        try {
            const { error } = await (supabase.from as any)("messages").insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content,
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error in sendMessage:", error);
            throw error;
        }
    };

    const startConversation = async (otherUserId: string) => {
        if (!user) return;

        try {
            // Check if conversation already exists
            const { data: existing, error: checkError } = await (supabase.from as any)("conversation_members")
                .select("conversation_id")
                .eq("user_id", user.id);

            if (checkError) throw checkError;

            const convIds = existing?.map((e: any) => e.conversation_id) || [];

            if (convIds.length > 0) {
                const { data: otherMember, error: memberError } = await (supabase.from as any)("conversation_members")
                    .select("conversation_id")
                    .in("conversation_id", convIds)
                    .eq("user_id", otherUserId)
                    .maybeSingle();

                if (memberError) console.warn("Issue checking other member:", memberError);
                if (otherMember) return otherMember.conversation_id;
            }

            // Create new conversation
            const { data: newConv, error: convError } = await (supabase.from as any)("conversations").insert({}).select().single();
            if (convError) throw convError;

            const { error: memberInsertError } = await (supabase.from as any)("conversation_members").insert([
                { conversation_id: newConv.id, user_id: user.id },
                { conversation_id: newConv.id, user_id: otherUserId },
            ]);
            if (memberInsertError) throw memberInsertError;

            return newConv.id;
        } catch (error) {
            console.error("Error in startConversation:", error);
            throw error;
        }
    };

    return { conversations, loading, sendMessage, startConversation, refresh: fetchConversations };
};
