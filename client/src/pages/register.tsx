import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const registerMutation = useMutation({
    mutationFn: async (registerData: { firstName: string; lastName: string; email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', registerData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Account Created Successfully!',
        description: 'Welcome to CardFlow! You can now start creating digital business cards.',
      });
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Redirect to dashboard
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords don't match. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-talklink-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-talklink-500 to-talklink-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-address-card text-white text-lg"></i>
              </div>
              <span className="text-2xl font-bold text-slate-900">CardFlow</span>
            </div>
          </Link>
          <p className="text-slate-600">Start your digital networking journey</p>
        </div>

        <Card className="shadow-xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join thousands of professionals who've gone digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Signup Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={registerMutation.isPending}
            >
              <i className="fab fa-google mr-2 text-red-500"></i>
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or create account with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
                <p className="text-xs text-slate-500">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                  disabled={registerMutation.isPending}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-slate-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-talklink-600 hover:text-talklink-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-talklink-600 hover:text-talklink-500">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-talklink-500 hover:bg-talklink-600 h-12 text-base font-medium mt-6"
                disabled={registerMutation.isPending || !formData.acceptTerms}
              >
                {registerMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-rocket mr-2"></i>
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-talklink-600 hover:text-talklink-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}