import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User } from "lucide-react";
import Navbar from "@/components/Navbar";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    mobile_number: "",
    birthday: "",
    about: "",
  });

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && mounted) {
        navigate('/auth');
        return;
      }
      
      if (mounted) {
        setAuthLoading(false);
        fetchProfile();
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        navigate('/auth');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("User not found");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          mobile_number: data.mobile_number || "",
          birthday: data.birthday || "",
          about: data.about || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("User not found");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          mobile_number: profile.mobile_number,
          birthday: profile.birthday || null,
          about: profile.about,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Edit Profile</CardTitle>
            </div>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  value={profile.mobile_number}
                  onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
                  placeholder="Enter your mobile number"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  Birthday
                </label>
                <Input
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  About
                </label>
                <Textarea
                  value={profile.about}
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
