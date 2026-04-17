import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Package, Tag, DollarSign, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const clubOptions = [
  { value: "BoardGames", label: "BoardGames Club" },
  { value: "Yoga", label: "Yoga Club" },
  { value: "WorldHistory", label: "WorldHistory Club" },
  { value: "Music", label: "Music Club" },
  { value: "Photography", label: "Photography Club" },
];

interface ClubMerchAdminCreateProps {
  onNavigate: (page: string) => void;
}

export function ClubMerchAdminCreate({ onNavigate }: ClubMerchAdminCreateProps) {
  const [imageUploaded, setImageUploaded] = useState(false);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: ""
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    // Simulate club merchandise submission flow.
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onNavigate("clubmerch");
    }, 1200);
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
                        <div className="upload-icon"><Upload className="h-16 w-16 text-blue-500" /></div>
                        <div>
                          <p className="font-medium">Upload an image</p>
                          <p className="text-sm text-gray-500">Supported JPG/PNG, maximum 10MB.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-green-700">Image selected and ready to submit.</div>
                    )}
                    <input type="file" accept="image/*" className="hidden" id="club-image-upload" onChange={handleImageUpload} />
                    <label htmlFor="club-image-upload" className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                      <ImageIcon className="h-4 w-4 mr-2" /> Upload Image
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Publish Club Merchandise
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
