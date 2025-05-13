import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal = ({
  isOpen,
  onClose,
}: PaymentModalProps) => {
  const [amount, setAmount] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAmountValid = amount !== undefined && amount >= 5;

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
                    USD
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
                className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md border border-gray-300 hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  disabled={isSubmitting || !isAmountValid}
                  onClick={handleCheckout}
                  className="px-4 py-2 text-sm font-medium text-white disabled:opacity-50 bg-black rounded-md hover:opacity-70 transition-opacity"
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
