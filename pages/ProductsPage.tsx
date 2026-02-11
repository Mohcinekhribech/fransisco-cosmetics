import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Category, Product } from '../types';
import { searchProducts, getCategories, isApiConfigured, mapApiProductToProduct } from '../services/apiClient';
import type { ApiCategory } from '../types/api';

const ProductsPage: React.FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const initialCat = query.get('cat') as Category | null;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>(initialCat || 'All');
  const [sort, setSort] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const useApi = isApiConfigured();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<(Category | 'All')[]>(['All']);
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
    getCategories() // GET /api/category
      .then((list: ApiCategory[]) => {
        setCategories(['All', ...list.map(c => c.name as Category)]);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      });
  }, [useApi]);

  useEffect(() => {
    if (!useApi) return;
    setLoading(true);
    setError(null);
    const sortParam = sort === 'price-low' ? 'finalPrice,asc' : sort === 'price-high' ? 'finalPrice,desc' : undefined;
    searchProducts({ // GET /api/product/search?categoryName=...&page=0&size=100&sort=...
      categoryName: category !== 'All' ? category : undefined,
      name: search || undefined,
      page: 0,
      size: 100,
      sort: sortParam,
    })
      .then((page) => {
        setProducts(page.content.map(mapApiProductToProduct));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [useApi, category, search, sort]);

  const hasActiveFilters = search !== '' || category !== 'All';
  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('newest');
    setMobileFiltersOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-serif text-brand-charcoal">La collection</h1>
          <p className="text-brand-charcoal/60 font-light max-w-xl mx-auto">
            Découvrez notre sélection soignée de beauté saine et essentiels bien-être.
          </p>
        </header>

        {/* Filters: mobile trigger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-brand-taupe/20 rounded-2xl py-4 text-sm font-medium text-brand-charcoal hover:bg-brand-nude transition-colors focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
            aria-expanded={mobileFiltersOpen}
            aria-label="Ouvrir les filtres"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-nudeGreen" aria-hidden="true" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-4 rounded-2xl text-sm font-medium text-brand-charcoal/70 hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filters panel: mobile (collapsible) + desktop (always visible) */}
        <div
          className={`bg-white rounded-3xl shadow-sm border border-brand-taupe/10 overflow-hidden transition-all duration-300 ${
            mobileFiltersOpen ? 'max-h-[600px] opacity-100 md:max-h-none' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
          }`}
        >
          <div className="p-6 space-y-6 md:space-y-0 md:flex md:items-center md:justify-between">
            <div className="flex flex-wrap gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 ${
                    category === cat 
                      ? 'bg-brand-charcoal text-white' 
                      : 'bg-brand-ivory text-brand-charcoal hover:bg-brand-nude'
                  }`}
                >
                  {cat === 'All' ? 'Tous' : cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-brand-ivory border border-brand-taupe/20 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe transition-all"
                  aria-label="Search products"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'newest' | 'price-low' | 'price-high')}
                className="w-full sm:w-auto bg-brand-ivory border border-brand-taupe/20 rounded-full px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe text-brand-charcoal"
                aria-label="Trier par"
              >
                <option value="newest">Plus récents</option>
                <option value="price-low">Prix : croissant</option>
                <option value="price-high">Prix : décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop: clear filters when active */}
        {hasActiveFilters && (
          <div className="hidden md:flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-brand-charcoal/60 hover:text-brand-nudeGreen focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 rounded-lg px-2 py-1"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}

        {/* Grid */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-brand-charcoal/60">Chargement des produits…</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-brand-taupe/10 rounded-full flex items-center justify-center mx-auto text-brand-taupe">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-brand-charcoal">Aucun produit trouvé</h3>
            <p className="text-brand-charcoal/60">Modifiez vos filtres ou termes de recherche.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-block mt-4 bg-brand-nudeGreen text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-brand-nudeGreen/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
