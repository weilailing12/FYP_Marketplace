import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, Package, Megaphone, ShieldAlert, EyeOff, Eye, Loader2, Store } from "lucide-react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
}

interface ProductInfo {
  id: string;
  title: string;
  price: number;
  product_type: string;
  status: string;
  seller_id: string;
  image_url?: string;
  profiles?: {
    full_name: string;
  };
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]);

  useEffect(() => {
    async function fetchAdminData() {
      // 1. Security Check: Ensure current user is an admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!myProfile?.is_admin) {
        alert("Access Denied: You are not an administrator.");
        navigate('/marketplace');
        return;
      }

      // 2. Fetch all users and products simultaneously
      const [usersResponse, productsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, profiles(full_name)').order('created_at', { ascending: false })
      ]);

      if (usersResponse.data) setUsers(usersResponse.data);
      if (productsResponse.data) setProducts(productsResponse.data);

      setLoading(false);
    }

    fetchAdminData();
  }, [navigate]);

  // Admin function to hide inappropriate listings
  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;

      // Update the UI instantly
      setProducts(products.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update listing status.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Loading System Dashboard...</p>
      </div>
    );
  }

  // Calculate Metrics
  const activeProducts = products.filter(p => p.status === 'active').length;
  const clubMerchCount = products.filter(p => p.product_type === 'clubmerch').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShieldAlert className="h-8 w-8 mr-3 text-blue-600" />
          Master Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Manage users, moderate marketplace listings, and handle official university announcements.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border shadow-sm p-1">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="products">Listing Moderation</TabsTrigger>
          <TabsTrigger value="actions">System Actions</TabsTrigger>
        </TabsList>

        {/* TAB 1: System Overview (Metrics) */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-4 bg-blue-100 rounded-full text-blue-600"><Users className="h-8 w-8" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Registered Users</p>
                  <h3 className="text-3xl font-bold text-gray-900">{users.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-4 bg-green-100 rounded-full text-green-600"><Package className="h-8 w-8" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Listings</p>
                  <h3 className="text-3xl font-bold text-gray-900">{activeProducts}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-4 bg-purple-100 rounded-full text-purple-600"><Store className="h-8 w-8" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Club Merch Items</p>
                  <h3 className="text-3xl font-bold text-gray-900">{clubMerchCount}</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Registered Students</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3">{user.student_id || "N/A"}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          {user.is_admin ? (
                            <Badge className="bg-purple-100 text-purple-800 border-none">Admin</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">Student</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Product Moderation */}
        <TabsContent value="products">
          <Card>
            <CardHeader><CardTitle>Marketplace Moderation</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                      <th className="px-4 py-3">Image</th>
                      <th className="px-4 py-3">Item Title</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img
                            src={product.image_url || "https://via.placeholder.com/50"}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded border"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] whitespace-normal break-words">
                          {product.title}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {product.profiles?.full_name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 capitalize">{product.product_type}</td>
                        <td className="px-4 py-3">RM {product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge className={product.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-transparent' : 'bg-red-100 text-red-800 hover:bg-red-200 border-transparent'}>
                            {product.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant={product.status === 'active' ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => toggleProductStatus(product.id, product.status)}
                          >
                            {product.status === 'active' ? <><EyeOff className="h-4 w-4 mr-1" /> Hide</> : <><Eye className="h-4 w-4 mr-1" /> Restore</>}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Quick Actions */}
        <TabsContent value="actions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <Store className="h-5 w-5 mr-2" /> Manage Club Merch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Add new official merchandise on behalf of university clubs and societies.</p>
                <Button onClick={() => navigate('/clubmerchcreate')} className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Club Merch Creator
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Megaphone className="h-5 w-5 mr-2" /> System Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Broadcast global announcements to all students on the platform homepage.</p>
                <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                  Post Announcement (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}