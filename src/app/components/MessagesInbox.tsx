import { useEffect, useState, useCallback } from "react";
import { 
  MessageCircle, 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface BaseConversation {
  id: string;
  otherId: string;
  name: string;
  lastMessage: string;
  createdAt: string;
  unreadCount: number;
}

interface MarketplaceConversation extends BaseConversation {
  route: string;
}

interface LostFoundConversation extends BaseConversation {
  itemId: string | null;
  itemTitle?: string;
  itemType?: "lost" | "found";
  route: string;
}

export function MessagesInbox() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "lostfound" ? "lostfound" : "marketplace";
  const [activeTab, setActiveTab] = useState<"marketplace" | "lostfound">(initialTab);

  const [loading, setLoading] = useState(true);
  const [marketplaceConversations, setMarketplaceConversations] = useState<MarketplaceConversation[]>([]);
  const [lostFoundConversations, setLostFoundConversations] = useState<LostFoundConversation[]>([]);
  const [marketplaceUnreadTotal, setMarketplaceUnreadTotal] = useState(0);
  const [lostFoundUnreadTotal, setLostFoundUnreadTotal] = useState(0);

  // Sync tab with URL searchParams
  const handleTabChange = (tab: "marketplace" | "lostfound") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadAllMessages = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch all messages involving the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, text, image_url, is_meetup_proposal, chat_type, item_id, read_at, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading messages:", error);
        setLoading(false);
        return;
      }

      const allMessages = messages || [];

      // 2. Separate messages into Marketplace vs Lost & Found
      const marketplaceMsgs = allMessages.filter((m) => m.chat_type !== "lostfound");
      const lostFoundMsgs = allMessages.filter((m) => m.chat_type === "lostfound");

      // Count unread for badges
      const mUnread = marketplaceMsgs.filter((m) => m.receiver_id === user.id && !m.read_at).length;
      const lfUnread = lostFoundMsgs.filter((m) => m.receiver_id === user.id && !m.read_at).length;
      setMarketplaceUnreadTotal(mUnread);
      setLostFoundUnreadTotal(lfUnread);

      // 3. Group Marketplace conversations by other user ID
      const marketplaceMap = new Map<string, { latest: any; unread: number }>();
      marketplaceMsgs.forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const isUnread = msg.receiver_id === user.id && !msg.read_at;
        if (!marketplaceMap.has(otherId)) {
          marketplaceMap.set(otherId, { latest: msg, unread: isUnread ? 1 : 0 });
        } else if (isUnread) {
          const current = marketplaceMap.get(otherId)!;
          current.unread += 1;
        }
      });

      // 4. Group Lost & Found conversations by (otherId + optional item_id)
      const lostFoundMap = new Map<string, { otherId: string; itemId: string | null; latest: any; unread: number }>();
      lostFoundMsgs.forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const itemId = msg.item_id || null;
        const key = itemId ? `${otherId}_${itemId}` : otherId;
        const isUnread = msg.receiver_id === user.id && !msg.read_at;

        if (!lostFoundMap.has(key)) {
          lostFoundMap.set(key, { otherId, itemId, latest: msg, unread: isUnread ? 1 : 0 });
        } else if (isUnread) {
          const current = lostFoundMap.get(key)!;
          current.unread += 1;
        }
      });

      // 5. Collect all required Profile IDs and Item IDs
      const allUserIds = Array.from(
        new Set([
          ...Array.from(marketplaceMap.keys()),
          ...Array.from(lostFoundMap.values()).map((v) => v.otherId),
        ])
      );

      const allItemIds = Array.from(
        new Set(
          Array.from(lostFoundMap.values())
            .map((v) => v.itemId)
            .filter(Boolean)
        )
      ) as string[];

      // Parallel fetch profiles and items
      const [profilesRes, itemsRes] = await Promise.all([
        allUserIds.length > 0
          ? supabase.from("profiles").select("id, full_name").in("id", allUserIds)
          : Promise.resolve({ data: [] }),
        allItemIds.length > 0
          ? supabase.from("lost_and_found").select("id, title, item_name, type, item_type").in("id", allItemIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profiles = profilesRes.data || [];
      const items = itemsRes.data || [];

      // 6. Build final Marketplace conversations
      const formattedMarketplace: MarketplaceConversation[] = Array.from(marketplaceMap.entries()).map(
        ([otherId, data]) => {
          const profile = profiles.find((p) => p.id === otherId);
          return {
            id: otherId,
            otherId,
            name: profile?.full_name || "Campus Student",
            lastMessage: data.latest.text || (data.latest.image_url ? "📷 Sent an image" : "Sent a message"),
            createdAt: data.latest.created_at,
            unreadCount: data.unread,
            route: `/chat/${otherId}`,
          };
        }
      );

      // 7. Build final Lost & Found conversations
      const formattedLostFound: LostFoundConversation[] = Array.from(lostFoundMap.entries()).map(
        ([key, data]) => {
          const profile = profiles.find((p) => p.id === data.otherId);
          const item = data.itemId ? items.find((i) => i.id === data.itemId) : null;
          const itemTitle = item ? item.title || item.item_name || "Belonging" : undefined;
          const itemType = item ? item.type || item.item_type : undefined;

          return {
            id: key,
            otherId: data.otherId,
            itemId: data.itemId,
            name: profile?.full_name || "Campus Student",
            itemTitle,
            itemType,
            lastMessage: data.latest.text || (data.latest.image_url ? "📷 Sent an image" : "Sent a message"),
            createdAt: data.latest.created_at,
            unreadCount: data.unread,
            route: `/lostfound/chat/${data.otherId}${data.itemId ? `?itemId=${data.itemId}` : ""}`,
          };
        }
      );

      setMarketplaceConversations(formattedMarketplace);
      setLostFoundConversations(formattedLostFound);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllMessages();

    // Listen to realtime messages to update inbox instantly
    let channel: ReturnType<typeof supabase.channel> | undefined;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      channel = supabase
        .channel(`inbox-realtime-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => {
            loadAllMessages();
          }
        )
        .subscribe();
    });

    const onMessagesRead = () => loadAllMessages();
    window.addEventListener("campustrade-messages-read", onMessagesRead);

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("campustrade-messages-read", onMessagesRead);
    };
  }, [loadAllMessages]);

  const activeConversations =
    activeTab === "marketplace" ? marketplaceConversations : lostFoundConversations;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2.5">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              Messages
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Organized conversations for your marketplace trades and lost & found inquiries.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-xl mb-6 max-w-md shadow-inner">
          <button
            onClick={() => handleTabChange("marketplace")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === "marketplace"
                ? "bg-white text-blue-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Marketplace & Merch</span>
            {marketplaceUnreadTotal > 0 && (
              <Badge className="bg-blue-600 text-white hover:bg-blue-600 text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                {marketplaceUnreadTotal}
              </Badge>
            )}
          </button>

          <button
            onClick={() => handleTabChange("lostfound")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === "lostfound"
                ? "bg-white text-emerald-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Lost & Found</span>
            {lostFoundUnreadTotal > 0 && (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                {lostFoundUnreadTotal}
              </Badge>
            )}
          </button>
        </div>

        {/* Content Box */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3.5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                {activeTab === "marketplace" ? (
                  <>
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    Buyer & Seller Conversations
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 text-emerald-600" />
                    Lost & Found Inquiries & Claims
                  </>
                )}
              </CardTitle>
              <span className="text-xs text-slate-500">
                {activeConversations.length} conversation{activeConversations.length === 1 ? "" : "s"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading conversations...</p>
              </div>
            ) : activeConversations.length === 0 ? (
              <div className="py-16 text-center px-4">
                {activeTab === "marketplace" ? (
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-1">No marketplace chats yet</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      When you message sellers about second-hand items or club merchandise, your chats and meetup proposals will appear here.
                    </p>
                    <Button onClick={() => navigate("/marketplace")} className="bg-blue-600 hover:bg-blue-700">
                      Explore Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="max-w-sm mx-auto">
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-1">No lost & found chats yet</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      When you claim a found item or report finding someone's lost item, inquiries and verification discussions will appear here.
                    </p>
                    <Button onClick={() => navigate("/lostfound")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      View Lost & Found Board
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTab === "marketplace" ? (
                  marketplaceConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => navigate(conv.route)}
                      className={`w-full text-left rounded-xl p-4 transition-all border flex items-center gap-4 ${
                        conv.unreadCount > 0
                          ? "bg-blue-50/40 border-blue-200 hover:bg-blue-50/80 shadow-xs"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {conv.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`font-semibold text-base truncate ${conv.unreadCount > 0 ? "text-blue-950 font-bold" : "text-slate-900"}`}>
                            {conv.name}
                          </span>
                          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                            {new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* Right indicator */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                  ))
                ) : (
                  lostFoundConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => navigate(conv.route)}
                      className={`w-full text-left rounded-xl p-4 transition-all border flex items-center gap-4 ${
                        conv.unreadCount > 0
                          ? "bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/80 shadow-xs"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {conv.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`font-semibold text-base truncate ${conv.unreadCount > 0 ? "text-emerald-950 font-bold" : "text-slate-900"}`}>
                              {conv.name}
                            </span>
                            {conv.itemTitle && (
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 border ${
                                  conv.itemType === "found"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {conv.itemType === "found" ? "Found:" : "Lost:"} {conv.itemTitle}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                            {new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* Right indicator */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}