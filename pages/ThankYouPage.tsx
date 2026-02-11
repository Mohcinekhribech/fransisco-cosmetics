
import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ThankYouPage: React.FC = () => {
  const { lastOrder } = useCart();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  // If no orderNumber in URL and no lastOrder, redirect to home
  if (!orderNumber && !lastOrder) {
    return <Navigate to="/" />;
  }

  // Extract name from lastOrder if available, otherwise use generic greeting
  const customerName = lastOrder?.firstName || 'Chère cliente / Cher client';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-xl border border-brand-taupe/10 overflow-hidden text-center">
        <div className="bg-brand-nude/30 p-12 md:p-16 space-y-8">
          <div className="w-24 h-24 bg-brand-olive text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif text-brand-charcoal">Thank You, {customerName}</h1>
            <p className="text-lg text-brand-charcoal/60 font-light">Your order has been placed successfully.</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-brand-taupe/20 inline-block px-12">
            <p className="text-xs uppercase tracking-widest text-brand-charcoal/40 font-bold mb-1">Order Number</p>
            <p className="text-xl font-bold text-brand-charcoal">{orderNumber || lastOrder?.id || 'N/A'}</p>
            {lastOrder?.id && orderNumber && lastOrder.id !== orderNumber && (
              <p className="text-xs text-brand-charcoal/40 mt-1">ID: {lastOrder.id}</p>
            )}
          </div>
        </div>

        <div className="p-12 md:p-16 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Et ensuite ?</h4>
              <p className="text-sm text-brand-charcoal/60 leading-relaxed">
                Vous recevrez un e-mail de confirmation. Notre équipe prépare et emballe votre commande avec soin.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Livraison et paiement</h4>
              <p className="text-sm text-brand-charcoal/60 leading-relaxed">
                La livraison standard prend en général 2 à 4 jours ouvrés. Payez en <strong>espèces à la livraison</strong> à réception.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm italic text-brand-charcoal/40 font-serif">« Pureté dans chaque détail, confiance à chaque étape. »</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="bg-brand-nudeGreen text-white px-10 py-4 rounded-full text-sm font-medium hover:bg-brand-nudeGreen/90 transition-all shadow-lg"
              >
                Continuer mes achats
              </Link>
              <Link 
                to="/" 
                className="bg-brand-ivory text-brand-charcoal px-10 py-4 rounded-full text-sm font-medium hover:bg-brand-nude transition-all border border-brand-taupe/20"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
