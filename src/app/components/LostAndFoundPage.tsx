import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MapPin, Calendar, PlusCircle, Loader2, ShieldCheck, Sparkles, CheckCircle2, MessageCircle } from "lucide-react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

interface LostFoundItem {
  id: string;
  type?: "lost" | "found";
  item_type?: "lost" | "found";
  title?: string;
  item_name?: string;
  location: string;
  date: string;
  image_url: string;
  description: string;
  status?: string;
  holding_location?: string;
  reporter_id: string;
  profiles: {
    full_name: string;
  };
}

export function LostAndFoundPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setCurrentUserId(sessionData.session.user.id);
        }

        const { data, error } = await supabase
          .from('lost_and_found')
          .select('*, profiles!lost_and_found_reporter_id_fkey(full_name)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching items:", error);
        } else if (data) {
          // Type assertion to match our interface since Supabase returns dynamic types
          setItems(data as unknown as LostFoundItem[]);
        }
      } catch (err) {
        console.error("Failed to load lost and found items", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

  const handleToggleStatus = async (item: LostFoundItem) => {
    const newStatus = item.status === 'returned' ? 'open' : 'returned';
    try {
      const { error } = await supabase
        .from('lost_and_found')
        .update({ status: newStatus })
        .eq('id', item.id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="lostfound-container">
      {/* Floating decorative shapes */}
      <div className="profile-shape-1"></div>
      <div className="profile-shape-2"></div>
      <div className="profile-shape-3"></div>

      {/* Hero Section */}
      <div className="lostfound-hero">
        <div className="hero-content">
          <h1 className="hero-title">Lost & Found</h1>
          <p className="hero-subtitle">Help your fellow students recover their belongings</p>
        </div>
      </div>

      <div className="lostfound-content pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-8">
          <Button className="bg-blue-600 hover:bg-blue-700 h-11 shadow-lg text-white" onClick={() => navigate('/reportlostfound')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Report Lost/Found
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
            <p>Loading items...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="lost">Lost Items</TabsTrigger>
              <TabsTrigger value="found">Found Items</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                  <p className="text-lg font-medium">No items reported yet</p>
                </div>
              ) : (
                items.map((item) => (
                  <LostFoundCard key={item.id} item={item} currentUserId={currentUserId} onToggleStatus={handleToggleStatus} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="lost" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.filter(i => (i.type || i.item_type) === 'lost').map((item) => (
                <LostFoundCard key={item.id} item={item} currentUserId={currentUserId} onToggleStatus={handleToggleStatus} />
              ))}
            </TabsContent>

            <TabsContent value="found" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.filter(i => (i.type || i.item_type) === 'found').map((item) => (
                <LostFoundCard key={item.id} item={item} currentUserId={currentUserId} onToggleStatus={handleToggleStatus} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Sub-component for the card to keep code clean
function LostFoundCard({ 
  item, 
  currentUserId,
  onToggleStatus
}: { 
  item: LostFoundItem; 
  currentUserId: string | null;
  onToggleStatus: (item: LostFoundItem) => void;
}) {
  const navigate = useNavigate();
  const isFound = (item.type || item.item_type) === 'found';
  const isReporter = currentUserId ? currentUserId === item.reporter_id : false;
  const isReturned = item.status === 'returned';

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm bg-white ${isReturned ? 'opacity-85' : ''}`}>
      <div className="flex h-48 sm:h-44">
        <div className="w-1/3 bg-gray-100 flex items-center justify-center overflow-hidden relative">
          {item.image_url ? (
            <img src={item.image_url} className="w-full h-full object-cover" alt={item.title || item.item_name} />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
          {isReturned && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
              <Badge className="bg-emerald-600 text-white border-none text-[10px] py-0.5 shadow">
                Reunited 🎉
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-1 mb-1">
              <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-1">{item.title || item.item_name}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <Badge className={isFound ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                  {isFound ? 'FOUND' : 'LOST'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 mt-1.5">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-blue-500 shrink-0" /> <span className="truncate">{item.location}</span>
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400 shrink-0" /> <span>{item.date}</span>
              </p>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
          </div>
          
          {isReporter ? (
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant={isReturned ? "outline" : "default"}
                className={`flex-1 h-8 text-xs font-medium ${
                  isReturned 
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                onClick={() => onToggleStatus(item)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {isReturned ? "Reopen" : "Mark Reunited 🎉"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs font-medium"
                onClick={() => navigate("/messages")}
                title="View student inquiries in Messages"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1 text-blue-600" />
                Inquiries
              </Button>
            </div>
          ) : (
            <Button 
              variant={isFound ? "default" : "secondary"}
              className={`w-full mt-2 h-8 text-xs font-medium flex items-center justify-center gap-1.5 ${
                isFound 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`} 
              onClick={() => navigate(`/lostfound/chat/${item.reporter_id}?itemId=${item.id}`)}
            >
              {isFound ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Claim This Item
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  I Found This!
                </>
              )}
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
}