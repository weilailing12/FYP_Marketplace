import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, ShieldCheck, MessageCircle, Heart } from "lucide-react";

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

interface ProductDetailsProps {
  onNavigate: (page: string) => void;
  productId?: string;
}

export function ProductDetails({ onNavigate, productId }: ProductDetailsProps) {
  const product = mockProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onNavigate={onNavigate} />
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
      <Navbar onNavigate={onNavigate} />

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
                onClick={() => onNavigate('chat')}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with Seller
              </Button>

              <Button
                variant="outline"
                className="h-12 px-6 border-gray-300 hover:text-red-500 hover:border-red-500 transition-colors"
                onClick={() => alert("Added to Wishlist!")}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}