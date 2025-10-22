import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (loginData: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', loginData);
      return response;
    },
    onSuccess: async () => {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Wait for user query to be updated and redirect based on role
      setTimeout(async () => {
        try {
          const updatedUserQuery = await queryClient.fetchQuery({ queryKey: ['/api/auth/user'] });
          if (updatedUserQuery && (updatedUserQuery as any).role === 'admin') {
            setLocation('/admin');
          } else {
            setLocation('/dashboard');
          }
        } catch (error) {
          // Fallback to dashboard if user data fetch fails
          setLocation('/dashboard');
        }
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({ email: email.trim(), password });
  };

  const handleGoogleLogin = () => {
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
          <p className="text-slate-600">Welcome back to the future of networking</p>
        </div>

        <Card className="shadow-xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loginMutation.isPending}
            >
              <i className="fab fa-google mr-2 text-red-500"></i>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-talklink-600 hover:text-talklink-500">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-talklink-500 hover:bg-talklink-600 h-12 text-base font-medium mt-6"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-talklink-600 hover:text-talklink-500 font-medium">
                  Sign up for free
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