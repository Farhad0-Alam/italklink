import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, UserCheck, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImpersonationStatus {
  isImpersonating: boolean;
  originalUserEmail?: string;
  impersonatedUserEmail?: string;
  startedAt?: string;
}

export function ImpersonationBanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [impersonationStatus, setImpersonationStatus] = useState<ImpersonationStatus | null>(null);
  const [isStoppingImpersonation, setIsStoppingImpersonation] = useState(false);

  useEffect(() => {
    checkImpersonationStatus();
  }, []);

  const checkImpersonationStatus = async () => {
    try {
      const response = await fetch('/api/admin/impersonation-status', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setImpersonationStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to check impersonation status:', error);
    }
  };

  const stopImpersonation = async () => {
    setIsStoppingImpersonation(true);
    try {
      const response = await apiRequest('POST', '/api/admin/stop-impersonation');
      
      toast({
        title: "Impersonation stopped",
        description: "You have returned to your admin account",
      });

      // Redirect back to admin users page
      setLocation('/admin/users');
      
      // Force a page reload to clear any cached user data
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop impersonation",
        variant: "destructive",
      });
    } finally {
      setIsStoppingImpersonation(false);
    }
  };

  if (!impersonationStatus?.isImpersonating) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserCheck className="h-5 w-5" />
          <div className="text-sm font-medium">
            <span className="opacity-90">Admin viewing as:</span>{" "}
            <span className="font-bold">{impersonationStatus.impersonatedUserEmail}</span>
          </div>
          {impersonationStatus.startedAt && (
            <div className="text-xs opacity-75">
              Started {new Date(impersonationStatus.startedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
        <Button
          onClick={stopImpersonation}
          disabled={isStoppingImpersonation}
          variant="secondary"
          size="sm"
          className="bg-white text-orange-600 hover:bg-gray-100 hover:text-orange-700"
          data-testid="button-stop-impersonation"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isStoppingImpersonation ? "Stopping..." : "Stop Impersonating"}
        </Button>
      </div>
    </div>
  );
}