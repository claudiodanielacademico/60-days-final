import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

const ChatWindow = ({ conversationId, onBack, otherUser }: { conversationId: string; onBack: () => void; otherUser: any }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        const { data, error } = await (supabase.from as any)("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });
        if (!error && data) setMessages(data);
    };

    useEffect(() => {
        fetchMessages();
        const channel = supabase.channel(`chat_${conversationId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [conversationId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;
        const { error } = await (supabase.from as any)("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: newMessage.trim(),
        });
        if (!error) setNewMessage("");
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="flex items-center gap-3 p-4 border-b bg-card mt-[45px]">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.avatar_url} />
                    <AvatarFallback>{otherUser.display_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-sm font-bold leading-none">{otherUser.display_name}</h2>
                    <p className="text-[10px] text-muted-foreground mt-1">@{otherUser.username}</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
                                }`}>
                                {msg.content}
                                <div className="text-[9px] opacity-70 mt-1 text-right">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card pb-20">
                <div className="flex gap-2">
                    <Input
                        placeholder={t("messages.placeholder")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="rounded-full"
                    />
                    <Button size="icon" onClick={handleSend} className="rounded-full shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
