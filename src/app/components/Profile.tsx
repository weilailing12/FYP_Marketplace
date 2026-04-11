import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Loader2, CheckCircle2, Camera } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface ProfileProps {
  onNavigate: (page: string) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  course: string;
  university: string;
  profileImage: string | null;
}

export function Profile({ onNavigate }: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "johndoe@university.edu",
    phone: "+60123456789",
    bio: "Engineering student passionate about tech and sustainability.",
    course: "Computer Science",
    university: "University of Malaya",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlfGVufDB8fHx8fDA&ixlib=rb-4.1.0&q=80&w=400",
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({ image: "Please select a valid image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: "Image size must be less than 5MB" });
      return;
    }

    setUploading(true);
    setErrors({});

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      
      // Simulate AI verification
      setTimeout(() => {
        setUploading(false);
        setProfile({ ...profile, profileImage: e.target?.result as string });
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!profile.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }
    if (!profile.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!profile.course) {
      newErrors.course = "Course is required";
    }
    if (!profile.university.trim()) {
      newErrors.university = "University is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof UserProfile,
    value: string
  ) => {
    setProfile({ ...profile, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Profile updated successfully!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Profile Picture</Label>
                <div className="flex items-center gap-6">
                  {/* Avatar Display */}
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={imagePreview || profile.profileImage || ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors"
                      disabled={uploading}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Upload Info */}
                  <div className="flex-1">
                    {uploading ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying image...</span>
                      </div>
                    ) : imagePreview ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Image updated</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Click the camera icon to upload a new profile picture
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: Square image, at least 400x400px, under 5MB
                    </p>
                  </div>
                </div>

                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              <div className="border-t pt-6">
                {/* Name Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="name" className="font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="email" className="font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@university.edu"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="phone" className="font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+60123456789"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* University Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="university" className="font-semibold">
                    University
                  </Label>
                  <Input
                    id="university"
                    value={profile.university}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                    placeholder="Your university name"
                    className={errors.university ? "border-red-500" : ""}
                  />
                  {errors.university && (
                    <p className="text-sm text-red-600">{errors.university}</p>
                  )}
                </div>

                {/* Course Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="course" className="font-semibold">
                    Course / Major
                  </Label>
                  <Select value={profile.course}  onValueChange={(value) => handleInputChange("course", value)}>
                    <SelectTrigger id="course" className={errors.course ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="law">Law</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.course && (
                    <p className="text-sm text-red-600">{errors.course}</p>
                  )}
                </div>

                {/* Bio Field */}
                <div className="space-y-2 mb-6">
                  <Label htmlFor="bio" className="font-semibold">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell other students about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {profile.bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onNavigate("marketplace")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
