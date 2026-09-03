import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem } = useCart();
  const total = items.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 font-medium mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-7 w-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
      </div>

      {items.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
          <p className="text-gray-500 mb-5">Save items here while you decide what to buy.</p>
          <Button onClick={() => navigate("/marketplace")} className="bg-blue-600 hover:bg-blue-700">Browse marketplace</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <img src={item.imageUrl || "https://via.placeholder.com/120"} alt={item.title} className="h-20 w-20 rounded-md object-cover bg-gray-100" />
                <button onClick={() => navigate(`/product/${item.id}`)} className="flex-1 text-left">
                  <h2 className="font-semibold text-gray-900 hover:text-blue-600">{item.title}</h2>
                  <p className="font-bold text-blue-600 mt-1">RM {Number(item.price).toFixed(2)}</p>
                </button>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title} from cart`}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-between border-t pt-5">
            <span className="font-semibold text-gray-700">Saved items total</span>
            <span className="text-xl font-bold text-blue-600">RM {total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}