import { useState } from "react";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

interface CreateListingProps {
  onNavigate: (page: string) => void;
}

export function CreateListing({ onNavigate }: CreateListingProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [productType, setProductType] = useState<"secondhand" | "clubmerch">("secondhand");
  const [selectedClub, setSelectedClub] = useState<string>("");

  const handleImageUpload = () => {
    setUploading(true);
    // Simulate AI verification
    setTimeout(() => {
      setUploading(false);
      setImageUploaded(true);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate back to marketplace after publishing
    setTimeout(() => {
      onNavigate('marketplace');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., MacBook Pro 2020 - Excellent Condition"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productType">Product Type</Label>
                <Select value={productType} onValueChange={(value: "secondhand" | "clubmerch") => setProductType(value)}>
                  <SelectTrigger id="productType">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="secondhand">Second-hand Item</SelectItem>
                    <SelectItem value="clubmerch">Club Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="books">Books & Textbooks</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {productType === "clubmerch" && (
                <div className="space-y-2">
                  <Label htmlFor="club">Club</Label>
                  <Select value={selectedClub} onValueChange={setSelectedClub} required>
                    <SelectTrigger id="club">
                      <SelectValue placeholder="Select a club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BoardGames">BoardGames Club</SelectItem>
                      <SelectItem value="Yoga">Yoga Club</SelectItem>
                      <SelectItem value="WorldHistory">WorldHistory Club</SelectItem>
                      <SelectItem value="Music">Music Club</SelectItem>
                      <SelectItem value="Photography">Photography Club</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="price">Price (RM)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item, its condition, and any other relevant details..."
                  rows={6}
                  required
                />
              </div>

              {/* Image Upload Zone */}
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    uploading || imageUploaded
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 cursor-pointer"
                  }`}
                  onClick={!uploading && !imageUploaded ? handleImageUpload : undefined}
                >
                  {!uploading && !imageUploaded && (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg text-gray-600">
                          Drag and drop your images here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2t8ZW58MXx8fHwxNzcyNzEwNjkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                          alt="Uploaded preview"
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                      </div>
                      <p className="text-blue-600 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking image authenticity with AI...
                      </p>
                    </div>
                  )}

                  {imageUploaded && (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/flagged/photo-1576697010739-6373b63f3204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2t8ZW58MXx8fHwxNzcyNzEwNjkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Image verified! Ready to publish
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                disabled={!imageUploaded}
              >
                Publish Listing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
