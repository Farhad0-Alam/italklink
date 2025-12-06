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
      if (user.role === 'owner') {
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
          if (updatedUserQuery && (updatedUserQuery as any).role === 'owner') {
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
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg">
                <svg viewBox="0 0 1000 1000" className="w-full h-full">
                  <path fill="#22c55e" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
                  <path fill="none" stroke="#FFFFFF" strokeWidth="70" strokeMiterlimit="10" d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"/>
                  <ellipse cx="498.5" cy="357.5" rx="44.5" ry="44.5" fill="#FFFFFF"/>
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">iTalkLink</span>
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