import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Mail, 
  Save, 
  Camera, 
  Shield, 
  Key, 
  Settings,
  Calendar,
  Activity,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'admin';
  planType: 'free' | 'pro' | 'enterprise';
  businessCardsCount: number;
  businessCardsLimit: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  timezone?: string;
  preferredLanguage?: string;
  loginAttempts?: number;
  permissions?: string[];
}


interface AdminSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  location: string;
  isCurrentSession: boolean;
  lastActive: string;
  createdAt: string;
}

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const preferencesSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  preferredLanguage: z.string().min(1, "Language is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function AdminProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user, isLoading: userLoading, error: userError } = useQuery<AdminUser>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      timezone: "UTC",
      preferredLanguage: "en",
    },
  });

  // Additional data queries

  const { data: sessions } = useQuery<AdminSession[]>({
    queryKey: ['/api/admin/profile/sessions'],
    retry: false,
  });

  // Update forms when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      
      preferencesForm.reset({
        timezone: String(user.timezone || "UTC"),
        preferredLanguage: String(user.preferredLanguage || "en"),
      });
      
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [user, profileForm, preferencesForm]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest('PATCH', '/api/admin/profile', data),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: PreferencesFormData) => apiRequest('PATCH', '/api/admin/profile/preferences', data),
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update preferences.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => apiRequest('POST', '/api/admin/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
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

  const toggle2FAMutation = useMutation({
    mutationFn: (enabled: boolean) => apiRequest('POST', '/api/admin/profile/2fa', { enabled }),
    onSuccess: () => {
      toast({
        title: "Two-factor authentication updated",
        description: `Two-factor authentication has been ${twoFactorEnabled ? 'disabled' : 'enabled'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update two-factor authentication.",
        variant: "destructive",
      });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiRequest('DELETE', `/api/admin/profile/sessions/${sessionId}`),
    onSuccess: () => {
      toast({
        title: "Session revoked",
        description: "The session has been terminated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile/sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Revoke failed",
        description: error.message || "Failed to revoke session.",
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/admin/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadImageMutation.mutate(file);
    }
  };

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const onSubmitPreferences = (data: PreferencesFormData) => {
    // Ensure data is clean before submitting
    const cleanData = {
      timezone: String(data.timezone || 'UTC'),
      preferredLanguage: String(data.preferredLanguage || 'en')
    };
    updatePreferencesMutation.mutate(cleanData);
  };

  const handleToggle2FA = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    toggle2FAMutation.mutate(newState);
  };

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Unable to load admin profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your admin account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-2xl">
                      {user.firstName?.[0] || 'A'}{user.lastName?.[0] || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border">
                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                      data-testid="input-admin-avatar"
                    />
                  </label>
                </div>
                
                {isUploading && (
                  <div className="mt-4">
                    <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="default" className="capitalize">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {user.planType}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Account Status:</span>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Member Since:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex items-center justify-between">
                      <span>Last Login:</span>
                      <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Information & Security */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...profileForm.register('firstName')}
                          className="mt-1"
                          placeholder="Enter your first name"
                          data-testid="input-admin-first-name"
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-sm text-red-600 mt-1">
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...profileForm.register('lastName')}
                          className="mt-1"
                          placeholder="Enter your last name"
                          data-testid="input-admin-last-name"
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-sm text-red-600 mt-1">
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register('email')}
                        className="mt-1"
                        placeholder="Enter your email address"
                        data-testid="input-admin-email"
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Change Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        {...passwordForm.register('currentPassword')}
                        className="mt-1 pr-10"
                        placeholder="Enter your current password"
                        data-testid="input-current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1 h-9 w-9 px-0"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-current-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        {...passwordForm.register('newPassword')}
                        className="mt-1 pr-10"
                        placeholder="Enter your new password"
                        data-testid="input-new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1 h-9 w-9 px-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        data-testid="button-toggle-new-password"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...passwordForm.register('confirmPassword')}
                        className="mt-1 pr-10"
                        placeholder="Confirm your new password"
                        data-testid="input-confirm-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1 h-9 w-9 px-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-change-password"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>Two-Factor Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable 2FA</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Add an extra layer of security to your admin account
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                    disabled={toggle2FAMutation.isPending}
                    data-testid="switch-2fa"
                  />
                </div>
                
                {twoFactorEnabled && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Two-factor authentication is enabled. Your account is more secure.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Login Attempts:</span>
                    <span className="font-medium">{user.loginAttempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Account Status:</span>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Locked'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Two-Factor Auth:</span>
                    <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Active Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${session.isCurrentSession ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <h4 className="font-medium">
                            {session.isCurrentSession ? 'Current Session' : 'Other Session'}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{session.userAgent}</p>
                        <p className="text-xs text-gray-500">
                          {session.location} • Last active: {new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                      {!session.isCurrentSession && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokeSessionMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-revoke-session-${session.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No active sessions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            {/* General Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>General Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={preferencesForm.handleSubmit(onSubmitPreferences)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={(() => {
                          const val = preferencesForm.watch('timezone');
                          return typeof val === 'string' ? val : 'UTC';
                        })()}
                        onValueChange={(value) => preferencesForm.setValue('timezone', value)}
                      >
                        <SelectTrigger data-testid="select-timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                        </SelectContent>
                      </Select>
                      {preferencesForm.formState.errors.timezone && (
                        <p className="text-sm text-red-600 mt-1">
                          {String(preferencesForm.formState.errors.timezone.message || preferencesForm.formState.errors.timezone)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="language">Preferred Language</Label>
                      <Select 
                        value={(() => {
                          const val = preferencesForm.watch('preferredLanguage');
                          return typeof val === 'string' ? val : 'en';
                        })()}
                        onValueChange={(value) => preferencesForm.setValue('preferredLanguage', value)}
                      >
                        <SelectTrigger data-testid="select-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                      {preferencesForm.formState.errors.preferredLanguage && (
                        <p className="text-sm text-red-600 mt-1">
                          {String(preferencesForm.formState.errors.preferredLanguage.message || preferencesForm.formState.errors.preferredLanguage)}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updatePreferencesMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-save-preferences"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Account Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600">{user.businessCardsCount}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Business Cards</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{user.businessCardsLimit}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Card Limit</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.ceil((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Days Active</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {user.lastLoginAt ? Math.ceil((new Date().getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Days Since Login</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}