import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Loader2 } from "lucide-react";

type Props = { 
  cardId: string | number; 
  cardTitle?: string;
  className?: string;
};

export default function NotifyCardButton({ cardId, cardTitle, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function send() {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/notify/card", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        credentials: "include",
        body: JSON.stringify({ 
          cardId: String(cardId), 
          title: title.trim(), 
          message: message.trim(), 
          url: url.trim() || undefined 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send notification`);
      }
      
      toast({
        title: "Notification sent!",
        description: `Push notification sent to subscribers of "${cardTitle || 'this card'}"`,
      });
      
      // Reset and close
      setOpen(false);
      setTitle("");
      setMessage("");
      setUrl("");
      
    } catch (error: any) {
      console.error('Notification send error:', error);
      toast({
        title: "Failed to send notification",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setMessage("");
      setUrl("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 px-3 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 ${className}`}
          title="Send push notification to card subscribers"
          data-testid={`notify-button-${cardId}`}
        >
          <Bell className="w-3 h-3 mr-1" />
          Notify
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Send Push Notification
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {cardTitle ? (
              <>Target: Subscribers of <strong>"{cardTitle}"</strong></>
            ) : (
              "Target: Card subscribers"
            )}
            <div className="mt-1 font-mono text-xs bg-muted px-2 py-1 rounded">
              tag: card_id={String(cardId)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="notification-title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New offer available! 🎉"
              className="mt-1"
              maxLength={100}
              data-testid="input-notification-title"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </div>
          </div>

          <div>
            <Label htmlFor="notification-message" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notification-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Check out our latest services and special discounts..."
              className="mt-1 min-h-[80px]"
              maxLength={300}
              data-testid="textarea-notification-message"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length}/300 characters
            </div>
          </div>

          <div>
            <Label htmlFor="notification-url" className="text-sm font-medium">
              Action URL <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="notification-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/offer"
              className="mt-1"
              data-testid="input-notification-url"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Where users go when they tap the notification
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            data-testid="button-cancel-notification"
          >
            Cancel
          </Button>
          <Button
            onClick={send}
            disabled={loading || !title.trim() || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-send-notification"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Push
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}