import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, User, ShieldCheck, Clock, Loader2, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { supabase } from "../../supabase";

import { useNavigate, useParams } from "react-router-dom";

export function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductAndSeller() {
      if (!productId) return;
      
      try {
        // 1. Fetch the exact product that was clicked
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // 2. Fetch the profile of the student selling it
        if (productData?.seller_id) {
          const { data: sellerData, error: sellerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', productData.seller_id)
            .single();
            
          if (!sellerError && sellerData) {
            setSeller(sellerData);
          }
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndSeller();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
        <p>Loading item details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Item not found</h2>
        <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/marketplace')}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Image */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center h-[400px] md:h-[500px]">
          <img 
            src={product.image_url || "https://via.placeholder.com/600"} 
            alt={product.title}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Right Column: Details & Seller Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-sm">
              <Tag className="w-3 h-3 mr-1 inline" />
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {product.title}
            </h1>
            <p className="text-4xl font-extrabold text-blue-600 mb-4">
              RM {product.price.toFixed(2)}
            </p>
            
            <div className="flex items-center text-gray-500 text-sm space-x-4 mb-6 pb-6 border-b border-gray-100">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Posted recently
              </span>
              <span className="flex items-center">
                <Badge variant="outline" className="text-gray-600 bg-gray-50">
                  {product.product_type === 'secondhand' ? 'Second-hand' : 'Brand New'}
                </Badge>
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
              {product.description}
            </p>
          </div>

          {/* Seller Profile Card */}
          <Card className="mt-auto border-blue-100 bg-blue-50/30">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center text-lg">
                      {seller ? seller.full_name : "Campus Student"}
                      {seller?.is_verified && (
                        <ShieldCheck className="w-5 h-5 text-green-500 ml-1" title="Verified Student" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {seller?.student_id ? `Student ID: ${seller.student_id}` : "Unverified Member"}
                    </p>
                  </div>
                </div>
                
                {/* Notice how clicking this goes to your chat page! */}
                <Button onClick={() => navigate('/chat')} className="bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}