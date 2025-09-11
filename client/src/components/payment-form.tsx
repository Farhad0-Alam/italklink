import { useState } from "react";
import { 
  PaymentElement, 
  AddressElement,
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const paymentFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  savePaymentMethod: z.boolean().default(false),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  amount: number;
  currency: string;
  eventTypeName: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  customerEmail?: string;
  customerName?: string;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function PaymentForm({
  amount,
  currency,
  eventTypeName,
  onPaymentSuccess,
  onPaymentError,
  customerEmail = "",
  customerName = "",
  isProcessing = false,
  disabled = false,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      customerName: customerName,
      customerEmail: customerEmail,
      savePaymentMethod: false,
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Confirm the payment using the PaymentElement
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
          receipt_email: data.customerEmail,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'An error occurred while processing your payment');
        onPaymentError(error);
        
        toast({
          title: "Payment Failed",
          description: error.message || "Please try again or use a different payment method",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentComplete(true);
        onPaymentSuccess(paymentIntent);
        
        toast({
          title: "Payment Successful!",
          description: "Your appointment has been booked and confirmed.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      onPaymentError(err);
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formattedAmount = formatCurrency(amount, currency);

  if (paymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Payment Successful!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Your appointment has been confirmed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="payment-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Secure payment for your <strong>{eventTypeName}</strong> booking
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Amount
            </span>
            <Badge variant="secondary" className="text-lg font-semibold">
              {formattedAmount}
            </Badge>
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          disabled={disabled || isLoading}
                          data-testid="input-customer-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          disabled={disabled || isLoading}
                          data-testid="input-customer-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Billing Address
              </h3>
              <div className="border rounded-lg p-4">
                <AddressElement 
                  options={{
                    mode: 'billing',
                    fields: {
                      phone: 'never',
                    },
                    validation: {
                      phone: 'never',
                    }
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Payment Method
                </h3>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Secure</span>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <PaymentElement 
                  options={{
                    layout: 'tabs',
                    defaultValues: {
                      billingDetails: {
                        name: form.getValues('customerName'),
                        email: form.getValues('customerEmail'),
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                      Payment Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {paymentError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!stripe || !elements || disabled || isLoading || isProcessing}
              data-testid="button-complete-payment"
            >
              {isLoading || isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Payment {formattedAmount}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your payment information is secured with 256-bit SSL encryption.
                <br />
                We don't store your payment details.
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}