import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Send, Paperclip, X, Calendar, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { supabase } from "../../supabase";
import { useNavigate, useParams } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  image_url?: string;
  is_meetup_proposal?: boolean;
  created_at: string;
}

export function ChatMeetup() {
  const navigate = useNavigate();
  const { sellerId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellerName, setSellerName] = useState("Loading...");

  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState("Main Library");
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupTime, setMeetupTime] = useState("");

  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Auth and Fetch Messages
  useEffect(() => {
    async function initChat() {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please login to chat.");
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);

      if (!sellerId) return;

      // Fetch Seller Name
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", sellerId)
        .single();
      if (sellerData) setSellerName(sellerData.full_name);

      // Fetch Chat History
      const { data: chatHistory, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${session.user.id})`)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching messages:", error);
      if (chatHistory) setMessages(chatHistory);
      await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("sender_id", sellerId).eq("receiver_id", session.user.id).is("read_at", null);
      window.dispatchEvent(new Event("campustrade-messages-read"));
    }
    initChat();
  }, [sellerId, navigate]);

  // 2. Setup Supabase Realtime Subscription
  useEffect(() => {
    if (!currentUserId || !sellerId) return;

    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only append if it belongs to this conversation
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === sellerId) ||
            (newMsg.sender_id === sellerId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, sellerId]);

  // 3. Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo purposes, we will just use local preview and upload it as a data URL,
    // or upload to a storage bucket if you prefer. To keep it simple, we use createObjectURL here,
    // but in production, you MUST upload `file` to `supabase.storage` and get a public URL!
    const previewUrl = URL.createObjectURL(file);
    setAttachedImage(previewUrl);
  };

  const handleSendMessage = async (textOverride?: string, isProposal = false) => {
    const textToSend = textOverride || inputText;
    if ((!textToSend.trim() && !attachedImage) || !currentUserId || !sellerId) return;

    // Optional: Upload `attachedImage` file to supabase storage here if it's a real file.
    
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: sellerId,
        text: textToSend,
        image_url: attachedImage || null,
        is_meetup_proposal: isProposal
      });

      if (error) throw error;

      setInputText("");
      setAttachedImage(null);
      setShowMeetupModal(false);
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message. Please check your connection.");
    }
  };

  const confirmMeetup = () => {
    if (!meetupLocation || !meetupDate || !meetupTime) {
      alert("Please choose a pickup point, date, and time.");
      return;
    }
    const proposalText = `📅 Proposed Meetup\n📍 Pickup point: ${meetupLocation}\n📆 Preferred date: ${meetupDate}\n⏰ Preferred time: ${meetupTime}`;
    handleSendMessage(proposalText, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* --- MEETUP RESERVATION MODAL --- */}
      {showMeetupModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Schedule Meetup</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowMeetupModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pickup Point</Label>
                <Select value={meetupLocation} onValueChange={setMeetupLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Library">Main Library</SelectItem>
                    <SelectItem value="Café">Café</SelectItem>
                    <SelectItem value="Student Centre">Student Centre</SelectItem>
                    <SelectItem value="Other">Other (discuss in chat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Input type="date" value={meetupDate} onChange={(event) => setMeetupDate(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="time" 
                    className="pl-10" 
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" onClick={confirmMeetup}>
                Send Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* Chat Side */}
          <Card className="flex flex-col h-full">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="bg-blue-600 text-white">{sellerName.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <CardTitle className="text-lg">{sellerName}</CardTitle>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Start the conversation! Say hi 👋</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      m.is_meetup_proposal ? "bg-green-50 border-2 border-green-200 text-green-900" : 
                      m.sender_id === currentUserId ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                    }`}>
                      {m.image_url && <img src={m.image_url} className="w-full rounded-md mb-2 object-cover" alt="attachment" />}
                      <p className="whitespace-pre-line break-words">{m.text}</p>
                      <p className="text-[10px] mt-1 opacity-70">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="flex justify-center py-4">
                <Button onClick={() => setShowMeetupModal(true)} variant="outline" className="border-blue-600 text-blue-600">
                  <Calendar className="h-4 w-4 mr-2" /> Propose Meetup
                </Button>
              </div>
            </CardContent>

            <div className="p-4 border-t bg-white">
              {attachedImage && (
                <div className="mb-3 relative inline-block">
                  <img src={attachedImage} className="h-20 w-20 object-cover rounded-md border" alt="preview" />
                  <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                </div>
              )}
              <div className="flex gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                <Input placeholder="Type a message..." className="flex-1" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                <Button className="bg-blue-600" onClick={() => handleSendMessage()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}