import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, User, Loader2, Tag, Edit2, ShoppingCart, Check, ClipboardCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { supabase } from "../../supabase";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function ProductDetails() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which image is currently showing big
  const [mainImage, setMainImage] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [hasCompletedPreviousOrder, setHasCompletedPreviousOrder] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;

    async function fetchProductAndSeller() {
      if (!productId) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // NEW: Set the first image as the main display image automatically
        if (productData.image_urls && productData.image_urls.length > 0) {
          setMainImage(productData.image_urls[0]);
        }

        if (productData?.seller_id) {
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', productData.seller_id)
            .single();
          if (sellerData) setSeller(sellerData);
        }

        if (user && productData) {
          const { data: userOrders } = await supabase
            .from("orders")
            .select("id, status, created_at")
            .eq("product_id", productData.id)
            .eq("buyer_id", user.id)
            .order("created_at", { ascending: false });

          if (userOrders && userOrders.length > 0) {
            const activeOrder = userOrders.find(
              (order: any) => order.status === "pending" || order.status === "accepted"
            );
            const completedOrder = userOrders.find(
              (order: any) => order.status === "completed"
            );

            if (productData.product_type === "clubmerch") {
              if (activeOrder) {
                setOrderStatus(activeOrder.status);
                setHasCompletedPreviousOrder(false);
              } else {
                setOrderStatus(null);
                if (completedOrder) {
                  setHasCompletedPreviousOrder(true);
                }
              }
            } else {
              if (activeOrder) {
                setOrderStatus(activeOrder.status);
              } else if (completedOrder) {
                setOrderStatus("completed");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndSeller();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && productId) {
        channel = supabase
          .channel(`product-order-${productId}-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `product_id=eq.${productId}`,
            },
            () => {
              fetchProductAndSeller();
            }
          )
          .subscribe();
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [productId]);

  const placeOrder = async () => {
    if (!currentUser || !product || product.seller_id === currentUser.id || product.availability !== "available") return;
    setPlacingOrder(true);
    const { data: latestProduct, error: productError } = await supabase.from("products").select("availability, stock_quantity, product_type").eq("id", product.id).single();
    const availableStock = latestProduct?.stock_quantity ?? 1;
    if (productError || latestProduct?.availability !== "available" || availableStock < orderQuantity) {
      alert("This item is no longer available or does not have enough stock.");
      setProduct((current: any) => current ? { ...current, availability: latestProduct?.availability || "sold", stock_quantity: latestProduct?.stock_quantity ?? 0 } : current);
      setPlacingOrder(false);
      return;
    }
    const { data: order, error } = await supabase.from("orders").insert({ product_id: product.id, buyer_id: currentUser.id, seller_id: product.seller_id, quantity: orderQuantity, price: product.price * orderQuantity, status: "pending" }).select("status").single();
    if (error) {
      alert(error.message);
    } else {
      setOrderStatus(order.status);
      setHasCompletedPreviousOrder(false);
    }
    setPlacingOrder(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  if (!product) return <div className="flex justify-center py-20 text-xl font-bold">Item not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>
        {currentUser?.id === product.seller_id && (
          <Button variant="outline" onClick={() => navigate(`/edit/${product.id}`)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Listing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Large Image */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center h-[400px] md:h-[500px]">
            <img 
              src={mainImage || "https://via.placeholder.com/600"} 
              alt={product.title}
              className="object-contain w-full h-full"
            />
          </div>
          
          {/* Thumbnail Strip */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.image_urls.map((url: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setMainImage(url)}
                  className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    mainImage === url ? "border-blue-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Seller Info (Unchanged from your code) */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-sm">
              <Tag className="w-3 h-3 mr-1 inline" /> {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.title}</h1>
            <p className="text-4xl font-extrabold text-blue-600 mb-4">RM {product.price.toFixed(2)}</p>
            {product.product_type === "clubmerch" && <p className="text-sm font-medium text-gray-600 mb-4">{product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Out of stock"}</p>}
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">{product.description}</p>
          </div>

          <Card className="mt-auto border-blue-100 bg-blue-50/30">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Seller Information</h3>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4"><User className="h-6 w-6" /></div>
                  <div><button onClick={() => seller?.id && navigate(`/seller/${seller.id}`)} disabled={!seller} className="font-semibold text-gray-900 flex items-center text-lg hover:text-blue-600 disabled:hover:text-gray-900">{seller ? seller.full_name : "Campus Student"}</button></div>
                </div>
                <Button onClick={() => navigate(seller?.id ? `/chat/${seller.id}` : '#')} variant="outline" className="text-blue-600" disabled={!seller}><MessageCircle className="w-4 h-4 mr-2" /> Chat</Button>
              </div>
              <Button
                variant={isInCart(product.id) ? "outline" : "default"}
                className="w-full mb-5"
                onClick={() => addItem({ id: product.id, title: product.title, price: product.price, imageUrl: mainImage, sellerId: product.seller_id })}
                disabled={isInCart(product.id) || product.availability !== "available"}
              >
                {isInCart(product.id) ? <Check className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                {isInCart(product.id) ? "Saved in cart" : "Add to cart"}
              </Button>
              {product.product_type === "clubmerch" && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <label htmlFor="order-quantity" className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    id="order-quantity"
                    type="number"
                    min="1"
                    max={product.stock_quantity || 1}
                    value={orderQuantity}
                    onChange={(event) => setOrderQuantity(Math.min(product.stock_quantity || 1, Math.max(1, Number(event.target.value) || 1)))}
                    className="h-9 w-24 rounded-md border border-gray-300 px-3 text-center"
                    disabled={product.availability !== "available" || (product.stock_quantity ?? 0) <= 0 || !!orderStatus}
                  />
                </div>
              )}

              {hasCompletedPreviousOrder && product.product_type === "clubmerch" && !orderStatus && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-800">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Previous order completed!</span>
                    <p className="text-green-700 mt-0.5">You can place another order for this club merchandise while stock remains available.</p>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={placeOrder}
                disabled={
                  placingOrder ||
                  !!orderStatus ||
                  product.availability !== "available" ||
                  (product.product_type === "clubmerch" && (product.stock_quantity ?? 0) <= 0) ||
                  currentUser?.id === product.seller_id
                }
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                {orderStatus === "pending"
                  ? "Request sent"
                  : orderStatus === "accepted"
                  ? "Order accepted"
                  : orderStatus === "completed"
                  ? "Order completed"
                  : product.availability !== "available" || (product.product_type === "clubmerch" && (product.stock_quantity ?? 0) <= 0)
                  ? "Out of stock"
                  : placingOrder
                  ? "Sending request..."
                  : hasCompletedPreviousOrder && product.product_type === "clubmerch"
                  ? "Place Another Order"
                  : "Place Order"}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">This sends a request to the seller. Payment and meetup are arranged manually.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}