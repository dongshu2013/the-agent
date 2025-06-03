import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { createApiClient } from '@/lib/api_client';
import { X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const [amount, setAmount] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAmountValid = amount !== undefined && amount >= 5;

  const handleCheckout = async () => {
    if (!user || !user.idToken) return;
    if (!isAmountValid) {
      setError('Amount must be at least 5');
      return;
    }

    setIsSubmitting(true);
    try {
      const { session_id, public_key } = await createApiClient(user.idToken).createCheckout(amount);
      const stripe = await loadStripe(public_key);
      if (!stripe) {
        toast.error('checkout failed');
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: session_id });
      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicking outside the modal to close it
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in duration-200"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Enter the amount of Token you would like to pay.
            </p>

            <div className="space-y-4">
              {/* Quick amount options */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setAmount(5)}
                  className="py-6 border border-gray-200 bg-gray-50 rounded-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  $5
                </button>
                <button
                  onClick={() => setAmount(10)}
                  className="py-6 border border-gray-200 bg-gray-50 rounded-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  $10
                </button>
                <button
                  onClick={() => setAmount(20)}
                  className="py-6 border border-gray-200 bg-gray-50 rounded-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  $20
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-sm font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    placeholder="Please enter the recharge amount"
                    value={amount === undefined ? '' : amount}
                    min={5}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      setAmount(val);
                    }}
                    className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none bg-gradient-to-r from-primary/80 to-primary rounded-r-md">
                    <span className="text-sm font-medium text-primary-foreground">USD</span>
                  </div>
                </div>
                {amount !== undefined && amount < 5 && (
                  <p className="text-sm text-red-500">Custom amount must be at least $5</p>
                )}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting || !isAmountValid}
                  onClick={handleCheckout}
                  className="px-4 py-2 text-sm font-medium text-white disabled:opacity-50 bg-black rounded-md hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
