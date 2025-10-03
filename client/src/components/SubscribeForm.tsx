import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Check } from "lucide-react";

interface SubscribeFormProps {
  cardId: string;
  title?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  requireName?: boolean;
  requireEmail?: boolean;
  enablePushNotifications?: boolean;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function SubscribeForm({
  cardId,
  title = "Stay Updated",
  description = "Subscribe to get notified about updates and news.",
  buttonText = "Subscribe",
  successMessage = "Thank you for subscribing!",
  requireName = false,
  requireEmail = true,
  enablePushNotifications = true,
  primaryColor = "#f97316",
  backgroundColor = "#ffffff",
  textColor = "#1e293b",
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch VAPID public key on component mount
  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const response = await fetch('/api/notify/vapid-public-key');
        const data = await response.json();
        if (data.ok && data.data?.publicKey) {
          setVapidPublicKey(data.data.publicKey);
        }
      } catch (error) {
        console.error("Failed to fetch VAPID key:", error);
      }
    };
    fetchVapidKey();
  }, []);

  const requestPushPermission = async (): Promise<PushSubscription | null> => {
    if (!enablePushNotifications || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return null;
    }

    if (!vapidPublicKey) {
      console.warn("VAPID public key not available");
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription with actual VAPID public key
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      return subscription;
    } catch (error) {
      console.error("Push subscription error:", error);
      return null;
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requireEmail && !email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (requireName && !name) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Request push notification permission if enabled
      let pushSubscription = null;
      if (enablePushNotifications) {
        pushSubscription = await requestPushPermission();
      }

      // Subscribe to card notifications
      const response = await fetch(`/api/cards/${cardId}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name?.trim() || undefined,
          pushSubscription: pushSubscription ? JSON.stringify(pushSubscription) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setIsSubscribed(true);
      toast({
        title: "Subscribed!",
        description: successMessage,
      });

      // Clear form
      setEmail("");
      setName("");
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (isSubscribed) {
    return (
      <div
        className="p-6 rounded-lg border border-slate-200 text-center"
        style={{
          backgroundColor,
          color: textColor,
        }}
        data-testid="subscribe-success"
      >
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{successMessage}</h3>
        <p className="text-sm opacity-80">You'll receive notifications about updates.</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-lg border border-slate-200"
      style={{
        backgroundColor,
        color: textColor,
      }}
      data-testid="subscribe-form"
    >
      <div className="text-center mb-4">
        <div className="flex justify-center mb-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Bell className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>

      <form onSubmit={handleSubscribe} className="space-y-3">
        {requireName && (
          <div>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required={requireName}
              className="w-full"
              data-testid="input-name"
              style={{
                borderColor: `${primaryColor}40`,
              }}
            />
          </div>
        )}

        {requireEmail && (
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required={requireEmail}
              className="w-full"
              data-testid="input-email"
              style={{
                borderColor: `${primaryColor}40`,
              }}
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold"
          style={{
            backgroundColor: primaryColor,
            color: "#ffffff",
          }}
          data-testid="button-subscribe"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>

        {enablePushNotifications && (
          <p className="text-xs text-center opacity-70">
            We'll ask for notification permission to send you updates
          </p>
        )}
      </form>
    </div>
  );
}
