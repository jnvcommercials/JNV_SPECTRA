import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateProfile } from "@/api/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  useEffect(() => {
    if (profileData?.data?.user) {
      setFormData({
        username: profileData.data.user.username || "",
        email: profileData.data.user.email || ""
      });
    }
  }, [profileData]);

  const handleProfileUpdate = async (values: any) => {
    try {
      // Format values to match backend expectations
      const payload = {
        username: values.username,
        email: values.email,
        ...values.password ? { password: values.password } : {}
      };
      
      await updateProfileMutation.mutateAsync(payload);
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  if (isProfileLoading) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-8">My Profile</h1>
        <div className="max-w-2xl">
          <div className="rounded-lg border p-6 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="flex justify-center">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (profileError) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-8">My Profile</h1>
        <div className="max-w-2xl">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            Failed to load profile data. Please try again later.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      
      <div className="max-w-2xl">
        {updateProfileMutation.isPending && (
          <div className="flex items-center justify-center mb-4 bg-primary/10 p-2 rounded-md">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Updating profile...</span>
          </div>
        )}
        <ProfileForm initialData={formData} onSubmit={handleProfileUpdate} />
      </div>
    </DashboardLayout>
  );
}
