import { useEffect, useState } from "react";
import { Check, Clock3, Edit, Eye, Package, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface SellerProduct { id: string; title: string; price: number; status: string; availability: string; image_urls?: string[]; }
interface Order { id: string; product_id: string; buyer_id: string; price: number; status: string; created_at: string; product?: { title: string }; buyer?: { full_name: string }; }
interface Meetup { order_id: string; location: string | null; meetup_date: string | null; meetup_time: string | null; buyer_accepted: boolean; seller_accepted: boolean; status: string; }

export function SellerDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    setUserId(user.id);
    const [{ data: productData }, { data: orderData }] = await Promise.all([
      supabase.from("products").select("id, title, price, status, availability, image_urls").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("id, product_id, buyer_id, price, status, created_at").eq("seller_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProducts((productData || []) as SellerProduct[]);
    const buyerIds = [...new Set((orderData || []).map((order) => order.buyer_id))];
    const productIds = [...new Set((orderData || []).map((order) => order.product_id))];
    const [{ data: buyers }, { data: orderedProducts }] = await Promise.all([
      buyerIds.length ? supabase.from("profiles").select("id, full_name").in("id", buyerIds) : Promise.resolve({ data: [] }),
      productIds.length ? supabase.from("products").select("id, title").in("id", productIds) : Promise.resolve({ data: [] }),
    ]);
    setOrders((orderData || []).map((order) => ({
      ...order,
      product: orderedProducts?.find((product) => product.id === order.product_id),
      buyer: buyers?.find((buyer) => buyer.id === order.buyer_id),
    })) as Order[]);
    const { data: meetupData } = (orderData || []).length ? await supabase.from("meetup_proposals").select("order_id, location, meetup_date, meetup_time, buyer_accepted, seller_accepted, status").in("order_id", (orderData || []).map((order) => order.id)) : { data: [] };
    setMeetups((meetupData || []) as Meetup[]);
    setLoading(false);
  };

  useEffect(() => { loadDashboard(); }, [navigate]);

  const updateOrder = async (order: Order, status: "accepted" | "rejected" | "completed") => {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", order.id).eq("seller_id", userId);
    if (error) { alert(error.message); return; }
    if (status === "accepted") {
      await supabase.from("products").update({ availability: "sold" }).eq("id", order.product_id).eq("seller_id", userId);
      await supabase.from("orders").update({ status: "cancelled" }).eq("product_id", order.product_id).eq("status", "pending").neq("id", order.id);
    }
    await loadDashboard();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading seller dashboard...</div>;

  return <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
    <div><h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1><p className="text-gray-600 mt-1">Manage your listings and buyer requests.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-blue-600" /> Buyer Requests</CardTitle></CardHeader><CardContent className="space-y-3">
      {orders.length === 0 && <p className="text-gray-500 py-6 text-center">No order requests yet.</p>}
      {orders.map((order) => <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4"><div><p className="font-semibold">{order.product?.title || "Product"}</p><p className="text-sm text-gray-600">Requested by {order.buyer?.full_name || "Student"} · RM {Number(order.price).toFixed(2)}</p><p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p></div><div className="flex items-center gap-2"><Badge className={order.status === "accepted" ? "bg-green-100 text-green-800" : order.status === "rejected" || order.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{order.status}</Badge>{order.status === "pending" && <><Button size="sm" onClick={() => updateOrder(order, "accepted")} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-1" /> Accept</Button><Button size="sm" variant="outline" onClick={() => updateOrder(order, "rejected")}><X className="h-4 w-4 mr-1" /> Reject</Button></>}{order.status === "accepted" && <Button size="sm" variant="outline" onClick={() => updateOrder(order, "completed")}>Mark completed</Button>}<Button size="sm" variant="ghost" onClick={() => navigate(`/chat/${order.buyer_id}`)}>Message</Button></div></div>)}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Meetup Recommendations</CardTitle></CardHeader><CardContent className="space-y-3">{meetups.length === 0 && <p className="text-gray-500">No meetup proposal yet.</p>}{meetups.map((meetup) => <div key={meetup.order_id} className="rounded-lg border p-3 text-sm"><p>Location: {meetup.location || "Pickup location not set"}</p><p>Date: {meetup.meetup_date || "Pickup date not set"}</p><p>Time: {meetup.meetup_time?.slice(0, 5) || "Pickup time not set"}</p><p className="font-medium mt-1">Buyer: {meetup.buyer_accepted ? "Accepted" : "Waiting"} · Seller: {meetup.seller_accepted ? "Accepted" : "Waiting"}</p></div>)}</CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-blue-600" /> My Listings</CardTitle></CardHeader><CardContent className="space-y-3">
      {products.map((product) => <div key={product.id} className="flex items-center gap-3 border rounded-lg p-3"><img src={product.image_urls?.[0] || "https://via.placeholder.com/80"} alt="" className="h-14 w-14 rounded object-cover" /><div className="flex-1"><p className="font-semibold">{product.title}</p><p className="text-sm text-blue-600">RM {Number(product.price).toFixed(2)}</p></div><Badge variant="outline">{product.availability || "available"}</Badge><Button size="sm" variant="outline" onClick={() => navigate(`/product/${product.id}`)}><Eye className="h-4 w-4 mr-1" /> View</Button><Button size="sm" variant="outline" onClick={() => navigate(`/edit/${product.id}`)}><Edit className="h-4 w-4 mr-1" /> Edit</Button></div>)}
    </CardContent></Card>
  </div>;
}