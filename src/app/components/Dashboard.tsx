import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Edit, Trash2, ShieldCheck } from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  image: string;
  status: "active" | "sold";
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "MacBook Pro 2020 - 16GB RAM",
    price: 1200,
    image: "https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2t8ZW58MXx8fHwxNzcyNzEwNjkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "active",
  },
  {
    id: "2",
    title: "Scientific Calculator TI-84",
    price: 80,
    image: "https://images.unsplash.com/photo-1684146771259-99b8b6089568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yJTIwc3R1ZHklMjBzdXBwbGllc3xlbnwxfHx8fDE3NzI3MjY2NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "active",
  },
  {
    id: "3",
    title: "Engineering Textbook Bundle",
    price: 150,
    image: "https://images.unsplash.com/photo-1731983568664-9c1d8a87e7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMHN0YWNrJTIwZGVza3xlbnwxfHx8fDE3NzI3MjY2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    status: "active",
  },
];

const mockChats = [
  {
    id: "1",
    buyer: "Sarah Chen",
    item: "MacBook Pro 2020",
    lastMessage: "Perfect! What time works for you?",
    time: "10:38 AM",
    unread: true,
  },
  {
    id: "2",
    buyer: "John Doe",
    item: "Scientific Calculator",
    lastMessage: "Is the price negotiable?",
    time: "Yesterday",
    unread: false,
  },
];

const mockPurchases = [
  {
    id: "1",
    title: "iPhone 13 Pro",
    price: 800,
    seller: "Mike Wang",
    date: "Feb 28, 2026",
    image: "https://images.unsplash.com/photo-1741061961703-0739f3454314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzcyNjI3NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "2",
    title: "Desk Lamp",
    price: 35,
    seller: "Lisa Tan",
    date: "Feb 15, 2026",
    image: "https://images.unsplash.com/photo-1621447980929-6638614633c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNrJTIwbGFtcCUyMHN0dWR5fGVufDF8fHx8MTc3MjcwOTEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl">John Doe</h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified Student
                  </Badge>
                </div>
                <p className="text-gray-600">student@utar.edu.my</p>
                <p className="text-sm text-gray-500 mt-1">Member since Jan 2025</p>
              </div>
              <Button variant="outline" onClick={() => onNavigate('profile')}>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="listings">Active Listings</TabsTrigger>
            <TabsTrigger value="chats">Pending Chats</TabsTrigger>
            <TabsTrigger value="purchases">Past Purchases</TabsTrigger>
          </TabsList>

          {/* Active Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {mockListings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="mb-1">{listing.title}</h3>
                      <p className="text-blue-600">RM {listing.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Pending Chats Tab */}
          <TabsContent value="chats" className="space-y-4">
            {mockChats.map((chat) => (
              <Card key={chat.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {chat.buyer.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{chat.buyer}</span>
                        {chat.unread && (
                          <Badge className="bg-red-500">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Re: {chat.item}</p>
                      <p className="text-sm text-gray-500">{chat.lastMessage}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {chat.time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Past Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            {mockPurchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={purchase.image}
                      alt={purchase.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="mb-1">{purchase.title}</h3>
                      <p className="text-sm text-gray-600">Seller: {purchase.seller}</p>
                      <p className="text-sm text-gray-500">Purchased on {purchase.date}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">RM {purchase.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
