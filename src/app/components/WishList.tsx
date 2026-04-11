import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trash2, Bell, BellOff, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  priceAlert: boolean;
}

interface WishlistPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    {
      id: "3",
      title: "MacBook Pro 2020",
      price: 1200,
      image: "https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?q=80&w=1080",
      priceAlert: true,
    },
    {
      id: "6",
      title: "Sony Noise-Cancelling Headphones",
      price: 180,
      image: "https://images.unsplash.com/photo-1762028892204-2ef68f7fcfd5?q=80&w=1080",
      priceAlert: false,
    }
  ]);

  const toggleAlert = (id: string) => {
    setWishlist(wishlist.map(item => 
      item.id === id ? { ...item, priceAlert: !item.priceAlert } : item
    ));
  };

  const removeItem = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Your wishlist is empty.</p>
          ) : (
            wishlist.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <img src={item.image} className="w-24 h-24 object-cover rounded" alt={item.title} />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-blue-600 font-bold">RM {item.price}</p>
                    <Badge variant="secondary" className="mt-2">Price Drop Alert: {item.priceAlert ? "ON" : "OFF"}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => toggleAlert(item.id)}
                      className={item.priceAlert ? "text-orange-500 border-orange-200 bg-orange-50" : "text-gray-400"}
                    >
                      {item.priceAlert ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-500" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button className="bg-blue-600" onClick={() => onNavigate('product', item.id)}>
                      View Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}