import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, ShieldCheck, MessageCircle } from "lucide-react";

interface ProductDetailsProps {
  onNavigate: (page: string) => void;
  productId?: string;
}

export function ProductDetails({ onNavigate, productId }: ProductDetailsProps) {
  // Mock product data
  const product = {
    id: productId || "1",
    title: "MacBook Pro 2020 - 16GB RAM, 512GB SSD",
    price: 1200,
    image: "https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2t8ZW58MXx8fHwxNzcyNzEwNjkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Selling my MacBook Pro in excellent condition. Used for 2 years during my Computer Science degree. Comes with original charger and box. Battery health is at 87%. No scratches or dents. Perfect for students or professionals. Upgraded to a newer model, so selling this one. Can meet on campus for safe exchange.",
    seller: {
      name: "Sarah Chen",
      avatar: "SC",
      rating: 4.8,
      totalRatings: 24,
      verified: true,
    },
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
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
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
              <h1 className="text-4xl mb-4">{product.title}</h1>
              <p className="text-3xl text-blue-600">RM {product.price}</p>
            </div>

            <div>
              <h2 className="text-xl mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg mb-4">Seller Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {product.seller.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{product.seller.name}</span>
                      {product.seller.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Student
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.floor(product.seller.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {product.seller.rating} ({product.seller.totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              onClick={() => onNavigate('chat')}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat with Seller
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
