import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, MessageCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const supportSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(100, "Subject must be less than 100 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
  priority: z.enum(["low", "medium", "high"]),
});

type SupportFormData = z.infer<typeof supportSchema>;

interface ContactSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSupportModal({ open, onOpenChange }: ContactSupportModalProps) {
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      subject: "",
      category: "",
      message: "",
      priority: "medium",
    },
  });

  const submitSupportMutation = useMutation({
    mutationFn: (data: SupportFormData) => apiRequest('POST', '/api/support/ticket', data),
    onSuccess: () => {
      toast({
        title: "Support ticket submitted",
        description: "We've received your message and will get back to you soon.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit support ticket.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportFormData) => {
    submitSupportMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Contact Support</span>
          </DialogTitle>
          <DialogDescription>
            Send us a message and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing & Payment</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="account">Account Help</SelectItem>
                  <SelectItem value="general">General Question</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as "low" | "medium" | "high")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              {...form.register('subject')}
              className="mt-1"
              placeholder="Brief description of your issue"
            />
            {form.formState.errors.subject && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.subject.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              {...form.register('message')}
              className="mt-1 min-h-[120px]"
              placeholder="Please describe your issue or question in detail..."
            />
            {form.formState.errors.message && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.message.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {form.watch('message')?.length || 0} / 1000 characters
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Before you submit:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check our Help Center for quick answers</li>
              <li>• Include specific error messages if any</li>
              <li>• Mention your browser and device type</li>
              <li>• Pro users get priority support responses</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitSupportMutation.isPending}
              className="flex items-center space-x-2"
            >
              {submitSupportMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send Message</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}