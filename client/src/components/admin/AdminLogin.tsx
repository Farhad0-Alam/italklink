import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@test.com', // Pre-fill for testing
      password: '',
      rememberMe: true, // Default to checked (recommended)
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const user = await response.json();
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl border-orange-100">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white font-bold text-2xl">2T</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              2TalkLink Admin
            </CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email / Username</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="username"
                          placeholder="admin@example.com"
                          data-testid="input-admin-email"
                          className="focus-visible:ring-orange-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            data-testid="input-admin-password"
                            className="focus-visible:ring-orange-500"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-remember-me"
                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Keep me logged in for 30 days
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive" data-testid="alert-login-error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 transition-all duration-200"
                  disabled={isLoading}
                  data-testid="button-admin-login"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 <span className="font-medium">Tip:</span> Your browser can also securely save your password for faster login.
              </p>
            </div>

            <div className="mt-4 p-4 bg-orange-50 dark:bg-gray-800 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-2 font-medium">Test Credentials:</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-500">
                Email: admin@test.com<br />
                Password: password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}