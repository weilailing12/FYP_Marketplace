import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, CheckCircle2, Plus, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface ReportLostFoundProps {
  onNavigate: (page: string) => void;
}

export function ReportLostFound({ onNavigate }: ReportLostFoundProps) {
  const [imageUploaded, setImageUploaded] = useState(false);
  const [itemType, setItemType] = useState<"lost" | "found">("lost");
  const [formData, setFormData] = useState({
    name: "",
    venue: "",
    description: "",
    date: ""
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageUploaded(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate back to lost and found page after submitting
    setTimeout(() => {
      onNavigate('lostfound');
    }, 500);
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
                        ? "bg-red-600 hover:bg-red-700"
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
                        ? "bg-green-600 hover:bg-green-700"
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

                <div className={`upload-zone ${imageUploaded ? 'uploaded' : ''}`}>
                  {!imageUploaded && (
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

                  {imageUploaded && (
                    <div className="upload-success">
                      <div className="success-preview">
                        <img
                          src="https://images.unsplash.com/photo-1621360058204-747353f40078?q=80&w=400"
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
                    className="publish-button"
                    disabled={!imageUploaded || !formData.name || !formData.venue || !formData.description || !formData.date}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Report
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
