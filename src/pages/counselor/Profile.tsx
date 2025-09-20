import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, Upload, Calendar } from "lucide-react";

const CounselorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [calendlyUrl, setCalendlyUrl] = useState(profile?.calendly_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateProfile.mutateAsync({
        full_name: fullName,
        avatar_url: avatarUrl,
        calendly_url: calendlyUrl,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update the avatar URL
      setAvatarUrl(data.publicUrl);

      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || "");
    setAvatarUrl(profile?.avatar_url || "");
    setCalendlyUrl(profile?.calendly_url || "");
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bridge-text mb-2">My Profile</h1>
          <p className="text-bridge-text/70">Manage your personal information and settings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and booking preferences
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback>
                  {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'C'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                </>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-bridge-surface/50"
                />
                <p className="text-sm text-bridge-text/60 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value="Counselor"
                  disabled
                  className="bg-bridge-surface/50"
                />
              </div>

              <div>
                <Label htmlFor="calendlyUrl" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendly URL
                </Label>
                <Input
                  id="calendlyUrl"
                  value={calendlyUrl}
                  onChange={(e) => setCalendlyUrl(e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://calendly.com/your-username"
                />
                <p className="text-sm text-bridge-text/60 mt-1">
                  Students will use this link to book appointments with you
                </p>
              </div>

              {isEditing && (
                <div>
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Enter avatar image URL"
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="bridge-button-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CounselorProfile;