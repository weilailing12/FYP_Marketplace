import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  productType: "secondhand" | "clubmerch";
  clubName?: string;
}

const mockProducts: Product[] = [
  // Club Merchandise only
  {
    id: "9",
    title: "BoardGames Club T-Shirt",
    price: 25,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0LXNoaXJ0JTIwY2x1YiUyMG1lcmNofGVufDF8fHx8MTc3MjcyNjUwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Clothing",
    productType: "clubmerch",
    clubName: "BoardGames",
  },
  {
    id: "10",
    title: "Yoga Club Hoodie",
    price: 45,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjB5b2dhJTIwY2x1Ynx8ZW58MXx8fHwxNzcyNzI2NTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Clothing",
    productType: "clubmerch",
    clubName: "Yoga",
  },
  {
    id: "11",
    title: "World History Club Notebook",
    price: 12,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RlYm9vayUyMGhpc3RvcnklMjBjbHVifGVufDF8fHx8MTc3MjcyNjUwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Accessories",
    productType: "clubmerch",
    clubName: "WorldHistory",
  },
  {
    id: "12",
    title: "Music Club Sticker Pack",
    price: 8,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGlja2VycyUyMG11c2ljJTIwY2x1Ynx8ZW58MXx8fHwxNzcyNzI2NTAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Accessories",
    productType: "clubmerch",
    clubName: "Music",
  },
  {
    id: "13",
    title: "Photography Club Keychain",
    price: 6,
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXljaGFpbiUyMHBob3RvZ3JhcGh5JTIwY2x1Ynx8ZW58MXx8fHwxNzcyNzI2NTA0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Accessories",
    productType: "clubmerch",
    clubName: "Photography",
  },
  {
    id: "14",
    title: "BoardGames Club Mug",
    price: 15,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWclMjBib2FyZGdhbWVzJTIwY2x1Ynx8ZW58MXx8fHwxNzcyNzI2NTA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Accessories",
    productType: "clubmerch",
    clubName: "BoardGames",
  },
  {
    id: "15",
    title: "Yoga Club Yoga Mat",
    price: 30,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHlvdGElMjBtYXQlMjB5b2dhJTIwY2x1Ynx8ZW58MXx8fHwxNzcyNzI2NTA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Other",
    productType: "clubmerch",
    clubName: "Yoga",
  },
  {
    id: "16",
    title: "World History Club Poster",
    price: 10,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3N0ZXIlMjBoaXN0b3J5JTIwY2x1Ynx8ZW58MXx8fHwxNzcyNzI2NTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Other",
    productType: "clubmerch",
    clubName: "WorldHistory",
  },
  {
    id: "17",
    title: "Music Club Event Ticket",
    price: 20,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHRpY2tldCUyMG11c2ljJTIwZXZlbnR8ZW58MXx8fHwxNzcyNzI2NTA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Other",
    productType: "clubmerch",
    clubName: "Music",
  },
  {
    id: "18",
    title: "Photography Club Camera Strap",
    price: 18,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfGNhbWVyYSUyMHN0cmFwJTIwcGhvdG9ncmFwaHklMjBjbHVifGVufDF8fHx8MTc3MjcyNjUwOXww&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    category: "Accessories",
    productType: "clubmerch",
    clubName: "Photography",
  },
];

import { useNavigate } from "react-router-dom";

export function ClubMerchPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClub, setSelectedClub] = useState("all");

  // Get unique clubs
  const clubs = Array.from(new Set(mockProducts.map(p => p.clubName).filter(Boolean))) as string[];

  // Filter products based on current filters
  const filteredProducts = mockProducts.filter((product) => {
    // Category filter
    if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory) {
      return false;
    }

    // Club filter
    if (selectedClub !== "all" && product.clubName !== selectedClub) {
      return false;
    }

    return true;
  });

  // Group products by club for display
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const club = product.clubName || "Other";
    if (!acc[club]) {
      acc[club] = [];
    }
    acc[club].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Merchandise</h1>
            <p className="text-gray-600">Support your favorite student clubs with exclusive merchandise</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/clubmerchcreate')}>
            Create Club Merchandise
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm mb-2 block">Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clubs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clubs</SelectItem>
                  {clubs.map((club) => (
                    <SelectItem key={club} value={club}>{club} Club</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Club Sections */}
        {Object.entries(groupedProducts).map(([clubName, products]) => (
          <div key={clubName} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{clubName} Club</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/product/${product.id}`)}
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
                    <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">
                      {product.clubName}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="line-clamp-1 mb-2">{product.title}</h3>
                    <p className="text-blue-600">RM {product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}