import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "react-router-dom";
import ChatWindow from "@/components/ChatWindow";
import { motion, AnimatePresence } from "framer-motion";

const Messages = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { state } = useLocation();
    const { conversations, loading } = useMessages();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    // Auto-select conversation from navigation state
    useEffect(() => {
        if (state?.selectedConversationId && conversations.length > 0) {
            const found = conversations.find(c => c.id === state.selectedConversationId);
            if (found) setSelectedConversation(found);
        }
    }, [state, conversations]);

    if (selectedConversation) {
        const otherMember = selectedConversation.members.find(m => m.user_id !== user?.id);
        return (
            <ChatWindow
                conversationId={selectedConversation.id}
                otherUser={otherMember?.profiles}
                onBack={() => setSelectedConversation(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="fixed top-0 left-0 right-0 z-10 border-b border-border bg-card/90 backdrop-blur-md px-4 py-4 mt-[45px]">
                <h1 className="font-display text-xl font-bold">{t("messages.title")}</h1>
            </div>

            <ScrollArea className="h-[calc(100vh-130px)] px-4 py-2 mt-12">
                <div className="space-y-2">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))
                    ) : conversations.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            <p>{t("messages.noMessages")}</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const otherMember = conv.members.find(m => m.user_id !== user?.id);
                            if (!otherMember) return null;

                            return (
                                <motion.div key={conv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                    <Card
                                        className="border-0 shadow-sm hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => setSelectedConversation(conv)}
                                    >
                                        <CardContent className="p-3 flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-background">
                                                <AvatarImage src={otherMember.profiles.avatar_url || ""} />
                                                <AvatarFallback>{otherMember.profiles.display_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-sm font-bold truncate">{otherMember.profiles.display_name}</h3>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {new Date(conv.last_message_at).toLocaleDateString() === new Date().toLocaleDateString()
                                                            ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : new Date(conv.last_message_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate italic">@{otherMember.profiles.username}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default Messages;
