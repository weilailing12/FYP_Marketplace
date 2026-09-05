import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Label } from "./ui/label";
import { Send, Paperclip, X, Calendar, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { supabase } from "../../supabase";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  image_url?: string;
  is_meetup_proposal?: boolean;
  read_at?: string | null;
  created_at: string;
}

interface MeetupProposal {
  id: string;
  order_id: string;
  location: string | null;
  meetup_date: string | null;
  meetup_time: string | null;
  buyer_accepted: boolean;
  seller_accepted: boolean;
  status: "pending" | "confirmed" | "cancelled";
}

function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMeetupTime(value: string | null) {
  if (!value) return "Pickup time not set";
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function ChatMeetup() {
  const navigate = useNavigate();
  const { sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orderId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellerName, setSellerName] = useState("Loading...");

  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState("Main Library");
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupTime, setMeetupTime] = useState("");
  const [meetupProposal, setMeetupProposal] = useState<MeetupProposal | null>(null);
  const [isBuyer, setIsBuyer] = useState(false);

  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLatest = useRef(true);
  const [showLatestButton, setShowLatestButton] = useState(false);

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

      const { data: order } = orderId
        ? await supabase.from("orders").select("id, buyer_id, seller_id").eq("id", orderId).single()
        : await supabase.from("orders").select("id, buyer_id, seller_id").or(`and(buyer_id.eq.${session.user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${session.user.id})`).in("status", ["pending", "accepted", "completed"]).order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (order) {
        if (order && (order.buyer_id === session.user.id || order.seller_id === session.user.id) && (order.buyer_id === sellerId || order.seller_id === sellerId)) {
          setActiveOrderId(order.id);
          setIsBuyer(order.buyer_id === session.user.id);
          const { data: proposal } = await supabase.from("meetup_proposals").select("*").eq("order_id", order.id).maybeSingle();
          if (proposal) {
            setMeetupProposal(proposal as MeetupProposal);
            setMeetupLocation(proposal.location || "");
            setMeetupDate(proposal.meetup_date || "");
            setMeetupTime(proposal.meetup_time?.slice(0, 5) || "");
          }
        }
      }

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
      if (chatHistory) {
        shouldScrollToLatest.current = true;
        setMessages(chatHistory);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          });
        });
      }
      await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("sender_id", sellerId).eq("receiver_id", session.user.id).is("read_at", null);
      window.dispatchEvent(new Event("campustrade-messages-read"));
    }
    initChat();
  }, [sellerId, navigate, orderId]);

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
            if (newMsg.sender_id === sellerId && newMsg.receiver_id === currentUserId) {
              supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMsg.id).eq("receiver_id", currentUserId);
              window.dispatchEvent(new Event("campustrade-messages-read"));
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updatedMessage = payload.new as Message;
          if ((updatedMessage.sender_id === currentUserId && updatedMessage.receiver_id === sellerId) || (updatedMessage.sender_id === sellerId && updatedMessage.receiver_id === currentUserId)) {
            setMessages((prev) => prev.map((message) => message.id === updatedMessage.id ? updatedMessage : message));
          }
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "meetup_proposals", filter: activeOrderId ? `order_id=eq.${activeOrderId}` : undefined }, (payload) => {
        setMeetupProposal(payload.new as MeetupProposal);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, sellerId, activeOrderId]);

  // Keep the view at the latest message unless the user is reading older messages.
  useEffect(() => {
    if (scrollRef.current && shouldScrollToLatest.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [messages]);

  const handleMessageScroll = () => {
    if (!scrollRef.current) return;
    const distanceFromBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight;
    shouldScrollToLatest.current = distanceFromBottom < 80;
    setShowLatestButton(distanceFromBottom >= 80);
  };

  const scrollToLatest = () => {
    if (!scrollRef.current) return;
    shouldScrollToLatest.current = true;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
    setShowLatestButton(false);
  };

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
      const { data: sentMessage, error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: sellerId,
        text: textToSend,
        image_url: attachedImage || null,
        is_meetup_proposal: isProposal
      }).select().single();

      if (error) throw error;

      if (sentMessage) {
        shouldScrollToLatest.current = true;
        setMessages((current) => current.some((message) => message.id === sentMessage.id) ? current : [...current, sentMessage as Message]);
      }
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
    const [year, month, day] = meetupDate.split("-").map(Number);
    const [hours, minutes] = meetupTime.split(":").map(Number);
    const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
    if (!Number.isFinite(selectedDateTime.getTime()) || selectedDateTime.getTime() <= Date.now()) {
      alert("Please choose a future date and time.");
      return;
    }
    saveMeetupProposal();
  };

  const saveMeetupProposal = async () => {
    if (!currentUserId || !activeOrderId) {
      alert("A meetup proposal is available after an order request is created.");
      return;
    }
    if (meetupProposal?.status === "confirmed") {
      alert("This meetup is already confirmed and cannot be changed.");
      return;
    }
    const { data, error } = await supabase.from("meetup_proposals").upsert({
      order_id: activeOrderId,
      proposed_by: currentUserId,
      location: meetupLocation.trim() || null,
      meetup_date: meetupDate || null,
      meetup_time: meetupTime || null,
      buyer_accepted: isBuyer,
      seller_accepted: !isBuyer,
      status: "pending",
      updated_at: new Date().toISOString(),
    }, { onConflict: "order_id" }).select().single();
    if (error) { alert(error.message); return; }
    setMeetupProposal(data as MeetupProposal);
    setShowMeetupModal(false);
  };

  const acceptMeetupProposal = async () => {
    if (!meetupProposal || !currentUserId) return;
    const bothAccepted = isBuyer ? meetupProposal.seller_accepted : meetupProposal.buyer_accepted;
    const { data, error } = await supabase.from("meetup_proposals").update({
      buyer_accepted: isBuyer ? true : meetupProposal.buyer_accepted,
      seller_accepted: isBuyer ? meetupProposal.seller_accepted : true,
      status: bothAccepted ? "confirmed" : "pending",
      updated_at: new Date().toISOString(),
    }).eq("id", meetupProposal.id).select().single();
    if (error) { alert(error.message); return; }
    setMeetupProposal(data as MeetupProposal);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 relative">
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
                <Input value={meetupLocation} onChange={(event) => setMeetupLocation(event.target.value)} placeholder="e.g. Block A, Level 2" />
              </div>

              <div className="space-y-2">
                <Label>Preferred Date</Label>
                  <Input type="date" min={getLocalDateString()} value={meetupDate} onChange={(event) => setMeetupDate(event.target.value)} />
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

      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Chat Side */}
          <Card className="flex flex-col min-h-0 h-full" onClick={scrollToLatest}>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="bg-blue-600 text-white">{sellerName.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <CardTitle className="text-lg">{sellerName}</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative flex-1 basis-0 min-h-0 overflow-y-scroll p-4 space-y-4" ref={scrollRef} onScroll={handleMessageScroll}>
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
                      <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {m.sender_id === currentUserId && <span className={m.read_at ? "text-blue-500 font-bold" : "text-gray-500"} aria-label={m.read_at ? "Read" : "Sent"}>{m.read_at ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {showLatestButton && <Button type="button" size="sm" onClick={scrollToLatest} className="sticky bottom-2 left-1/2 -translate-x-1/2 z-10 shadow-md bg-blue-600 hover:bg-blue-700">↓ Latest messages</Button>}
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

          {activeOrderId && <Card className="h-fit lg:max-h-full overflow-y-auto">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /> Meetup</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {meetupProposal ? <div className="rounded-lg border bg-green-50 p-4 text-sm space-y-1">
                <p className="font-semibold text-green-900">{meetupProposal.status === "confirmed" ? "Meetup confirmed" : "Meetup proposal"}</p>
                <p>Location: {meetupProposal.location || "Pickup location not set"}</p>
                <p>Date: {meetupProposal.meetup_date || "Pickup date not set"}</p>
                <p>Time: {formatMeetupTime(meetupProposal.meetup_time)}</p>
                {meetupProposal.status !== "confirmed" && <p className="font-medium pt-2">Buyer: {meetupProposal.buyer_accepted ? "Accepted" : "Waiting"} · Seller: {meetupProposal.seller_accepted ? "Accepted" : "Waiting"}</p>}
              </div> : <p className="text-sm text-gray-500">No meetup proposal yet.</p>}
              {meetupProposal?.status !== "confirmed" && <div className="flex flex-wrap gap-2"><Button onClick={() => setShowMeetupModal(true)} variant="outline" className="border-blue-600 text-blue-600"><Calendar className="h-4 w-4 mr-2" /> {meetupProposal ? "Edit Meetup" : "Propose Meetup"}</Button>{meetupProposal && !(isBuyer ? meetupProposal.buyer_accepted : meetupProposal.seller_accepted) && <Button onClick={acceptMeetupProposal} className="bg-green-600 hover:bg-green-700">Accept</Button>}</div>}
            </CardContent>
          </Card>}

        </div>
      </div>
    </div>
  );
}