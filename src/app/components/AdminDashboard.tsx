import { useState, useEffect, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, Package, Megaphone, ShieldAlert, EyeOff, Eye, Loader2, Plus, Edit, Store, FileText, Trash2 } from "lucide-react";
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
  image_urls?: string | string[];
  profiles?: {
    full_name: string;
  };
}

interface ClubMerchProduct {
  id: string;
  title: string;
  price: number;
  image_urls?: any;
  category: string;
  status: string;
  club_name?: string;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  pdf_url?: string | null;
  image_url?: string | null;
  is_published: boolean;
  created_at: string;
}

// ---------------------------------------------------------
// HELPER FUNCTION FOR MARKETPLACE IMAGES
// ---------------------------------------------------------
const getFirstImageUrl = (imageUrls: any): string => {
  console.log("getFirstImageUrl input:", imageUrls, "type:", typeof imageUrls);
  
  if (!imageUrls) return "https://via.placeholder.com/50";

  let url = "";

  // Case 1: Already an array
  if (Array.isArray(imageUrls)) {
    url = imageUrls.length > 0 ? imageUrls[0] : "";
  } 
  // Case 2: String (could be JSON array, CSV, or direct URL)
  else if (typeof imageUrls === 'string') {
    let clean = imageUrls.trim();
    
    // Try to parse as JSON array first
    if (clean.startsWith('[')) {
      try {
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          url = parsed[0];
        }
      } catch (e) { 
        console.warn("Failed to parse JSON array:", clean);
      }
    } 
    // Try to split by comma
    else if (clean.includes(',')) {
      url = clean.split(',')[0].trim();
    } 
    // Use as direct URL
    else {
      url = clean;
    }
  }

  if (!url) {
    console.warn("No valid URL found, returning placeholder");
    return "https://via.placeholder.com/50";
  }

  // Ensure it's a valid URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn("URL doesn't start with http, returning placeholder:", url);
    return "https://via.placeholder.com/50";
  }

  console.log("Final URL:", url);
  return url;
};

