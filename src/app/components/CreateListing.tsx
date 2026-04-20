import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, CheckCircle2, Plus, Image as ImageIcon, Sparkles, Package, Tag, DollarSign, FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../../supabase";

import { useNavigate } from "react-router-dom";

export function CreateListing() {
  const navigate = useNavigate();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Added image_url to hold the Supabase link
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image_url: "" 
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // The Magic Image Uploader
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // 1. Create a unique file name so images don't overwrite each other
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // 2. Upload the physical file to the bucket
      const { error: uploadError } = await supabase.storage
        .from('campus-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the public URL so anyone can see it
      const { data: publicUrlData } = supabase.storage
        .from('campus-images')
        .getPublicUrl(filePath);

      // 4. Save that URL to our form state
      setFormData(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
      setImageUploaded(true);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Make sure your bucket is named 'campus-images' and is Public!");
    } finally {
      setIsUploading(false);
    }
  };

  // The Magic Database Submitter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Trick for FYP: Automatically grab the first test profile from the database to act as the seller
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
      const sellerId = profiles?.[0]?.id;

      if (!sellerId) {
        alert("You need at least one user in your profiles table to sell an item!");
        setIsSubmitting(false);
        return;
      }

      // Insert the new product into the database!
      const { error } = await supabase.from('products').insert({
        seller_id: sellerId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        product_type: "secondhand",
        image_url: formData.image_url,
        status: "active"
      });

      if (error) throw error;

      // Success! Navigate back to the marketplace
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
              {/* Basic Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="section-title">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="form-label">
                      <Tag className="h-4 w-4 inline mr-2" />
                      Listing Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., MacBook Pro 2020 - Excellent Condition"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Product Type</span>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">Second-hand Item</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="form-label">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                      <SelectTrigger className="form-select">
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
                </div>
              </div>

              {/* Details Section */}
              <div className="form-section">
                <div className="section-header">
                  <Tag className="h-5 w-5 text-purple-600" />
                  <h3 className="section-title">Item Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="form-label">
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
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-6">
                  <Label htmlFor="description" className="form-label">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item, its condition, and any other relevant details..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="form-section">
                <div className="section-header">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <h3 className="section-title">Product Images</h3>
                </div>
                
                <div className={`upload-zone ${imageUploaded ? 'uploaded' : ''}`}>
                  {!imageUploaded && (
                    <div className="upload-content">
                      <div className="upload-icon">
                        {isUploading ? <Loader2 className="h-16 w-16 text-blue-500 animate-spin" /> : <Upload className="h-16 w-16 text-blue-500" />}
                      </div>
                      <div className="upload-text">
                        <h4 className="upload-title">{isUploading ? "Uploading to Cloud..." : "Upload Product Images"}</h4>
                        <p className="upload-subtitle">Select images from your device</p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          disabled={isUploading}
                        />
                        <Button type="button" className="upload-button" asChild disabled={isUploading}>
                          <span>
                            <Plus className="h-4 w-4 mr-2" />
                            {isUploading ? "Uploading..." : "Choose Files"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}

                  {imageUploaded && (
                    <div className="upload-success">
                      <div className="success-preview">
                        {/* Notice this now uses the REAL live URL from Supabase! */}
                        <img
                          src={formData.image_url}
                          alt="Uploaded preview"
                          className="preview-image"
                        />
                        <div className="success-overlay">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="success-content">
                        <h4 className="success-title">Image Successfully Uploaded!</h4>
                        <p className="success-text">Your image is securely stored in the cloud.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Publish Section */}
              <div className="form-section">
                <Alert className="publish-alert">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    Ready to publish? Your listing will be visible to all students on CampusTrade!
                  </AlertDescription>
                </Alert>
                <div className="publish-actions">
                  <Button
                    type="submit"
                    className="publish-button"
                    disabled={isSubmitting || !imageUploaded || !formData.title || !formData.category || !formData.price || !formData.description}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Publish Listing</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}