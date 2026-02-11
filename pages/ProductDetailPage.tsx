import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { searchProducts, isApiConfigured, mapApiProductToProduct } from '../services/apiClient';
import { Product } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import LazyImage from '../components/LazyImage';
import ProductCard from '../components/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { addToCartWithQuantity } = useCart();

  const productFromState = (location.state as { product?: Product })?.product;
  const [product, setProduct] = useState<Product | null>(productFromState ?? null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!productFromState);

  const [activeImage, setActiveImage] = useState(product?.image ?? '');
  const [quantity, setQuantity] = useState(1);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [userConcerns, setUserConcerns] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  useEffect(() => {
    if (product) setActiveImage(product.image);
  }, [product?.id]);

  useEffect(() => {
    if (!productFromState && isApiConfigured() && id) {
      setLoading(true);
      searchProducts({ page: 0, size: 100 })
        .then((page) => {
          const found = page.content.find(p => p.id === id);
          if (found) {
            const p = mapApiProductToProduct(found);
            setProduct(p);
            setActiveImage(p.image);
            searchProducts({ categoryName: p.category, page: 0, size: 4 })
              .then((relatedPage) => {
                setRelatedProducts(
                  relatedPage.content
                    .filter(p => p.id !== id)
                    .slice(0, 3)
                    .map(mapApiProductToProduct)
                );
              })
              .catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (product) {
      if (isApiConfigured()) {
        searchProducts({ categoryName: product.category, page: 0, size: 4 })
          .then((page) => {
            setRelatedProducts(
              page.content
                .filter(p => p.id !== product.id)
                .slice(0, 3)
                .map(mapApiProductToProduct)
            );
          })
          .catch(() => {});
      }
    }
  }, [id, productFromState, product?.id, product?.category]);

  const productReviews: never[] = [];
  const averageRating = null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-brand-charcoal/60">Chargement du produit…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-serif">Produit introuvable</h2>
          <Link to="/products" className="text-brand-nudeGreen underline">Retour au catalogue</Link>
        </div>
      </div>
    );
  }

  const handleGetAdvice = async () => {
    if (!userConcerns.trim()) return;
    setAdviceLoading(true);
    try {
      setAiAdvice(
        `Pour votre besoin (${userConcerns}), nous vous recommandons de vérifier si ${product.name} convient à votre type de peau. Ce produit fait partie de la catégorie ${product.category}. Pour un conseil personnalisé, contactez notre support.`
      );
    } catch {
      setAiAdvice('Impossible de générer un conseil. Veuillez contacter le support.');
    }
    setAdviceLoading(false);
  };

  const handleAddToCart = () => {
    addToCartWithQuantity(product, quantity);
  };

  const trustBadges = [
    { label: 'Livraison gratuite à partir de 500 MAD', icon: '🚚' },
    { label: 'Paiement sécurisé', icon: '🔒' },
    { label: 'Retours faciles', icon: '↩️' },
  ];

  return (
    <div className="pb-24 md:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <Breadcrumbs items={[
        { label: 'Accueil', path: '/' },
        { label: 'Produits', path: '/products' },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mt-8">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[1/1] max-h-[560px] mx-auto rounded-3xl overflow-hidden bg-white shadow-lg border border-brand-taupe/10">
            <LazyImage
              src={activeImage ?? product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300 rounded-3xl"
              skeletonClassName="rounded-3xl"
            />
          </div>
          {product.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-brand-terracotta ring-2 ring-brand-terracotta/30' : 'border-brand-taupe/20 hover:border-brand-taupe/40'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info — conversion-focused order */}
        <div className="space-y-8">
          {/* Category + title + price + stock — above the fold */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/50">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-brand-charcoal leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-2xl font-semibold text-brand-charcoal">
                {product.price.toFixed(2)} MAD
              </p>
              {averageRating !== null && (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= Math.round(averageRating) ? 'text-amber-500' : 'text-brand-taupe/30'}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-brand-charcoal/60 ml-1">
                    {averageRating.toFixed(1)} ({productReviews.length} {productReviews.length === 1 ? 'avis' : 'avis'})
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                product.stockStatus === 'In Stock' ? 'bg-green-500' :
                product.stockStatus === 'Low Stock' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-brand-charcoal/80">{product.stockStatus}</span>
              {product.stockStatus === 'Low Stock' && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Selling fast</span>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 py-4 border-y border-brand-taupe/15">
            {trustBadges.map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-2 text-brand-charcoal/70 text-sm">
                <span aria-hidden>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Short description */}
          <p className="text-lg text-brand-charcoal/80 leading-relaxed">
            {product.description}
          </p>

          {/* Add to Cart — primary CTA with quantity */}
          <div className="space-y-4 p-6 rounded-2xl bg-brand-ivory/50 border border-brand-taupe/10">
            <div className="flex items-center gap-4">
              <label htmlFor="qty" className="text-sm font-medium text-brand-charcoal">Quantity</label>
              <div className="flex items-center border border-brand-taupe/20 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-brand-charcoal hover:bg-brand-nude transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  −
                </button>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))}
                  className="w-14 h-12 text-center font-medium border-x border-brand-taupe/20 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(99, q + 1))}
                  className="w-12 h-12 flex items-center justify-center text-brand-charcoal hover:bg-brand-nude transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-brand-nudeGreen text-white py-4 rounded-2xl text-lg font-semibold hover:bg-brand-nudeGreen/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
            >
              Ajouter au panier — {(product.price * quantity).toFixed(2)} MAD
            </button>
            <p className="text-center text-sm text-brand-charcoal/60">
              Satisfaction garantie. Livraison gratuite à partir de 500 MAD.
            </p>
          </div>

          {/* Benefits + usage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Avantages</h4>
              <ul className="space-y-2">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-brand-charcoal/80">
                    <span className="w-5 h-5 rounded-full bg-brand-olive/20 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-brand-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">How to use</h4>
              <p className="text-sm text-brand-charcoal/80 leading-relaxed italic">
                {product.usage}
              </p>
            </div>
          </div>

          {/* Ingredients */}
          <div className="pt-6 border-t border-brand-taupe/20">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal mb-3">Ingrédients</h4>
            <p className="text-xs text-brand-charcoal/50 leading-relaxed tracking-wider">
              {product.ingredients}
            </p>
          </div>

          {/* AI Advisor */}
          <div className="bg-brand-nude/30 p-6 rounded-2xl border border-brand-taupe/10 space-y-4">
            <div className="flex items-center gap-2 text-brand-charcoal">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-nudeGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-serif text-lg">Conseiller personnel</h3>
            </div>
            <p className="text-sm text-brand-charcoal/60">Not sure if it’s right for you? </p>
            <p className="text-sm text-brand-charcoal/60">Pas sûr que ce soit pour vous ? Indiquez vos préoccupations peau.</p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="ex. peau sèche, sensible..."
                value={userConcerns}
                onChange={e => setUserConcerns(e.target.value)}
                className="flex-1 min-w-[180px] bg-white border border-brand-taupe/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe"
              />
              <button
                onClick={handleGetAdvice}
                disabled={adviceLoading || !userConcerns.trim()}
                className="bg-brand-charcoal text-white px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-brand-nudeGreen/90 transition-colors"
              >
                {adviceLoading ? 'Analyzing...' : 'Ask AI'}
              </button>
            </div>
            {aiAdvice && (
              <div className="bg-white/90 p-4 rounded-xl border border-brand-taupe/20">
                <p className="text-sm leading-relaxed text-brand-charcoal italic">{aiAdvice}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Reviews */}
      {productReviews.length > 0 && (
        <section className="mt-20 pt-16 border-t border-brand-taupe/20">
          <h2 className="text-2xl font-serif text-brand-charcoal mb-6">Ce que disent nos clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productReviews.map(review => (
              <div key={review.id} className="p-6 rounded-2xl bg-brand-ivory/40 border border-brand-taupe/10">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= review.rating ? 'text-amber-500' : 'text-brand-taupe/30'}>★</span>
                  ))}
                  <span className="text-sm font-medium text-brand-charcoal/80">{review.author}</span>
                  <span className="text-xs text-brand-charcoal/50">{review.date}</span>
                </div>
                <p className="text-brand-charcoal/80 text-sm leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-brand-taupe/20">
          <h2 className="text-2xl font-serif text-brand-charcoal mb-2">Vous aimerez aussi</h2>
          <p className="text-brand-charcoal/60 mb-8">Complétez votre routine avec ces incontournables.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      </div>

      {/* Fixed Add to Cart bar — mobile & desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-brand-taupe/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        role="region"
        aria-label="Ajouter au panier"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center border border-brand-taupe/25 rounded-xl overflow-hidden bg-brand-ivory flex-shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center text-brand-charcoal hover:bg-brand-nude transition-colors"
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="w-10 md:w-12 h-11 md:h-12 flex items-center justify-center font-semibold text-brand-charcoal border-x border-brand-taupe/20 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(99, q + 1))}
                className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center text-brand-charcoal hover:bg-brand-nude transition-colors"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 min-w-0 bg-brand-nudeGreen text-white py-3.5 md:py-4 rounded-xl text-base md:text-lg font-semibold hover:bg-brand-nudeGreen/90 transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              Ajouter au panier — {(product.price * quantity).toFixed(2)} MAD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
