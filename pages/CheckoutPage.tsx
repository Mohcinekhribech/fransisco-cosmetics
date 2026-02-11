import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkoutOrder, isApiConfigured } from '../services/apiClient';
import type { CheckoutRequest } from '../types/api';
import Breadcrumbs from '../components/Breadcrumbs';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    promoCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [backendErrors, setBackendErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Scroll to first error on validation/backend error
  useEffect(() => {
    if ((Object.keys(errors).length > 0 || backendErrors.length > 0) && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors, backendErrors]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters except leading +
    const cleaned = phone.trim();
    if (!cleaned) return false;

    // Extract digits only (allow + prefix)
    const digits = cleaned.replace(/\D/g, '');
    // Check length: 10-15 digits
    return digits.length >= 10 && digits.length <= 15;
  };

  const validateField = (name: string, value: string): string => {
    const trimmed = value.trim();

    if (name === 'fullName') {
      if (!trimmed) return 'Le nom complet est requis.';
      if (trimmed.length < 2) return 'Le nom doit contenir au moins 2 caractères.';
      if (trimmed.length > 100) return 'Le nom ne doit pas dépasser 100 caractères.';
      return '';
    }

    if (name === 'phoneNumber') {
      if (!trimmed) return 'Le numéro de téléphone est requis.';
      if (!validatePhoneNumber(trimmed)) {
        return 'Veuillez entrer un numéro valide (10 à 15 chiffres). Ex. : +212600000000, 0600000000';
      }
      return '';
    }

    if (name === 'address') {
      if (!trimmed) return 'L\'adresse est requise.';
      if (trimmed.length < 10) return 'L\'adresse doit contenir au moins 10 caractères.';
      if (trimmed.length > 500) return 'L\'adresse ne doit pas dépasser 500 caractères.';
      return '';
    }

    if (name === 'promoCode') {
      // Optional field, no validation needed
      return '';
    }

    return '';
  };

  const validateCart = (): string => {
    if (cart.length === 0) {
      return 'Your cart is empty. Please add products before checkout.';
    }
    const invalidItems = cart.filter(item => !item.id || item.quantity < 1);
    if (invalidItems.length > 0) {
      return 'Invalid cart items. Please refresh and try again.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setBackendErrors([]);
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cart
    const cartError = validateCart();
    if (cartError) {
      setBackendErrors([cartError]);
      return;
    }

    // Mark all fields as touched
    setTouched({
      fullName: true,
      phoneNumber: true,
      address: true,
      promoCode: true,
    });

    // Validate all form fields
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);

    // If validation fails, return
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Check if API is configured
    if (!isApiConfigured()) {
      setBackendErrors(['API non configurée. Veuillez contacter le support.']);
      return;
    }

    setSubmitting(true);
    setBackendErrors([]);

    try {
      // Transform cart to orderedProducts format
      const orderedProducts = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      // Build checkout request payload
      const checkoutPayload: CheckoutRequest = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        orderedProducts,
        ...(formData.promoCode.trim() ? { promoCode: formData.promoCode.trim() } : {}),
      };

      // Call checkout API
      const response = await checkoutOrder(checkoutPayload);

      // Success: clear cart and redirect
      clearCart();
      navigate(`/thank-you?orderNumber=${encodeURIComponent(response.orderNumber)}`);
    } catch (err: any) {
      // Handle errors
      if (err.details && Array.isArray(err.details)) {
        // Backend validation errors (400)
        setBackendErrors(err.details);
      } else {
        // Other errors (network, 500, etc.)
        const errorMessage = err.message || 'Impossible de passer la commande. Veuillez réessayer.';
        setBackendErrors([errorMessage]);
      }
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-24 h-24 bg-brand-taupe/10 rounded-full flex items-center justify-center mx-auto text-brand-taupe">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-4xl font-serif text-brand-charcoal">Your cart is empty</h1>
          <p className="text-brand-charcoal/60 leading-relaxed font-light">
            Take a look at our collection and find the perfect products for your daily routine.
          </p>
          <Link 
            to="/products" 
            className="inline-block bg-brand-charcoal text-white px-12 py-4 rounded-full text-sm font-medium hover:bg-brand-nudeGreen/90 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <Breadcrumbs items={[
        { label: 'Accueil', path: '/' },
        { label: 'Panier', path: '/checkout' },
        { label: 'Commande' },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Checkout Form */}
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-4xl font-serif text-brand-charcoal">Checkout</h1>
            <p className="text-brand-charcoal/60 font-light">Complete your order details below.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">
                Nom complet
              </label>
              <input 
                id="fullName"
                required 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                type="text" 
                className={`w-full bg-brand-ivory border rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe ${
                  errors.fullName ? 'border-red-400' : 'border-brand-taupe/30'
                }`}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">
                Téléphone
              </label>
              <input 
                id="phoneNumber"
                required 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                type="tel" 
                placeholder="+212600000000 or 0600000000"
                className={`w-full bg-brand-ivory border rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe ${
                  errors.phoneNumber ? 'border-red-400' : 'border-brand-taupe/30'
                }`}
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
              />
              {errors.phoneNumber && (
                <p id="phoneNumber-error" className="text-xs text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">
                Shipping Address
              </label>
              <textarea 
                id="address"
                required 
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                className={`w-full bg-brand-ivory border rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe resize-none ${
                  errors.address ? 'border-red-400' : 'border-brand-taupe/30'
                }`}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'address-error' : undefined}
                placeholder="Saisissez votre adresse complète de livraison"
              />
              {errors.address && (
                <p id="address-error" className="text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Promo Code */}
            <div className="space-y-2">
              <label htmlFor="promoCode" className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">
                Promo Code <span className="text-brand-charcoal/40 font-normal">(Optional)</span>
              </label>
              <input 
                id="promoCode"
                name="promoCode"
                value={formData.promoCode}
                onChange={handleChange}
                onBlur={handleBlur}
                type="text" 
                placeholder="Saisir le code promo"
                className="w-full bg-brand-ivory border border-brand-taupe/30 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe"
              />
            </div>

            {/* Payment Method */}
            <div className="pt-8 border-t border-brand-taupe/20 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Payment Method</h4>
              <div className="flex items-center space-x-4 p-4 border border-brand-taupe rounded-2xl bg-brand-ivory/50">
                <div className="w-4 h-4 rounded-full border-4 border-brand-charcoal"></div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-brand-charcoal">Cash on Delivery (COD)</p>
                  <p className="text-xs text-brand-charcoal/50">Pay with cash when your order is delivered. No card required.</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-charcoal/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>

            {/* Backend Errors */}
            {backendErrors.length > 0 && (
              <div 
                ref={errorRef}
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm space-y-1" 
                role="alert"
              >
                {backendErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-brand-nudeGreen text-white py-6 rounded-2xl text-lg font-medium hover:bg-brand-nudeGreen/90 transition-all shadow-xl hover:shadow-brand-nudeGreen/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi en cours…' : 'Passer la commande'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-brand-taupe/10 space-y-12">
            <h2 className="text-2xl font-serif text-brand-charcoal">Order Summary</h2>
            
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-20 h-20 bg-brand-ivory rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-brand-charcoal">{item.name}</h4>
                    <p className="text-xs text-brand-charcoal/40 mb-2">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-ivory hover:bg-brand-nude text-xs"
                        >
                          &ndash;
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-ivory hover:bg-brand-nude text-xs"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} MAD</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-brand-charcoal/20 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-brand-taupe/20 space-y-4">
              <div className="flex justify-between text-sm text-brand-charcoal/60">
                <span>Sous-total</span>
                <span>{cartTotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm text-brand-charcoal/60">
                <span>Livraison</span>
                <span className="text-brand-olive font-medium">Offerte</span>
              </div>
              <div className="flex justify-between text-xl font-serif text-brand-charcoal pt-4 border-t border-brand-taupe/20">
                <span>Total</span>
                <span className="text-xs text-brand-charcoal/40 italic">Calculé par le serveur (MAD)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 px-8 text-brand-charcoal/40 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p>Transaction sécurisée. Aucune carte bancaire requise à cette étape.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
