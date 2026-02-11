
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/logo fransisco cosmetics web.png';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <footer className="bg-brand-taupe/10 border-t border-brand-taupe/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="h-12 w-auto">
              <img 
                src={logoImage} 
                alt="Fransisco Cosmetics" 
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-sm text-brand-charcoal/60 leading-relaxed">
              Nous sélectionnons le meilleur en cosmétiques naturels et parapharmacie. Confiance, qualité et pureté dans chaque produit.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-6">Boutique</h4>
            <ul className="space-y-4 text-sm text-brand-charcoal/70">
              <li><Link to="/products?cat=Skin Care" className="hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded">Skin Care</Link></li>
              <li><Link to="/products?cat=Hair Care" className="hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded">Hair Care</Link></li>
              <li><Link to="/products?cat=Para-pharmacy" className="hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded">Para-pharmacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-brand-charcoal/70">
              <li><a href="#" className="hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded">Nous contacter</a></li>
              <li><a href="#" className="hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded">Livraison et retours</a></li>
              <li><a href="#" className="hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded">Politique de confidentialité</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-6">Newsletter</h4>
            {submitted ? (
              <div className="flex items-center gap-2 text-brand-olive font-medium text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Merci pour votre inscription !
              </div>
            ) : (
              <>
                <p className="text-sm text-brand-charcoal/60 mb-4">Rejoignez notre communauté pour des actualités exclusives.</p>
                <form onSubmit={handleNewsletterSubmit} className="flex">
                  <label htmlFor="footer-email" className="sr-only">Adresse e-mail</label>
                  <input 
                    id="footer-email"
                    type="email" 
                    placeholder="Adresse e-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border border-brand-taupe/30 rounded-l-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:border-transparent"
                  />
                  <button type="submit" className="bg-brand-nudeGreen text-white rounded-r-lg px-4 py-2 text-sm hover:bg-brand-nudeGreen/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2">
                    S&apos;inscrire
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-brand-taupe/20 text-center text-xs text-brand-charcoal/40">
          &copy; {new Date().getFullYear()} Fransisco Cosmetics. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
