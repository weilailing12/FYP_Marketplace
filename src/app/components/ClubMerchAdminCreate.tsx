import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Package, Tag, DollarSign, Image as ImageIcon, Loader2 } from "lucide-react";
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
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    image_url: ""
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `clubmerch_${Date.now()}.${fileExt}`;
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
      alert("Failed to upload image. Make sure your bucket is named 'campus-images' and is Public!");
    } finally {
      setIsUploading(false);
    }
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

    setIsSubmitting(true);

    try {
      // Get the mock seller ID
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
      const sellerId = profiles?.[0]?.id;

      if (!sellerId) {
        alert("You need at least one user in your profiles table to sell an item!");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('products').insert({
        seller_id: sellerId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        product_type: "clubmerch",
        club_name: selectedClub,
        image_url: formData.image_url,
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
          <p className="text-gray-600">Use this flow to submit club merchandise listings through an admin-approved club process.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Publish Club Merchandise</CardTitle>
          </CardHeader>
          <CardContent>
            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription>Club merchandise listing submitted! It will appear in the club catalogue after approval.</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club" className="form-label">Club</Label>
                  <Select value={selectedClub} onValueChange={setSelectedClub} required>
                    <SelectTrigger className="form-select">
                      <SelectValue placeholder="Select your club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubOptions.map((club) => (
                        <SelectItem key={club.value} value={club.value}>{club.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="form-label">Listing Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Club T-Shirt"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="form-label">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                      <SelectTrigger className="form-select">
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
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="00.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="form-label">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Enter product details, materials, sizing and availability"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="form-label">Club Merchandise Image</Label>
                  <div className={`upload-zone ${imageUploaded ? 'uploaded' : ''}`}>
                    {!imageUploaded ? (
                      <div className="upload-content">
                        <div className="upload-icon">
                          {isUploading ? <Loader2 className="h-16 w-16 text-blue-500 animate-spin" /> : <Upload className="h-16 w-16 text-blue-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{isUploading ? "Uploading..." : "Upload an image"}</p>
                          <p className="text-sm text-gray-500">Supported JPG/PNG, maximum 10MB.</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" id="club-image-upload" onChange={handleImageUpload} disabled={isUploading} />
                        <label htmlFor="club-image-upload" className={`mt-4 inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-white ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                          <ImageIcon className="h-4 w-4 mr-2" /> Choose File
                        </label>
                      </div>
                    ) : (
                      <div className="text-center">
                        <img src={formData.image_url} alt="Club merch preview" className="h-32 object-contain mx-auto mb-2 rounded-md border" />
                        <div className="text-sm text-green-700 font-medium">Image uploaded successfully!</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || !imageUploaded || !formData.title || !selectedClub || !formData.category || !formData.price}
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
