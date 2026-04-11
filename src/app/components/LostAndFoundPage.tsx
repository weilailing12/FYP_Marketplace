import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MapPin, Calendar, Search, PlusCircle, Megaphone } from "lucide-react";

interface LostFoundItem {
  id: string;
  type: "lost" | "found";
  title: string;
  location: string;
  date: string;
  image: string;
  description: string;
  contactName: string;
}

interface LostAndFoundPageProps {
  onNavigate: (page: string) => void;
}

export function LostAndFoundPage({ onNavigate }: LostAndFoundPageProps) {
  const [items] = useState<LostFoundItem[]>([
    {
      id: "1",
      type: "lost",
      title: "Blue Stanley Tumbler",
      location: "Block G Level 2",
      date: "Oct 24, 2025",
      image: "https://images.unsplash.com/photo-1701188339390-34896020589a?q=80&w=400",
      description: "Left it at the computer lab. Has a UTAR sticker on it.",
      contactName: "Kevin",
    },
    {
      id: "2",
      type: "found",
      title: "Silver House Keys",
      location: "Main Library Entrance",
      date: "Oct 25, 2025",
      image: "https://images.unsplash.com/photo-1621360058204-747353f40078?q=80&w=400",
      description: "Found near the turnstiles. Handed to security guard.",
      contactName: "Admin",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Megaphone className="text-blue-600" />
              Lost & Found
            </h1>
            <p className="text-gray-600">Help your fellow students recover their belongings.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 h-11" onClick={() => onNavigate('create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Report Lost/Found
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <LostFoundCard key={item.id} item={item} onNavigate={onNavigate} />
            ))}
          </TabsContent>
          
          <TabsContent value="lost" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.filter(i => i.type === 'lost').map((item) => (
              <LostFoundCard key={item.id} item={item} onNavigate={onNavigate} />
            ))}
          </TabsContent>

          <TabsContent value="found" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.filter(i => i.type === 'found').map((item) => (
              <LostFoundCard key={item.id} item={item} onNavigate={onNavigate} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Sub-component for the card to keep code clean
function LostFoundCard({ item, onNavigate }: { item: LostFoundItem, onNavigate: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm">
      <div className="flex h-44">
        <img src={item.image} className="w-1/3 object-cover" alt={item.title} />
        <CardContent className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
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
          <Button variant="ghost" className="w-full mt-2 text-blue-600 h-8 text-xs hover:bg-blue-50" onClick={() => onNavigate('chat')}>
            Contact {item.contactName}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}