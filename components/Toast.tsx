import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

const Toast: React.FC = () => {
  const { toastMessage, dismissToast } = useCart();

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(dismissToast, 2500);
    return () => clearTimeout(t);
  }, [toastMessage, dismissToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-brand-charcoal text-white rounded-full text-sm font-medium shadow-xl animate-[fadeInUp_0.3s_ease-out] flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-nude" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {toastMessage}
      <button
        type="button"
        onClick={dismissToast}
        className="ml-2 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-charcoal"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
