import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, CheckCircle2, Image as ImageIcon, Package, Tag, DollarSign, FileText, Loader2, Save, ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase";

import { useNavigate, useParams } from "react-router-dom";

const clubOptions = [
  { value: "BoardGames", label: "BoardGames Club" },
  { value: "Yoga", label: "Yoga Club" },
  { value: "WorldHistory", label: "WorldHistory Club" },
  { value: "Music", label: "Music Club" },
  { value: "Photography", label: "Photography Club" },
];

export function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(true); // Default true since we are editing an existing item
  
  const [productType, setProductType] = useState<"secondhand" | "clubmerch">("secondhand");
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image_url: "",
    club_name: ""
  });

  // Fetch the existing product data
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        
        if (data) {
          setProductType(data.product_type || "secondhand");
          setFormData({
            title: data.title || "",
            category: data.category || "",
            price: data.price ? data.price.toString() : "",
            description: data.description || "",
            image_url: data.image_url || "",
            club_name: data.club_name || ""
          });
          setImageUploaded(!!data.image_url);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Could not load product details.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const prefix = productType === "clubmerch" ? "clubmerch_" : "";
      const fileName = `${prefix}${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campus-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('campus-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
      setImageUploaded(true);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    
    if (productType === "clubmerch" && !formData.club_name) {
      alert("Please select a club!");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatePayload: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
      };

      if (productType === "clubmerch") {
        updatePayload.club_name = formData.club_name;
      }

      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId);

      if (error) throw error;

      // Success! Navigate back to the product details page
      navigate(`/product/${productId}`);
      
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
        <p>Loading details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-blue-600 mb-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Editing
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Listing</h1>
          <p className="text-gray-600">Update the details of your item.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Package className="h-5 w-5 mr-3 text-blue-600" />
            Listing Information
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Conditional Club Selector */}
            {productType === "clubmerch" && (
              <div className="space-y-4 pb-4 border-b">
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="club" className="font-semibold text-gray-700">Club Name</Label>
                  <Select value={formData.club_name} onValueChange={(v) => handleInputChange("club_name", v)} required>
                    <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500">
                      <SelectValue placeholder="Select club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubOptions.map((club) => (
                        <SelectItem key={club.value} value={club.value}>{club.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold text-gray-700">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Listing Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., MacBook Pro 2020"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-white border-gray-300 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-gray-700">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="books"> 📚 Books & Textbooks</SelectItem>
                    <SelectItem value="electronics"> 💻 Electronics</SelectItem>
                    <SelectItem value="furniture"> 🪑 Furniture</SelectItem>
                    <SelectItem value="accessories"> 🎒 Accessories</SelectItem>
                    <SelectItem value="clothing"> 👕 Clothing</SelectItem>
                    <SelectItem value="other"> 📦 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold text-gray-700">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Price (RM)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="bg-white border-gray-300 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-gray-700">
                <FileText className="h-4 w-4 inline mr-2" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item..."
                rows={5}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-white border-gray-300 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">
                <ImageIcon className="h-4 w-4 inline mr-2" />
                Product Image
              </Label>
              
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center">
                {formData.image_url ? (
                  <div className="mb-4">
                    <img
                      src={formData.image_url}
                      alt="Current preview"
                      className="h-48 object-contain mx-auto rounded-md shadow-sm border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600">No image currently</p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="edit-image-upload"
                  disabled={isUploading}
                />
                <label 
                  htmlFor="edit-image-upload" 
                  className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    "Replace Image"
                  )}
                </label>
              </div>
            </div>

            <div className="pt-6 border-t flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                disabled={isSubmitting || !formData.title || !formData.category || !formData.price || !formData.description}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
