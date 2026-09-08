import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  Send, 
  Paperclip, 
  X, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Sparkles,
  HelpCircle,
  MessageCircle
} from "lucide-react";
import { supabase } from "../../supabase";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  image_url?: string;
  read_at?: string | null;
  created_at: string;
}

interface ItemDetails {
  id: string;
  title?: string;
  item_name?: string;
  type?: "lost" | "found";
  item_type?: "lost" | "found";
  location: string;
  date?: string;
  incident_date?: string;
  image_url?: string;
  description: string;
  status?: string;
  holding_location?: string;
  reporter_id: string;
  profiles?: {
    full_name: string;
  };
}

export function LostFoundChat() {
  const navigate = useNavigate();
  const { reporterId } = useParams<{ reporterId: string }>();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState<string>("Reporter");
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLatest = useRef(true);
  const [showLatestButton, setShowLatestButton] = useState(false);

  // 1. Fetch Auth, Item Details & Reporter Profile
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please login to contact this student.");
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);

      // Fetch reporter profile
      if (reporterId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", reporterId)
          .maybeSingle();

        if (profile?.full_name) {
          setReporterName(profile.full_name);
        }
      }

      // Fetch Item details if itemId is present
      if (itemId) {
        try {
          const { data, error } = await supabase
            .from("lost_and_found")
            .select("*, profiles!lost_and_found_reporter_id_fkey(full_name)")
            .eq("id", itemId)
            .maybeSingle();

          if (!error && data) {
            setItem(data as unknown as ItemDetails);
            if (data.profiles?.full_name) {
              setReporterName(data.profiles.full_name);
            }
          }
        } catch (err) {
          console.error("Failed to load item info:", err);
        } finally {
          setLoadingItem(false);
        }
      } else {
        setLoadingItem(false);
      }

      // Fetch Messages history
      if (reporterId) {
        const { data: chatHistory, error } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${reporterId}),and(sender_id.eq.${reporterId},receiver_id.eq.${session.user.id})`)
          .order("created_at", { ascending: true });

        if (!error && chatHistory) {
          setMessages(chatHistory);
          setTimeout(scrollToLatest, 100);
        }

        // Mark incoming messages as read
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("sender_id", reporterId)
          .eq("receiver_id", session.user.id)
          .is("read_at", null);

        window.dispatchEvent(new Event("campustrade-messages-read"));
      }
    }

    init();
  }, [reporterId, itemId, navigate]);

  // 2. Realtime Messages Subscription
  useEffect(() => {
    if (!currentUserId || !reporterId) return;

    const channel = supabase
      .channel(`lostfound_chat_${currentUserId}_${reporterId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === reporterId) ||
            (newMsg.sender_id === reporterId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.sender_id === reporterId && newMsg.receiver_id === currentUserId) {
              supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMsg.id)
                .eq("receiver_id", currentUserId);
              window.dispatchEvent(new Event("campustrade-messages-read"));
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, reporterId]);

  // Scroll helpers
  useEffect(() => {
    if (scrollRef.current && shouldScrollToLatest.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageScroll = () => {
    if (!scrollRef.current) return;
    const distanceFromBottom =
      scrollRef.current.scrollHeight -
      scrollRef.current.scrollTop -
      scrollRef.current.clientHeight;
    shouldScrollToLatest.current = distanceFromBottom < 80;
    setShowLatestButton(distanceFromBottom >= 80);
  };

  const scrollToLatest = () => {
    if (!scrollRef.current) return;
    shouldScrollToLatest.current = true;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setShowLatestButton(false);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if ((!textToSend && !attachedImage) || !currentUserId || !reporterId) return;

    try {
      const { data: sentMessage, error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: reporterId,
          text: textToSend,
          image_url: attachedImage || null,
          is_meetup_proposal: false
        })
        .select()
        .single();

      if (error) throw error;

      if (sentMessage) {
        setMessages((prev) =>
          prev.some((m) => m.id === sentMessage.id) ? prev : [...prev, sentMessage as Message]
        );
        setTimeout(scrollToLatest, 50);
      }

      setInputText("");
      setAttachedImage(null);
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message. Please check your connection.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAttachedImage(previewUrl);
  };

  const handleMarkReturned = async () => {
    if (!item || !currentUserId || item.reporter_id !== currentUserId) return;
    setUpdatingStatus(true);
    try {
      const newStatus = item.status === "returned" ? "open" : "returned";
      const { error } = await supabase
        .from("lost_and_found")
        .update({ status: newStatus })
        .eq("id", item.id);

      if (error) throw error;

      setItem((prev) => (prev ? { ...prev, status: newStatus } : prev));
      if (newStatus === "returned") {
        await handleSendMessage("🎉 Item status updated: This item has been marked as Reunited / Returned!");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update item status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isFoundItem = item ? (item.type || item.item_type) === "found" : false;
  const isReporter = currentUserId && item ? currentUserId === item.reporter_id : false;
  const isReturned = item?.status === "returned";

  // Pre-filled suggestion chips
  const quickReplies = isFoundItem
    ? [
        "Hi! I think this is mine. Can I provide proof of ownership?",
        "Where can we meet on campus to hand this over?",
        "Thank you so much for picking this up!"
      ]
    : [
        "Hi, I found the item you reported lost!",
        "I saw something matching your description on campus.",
        "Could you confirm unique details or stickers on it?"
      ];

  return (
    <div className="h-full min-h-0 overflow-hidden bg-slate-50 relative flex flex-col">
      <div className="max-w-6xl mx-auto w-full h-full px-4 sm:px-6 py-4 flex flex-col min-h-0">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/lostfound")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lost & Found
          </Button>

          {isReporter && item && (
            <Button
              size="sm"
              variant={isReturned ? "outline" : "default"}
              className={isReturned ? "border-green-600 text-green-700 bg-green-50" : "bg-green-600 hover:bg-green-700 text-white"}
              onClick={handleMarkReturned}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              {isReturned ? "Mark as Open / Unresolved" : "Mark as Reunited 🎉"}
            </Button>
          )}
        </div>

        {/* Main Grid: Item Info (Left) + Chat (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
          
          {/* Left Column: Item Context & Safety Guidance */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
            {item ? (
              <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title || item.item_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <HelpCircle className="h-8 w-8 mb-1" />
                      <span className="text-xs">No image provided</span>
                    </div>
                  )}
                  <Badge
                    className={`absolute top-3 left-3 ${
                      isFoundItem
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {isFoundItem ? "FOUND ITEM" : "LOST ITEM"}
                  </Badge>

                  {isReturned && (
                    <Badge className="absolute top-3 right-3 bg-green-600 text-white flex items-center gap-1 shadow">
                      <CheckCircle2 className="h-3 w-3" /> Reunited 🎉
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h2 className="font-bold text-lg text-slate-800 leading-tight">
                      {item.title || item.item_name || "Campus Item"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{item.location || "Campus area"}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{item.date || item.incident_date || "Recently reported"}</span>
                    </p>
                  </div>

                  {item.description && (
                    <div className="bg-slate-50 p-2.5 rounded-md text-xs text-slate-600 leading-relaxed border border-slate-100">
                      {item.description}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-slate-400">Reporter:</span>
                    <span className="font-medium text-slate-800">
                      {reporterName} {isReporter ? "(You)" : isFoundItem ? "(Finder)" : "(Owner)"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : loadingItem ? (
              <Card className="p-6 text-center border-dashed">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs text-slate-500">Loading item details...</p>
              </Card>
            ) : null}

            {/* Campus Proof-of-Ownership & Safety Tip Card */}
            <Card className="border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-blue-900">
                    {isFoundItem ? "Ownership Verification" : "Campus Safety"}
                  </h4>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {isFoundItem
                      ? "Before handing the item over, ask the student to describe hidden details (e.g. phone lockscreen wallpaper, stickers, or bag contents) to ensure it's the rightful owner."
                      : "Always arrange handovers in safe, well-lit campus zones like the Library lobby, Cafeteria, or Student Affairs counter."}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Chat Box or Reporter Inbox Guidance */}
          <div className="lg:col-span-8 flex flex-col min-h-0 h-full overflow-hidden">
            {currentUserId && reporterId && currentUserId === reporterId ? (
              <Card className="flex flex-col items-center justify-center min-h-0 h-full p-8 text-center bg-white border-slate-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">You Reported This Item</h3>
                <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                  When other students reach out to claim this item or help you find it, their messages will arrive directly in your <strong>Messages Inbox</strong>.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => navigate("/messages")} className="bg-blue-600 hover:bg-blue-700 text-white shadow">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Messages Inbox
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/lostfound")}>
                    Back to Lost & Found
                  </Button>
                </div>
              </Card>
            ) : (
            <Card className="flex flex-col min-h-0 h-full overflow-hidden shadow-sm border-slate-200 bg-white">
              
              {/* Chat Header */}
              <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold">
                      {reporterName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {reporterName}
                    </CardTitle>
                    <p className="text-[11px] text-slate-500">
                      {isFoundItem ? "Finder of this item" : "Owner of this item"}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 font-normal">
                  <Sparkles className="h-3 w-3 mr-1 text-blue-500" /> Lost & Found Chat
                </Badge>
              </CardHeader>

              {/* Chat Messages Body */}
              <CardContent className="flex-1 basis-0 h-0 min-h-0 p-0 overflow-hidden bg-slate-50/50">
                <div
                  className="relative h-full overflow-y-auto p-4 space-y-3"
                  ref={scrollRef}
                  onScroll={handleMessageScroll}
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100/60 flex items-center justify-center mb-3">
                        <Send className="h-5 w-5 text-blue-500 translate-x-0.5" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Start the recovery conversation</p>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">
                        Send a message to coordinate the return or verify ownership of this item.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              isMe
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-slate-800 border border-slate-200/70 rounded-bl-none"
                            }`}
                          >
                            {m.image_url && (
                              <img
                                src={m.image_url}
                                className="w-full rounded-lg mb-2 object-cover max-h-60"
                                alt="Attachment"
                              />
                            )}
                            <p className="whitespace-pre-line break-words leading-relaxed text-xs sm:text-sm">
                              {m.text}
                            </p>
                            <div
                              className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                                isMe ? "text-blue-100" : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                              {isMe && (
                                <span className={m.read_at ? "text-white font-bold" : "text-blue-200"}>
                                  {m.read_at ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {showLatestButton && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={scrollToLatest}
                      className="sticky bottom-2 left-1/2 -translate-x-1/2 z-10 shadow-md bg-blue-600 hover:bg-blue-700 text-white text-xs h-7"
                    >
                      ↓ Latest messages
                    </Button>
                  )}
                </div>
              </CardContent>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0 mr-1">
                  Quick:
                </span>
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200/60 shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
                {attachedImage && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={attachedImage}
                      className="h-16 w-16 object-cover rounded-md border"
                      alt="preview"
                    />
                    <button
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-blue-600"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message or verify item details..."
                    className="flex-1 text-sm bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                    onClick={() => handleSendMessage()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </Card>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
