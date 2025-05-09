import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess
}: PaymentModalProps) => {
  const [amount, setAmount] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const { user } = useAuth();
  const isAmountValid = amount !== undefined && amount >= 5;

  // Reset copy states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopiedAddress(false);
      setCopiedAmount(false);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'address') {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } else {
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCheckout = async () => {
    if (!isAmountValid) {
      setError('Amount must be at least 5');
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the checkout API endpoint
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          credits: amount,
          userId: user?.id,
          userEmail: user?.email
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { public_key, session_id } = data;
      
      const stripe = await loadStripe(public_key);
      if (!stripe) {
        toast.error("checkout failed");
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session_id,
      });
      
      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error("checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter the amount of Token you would like to pay.
          </p>

          <div className="space-y-4">
            {/* Quick amount options */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => setAmount(5)}
                className="py-6"
              >
                $5
              </Button>
              <Button
                variant="outline"
                onClick={() => setAmount(10)}
                className="py-6"
              >
                $10
              </Button>
              <Button
                variant="outline"
                onClick={() => setAmount(20)}
                className="py-6"
              >
                $20
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-sm font-medium">$</span>
                </div>
                <Input
                  type="number"
                  id="amount"
                  placeholder="Please enter the recharge amount, at least $5"
                  value={amount === undefined ? '' : amount}
                  min={5}
                  onChange={(e) => {
                    const val =
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value);
                    setAmount(val);
                  }}
                  className="pl-8 pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none bg-gradient-to-r from-primary/80 to-primary rounded-r-md">
                  <span className="text-sm font-medium text-primary-foreground">
                    USDT
                  </span>
                </div>
              </div>
              {amount !== undefined && amount < 5 && (
                <p className="text-sm text-red-500">
                  Custom amount must be at least $5
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
              <div className="flex justify-end space-x-2">
                <button onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md border border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Cancel
                </button>
                <button
                  disabled={isSubmitting || !isAmountValid}
                  onClick={handleCheckout}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
