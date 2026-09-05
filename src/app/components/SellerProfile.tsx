import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";

interface Seller {
  full_name: string;
  student_id?: string | null;
  university?: string | null;
  course?: string | null;
  bio?: string | null;
  phone?: string | null;
}

export function SellerProfile() {
  const navigate = useNavigate();
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeller() {
      if (!sellerId) return;
      const { data } = await supabase.from("profiles").select("full_name, student_id, university, course, bio, phone").eq("id", sellerId).single();
      setSeller(data);
      setLoading(false);
    }
    loadSeller();
  }, [sellerId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>;
  if (!seller) return <div className="max-w-3xl mx-auto px-4 py-12 text-center">Seller profile not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 font-medium mb-6"><ArrowLeft className="h-4 w-4 mr-2" /> Back</button>
      <Card>
        <CardHeader className="border-b bg-blue-50/50"><div className="flex items-center gap-4"><div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="h-8 w-8" /></div><div><CardTitle>{seller.full_name}</CardTitle><p className="text-sm text-gray-500 mt-1">Campus seller</p></div></div></CardHeader>
        <CardContent className="p-6 space-y-5">
          {seller.bio && <div><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">About</h3><p className="mt-1 whitespace-pre-wrap text-gray-700">{seller.bio}</p></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><span className="font-medium text-gray-500">University</span><p className="text-gray-800">{seller.university || "Not provided"}</p></div><div><span className="font-medium text-gray-500">Course / Major</span><p className="text-gray-800">{seller.course || "Not provided"}</p></div><div><span className="font-medium text-gray-500">Student ID</span><p className="text-gray-800">{seller.student_id || "Not provided"}</p></div><div><span className="font-medium text-gray-500">Contact</span><p className="text-gray-800 flex items-center gap-2">{seller.phone ? <><Phone className="h-4 w-4" />{seller.phone}</> : <><Mail className="h-4 w-4" />Contact through chat</>}</p></div></div>
        </CardContent>
      </Card>
    </div>
  );
}