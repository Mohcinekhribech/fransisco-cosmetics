import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, searchProducts, isApiConfigured, mapApiProductToProduct } from '../services/apiClient';
import { getUploadImageUrl } from '../utils/upload';
import type { ApiCategory } from '../types/api';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const useApi = isApiConfigured();
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useApi) {
      setError('API not configured. Set VITE_API_BASE_URL in .env');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const timeoutId = setTimeout(() => {
      setError('Request timeout. Check if backend is running at ' + import.meta.env.VITE_API_BASE_URL);
      setLoading(false);
    }, 10000);
    
    Promise.all([
      getCategories(), // GET /api/category
      searchProducts({ page: 0, size: 4 }), // GET /api/product/search?page=0&size=4
    ])
      .then(([list, page]) => {
        clearTimeout(timeoutId);
        setCategories(list.map(c => ({ name: c.name, image: c.image || '' })));
        setFeaturedProducts(page.content.map(mapApiProductToProduct));
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        setError(err instanceof Error ? err.message : 'Failed to load data. Check if backend is running.');
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
  }, [useApi]);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/28861616/pexels-photo-28861616.jpeg" 
            alt="Produits de soins et beauté naturels sur un marbre"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-ivory via-brand-ivory/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif text-brand-charcoal leading-tight">
              Beauté naturelle, <br />
              <span className="italic">soigneusement sélectionnée</span> <br />
              pour votre peau.
            </h1>
            <p className="text-xl text-brand-charcoal/70 leading-relaxed font-light">
              Découvrez la pureté de la science botanique. Nous sélectionnons les produits les plus efficaces et sains pour votre rituel quotidien.
            </p>
            <div className="flex space-x-4">
              <Link 
                to="/products" 
                className="bg-brand-nudeGreen text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-brand-nudeGreen/90 transition-all shadow-lg hover:shadow-brand-nudeGreen/20"
              >
                Découvrir les produits
              </Link>
              <Link 
                to="/about" 
                className="bg-white/50 backdrop-blur-md border border-brand-taupe text-brand-charcoal px-8 py-4 rounded-full text-sm font-medium hover:bg-white transition-all"
              >
                Pourquoi notre boutique
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Snippet – GET /api/category when API configured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm mb-8" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-brand-ivory/50 animate-pulse" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link 
                key={cat.name}
                to={`/products?cat=${encodeURIComponent(cat.name)}`} 
                className="group relative h-80 rounded-3xl overflow-hidden shadow-sm"
              >
                <img src={cat.image ? getUploadImageUrl(cat.image) : 'https://via.placeholder.com/800x800?text=' + encodeURIComponent(cat.name)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-brand-charcoal/20 group-hover:bg-brand-charcoal/40 transition-colors"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl font-serif text-white">{cat.name}</h3>
                  <p className="text-white/80 text-sm mt-2 font-light">Découvrir la collection &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* Featured Products – GET /api/product/search?page=0&size=4 when API configured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif text-brand-charcoal">Essentiels à la une</h2>
            <p className="text-brand-charcoal/60 mt-2">Le meilleur de notre sélection.</p>
          </div>
          <Link to="/products" className="text-brand-nudeGreen font-medium border-b border-brand-nudeGreen/30 hover:border-brand-nudeGreen transition-all">
            Voir tous les produits
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-brand-ivory/50 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        ) : null}
      </section>

      {/* Values Section */}
      <section className="bg-brand-nude/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif text-brand-charcoal">Rooted in Purity, <br />Driven by Science</h2>
              <p className="text-lg text-brand-charcoal/70 leading-relaxed font-light">
                We believe that what you put on your body is as important as what you put in it. Every product in our catalog undergoes rigorous testing for purity, effectiveness, and sustainability.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-brand-olive/20 rounded-full flex items-center justify-center text-brand-olive">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-brand-charcoal">Skin-Safe</h4>
                  <p className="text-sm text-brand-charcoal/60">Dermatologist approved formulas.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-brand-nudeGreen/20 rounded-full flex items-center justify-center text-brand-nudeGreen">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-brand-charcoal">High Potency</h4>
                  <p className="text-sm text-brand-charcoal/60">Active botanical ingredients.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000" 
                alt="Laboratoire et ingrédients naturels, pureté et science" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
