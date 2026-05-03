import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Loader2, CheckCircle2, User, Bell, Shield, Settings, Moon, Sun } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "../../supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

const profileSchema = z.object({
  name: z.string(),
  student_id: z.string(),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  university: z.string().optional().or(z.literal("")),
  course: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
});

const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  profileVisibility: z.string(),
  theme: z.string(),
  language: z.string(),
  twoFactorAuth: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SettingsFormValues = z.infer<typeof settingsSchema>;

export function Profile() {
  const navigate = useNavigate();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      student_id: "",
      email: "",
      phone: "",
      university: "",
      course: "",
      bio: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      setIsLoadingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUserId(session.user.id);

      // Fetch from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData && !error) {
        profileForm.reset({
          name: profileData.full_name || "",
          student_id: profileData.student_id || "",
          email: session.user.email || "", // Email from auth session
          phone: profileData.phone || "",
          university: profileData.university || "",
          course: profileData.course || "",
          bio: profileData.bio || "",
        });
      }
      setIsLoadingProfile(false);
    }

    loadProfile();
  }, [navigate, profileForm]);

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      profileVisibility: "public",
      theme: "light",
      language: "en",
      twoFactorAuth: false,
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;
    
    // Update Supabase profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        phone: data.phone,
        university: data.university,
        course: data.course,
        bio: data.bio
      })
      .eq('id', userId);

    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      console.error("Failed to update profile", error);
      alert("Failed to update profile.");
    }
  };

  const onSettingsSubmit = async (data: SettingsFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Settings updated:", data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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

                {isLoadingProfile ? (
                  <div className="flex justify-center p-8 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label text-gray-400">Full Name (Verified)</FormLabel>
                              <FormControl>
                                <Input className="form-input bg-gray-50 cursor-not-allowed" readOnly {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="student_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label text-gray-400">Student ID (Verified)</FormLabel>
                              <FormControl>
                                <Input className="form-input bg-gray-50 cursor-not-allowed" readOnly {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label text-gray-400">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" className="form-input bg-gray-50 cursor-not-allowed" readOnly {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label">Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+60123456789" type="tel" className="form-input" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="university"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label">University</FormLabel>
                              <FormControl>
                                <Input placeholder="Your university name" className="form-input" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                    <FormField
                      control={profileForm.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Course / Major</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="form-select">
                                <SelectValue placeholder="Select your course" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell other students about yourself..."
                              className="form-textarea"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            {field.value.length}/500 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4 pt-6">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        disabled={profileForm.formState.isSubmitting}
                      >
                        {profileForm.formState.isSubmitting ? (
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
                        disabled={profileForm.formState.isSubmitting}
                      >
                        Back to Marketplace
                      </Button>
                    </div>
                  </form>
                </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
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

                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">Email Notifications</FormLabel>
                              <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">Push Notifications</FormLabel>
                              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">SMS Notifications</FormLabel>
                              <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      disabled={settingsForm.formState.isSubmitting}
                    >
                      {settingsForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
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

                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="profileVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Profile Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-select">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                                <SelectItem value="friends">Friends Only - Only connected users</SelectItem>
                                <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={settingsForm.control}
                        name="twoFactorAuth"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 rounded-lg border bg-white/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">Two-Factor Authentication</FormLabel>
                              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      disabled={settingsForm.formState.isSubmitting}
                    >
                      {settingsForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Privacy Settings"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
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

                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Theme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-select">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="form-select">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ms">Bahasa Melayu</SelectItem>
                                <SelectItem value="zh">中文</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      disabled={settingsForm.formState.isSubmitting}
                    >
                      {settingsForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
