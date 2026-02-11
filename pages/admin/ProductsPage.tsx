import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, getUploadImageUrl } from '../../services/adminApiClient';
import { getCategories } from '../../services/apiClient';
import DataTable, { Column } from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import type { ProductDtoResponse } from '../../types/admin';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDtoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; product: ProductDtoResponse | null }>({
    open: false,
    product: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats.map((c) => ({ id: c.id, name: c.name })));
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const allProducts = await getProducts();
        let filtered = allProducts;

        // Filter by category
        if (selectedCategory) {
          filtered = filtered.filter((p) => {
            const pCategoryName = p.categoryName || 
              (typeof p.category === 'string' ? p.category : 
               (typeof p.category === 'object' && p.category !== null ? (p.category as any).name : ''));
            return pCategoryName === selectedCategory;
          });
        }

        // Filter by search term
        if (searchTerm) {
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setProducts(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const handleDelete = async () => {
    if (!deleteConfirm.product) return;
    try {
      await deleteProduct(deleteConfirm.product.id);
      setProducts(products.filter((p) => p.id !== deleteConfirm.product!.id));
      setDeleteConfirm({ open: false, product: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const columns: Column<ProductDtoResponse>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (product) => {
        const imageSrc =
          product.productMedias?.[0]?.mediaName != null
            ? getUploadImageUrl(product.productMedias[0].mediaName)
            : product.image
              ? getUploadImageUrl(product.image)
              : 'https://via.placeholder.com/60x60?text=No+Image';
        return (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=No+Image';
            }}
          />
        );
      },
    },
    {
      key: 'name',
      header: 'Name',
      render: (product) => (
        <div>
          <p className="font-medium text-brand-charcoal">{product.name}</p>
          <p className="text-xs text-brand-charcoal/50 mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) => {
        let categoryName = product.categoryName;
        if (!categoryName && product.category) {
          if (typeof product.category === 'string') {
            categoryName = product.category;
          } else if (typeof product.category === 'object' && product.category !== null) {
            categoryName = (product.category as any).name || String(product.category);
          }
        }
        return (
          <span className="text-sm text-brand-charcoal">{categoryName || 'N/A'}</span>
        );
      },
    },
    {
      key: 'purchasePrice',
      header: 'Purchase Price',
      render: (product) => (
        <span className="text-sm text-brand-charcoal">{product.purchasePrice.toFixed(2)} MAD</span>
      ),
    },
    {
      key: 'finalPrice',
      header: 'Final Price',
      render: (product) => (
        <span className="font-semibold text-brand-charcoal">{product.finalPrice.toFixed(2)} MAD</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <span
          className={`text-sm font-medium ${
            product.inStock ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/products/${product.id}/edit`}
            className="px-3 py-1.5 text-xs font-medium text-brand-terracotta bg-brand-terracotta/10 rounded-lg hover:bg-brand-terracotta/20 transition-colors"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm({ open: true, product });
            }}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-brand-charcoal">Products</h1>
          <p className="text-brand-charcoal/60 mt-2">Manage your product catalog</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/products/new')}
          className="px-6 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-terracotta/90 transition-colors font-medium"
        >
          Create Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-brand-taupe/10 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {(searchTerm || selectedCategory) && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="px-4 py-2 text-sm text-brand-charcoal/60 hover:text-brand-charcoal"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found"
      />

      <ConfirmModal
        open={deleteConfirm.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.product?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, product: null })}
      />
    </div>
  );
};

export default ProductsPage;
