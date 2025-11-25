import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield, Bell, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  planType: 'free' | 'paid';
  createdAt: string;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AccountSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [allowSearch, setAllowSearch] = useState(false);

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => apiRequest('PATCH', '/api/auth/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (settings: any) => apiRequest('PATCH', '/api/auth/notification-settings', settings),
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/auth/account'),
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      queryClient.clear();
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete account.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access account settings.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    const settings = {
      emailNotifications,
      marketingEmails,
      securityAlerts,
      [type]: value,
    };
    
    // Update local state
    switch (type) {
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'marketingEmails':
        setMarketingEmails(value);
        break;
      case 'securityAlerts':
        setSecurityAlerts(value);
        break;
    }
    
    updateNotificationsMutation.mutate(settings);
  };

  const handlePrivacyChange = (type: string, value: boolean) => {
    const settings = {
      profileVisibility,
      allowSearch,
      [type]: value,
    };
    
    // Update local state
    switch (type) {
      case 'profileVisibility':
        setProfileVisibility(value);
        break;
      case 'allowSearch':
        setAllowSearch(value);
        break;
    }
    
    updateNotificationsMutation.mutate(settings);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    className="mt-1"
                    placeholder="Enter your current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword')}
                      className="mt-1"
                      placeholder="Enter new password"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                      className="mt-1"
                      placeholder="Confirm new password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {changePasswordMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>Update Password</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive updates about your account via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Emails</h4>
                  <p className="text-sm text-gray-500">Receive newsletters and promotional content</p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={(value) => handleNotificationChange('marketingEmails', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Security Alerts</h4>
                  <p className="text-sm text-gray-500">Important security notifications and login alerts</p>
                </div>
                <Switch
                  checked={securityAlerts}
                  onCheckedChange={(value) => handleNotificationChange('securityAlerts', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-gray-500">Allow others to view your public profile</p>
                </div>
                <Switch
                  checked={profileVisibility}
                  onCheckedChange={(value) => handlePrivacyChange('profileVisibility', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Search Visibility</h4>
                  <p className="text-sm text-gray-500">Allow your profile to appear in search results</p>
                </div>
                <Switch
                  checked={allowSearch}
                  onCheckedChange={(value) => handlePrivacyChange('allowSearch', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Danger Zone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                  All your business cards, data, and settings will be permanently deleted.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-red-800">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        variant="destructive"
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        {deleteAccountMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Yes, Delete My Account</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}