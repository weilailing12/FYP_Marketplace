import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Upload, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

export function ReportLostFound() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [itemType, setItemType] = useState<"lost" | "found">("lost");
  const [userId, setUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    description: "",
    date: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        alert("You must be logged in to report an item.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // 1. Upload Image to Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('lost_and_found_images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          alert("Failed to upload image. Please make sure the 'lost_and_found_images' bucket exists and is public.");
          setIsSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('lost_and_found_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Insert into lost_and_found table
      const { error: insertError } = await supabase.from('lost_and_found').insert({
        type: itemType,          // The column I added
        item_type: itemType,     // The column your database originally had
        title: formData.name,
        location: formData.venue,
        date: formData.date,
        incident_date: formData.date, // The column your database originally had for dates
        description: formData.description,
        image_url: imageUrl,
        reporter_id: userId
      });

      if (insertError) throw insertError;

      // 3. Navigate back on success
      navigate('/lostfound');

    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Report Lost or Found Item</h1>
          <p className="text-gray-600">Help reunite students with their belongings</p>
        </div>

        <Card className="listing-card">
          <CardHeader>
            <CardTitle className="card-title">Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Item Type Selection */}
              <div className="form-section">
                <h3 className="section-title mb-4">Is this item Lost or Found?</h3>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={itemType === "lost" ? "default" : "outline"}
                    onClick={() => setItemType("lost")}
                    className={`h-16 text-lg font-semibold ${
                      itemType === "lost"
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    Lost Item
                  </Button>
                  <Button
                    type="button"
                    variant={itemType === "found" ? "default" : "outline"}
                    onClick={() => setItemType("found")}
                    className={`h-16 text-lg font-semibold ${
                      itemType === "found"
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    Found Item
                  </Button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title mb-4">Basic Information</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="form-label">
                      Item Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Blue Stanley Tumbler, Silver Keys"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue" className="form-label">
                      Venue / Location
                    </Label>
                    <Input
                      id="venue"
                      placeholder="e.g., Block G Level 2, Main Library Entrance"
                      value={formData.venue}
                      onChange={(e) => handleInputChange("venue", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date" className="form-label">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <h3 className="section-title mb-4">Description</h3>

                <div>
                  <Label htmlFor="description" className="form-label">
                    Item Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item in detail, including color, brand, any distinctive features, condition, etc."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-section">
                <h3 className="section-title mb-4">Item Photo</h3>

                <div className={`upload-zone ${imagePreview ? 'uploaded' : ''}`}>
                  {!imagePreview && (
                    <div className="upload-content">
                      <div className="upload-icon">
                        <Upload className="h-16 w-16 text-blue-500" />
                      </div>
                      <div className="upload-text">
                        <h4 className="upload-title">Upload Item Photo</h4>
                        <p className="upload-subtitle">
                          Select a photo from your device
                        </p>
                        <p className="upload-hint">
                          Supports JPG, PNG up to 10MB
                        </p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <Button type="button" className="upload-button" asChild>
                          <span>
                            <Plus className="h-4 w-4 mr-2" />
                            Choose Photo
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="upload-success">
                      <div className="success-preview">
                        <img
                          src={imagePreview}
                          alt="Uploaded preview"
                          className="preview-image"
                        />
                        <div className="success-overlay">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="success-content">
                        <h4 className="success-title">Photo Selected!</h4>
                        <p className="success-text">
                          Your photo has been selected and is ready
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => {setImageFile(null); setImagePreview(null);}}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Section */}
              <div className="form-section">
                <Alert className="publish-alert">
                  <Plus className="h-4 w-4" />
                  <AlertDescription>
                    Help reunite items with their owners. Submit your report now!
                  </AlertDescription>
                </Alert>

                <div className="publish-actions">
                  <Button
                    type="submit"
                    className="publish-button bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting || !formData.name || !formData.venue || !formData.description || !formData.date}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {isSubmitting ? "Submitting..." : "Submit Report"}
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
