import React, { useState, useEffect } from "react";
import { Search, Plus, ShoppingCart, MessageCircle, Bell } from "lucide-react";
import { supabase } from "../../supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { itemCount } = useCart();
  const [orderNoticeCount, setOrderNoticeCount] = useState(0);
  const [messageNoticeCount, setMessageNoticeCount] = useState(0);
  
  const [localQuery, setLocalQuery] = useState(searchParams.get("q") || "");
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local query in sync with URL if URL changes
  useEffect(() => {
    setLocalQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    async function loadOrderNotices() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const seenOrders = JSON.parse(localStorage.getItem(`campustrade-seen-orders:${user.id}`) || "[]") as string[];
      const { data } = await supabase.from("orders").select("id").eq("buyer_id", user.id).in("status", ["accepted", "rejected", "completed"]);
      setOrderNoticeCount((data || []).filter((order) => !seenOrders.includes(order.id)).length);
      channel = supabase.channel(`navbar-orders-${user.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` }, loadOrderNotices).subscribe();
    }
    loadOrderNotices();
    const refreshSeenOrders = () => loadOrderNotices();
    window.addEventListener("campustrade-orders-seen", refreshSeenOrders);
    return () => { if (channel) supabase.removeChannel(channel); window.removeEventListener("campustrade-orders-seen", refreshSeenOrders); };
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    async function loadMessageNotices() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("messages").select("id").eq("receiver_id", user.id).is("read_at", null);
      setMessageNoticeCount(data?.length || 0);
      channel = supabase.channel(`navbar-messages-${user.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, loadMessageNotices).on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, loadMessageNotices).subscribe();
    }
    loadMessageNotices();
    const refreshMessages = () => loadMessageNotices();
    window.addEventListener("campustrade-messages-read", refreshMessages);
    return () => { if (channel) supabase.removeChannel(channel); window.removeEventListener("campustrade-messages-read", refreshMessages); };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Live search ONLY if we are already on a searchable page
    if (location.pathname === '/marketplace' || location.pathname === '/clubmerch') {
      debounceTimerRef.current = setTimeout(() => {
        setSearchParams(query ? { q: query } : {}, { replace: true });
      }, 300);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If we're not on a searchable page, redirect to marketplace to show results
    if (location.pathname !== '/marketplace' && location.pathname !== '/clubmerch') {
      navigate(`/marketplace?q=${encodeURIComponent(localQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => navigate("/marketplace")}
            className="text-2xl text-blue-600 cursor-pointer font-semibold hover:text-blue-700"
          >
            CampusTrade
          </button>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search items, categories..."
                className="pl-10"
                value={localQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/cart")} aria-label={`Open cart with ${itemCount} items`} className="relative">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 h-5 rounded-full bg-blue-600 px-1 text-xs leading-5 text-white">{itemCount}</span>}
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/messages")} aria-label={`Open messages with ${messageNoticeCount} unread`} className="relative">
              <MessageCircle className="h-4 w-4" />
              {messageNoticeCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 h-5 rounded-full bg-green-600 px-1 text-xs leading-5 text-white">{messageNoticeCount}</span>}
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/orders")} aria-label={`Open orders with ${orderNoticeCount} updates`} className="relative">
              <Bell className="h-4 w-4" />
              {orderNoticeCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 h-5 rounded-full bg-green-600 px-1 text-xs leading-5 text-white">{orderNoticeCount}</span>}
            </Button>
            <Button
              onClick={() => navigate("/create")}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Item
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
