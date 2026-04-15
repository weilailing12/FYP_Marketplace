import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Upload, Loader2, CheckCircle2, Plus, X, Image as ImageIcon, Sparkles, Package, Tag, DollarSign, FileText } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface CreateListingProps {
  onNavigate: (page: string) => void;
}

export function CreateListing({ onNavigate }: CreateListingProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [productType, setProductType] = useState<"secondhand" | "clubmerch">("secondhand");
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: ""
  });

  const handleImageUpload = () => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setImageUploaded(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate back to marketplace after publishing
    setTimeout(() => {
      onNavigate('marketplace');
    }, 500);
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: Package, completed: formData.title && formData.category },
    { id: 2, title: "Details", icon: Tag, completed: formData.price && formData.description },
    { id: 3, title: "Images", icon: ImageIcon, completed: imageUploaded },
    { id: 4, title: "Publish", icon: Sparkles, completed: false }
  ];

  return (
    <div className="create-listing-container">
      {/* Floating decorative shapes */}
      <div className="listing-shape-1"></div>
      <div className="listing-shape-2"></div>
      <div className="listing-shape-3"></div>

      {/* Hero Section */}
      <div className="listing-hero">
        <div className="hero-content">
          <h1 className="hero-title">Create New Listing</h1>
          <p className="hero-subtitle">Share your items with the campus community</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="listing-progress">
        <div className="progress-container">
          {steps.map((step, index) => (
            <div key={step.id} className="step-item">
              <div className={`step-circle ${currentStep >= step.id ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`step-title ${currentStep >= step.id ? 'active' : ''}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`step-line ${currentStep > step.id ? 'completed' : ''}`}></div>
              )}
            </div>
          ))}
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
                    <Label htmlFor="productType" className="form-label">
                      Product Type
                    </Label>
                    <Select value={productType} onValueChange={(value: "secondhand" | "clubmerch") => setProductType(value)}>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="secondhand">Second-hand Item</SelectItem>
                        <SelectItem value="clubmerch">Club Merchandise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="form-label">
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="books">📚 Books & Textbooks</SelectItem>
                        <SelectItem value="electronics">💻 Electronics</SelectItem>
                        <SelectItem value="furniture">🪑 Furniture</SelectItem>
                        <SelectItem value="accessories">🎒 Accessories</SelectItem>
                        <SelectItem value="clothing">👕 Clothing</SelectItem>
                        <SelectItem value="other">📦 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {productType === "clubmerch" && (
                    <div className="space-y-2">
                      <Label htmlFor="club" className="form-label">
                        Club
                      </Label>
                      <Select value={selectedClub} onValueChange={setSelectedClub} required>
                        <SelectTrigger className="form-select">
                          <SelectValue placeholder="Select a club" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BoardGames">🎲 BoardGames Club</SelectItem>
                          <SelectItem value="Yoga">🧘 Yoga Club</SelectItem>
                          <SelectItem value="WorldHistory">📜 WorldHistory Club</SelectItem>
                          <SelectItem value="Music">🎵 Music Club</SelectItem>
                          <SelectItem value="Photography">📸 Photography Club</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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

                <div className="space-y-2">
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

                <div
                  className={`upload-zone ${uploading || imageUploaded ? 'uploaded' : ''}`}
                  onClick={!uploading && !imageUploaded ? handleImageUpload : undefined}
                >
                  {!uploading && !imageUploaded && (
                    <div className="upload-content">
                      <div className="upload-icon">
                        <Upload className="h-16 w-16 text-blue-500" />
                      </div>
                      <div className="upload-text">
                        <h4 className="upload-title">Upload Product Images</h4>
                        <p className="upload-subtitle">
                          Drag and drop your images here or click to browse
                        </p>
                        <p className="upload-hint">
                          Supports JPG, PNG up to 10MB each
                        </p>
                      </div>
                      <Button type="button" className="upload-button">
                        <Plus className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  )}

                  {uploading && (
                    <div className="upload-progress">
                      <div className="progress-icon">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                      </div>
                      <div className="progress-content">
                        <h4 className="progress-title">Uploading & Verifying</h4>
                        <Progress value={uploadProgress} className="progress-bar" />
                        <p className="progress-text">
                          AI is checking image authenticity... {uploadProgress}%
                        </p>
                      </div>
                    </div>
                  )}

                  {imageUploaded && (
                    <div className="upload-success">
                      <div className="success-preview">
                        <img
                          src="https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2t8ZW58MXx8fHwxNzcyNzEwNjkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                          alt="Uploaded preview"
                          className="preview-image"
                        />
                        <div className="success-overlay">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="success-content">
                        <h4 className="success-title">Image Verified!</h4>
                        <p className="success-text">
                          Your image has been successfully uploaded and verified
                        </p>
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
                    type="button"
                    variant="outline"
                    className="cancel-button"
                    onClick={() => onNavigate('marketplace')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="publish-button"
                    disabled={!imageUploaded || !formData.title || !formData.category || !formData.price || !formData.description}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish Listing
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
