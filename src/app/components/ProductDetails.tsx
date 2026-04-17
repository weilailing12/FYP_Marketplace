import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, ShieldCheck, MessageCircle, MapPin, Clock, Users } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  verified: boolean;
  category: string;
  productType: "secondhand" | "clubmerch";
  clubName?: string;
}

const mockProducts: Product[] = [
  { id: "1", title: "Engineering Textbook Bundle", price: 150, image: "https://images.unsplash.com/photo-1731983568664-9c1d8a87e7a2?q=80&w=1080", verified: true, category: "Books", productType: "secondhand" },
  { id: "2", title: "Scientific Calculator TI-84", price: 80, image: "https://images.unsplash.com/photo-1684146771259-99b8b6089568?q=80&w=1080", verified: true, category: "Electronics", productType: "secondhand" },
  { id: "3", title: "MacBook Pro 2020", price: 1200, image: "https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?q=80&w=1080", verified: true, category: "Electronics", productType: "secondhand" },
  { id: "4", title: "North Face Backpack", price: 60, image: "https://images.unsplash.com/photo-1655303219938-3a771279c801?q=80&w=1080", verified: true, category: "Accessories", productType: "secondhand" },
  { id: "5", title: "Modern Desk Lamp", price: 35, image: "https://images.unsplash.com/photo-1621447980929-6638614633c8?q=80&w=1080", verified: true, category: "Furniture", productType: "secondhand" },
  { id: "6", title: "Sony Noise-Cancelling Headphones", price: 180, image: "https://images.unsplash.com/photo-1762028892204-2ef68f7fcfd5?q=80&w=1080", verified: true, category: "Electronics", productType: "secondhand" },
  { id: "7", title: "iPhone 13 Pro", price: 800, image: "https://images.unsplash.com/photo-1741061961703-0739f3454314?q=80&w=1080", verified: true, category: "Electronics", productType: "secondhand" },
  { id: "8", title: "Business Statistics Textbook", price: 45, image: "https://images.unsplash.com/photo-1731983568664-9c1d8a87e7a2?q=80&w=1080", verified: true, category: "Books", productType: "secondhand" },
  { id: "9", title: "BoardGames Club T-Shirt", price: 25, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080", verified: true, category: "Clothing", productType: "clubmerch", clubName: "BoardGames" },
  { id: "10", title: "Yoga Club Hoodie", price: 45, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1080", verified: true, category: "Clothing", productType: "clubmerch", clubName: "Yoga" },
  { id: "11", title: "World History Club Notebook", price: 12, image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=1080", verified: true, category: "Accessories", productType: "clubmerch", clubName: "WorldHistory" },
  { id: "12", title: "Music Club Sticker Pack", price: 8, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1080", verified: true, category: "Accessories", productType: "clubmerch", clubName: "Music" },
  { id: "13", title: "Photography Club Keychain", price: 6, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1080", verified: true, category: "Accessories", productType: "clubmerch", clubName: "Photography" },
  { id: "14", title: "BoardGames Club Mug", price: 15, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?q=80&w=1080", verified: true, category: "Accessories", productType: "clubmerch", clubName: "BoardGames" },
  { id: "15", title: "Yoga Club Yoga Mat", price: 30, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1080", verified: true, category: "Other", productType: "clubmerch", clubName: "Yoga" },
  { id: "16", title: "World History Club Poster", price: 10, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1080", verified: true, category: "Other", productType: "clubmerch", clubName: "WorldHistory" },
  { id: "17", title: "Music Club Event Ticket", price: 20, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1080", verified: true, category: "Other", productType: "clubmerch", clubName: "Music" },
  { id: "18", title: "Photography Club Camera Strap", price: 18, image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=1080", verified: true, category: "Accessories", productType: "clubmerch", clubName: "Photography" },
];

const meetupZones = [
  {
    id: "1",
    name: "Main Library Entrance",
    description: "Safe and monitored area with security cameras",
    crowdLevel: "Medium",
    operatingHours: "8:00 AM - 10:00 PM",
    facilities: ["WiFi", "Seating", "Security"],
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400"
  },
  {
    id: "2",
    name: "Student Center Plaza",
    description: "Open public space with good lighting and visibility",
    crowdLevel: "High",
    operatingHours: "7:00 AM - 11:00 PM",
    facilities: ["WiFi", "Food Court", "ATM"],
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400"
  },
  {
    id: "3",
    name: "Block A Ground Floor Lobby",
    description: "Indoor lobby with security guard presence",
    crowdLevel: "Low",
    operatingHours: "6:00 AM - 12:00 AM",
    facilities: ["Elevator", "Restrooms", "Vending Machines"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400"
  },
  {
    id: "4",
    name: "Cafeteria Area",
    description: "Well-lit dining area with constant staff presence",
    crowdLevel: "High",
    operatingHours: "7:00 AM - 9:00 PM",
    facilities: ["Food", "Seating", "WiFi"],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400"
  },
  {
    id: "5",
    name: "Sports Complex Entrance",
    description: "Monitored entrance to sports facilities",
    crowdLevel: "Medium",
    operatingHours: "6:00 AM - 10:00 PM",
    facilities: ["Parking", "Lockers", "Showers"],
    image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=400"
  }
];

interface ProductDetailsProps {
  onNavigate: (page: string) => void;
  productId?: string;
}

export function ProductDetails({ onNavigate, productId }: ProductDetailsProps) {
  const [showChatModal, setShowChatModal] = useState(false);
  const product = mockProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="mb-4">Product not found</p>
          <Button onClick={() => onNavigate('marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const seller = {
    name: "Student Seller",
    avatar: product.title.substring(0, 2).toUpperCase(),
    rating: 4.5,
    totalRatings: 12,
    verified: product.verified,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => onNavigate('marketplace')}
          className="mb-4"
        >
          ← Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="relative">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white border shadow-sm">
              <img
                src={product.image}
                alt={product.title}
                className="object-cover w-full h-full"
              />
              <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-white px-3 py-2">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verified Real Photo
              </Badge>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              <p className="text-3xl font-bold text-blue-600">RM {product.price}</p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                This is a pre-owned {product.title} in excellent condition. 
                Perfect for students looking for quality at a reasonable price. 
                Meetups are available at campus safe zones.
              </p>
            </div>

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Seller Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {seller.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{seller.name}</span>
                      {seller.verified && (
                        <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                          Verified Student
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.floor(seller.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                            }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {seller.rating} ({seller.totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons Row */}
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                onClick={() => setShowChatModal(true)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with Seller
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat/Meetup Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Contact Seller</h2>
              <Button
                variant="ghost"
                onClick={() => setShowChatModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="flex h-[600px]">
              {/* Chat Zone */}
              <div className="flex-1 border-r p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Seller
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 h-[500px] flex flex-col">
                  <div className="flex-1 space-y-4 overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg p-3 max-w-[70%] shadow-sm">
                        <p className="text-sm">Hi! I'm interested in your {product?.title}. Is it still available?</p>
                        <span className="text-xs text-gray-500 mt-1 block">Seller • 2 min ago</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[70%]">
                        <p className="text-sm">Yes, it's still available! Would you like to meet up?</p>
                        <span className="text-xs opacity-75 mt-1 block">You • 1 min ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
                  </div>
                </div>
              </div>

              {/* Meetup Zones */}
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Safe Meetup Zones
                </h3>
                <div className="space-y-4 h-[500px] overflow-y-auto">
                  {meetupZones.map((zone) => (
                    <Card key={zone.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={zone.image}
                            alt={zone.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{zone.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{zone.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {zone.crowdLevel}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {zone.operatingHours}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {zone.facilities.map((facility) => (
                                <Badge key={facility} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setShowChatModal(false);
                            onNavigate('chat');
                          }}
                        >
                          Schedule Meetup Here
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}