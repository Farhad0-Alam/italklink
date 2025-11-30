import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface CouponInputProps {
  totalAmount: number;
  onCouponApplied: (discount: number, code: string) => void;
}

export function CouponInput({ totalAmount, onCouponApplied }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const { toast } = useToast();

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Invalid coupon');
      }
      return res.json();
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount: totalAmount }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to apply coupon');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setAppliedCode(couponCode);
      onCouponApplied(data.data.discount, couponCode);
      toast({
        title: 'Coupon Applied!',
        description: `You saved $${(data.data.discount / 100).toFixed(2)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Coupon Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Enter a coupon code',
        variant: 'destructive',
      });
      return;
    }
    applyCouponMutation.mutate(couponCode.toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCode('');
    onCouponApplied(0, '');
    toast({
      title: 'Coupon removed',
    });
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-900 dark:text-green-100">
            Coupon "{appliedCode}" applied
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveCoupon}
          data-testid="button-remove-coupon"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Have a coupon code?</label>
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          disabled={applyCouponMutation.isPending}
          data-testid="input-coupon"
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={applyCouponMutation.isPending || !couponCode.trim()}
          data-testid="button-apply-coupon"
        >
          {applyCouponMutation.isPending ? 'Checking...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
}
