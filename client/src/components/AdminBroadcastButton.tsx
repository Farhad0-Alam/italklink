import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send, Loader2, Users, Crown } from "lucide-react";

export default function AdminBroadcastButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [segment, setSegment] = useState("all");
  const [locales, setLocales] = useState("");
  const [countries, setCountries] = useState("");
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
      const payload: any = {
        title: title.trim(),
        message: message.trim(),
        segment,
      };

      if (url.trim()) payload.url = url.trim();
      if (locales.trim()) payload.locales = locales.split(',').map(l => l.trim()).filter(Boolean);
      if (countries.trim()) payload.countries = countries.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

      const response = await fetch("/api/notify/admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send broadcast`);
      }
      
      toast({
        title: "Broadcast sent!",
        description: `Notification sent to ${segment === 'all' ? 'all' : segment} users`,
      });
      
      // Reset and close
      setOpen(false);
      setTitle("");
      setMessage("");
      setUrl("");
      setSegment("all");
      setLocales("");
      setCountries("");
      
    } catch (error: any) {
      console.error('Broadcast send error:', error);
      toast({
        title: "Failed to send broadcast",
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
      setSegment("all");
      setLocales("");
      setCountries("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          data-testid="admin-broadcast-button"
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Broadcast Notification
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Admin Broadcast
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Send push notification to app users
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="broadcast-title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="broadcast-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., New features available!"
              className="mt-1"
              maxLength={100}
              data-testid="input-broadcast-title"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {title.length}/100 characters
            </div>
          </div>

          <div>
            <Label htmlFor="broadcast-message" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., We've added exciting new templates and features to help you create even better business cards..."
              className="mt-1 min-h-[80px]"
              maxLength={300}
              data-testid="textarea-broadcast-message"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length}/300 characters
            </div>
          </div>

          <div>
            <Label htmlFor="broadcast-url" className="text-sm font-medium">
              Action URL <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="broadcast-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://talkl.ink/dashboard"
              className="mt-1"
              data-testid="input-broadcast-url"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-segment" className="text-sm font-medium">
                User Segment
              </Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger className="mt-1" data-testid="select-user-segment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                  <SelectItem value="paid">Paid Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-locales" className="text-sm font-medium">
                Locales <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="target-locales"
                value={locales}
                onChange={(e) => setLocales(e.target.value)}
                placeholder="en,bn,es"
                className="mt-1"
                data-testid="input-target-locales"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Comma-separated language codes
              </div>
            </div>

            <div>
              <Label htmlFor="target-countries" className="text-sm font-medium">
                Countries <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="target-countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="us,bd,in"
                className="mt-1"
                data-testid="input-target-countries"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Comma-separated ISO-2 codes
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>Rate Limit:</strong> Maximum 2 broadcasts per admin per 24 hours
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            data-testid="button-cancel-broadcast"
          >
            Cancel
          </Button>
          <Button
            onClick={send}
            disabled={loading || !title.trim() || !message.trim()}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="button-send-broadcast"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Broadcasting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}