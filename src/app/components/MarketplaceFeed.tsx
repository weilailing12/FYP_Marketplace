import { useState, useEffect } from "react";
import { Filter, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader } from "./ui/card";
import { supabase } from "../../supabase";

import { useNavigate, useSearchParams } from "react-router-dom";

export function MarketplaceFeed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get("q") || "";

  // This function fetches the real data from Supabase!
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('product_type', 'secondhand') // Only show secondhand items
          .eq('status', 'active') // Only show active items
          .eq('availability', 'available')
          .order('created_at', { ascending: false }); // Newest items first!

        if (error) throw error;

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Items" },
    { id: "books", label: "📚 Books" },
    { id: "electronics", label: "💻 Electronics" },
    { id: "fashion", label: "👕 Fashion" },
    { id: "furniture", label: "🪑 Furniture" },
    { id: "sports", label: "🏸 Sports" },
    { id: "other", label: "📦 Other" }
  ];

  // Filter products based on search bar and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      (product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="marketplace-container">
      {/* Category Pills and Search Indicator */}
      <div className="marketplace-header mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1 flex items-center">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full shrink-0">
              <span>Search: <strong>"{searchQuery}"</strong></span>
              <button 
                onClick={() => navigate("/marketplace")} 
                className="text-blue-500 hover:text-blue-900 font-bold ml-1"
                title="Clear search"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
          <p>Loading campus marketplace...</p>
        </div>
      ) : (
        /* The Product Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-3">Try adjusting your search or category filter, or be the first to sell something!</p>
              {(searchQuery || selectedCategory !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedCategory("all");
                    navigate("/marketplace");
                  }}
                  className="mt-1"
                >
                  Reset All Filters & Search
                </Button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 border border-gray-100 group cursor-pointer"
              >
                {/* 1. Just the Picture */}
                <div className="h-40 sm:h-48 relative overflow-hidden bg-gray-50">
                  <img
                    // Grabs the first image from the array, or falls back to a placeholder
                    src={(product.image_urls && product.image_urls.length > 0) ? product.image_urls[0] : "https://via.placeholder.com/400"}
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* 2. Just the Name (and Price) */}
                <CardHeader className="p-3">
                  <h3 className="font-medium text-sm sm:text-base line-clamp-2 leading-tight text-gray-800 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    RM {product.price.toFixed(2)}
                  </p>
                </CardHeader>

                {/* Notice that <CardContent> with the description is completely deleted! */}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}