// ---------------------------------------------------------
// HELPER FUNCTION FOR CLUB MERCH IMAGES
// ---------------------------------------------------------
const getClubMerchImageUrl = (imageUrls: any): string => {
  if (!imageUrls) return "https://via.placeholder.com/400";

  let url = "";
  
  if (Array.isArray(imageUrls)) {
    url = imageUrls.length > 0 ? imageUrls[0] : "";
  } else if (typeof imageUrls === 'string') {
    let clean = imageUrls.trim();
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

  return url || "https://via.placeholder.com/400";
};


export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [clubMerchProducts, setClubMerchProducts] = useState<ClubMerchProduct[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [announcementPdf, setAnnouncementPdf] = useState<File | null>(null);
  const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

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
      const [usersResponse, productsResponse, clubMerchResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, profiles(full_name)').order('created_at', { ascending: false }),
        supabase.from('products').select('*').eq('product_type', 'clubmerch').order('created_at', { ascending: false })
      ]);
      const announcementsResponse = await supabase.from("announcements").select("*").order("created_at", { ascending: false });

      if (usersResponse.data) setUsers(usersResponse.data);
      if (productsResponse.data) {
        console.log("CHECK PRODUCTS DATA:", productsResponse.data);
        setProducts(productsResponse.data);
      }
      if (clubMerchResponse.data) {
        console.log("CHECK CLUB MERCH DATA:", clubMerchResponse.data);
        setClubMerchProducts(clubMerchResponse.data as ClubMerchProduct[]);
      }
      if (announcementsResponse.data) setAnnouncements(announcementsResponse.data as Announcement[]);

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

  // Admin function to toggle club merch visibility
  const toggleClubMerchStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;

      // Update the UI instantly
      setClubMerchProducts(clubMerchProducts.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to update status.");
    }
  };

  const createAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    if (!announcementTitle.trim() || !announcementDescription.trim()) return;
    setSavingAnnouncement(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");
      let pdfUrl: string | null = null;
      let imageUrl: string | null = null;
      if (announcementImage) {
        const imagePath = `announcements/${Date.now()}-${announcementImage.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage.from("campus-images").upload(imagePath, announcementImage, { upsert: false });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("campus-images").getPublicUrl(imagePath).data.publicUrl;
      }
      if (announcementPdf) {
        const filePath = `announcements/${Date.now()}-pdf-${announcementPdf.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage.from("campus-images").upload(filePath, announcementPdf, { upsert: false });
        if (uploadError) throw uploadError;
        pdfUrl = supabase.storage.from("campus-images").getPublicUrl(filePath).data.publicUrl;
      }
      const existingAnnouncement = announcements.find((item) => item.id === editingAnnouncementId);
      const announcementValues = {
        title: announcementTitle.trim(),
        description: announcementDescription.trim(),
        pdf_url: pdfUrl || existingAnnouncement?.pdf_url || null,
        image_url: imageUrl || existingAnnouncement?.image_url || null,
      };
      const query = editingAnnouncementId
        ? supabase.from("announcements").update(announcementValues).eq("id", editingAnnouncementId).select().single()
        : supabase.from("announcements").insert({ ...announcementValues, created_by: user.id, is_published: true }).select().single();
      const { data, error } = await query;
      if (error) throw error;
      setAnnouncements((current) => editingAnnouncementId
        ? current.map((item) => item.id === editingAnnouncementId ? data as Announcement : item)
        : [data as Announcement, ...current]);
      setAnnouncementTitle("");
      setAnnouncementDescription("");
      setAnnouncementPdf(null);
      setAnnouncementImage(null);
      setEditingAnnouncementId(null);
      document.querySelectorAll<HTMLInputElement>("#announcement-pdf, #announcement-image").forEach((input) => { input.value = ""; });
    } catch (error: any) {
      alert(error.message || "Failed to publish announcement.");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementTitle(announcement.title);
    setAnnouncementDescription(announcement.description);
    setAnnouncementPdf(null);
    setAnnouncementImage(null);
    document.getElementById("announcement-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const cancelAnnouncementEdit = () => {
    setEditingAnnouncementId(null);
    setAnnouncementTitle("");
    setAnnouncementDescription("");
    setAnnouncementPdf(null);
    setAnnouncementImage(null);
    document.querySelectorAll<HTMLInputElement>("#announcement-pdf, #announcement-image").forEach((input) => { input.value = ""; });
  };

  const toggleAnnouncement = async (announcement: Announcement) => {
    const { error } = await supabase.from("announcements").update({ is_published: !announcement.is_published }).eq("id", announcement.id);
    if (error) { alert(error.message); return; }
    setAnnouncements((current) => current.map((item) => item.id === announcement.id ? { ...item, is_published: !item.is_published } : item));
  };

  const deleteAnnouncement = async (announcement: Announcement) => {
    if (!window.confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", announcement.id);
    if (error) { alert(error.message); return; }
    setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
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
  const secondHandProducts = products.filter(p => p.product_type !== 'clubmerch' && p.status === 'active').length;
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
          <TabsTrigger value="clubmerch">Club Merchandise</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
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
                  <p className="text-sm font-medium text-gray-500">Active Second-Hand Items</p>
                  <h3 className="text-3xl font-bold text-gray-900">{secondHandProducts}</h3>
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
            <CardHeader><CardTitle>Listing Moderation - Second-Hand Products</CardTitle></CardHeader>
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
                    {products.filter(p => p.product_type !== 'clubmerch').map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img
                            src={getFirstImageUrl(product.image_urls)}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded border"
                            onError={(e) => {
                              console.error("IMAGE FAILED TO LOAD:", (e.target as HTMLImageElement).src);
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/50";
                            }}
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

        {/* TAB 4: Club Merchandise Management */}
        <TabsContent value="clubmerch">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Club Merchandise Management</CardTitle>
                <Button onClick={() => navigate('/clubmerchcreate')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" /> Create New Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clubMerchProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-lg mb-4">No club merchandise found.</p>
                  <Button onClick={() => navigate('/clubmerchcreate')} variant="outline">
                    Create your first item
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {clubMerchProducts.map((product) => (
                    <Card key={product.id} className={`overflow-hidden transition-all ${product.status === 'hidden' ? 'opacity-70 bg-gray-50' : 'bg-white'}`}>
                      <CardContent className="p-0">
                        <div className="flex items-center p-4">
                          <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={getClubMerchImageUrl(product.image_urls)}
                              alt={product.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400";
                              }}
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
                            <Button variant={product.status === 'active' ? "destructive" : "secondary"} size="sm" onClick={() => toggleClubMerchStatus(product.id, product.status)}>
                              {product.status === 'active' ? <><EyeOff className="w-4 h-4 mr-2" /> Hide</> : <><Eye className="w-4 h-4 mr-2" /> Show</>}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: System Announcements */}
        <TabsContent value="announcements">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
            <Card>
              <CardHeader><CardTitle>{editingAnnouncementId ? "Edit Announcement" : "Post Announcement"}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={createAnnouncement} className="space-y-4">
                  <div><label htmlFor="announcement-title" className="text-sm font-medium">Title</label><input id="announcement-title" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" required /></div>
                  <div><label htmlFor="announcement-description" className="text-sm font-medium">Description</label><textarea id="announcement-description" value={announcementDescription} onChange={(event) => setAnnouncementDescription(event.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 min-h-28" required /></div>
                  <div><label htmlFor="announcement-image" className="text-sm font-medium">Thumbnail image (optional)</label><input id="announcement-image" type="file" accept="image/*" onChange={(event) => setAnnouncementImage(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" /></div>
                  <div><label htmlFor="announcement-pdf" className="text-sm font-medium">PDF attachment (optional)</label><input id="announcement-pdf" type="file" accept="application/pdf" onChange={(event) => setAnnouncementPdf(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" /></div>
                  <div className="flex items-center gap-2"><Button type="submit" disabled={savingAnnouncement} className="bg-blue-600 hover:bg-blue-700"><Megaphone className="h-4 w-4 mr-2" />{savingAnnouncement ? "Saving..." : editingAnnouncementId ? "Save changes" : "Publish announcement"}</Button>{editingAnnouncementId && <Button type="button" variant="outline" onClick={cancelAnnouncementEdit}>Cancel</Button>}</div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Published and Draft Announcements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 && <p className="text-gray-500 py-8 text-center">No announcements yet.</p>}
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">{announcement.image_url && <img src={announcement.image_url} alt="" className="h-14 w-14 rounded object-cover" />}<div className="flex-1"><h3 className="font-semibold">{announcement.title}</h3><p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{announcement.description}</p></div><Badge className={announcement.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>{announcement.is_published ? "Published" : "Draft"}</Badge></div>
                    <div className="flex items-center gap-2 mt-3"><Button size="sm" variant="outline" onClick={() => editAnnouncement(announcement)}><Edit className="h-4 w-4 mr-1" /> Edit</Button><Button size="sm" variant="outline" onClick={() => toggleAnnouncement(announcement)}>{announcement.is_published ? <><EyeOff className="h-4 w-4 mr-1" /> Unpublish</> : <><Eye className="h-4 w-4 mr-1" /> Publish</>}</Button>{announcement.pdf_url && <a href={announcement.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 px-2"><FileText className="h-4 w-4 mr-1" /> PDF</a>}<Button size="sm" variant="ghost" onClick={() => deleteAnnouncement(announcement)} aria-label={`Delete ${announcement.title}`}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}