import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MapPin, Calendar, PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

interface LostFoundItem {
  id: string;
  type: "lost" | "found";
  title: string;
  location: string;
  date: string;
  image_url: string;
  description: string;
  reporter_id: string;
  profiles: {
    full_name: string;
  };
}

export function LostAndFoundPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
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
                  <LostFoundCard key={item.id} item={item} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="lost" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.filter(i => i.type === 'lost').map((item) => (
                <LostFoundCard key={item.id} item={item} />
              ))}
            </TabsContent>

            <TabsContent value="found" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.filter(i => i.type === 'found').map((item) => (
                <LostFoundCard key={item.id} item={item} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Sub-component for the card to keep code clean
function LostFoundCard({ item }: { item: LostFoundItem }) {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm bg-white">
      <div className="flex h-44">
        <div className="w-1/3 bg-gray-100 flex items-center justify-center overflow-hidden relative">
          {item.image_url ? (
            <img src={item.image_url} className="w-full h-full object-cover" alt={item.title} />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.title}</h3>
              <Badge className={item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                {item.type.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {item.location}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {item.date}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-blue-600 h-8 text-xs hover:bg-blue-50" 
            onClick={() => navigate(`/chat/${item.reporter_id}`)}
          >
            Contact {item.profiles?.full_name || 'Reporter'}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}