import { useState } from "react";
import { Navbar } from "./Navbar";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ShieldCheck } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  verified: boolean;
  category: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Engineering Textbook Bundle",
    price: 150,
    image: "https://images.unsplash.com/photo-1731983568664-9c1d8a87e7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMHN0YWNrJTIwZGVza3xlbnwxfHx8fDE3NzI3MjY2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Books",
  },
  {
    id: "2",
    title: "Scientific Calculator TI-84",
    price: 80,
    image: "https://images.unsplash.com/photo-1684146771259-99b8b6089568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yJTIwc3R1ZHklMjBzdXBwbGllc3xlbnwxfHx8fDE3NzI3MjY2NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Electronics",
  },
  {
    id: "3",
    title: "MacBook Pro 2020",
    price: 1200,
    image: "https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2t8ZW58MXx8fHwxNzcyNzEwNjkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Electronics",
  },
  {
    id: "4",
    title: "North Face Backpack",
    price: 60,
    image: "https://images.unsplash.com/photo-1655303219938-3a771279c801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMHNjaG9vbCUyMGJhZ3xlbnwxfHx8fDE3NzI2NzgwODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Accessories",
  },
  {
    id: "5",
    title: "Modern Desk Lamp",
    price: 35,
    image: "https://images.unsplash.com/photo-1621447980929-6638614633c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNrJTIwbGFtcCUyMHN0dWR5fGVufDF8fHx8MTc3MjcwOTEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Furniture",
  },
  {
    id: "6",
    title: "Sony Noise-Cancelling Headphones",
    price: 180,
    image: "https://images.unsplash.com/photo-1762028892204-2ef68f7fcfd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW8lMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNjM4NjgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Electronics",
  },
  {
    id: "7",
    title: "iPhone 13 Pro",
    price: 800,
    image: "https://images.unsplash.com/photo-1741061961703-0739f3454314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzcyNjI3NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Electronics",
  },
  {
    id: "8",
    title: "Business Statistics Textbook",
    price: 45,
    image: "https://images.unsplash.com/photo-1731983568664-9c1d8a87e7a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMHN0YWNrJTIwZGVza3xlbnwxfHx8fDE3NzI3MjY2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Books",
  },
];

interface MarketplaceFeedProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function MarketplaceFeed({ onNavigate }: MarketplaceFeedProps) {
  const [showClubMerch, setShowClubMerch] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} currentPage="marketplace" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Category</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Price</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">RM 0 - RM 50</SelectItem>
                  <SelectItem value="50-200">RM 50 - RM 200</SelectItem>
                  <SelectItem value="200-500">RM 200 - RM 500</SelectItem>
                  <SelectItem value="500+">RM 500+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="club-merch"
                checked={showClubMerch}
                onCheckedChange={setShowClubMerch}
              />
              <Label htmlFor="club-merch" className="cursor-pointer">
                Club Merch Only
              </Label>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onNavigate('product', product.id)}
            >
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
                {product.verified && (
                  <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified Real Photo
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-1 mb-2">{product.title}</h3>
                <p className="text-blue-600">RM {product.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
