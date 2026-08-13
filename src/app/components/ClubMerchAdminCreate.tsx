import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Package, Tag, DollarSign, Image as ImageIcon, Loader2, X, Plus } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

const clubOptions = [
  { value: "BoardGames", label: "BoardGames Club" },
  { value: "Yoga", label: "Yoga Club" },
  { value: "WorldHistory", label: "WorldHistory Club" },
  { value: "Music", label: "Music Club" },
  { value: "Photography", label: "Photography Club" },
];

export function ClubMerchAdminCreate() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [customClub, setCustomClub] = useState<string>("");
  
  // CHANGED: image_url to image_urls array
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image_urls: [] as string[]
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  // NEW: Handle array of images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `clubmerch_${Date.now()}_${i}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campus-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('campus-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setFormData(prev => ({ 
        ...prev, 
        image_urls: [...prev.image_urls, ...uploadedUrls] 
      }));
      
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Make sure your bucket is public!");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) {
      alert("Please select a club first!");
      return;
    }
    if (selectedClub === "other" && !customClub.trim()) {
      alert("Please enter the custom club name!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the real logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      const sellerId = session?.user?.id;

      if (!sellerId) {
        alert("You must be logged in to create a listing.");
        setIsSubmitting(false);
        return;
      }

      const finalClubName = selectedClub === "other" ? customClub.trim() : selectedClub;

      const { error } = await supabase.from('products').insert({
        seller_id: sellerId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        product_type: "clubmerch",
        club_name: finalClubName,
        image_urls: formData.image_urls, // Sending array
        status: "active"
      });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate("/clubmerch");
      }, 1200);

    } catch (error) {
      console.error("Error creating club merchandise:", error);
      alert("Failed to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Merchandise Admin</h1>
          <p className="text-gray-600">Use this flow to submit club merchandise listings.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Publish Club Merchandise</CardTitle>
          </CardHeader>
          <CardContent>
            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription>Club merchandise listing submitted!</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club" className="form-label">Club</Label>
                  <Select value={selectedClub} onValueChange={setSelectedClub} required>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubOptions.map((club) => (
                        <SelectItem key={club.value} value={club.value}>{club.label}</SelectItem>
                      ))}
                      <SelectItem value="other">Other (Type your own)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedClub === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="customClub" className="form-label">New Club Name</Label>
                    <Input id="customClub" value={customClub} onChange={(e) => setCustomClub(e.target.value)} required />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="form-label">Listing Title</Label>
                    <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="form-label">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="form-label">Price (RM)</Label>
                  <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="form-label">Description</Label>
                  <Textarea id="description" rows={5} value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
                </div>

                {/* NEW: Array Image Editor */}
                <div className="space-y-2">
                  <Label className="form-label">Club Merchandise Images</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center">
                    <div className="flex flex-wrap gap-4 mb-4 justify-center">
                      {formData.image_urls.map((url, idx) => (
                        <div key={idx} className="relative h-24 w-24 border rounded-md overflow-hidden bg-white shadow-sm">
                          <img src={url} alt="preview" className="h-full w-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Uploading...</>
                      ) : (
                        <><Plus className="h-5 w-5 mr-2" /> {formData.image_urls.length > 0 ? "Add More Photos" : "Choose Photos"}</>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting || formData.image_urls.length === 0 || !formData.title || !selectedClub || !formData.category || !formData.price}
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
                  ) : (
                    "Publish Club Merchandise"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
