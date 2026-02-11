import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import LazyImage from './LazyImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-brand-taupe/10 hover:border-brand-taupe/20 hover:-translate-y-1 transition-all duration-300">
      {/* Image: strict 1:1 aspect ratio */}
      <Link
        to={`/product/${product.id}`}
        state={{ product }}
        className="block aspect-[1/1] overflow-hidden rounded-t-2xl bg-brand-ivory/30"
      >
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 rounded-t-2xl"
          skeletonClassName="rounded-t-2xl"
        />
      </Link>

      <div className="p-5 sm:p-6 flex flex-col">
        <div className="flex justify-between items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest text-brand-charcoal/50 font-medium">
            {typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Produit'}
          </span>
          <span className="text-base font-semibold text-brand-charcoal tabular-nums">
            {product.price.toFixed(2)} MAD
          </span>
        </div>

        <Link to={`/product/${product.id}`} state={{ product }} className="flex-1">
          <h3 className="text-lg font-serif font-bold text-brand-charcoal mb-4 hover:text-brand-nudeGreen transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
          className="w-full bg-brand-nudeGreen text-white py-3.5 rounded-xl text-sm font-medium hover:bg-brand-nudeGreen/90 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2"
        >
          Ajouter au panier
        </button>
      </div>

      {product.stockStatus === 'Low Stock' && (
        <span className="absolute top-4 left-4 bg-brand-nudeGreen/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
          Stock limité
        </span>
      )}
    </div>
  );
};

export default ProductCard;
