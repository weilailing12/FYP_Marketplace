import { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { supabase } from "../../supabase";

export function MarketplaceFeed() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // This function fetches the real data from Supabase!
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active') // Only show active items
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

  // Filter products based on search bar
  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="marketplace-container">
      {/* Search and Filter Header */}
      <div className="marketplace-header mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Search items, categories..." 
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your search or be the first to sell something!</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_url || "https://via.placeholder.com/400"} 
                    alt={product.title}
                    className="object-cover w-full h-full"
                  />
                  <Badge className="absolute top-3 right-3 bg-white/90 text-black hover:bg-white">
                    {product.category}
                  </Badge>
                </div>
                
                <CardHeader className="p-4 pb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                  <p className="text-2xl font-bold text-blue-600">RM {product.price.toFixed(2)}</p>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 flex-grow">
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 border-t border-gray-100 mt-4">
                  <Button className="w-full mt-4">
                    Message Seller
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}