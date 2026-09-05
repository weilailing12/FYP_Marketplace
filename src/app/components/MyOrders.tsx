import { useEffect, useState } from "react";
import { Bell, Check, Clock3, MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Order { id: string; product_id: string; seller_id: string; price: number; status: string; created_at: string; updated_at: string; product?: { title: string }; seller?: { full_name: string }; }

export function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    const { data } = await supabase.from("orders").select("id, product_id, seller_id, price, status, created_at, updated_at").eq("buyer_id", user.id).order("updated_at", { ascending: false });
    const productIds = [...new Set((data || []).map((order) => order.product_id))];
    const sellerIds = [...new Set((data || []).map((order) => order.seller_id))];
    const [{ data: products }, { data: sellers }] = await Promise.all([
      productIds.length ? supabase.from("products").select("id, title").in("id", productIds) : Promise.resolve({ data: [] }),
      sellerIds.length ? supabase.from("profiles").select("id, full_name").in("id", sellerIds) : Promise.resolve({ data: [] }),
    ]);
    setOrders((data || []).map((order) => ({ ...order, product: products?.find((product) => product.id === order.product_id), seller: sellers?.find((seller) => seller.id === order.seller_id) })) as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    async function subscribe() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await loadOrders();
      channel = supabase.channel(`buyer-orders-${user.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` }, loadOrders).subscribe();
    }
    subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [navigate]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your orders...</div>;
  return <div className="max-w-4xl mx-auto px-4 py-8"><div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Bell className="h-7 w-7 text-blue-600" /> My Orders</h1><p className="text-gray-600 mt-1">Track your requests and seller responses.</p></div><div className="space-y-4">{orders.length === 0 && <Card><CardContent className="py-12 text-center text-gray-500">You have not placed any order requests.</CardContent></Card>}{orders.map((order) => <Card key={order.id} className={order.status === "accepted" ? "border-green-300" : order.status === "rejected" ? "border-red-200" : ""}><CardHeader className="pb-3"><CardTitle className="text-lg flex items-center justify-between gap-3"><span>{order.product?.title || "Product"}</span><Badge className={order.status === "accepted" || order.status === "completed" ? "bg-green-100 text-green-800" : order.status === "rejected" || order.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{order.status}</Badge></CardTitle></CardHeader><CardContent><p className="text-sm text-gray-600">Seller: {order.seller?.full_name || "Student"} · RM {Number(order.price).toFixed(2)}</p><p className="text-xs text-gray-400 mt-1">Updated {new Date(order.updated_at).toLocaleString()}</p>{order.status === "accepted" && <p className="text-sm text-green-700 mt-3 flex items-center gap-2"><Check className="h-4 w-4" /> Seller accepted. Message the seller to arrange payment and a meetup zone.</p>}{order.status === "pending" && <p className="text-sm text-yellow-700 mt-3 flex items-center gap-2"><Clock3 className="h-4 w-4" /> Waiting for the seller to respond.</p>}{order.status === "rejected" && <p className="text-sm text-red-700 mt-3 flex items-center gap-2"><X className="h-4 w-4" /> The seller rejected this request.</p>}<div className="flex gap-2 mt-4"><Button size="sm" variant="outline" onClick={() => navigate(`/chat/${order.seller_id}`)}><MessageCircle className="h-4 w-4 mr-1" /> Message seller</Button><Button size="sm" variant="ghost" onClick={() => navigate(`/product/${order.product_id}`)}>View product</Button></div></CardContent></Card>)}</div></div>;
}