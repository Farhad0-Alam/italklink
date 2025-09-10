import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send, Loader2, Users } from "lucide-react";

type Props = { 
  totalCards: number;
  className?: string;
};

export default function NotifyAllCardsButton({ totalCards, className = "" }: Props) {
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
      const response = await fetch("/api/notify/all-cards", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        credentials: "include",
        body: JSON.stringify({ 
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
        title: "Notifications sent!",
        description: `Push notifications sent to subscribers of all ${totalCards} business cards`,
      });
      
      // Reset and close
      setOpen(false);
      setTitle("");
      setMessage("");
      setUrl("");
      
    } catch (error: any) {
      console.error('Bulk notification send error:', error);
      toast({
        title: "Failed to send notifications",
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

  // Don't show if no cards
  if (totalCards === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`bg-purple-600 hover:bg-purple-700 text-white ${className}`}
          title="Send push notification to all card subscribers"
          data-testid="notify-all-cards-button"
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Notify All Cards
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Send to All Card Subscribers
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Target: Subscribers of all <strong>{totalCards}</strong> business cards
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-800">
                <strong>Note:</strong> This will send notifications to everyone who subscribed 
                to any of your business cards. Each subscriber will receive one notification.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bulk-title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bulk-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New updates across all my services! 🎉"
              className="mt-1"
              maxLength={100}
              data-testid="input-bulk-title"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </div>
          </div>

          <div>
            <Label htmlFor="bulk-message" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bulk-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Check out the latest updates and special offers across all my business services..."
              className="mt-1 min-h-[80px]"
              maxLength={300}
              data-testid="textarea-bulk-message"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length}/300 characters
            </div>
          </div>

          <div>
            <Label htmlFor="bulk-url" className="text-sm font-medium">
              Action URL <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="bulk-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/updates"
              className="mt-1"
              data-testid="input-bulk-url"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Where users go when they tap the notification
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>Rate Limit:</strong> Maximum 2 bulk notifications per user per 24 hours
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            data-testid="button-cancel-bulk"
          >
            Cancel
          </Button>
          <Button
            onClick={send}
            disabled={loading || !title.trim() || !message.trim()}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-send-bulk"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to All ({totalCards} cards)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}