import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Eye, EyeOff, Plus, Loader2, Edit } from "lucide-react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  price: number;
  image_urls?: any;
  category: string;
  status: string;
  club_name?: string;
}

export function ClubMerchAdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClubMerch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'clubmerch')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data as Product[]);
    } catch (error) {
      console.error("Error fetching club merchandise:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubMerch();
  }, []);

  const toggleVisibility = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'hidden' : 'active';
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', product.id);

      if (error) throw error;
      setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Merchandise Admin</h1>
          <p className="text-gray-600">Manage all club merchandise, hide items, or create new ones.</p>
        </div>
        <Button onClick={() => navigate('/clubmerchcreate')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Create New Item
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 text-blue-500 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No club merchandise found.</p>
          <Button onClick={() => navigate('/clubmerchcreate')} className="mt-4" variant="outline">Create your first item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <Card key={product.id} className={`overflow-hidden transition-all ${product.status === 'hidden' ? 'opacity-70 bg-gray-50' : 'bg-white'}`}>
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {/* CHANGED: Pulling first image from array */}
                    <img
                      src={
                        Array.isArray(product.image_urls)
                          ? product.image_urls[0]
                          : typeof product.image_urls === 'string' && product.image_urls.includes(',')
                            ? product.image_urls.split(',')[0].trim()
                            : product.image_urls || "https://via.placeholder.com/400"
                      }
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">{product.club_name || "Unknown Club"}</Badge>
                      {product.status === 'hidden' && <Badge variant="destructive">Hidden</Badge>}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.title}</h3>
                    <p className="text-blue-600 font-medium">RM {product.price}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${product.id}`)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant={product.status === 'active' ? "destructive" : "secondary"} size="sm" onClick={() => toggleVisibility(product)}>
                      {product.status === 'active' ? <><EyeOff className="w-4 h-4 mr-2" /> Hide</> : <><Eye className="w-4 h-4 mr-2" /> Show</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}