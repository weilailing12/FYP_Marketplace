import { useState } from "react";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Edit, Trash2, ShieldCheck, Star, X, CheckCircle2 } from "lucide-react";

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
  // --- RATING STATES ---
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleOpenRating = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowRatingModal(true);
    setRating(0);
    setComment("");
  };

  const submitRating = () => {
    // In a real app, this would fetch to app.py
    alert(`Rating submitted for ${selectedPurchase.seller}! \nStars: ${rating} \nComment: ${comment}`);
    setShowRatingModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar onNavigate={onNavigate} />

      {/* --- FEATURE 4: SELLER RATING MODAL --- */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Rate Seller: {selectedPurchase?.seller}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowRatingModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col items-center py-6 space-y-4">
                <p className="text-sm text-gray-500 text-center">How was your experience with this transaction?</p>
                
                {/* 5-Star Selection System */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(rating)}
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hover || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-100 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor="comment">Your Feedback (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience (e.g., prompt pickup, item condition matches description...)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                onClick={submitRating}
                disabled={rating === 0}
              >
                Submit Review
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header (Original Code) */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-600 text-white text-2xl">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl">John Doe</h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified Student
                  </Badge>
                </div>
                <p className="text-gray-600">student@utar.edu.my</p>
              </div>
              <Button variant="outline" onClick={() => onNavigate('profile')}>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="listings">Active Listings</TabsTrigger>
            <TabsTrigger value="chats">Pending Chats</TabsTrigger>
            <TabsTrigger value="purchases">Past Purchases</TabsTrigger>
          </TabsList>

          {/* ... (Active Listings & Chats Tabs stay the same) ... */}

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
                      <h3 className="mb-1 font-semibold">{purchase.title}</h3>
                      <p className="text-sm text-gray-600">Seller: {purchase.seller}</p>
                      <p className="text-sm text-gray-500">Purchased on {purchase.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-blue-600 font-bold text-lg">RM {purchase.price}</p>
                      
                      {/* Rating Button Logic */}
                      {purchase.rated ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Rated
                        </Badge>
                      ) : (
                        <Button 
                           variant="outline" 
                           size="sm" 
                           className="text-blue-600 border-blue-600 hover:bg-blue-50"
                           onClick={() => handleOpenRating(purchase)}
                        >
                          Rate Seller
                        </Button>
                      )}
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