import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Loader2, CheckCircle2, User, Bell, Shield, Settings, Palette, Moon, Sun } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  course: string;
  university: string;
}

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  theme: 'light' | 'dark' | 'system';
  language: string;
  twoFactorAuth: boolean;
}

export function Profile() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "johndoe@university.edu",
    phone: "+60123456789",
    bio: "Engineering student passionate about tech and sustainability.",
    course: "Computer Science",
    university: "University of Malaya",
  });

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    profileVisibility: 'public',
    theme: 'light',
    language: 'en',
    twoFactorAuth: false,
  });

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

  const handleSettingsChange = (
    field: keyof UserSettings,
    value: any
  ) => {
    setSettings({ ...settings, [field]: value });
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

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="profile-container">
      {/* Floating decorative shapes */}
      <div className="profile-shape-1"></div>
      <div className="profile-shape-2"></div>
      <div className="profile-shape-3"></div>

      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-content">
          <h1 className="hero-title">Settings</h1>
          <p className="hero-subtitle">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="profile-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="profile-tabs">
            <TabsTrigger value="profile" className="tab-trigger">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="tab-trigger">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="tab-trigger">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences" className="tab-trigger">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="tab-content">
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="card-title">Personal Information</CardTitle>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="form-label">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className={`form-input ${errors.name ? "border-red-500" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="form-label">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@university.edu"
                        className={`form-input ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="form-label">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+60123456789"
                        className={`form-input ${errors.phone ? "border-red-500" : ""}`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    {/* University Field */}
                    <div className="space-y-2">
                      <Label htmlFor="university" className="form-label">
                        University
                      </Label>
                      <Input
                        id="university"
                        value={profile.university}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                        placeholder="Your university name"
                        className={`form-input ${errors.university ? "border-red-500" : ""}`}
                      />
                      {errors.university && (
                        <p className="text-sm text-red-600">{errors.university}</p>
                      )}
                    </div>
                  </div>

                  {/* Course Field */}
                  <div className="space-y-2">
                    <Label htmlFor="course" className="form-label">
                      Course / Major
                    </Label>
                    <Select value={profile.course} onValueChange={(value) => handleInputChange("course", value)}>
                      <SelectTrigger className={`form-select ${errors.course ? "border-red-500" : ""}`}>
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
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="form-label">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell other students about yourself..."
                      rows={4}
                      maxLength={500}
                      className="form-textarea"
                    />
                    <p className="text-xs text-gray-500">
                      {profile.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      disabled={saving}
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
                      onClick={() => navigate("/marketplace")}
                      disabled={saving}
                    >
                      Back to Marketplace
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="tab-content">
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="card-title">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {saveSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Settings updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                      <div>
                        <Label className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingsChange("emailNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                      <div>
                        <Label className="text-base font-medium">Push Notifications</Label>
                        <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingsChange("pushNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                      <div>
                        <Label className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => handleSettingsChange("smsNotifications", checked)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="tab-content">
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="card-title">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {saveSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Privacy settings updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="form-label">Profile Visibility</Label>
                      <Select value={settings.profileVisibility} onValueChange={(value: any) => handleSettingsChange("profileVisibility", value)}>
                        <SelectTrigger className="form-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                          <SelectItem value="friends">Friends Only - Only connected users</SelectItem>
                          <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                      <div>
                        <Label className="text-base font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSettingsChange("twoFactorAuth", checked)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Privacy Settings"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="tab-content">
            <Card className="profile-card">
              <CardHeader>
                <CardTitle className="card-title">App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {saveSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Preferences updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="form-label">Theme</Label>
                      <Select value={settings.theme} onValueChange={(value: any) => handleSettingsChange("theme", value)}>
                        <SelectTrigger className="form-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="form-label">Language</Label>
                      <Select value={settings.language} onValueChange={(value: any) => handleSettingsChange("language", value)}>
                        <SelectTrigger className="form-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ms">Bahasa Melayu</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
