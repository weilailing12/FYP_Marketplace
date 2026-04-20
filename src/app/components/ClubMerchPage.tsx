import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "../../supabase";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  verified?: boolean;
  category: string;
  product_type: string;
  club_name?: string;
}

import { useNavigate, useSearchParams } from "react-router-dom";

export function ClubMerchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClub, setSelectedClub] = useState("all");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchClubMerch() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('product_type', 'clubmerch')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setProducts(data as Product[]);
        }
      } catch (error) {
        console.error("Error fetching club merchandise:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClubMerch();
  }, []);

  // Get unique clubs from fetched products
  const clubs = Array.from(new Set(products.map(p => p.club_name).filter(Boolean))) as string[];

  // Filter products based on current filters
  const filteredProducts = products.filter((product) => {
    // Search query filter
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory) {
      return false;
    }

    // Club filter
    if (selectedClub !== "all" && product.club_name !== selectedClub) {
      return false;
    }

    return true;
  });

  // Group products by club for display
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const club = product.club_name || "Other";
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="ml-4 text-lg text-gray-600">Loading club merchandise...</p>
          </div>
        ) : Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg border-2 border-dashed border-gray-200 rounded-xl">
            No club merchandise found matching your criteria.
          </div>
        ) : (
          Object.entries(groupedProducts).map(([clubName, products]) => (
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
                        src={product.image_url}
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
                        {product.club_name}
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
          ))
        )}
      </div>
    </div>
  );
}