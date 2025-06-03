import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { createApiClient } from '@/lib/api_client';
import { X } from 'lucide-react';

interface CouponCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CouponCodeModal({ isOpen, onClose }: CouponCodeModalProps) {
  const { user, refreshUserData } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.idToken) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await createApiClient(user.idToken).redeemCoupon(code);
      const addedAmount = formatCurrency(result.added_credits, { maximumFractionDigits: 2 });
      const totalAmount = formatCurrency(result.total_credits, { maximumFractionDigits: 2 });
      setSuccess(
        `Added ${addedAmount} credits to your balance. Current Balance is ${totalAmount}.`
      );
      await refreshUserData();
      setTimeout(() => {
        onClose();
        setCode('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      let errorMessage = 'Failed to redeem coupon';
      if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in duration-200"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Redeem Coupon Code
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.trim().toUpperCase())}
              placeholder="Enter coupon code"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              disabled={isSubmitting}
            />
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:opacity-70 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
