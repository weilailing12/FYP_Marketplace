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
  image_urls: string | string[];
  verified?: boolean;
  category: string;
  product_type: string;
  club_name?: string;
}

import { useNavigate, useSearchParams } from "react-router-dom";

// Helper to fix Supabase storage paths into full public URLs
const getValidImageUrl = (img: any): string => {
  let url = "";
  if (Array.isArray(img)) {
    url = img.length > 0 ? img[0] : "";
  } else if (typeof img === 'string') {
    let clean = img.trim();
    if (clean.startsWith('[')) {
      try {
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) url = parsed[0];
      } catch (e) { }
    } else if (clean.includes(',')) {
      url = clean.split(',')[0].trim();
    } else {
      url = clean;
    }
  }

  if (!url) return "https://via.placeholder.com/400";

  // If it's already a full web URL (including full Supabase URLs), return it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Otherwise, turn it into a full Supabase public URL 
  // (Replace 'your-bucket-name' with your actual Supabase storage bucket name if different, 
  // or your full supabase project URL storage endpoint)
  return `https://zqfhctembntccxlefpry.supabase.co/storage/v1/object/public/${url}`;
};
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
          console.log("Raw products fetched:", data);
          console.log("First product image_urls:", data[0]?.image_urls);
          const formattedData = data as Product[];
          setProducts(formattedData);
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
    <div className="clubmerch-container">
      {/* Floating decorative shapes */}
      <div className="profile-shape-1"></div>
      <div className="profile-shape-2"></div>
      <div className="profile-shape-3"></div>

      {/* Hero Section */}
      <div className="clubmerch-hero">
        <div className="hero-content">
          <h1 className="hero-title">Club Merchandise</h1>
          <p className="hero-subtitle">Support your favorite student clubs with exclusive merchandise</p>
        </div>
      </div>

      <div className="clubmerch-content pb-20">

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
                {products.map((product) => {
                  const imageUrl = getValidImageUrl(product.image_urls);
                  console.log(`Product: ${product.title}, ImageUrls: `, product.image_urls, "Final URL:", imageUrl);
                  return (
                  <Card
                    key={product.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error("Image failed to load:", imageUrl);
                          // If the image fails to load, fallback to placeholder instead of breaking
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400";
                        }}
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
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}