
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logoImage from '../assets/logo fransisco cosmetics web.png';

const Navbar: React.FC = () => {
  const { cartCount, cartJustUpdated, openCartDrawer } = useCart();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Produits', path: '/products' },
    { name: 'À propos', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-ivory/95 backdrop-blur-sm border-b border-brand-taupe/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center h-12">
              <img 
                src={logoImage} 
                alt="Fransisco Cosmetics" 
                className="h-full w-auto object-contain"
              />
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-12 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-terracotta ${
                  location.pathname === link.path ? 'text-brand-charcoal underline underline-offset-8' : 'text-brand-charcoal/70'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative p-2 text-brand-charcoal hover:text-brand-nudeGreen transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 focus:ring-offset-brand-ivory"
              aria-label={`Panier, ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span 
                  className={`absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-nudeGreen rounded-full transition-transform duration-300 ${cartJustUpdated ? 'scale-125' : ''}`}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <span className="hidden lg:inline text-sm font-medium text-brand-charcoal/70">Panier</span>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-brand-charcoal rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 focus:ring-offset-brand-ivory"
              aria-expanded={isMobileMenuOpen}
              aria-label="Ouvrir ou fermer le menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-brand-ivory border-t border-brand-taupe/20 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-lg font-medium text-brand-charcoal hover:text-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-inset rounded-lg py-1"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
