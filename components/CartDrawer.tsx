
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer: React.FC = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, cartDrawerOpen, closeCartDrawer } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartDrawerOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCartDrawer();
    };
    if (cartDrawerOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [cartDrawerOpen, closeCartDrawer]);

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  if (!cartDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-charcoal/40 z-40 transition-opacity duration-300"
        onClick={closeCartDrawer}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-ivory shadow-2xl z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
      >
        <header className="flex items-center justify-between p-6 border-b border-brand-taupe/20">
          <h2 className="text-xl font-serif text-brand-charcoal">Votre panier</h2>
          <button
            type="button"
            onClick={closeCartDrawer}
            className="p-2 text-brand-charcoal/70 hover:text-brand-charcoal rounded-full hover:bg-brand-taupe/10 focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
            aria-label="Fermer le panier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-brand-taupe/10 rounded-full flex items-center justify-center mb-4 text-brand-taupe">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-brand-charcoal/70 font-medium">Votre panier est vide</p>
              <p className="text-sm text-brand-charcoal/50 mt-1">Ajoutez un produit qui vous plaît.</p>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="mt-6 text-brand-nudeGreen font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-brand-taupe/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-bold text-brand-charcoal truncate">{item.name}</h3>
                    <p className="text-xs text-brand-charcoal/50 mb-2">{item.category}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-ivory hover:bg-brand-nude text-brand-charcoal text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-1"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-ivory hover:bg-brand-nude text-brand-charcoal text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-1"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-brand-charcoal">{(item.price * item.quantity).toFixed(2)} MAD</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-brand-charcoal/40 hover:text-red-500 transition-colors p-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-1 rounded"
                    aria-label={`Retirer ${item.name} du panier`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="p-6 border-t border-brand-taupe/20 space-y-4">
            <div className="flex justify-between text-lg font-serif text-brand-charcoal">
              <span>Total</span>
              <span>{cartTotal.toFixed(2)} MAD</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-brand-nudeGreen text-white py-4 rounded-full font-medium hover:bg-brand-nudeGreen/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
            >
              Passer commande
            </button>
            <Link
              to="/products"
              onClick={closeCartDrawer}
              className="block text-center text-sm text-brand-charcoal/70 hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded py-2"
            >
              Continuer mes achats
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
