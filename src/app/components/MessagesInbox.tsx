import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Conversation { id: string; name: string; lastMessage: string; createdAt: string; }

export function MessagesInbox() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  useEffect(() => {
    async function loadMessages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: messages } = await supabase.from("messages").select("sender_id, receiver_id, text, created_at").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });
      const latest = new Map<string, any>();
      (messages || []).forEach((message) => { const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id; if (!latest.has(otherId)) latest.set(otherId, message); });
      const ids = [...latest.keys()];
      if (ids.length === 0) return;
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setConversations(ids.map((id) => ({ id, name: profiles?.find((profile) => profile.id === id)?.full_name || "Student", lastMessage: latest.get(id).text, createdAt: latest.get(id).created_at })));
    }
    loadMessages();
  }, []);
  return <div className="max-w-3xl mx-auto px-4 py-8"><Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-blue-600" /> Messages</CardTitle></CardHeader><CardContent className="space-y-2">{conversations.length === 0 && <p className="text-center text-gray-500 py-8">No conversations yet. Start a chat from a product page.</p>}{conversations.map((conversation) => <button key={conversation.id} onClick={() => navigate(`/chat/${conversation.id}`)} className="w-full text-left border rounded-lg p-4 hover:bg-blue-50"><p className="font-semibold">{conversation.name}</p><p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p><p className="text-xs text-gray-400 mt-1">{new Date(conversation.createdAt).toLocaleString()}</p></button>)}</CardContent></Card></div>;
}