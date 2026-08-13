import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, CheckCircle2, Plus, Image as ImageIcon, Sparkles, Package, Tag, DollarSign, FileText, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

export function CreateListing() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // CHANGED: image_url is now an array image_urls[]
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image_urls: [] as string[] 
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // NEW: Handles an array of files instead of just one
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedUrls: string[] = [];

      // Loop through every selected file and upload it
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
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

      // Add the new URLs to the existing array in state
      setFormData(prev => ({ 
        ...prev, 
        image_urls: [...prev.image_urls, ...uploadedUrls] 
      }));
      
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Check your bucket permissions.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sellerId = session?.user?.id;

      if (!sellerId) {
        alert("You must be logged in to create a listing.");
        setIsSubmitting(false);
        return;
      }

      // CHANGED: Sending image_urls array to the database
      const { error } = await supabase.from('products').insert({
        seller_id: sellerId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        product_type: "secondhand",
        image_urls: formData.image_urls, // Note the 's'
        status: "active"
      });

      if (error) throw error;
      navigate('/marketplace');
      
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-listing-container">
      {/* Hero Section */}
      <div className="listing-hero">
        <div className="hero-content">
          <h1 className="hero-title">Create New Listing</h1>
          <p className="hero-subtitle">Share your items with the campus community</p>
        </div>
      </div>

      <div className="listing-content">
        <Card className="listing-card">
          <CardHeader>
            <CardTitle className="card-title">
              <Package className="h-6 w-6 mr-3" />
              Listing Details
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section (Unchanged, skipped for brevity but keep your existing fields here) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="form-label">Listing Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="form-label">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="books">📚 Books</SelectItem>
                      <SelectItem value="electronics">💻 Electronics</SelectItem>
                      <SelectItem value="other">📦 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="form-label">Price (RM)</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="form-label">Description</Label>
                <Textarea id="description" rows={4} value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
              </div>

              {/* NEW: Image Upload Section */}
              <div className="form-section">
                <div className="section-header">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <h3 className="section-title">Product Images</h3>
                </div>
                
                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center">
                  <div className="flex flex-wrap gap-4 mb-4 justify-center">
                    {/* Display all uploaded images in a grid */}
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

                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple // ALLOWS MULTIPLE FILE SELECTION
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

              {/* Publish Section */}
              <div className="publish-actions flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  disabled={isSubmitting || formData.image_urls.length === 0 || !formData.title || !formData.category || !formData.price || !formData.description}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {isSubmitting ? "Publishing..." : "Publish Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}