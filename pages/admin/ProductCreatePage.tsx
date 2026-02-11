import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createProduct,
  uploadImages,
  attachProductMediaAll,
  getUploadImageUrl,
} from '../../services/adminApiClient';
import { getCategories } from '../../services/apiClient';
import { getTags } from '../../services/adminApiClient';
import FormField from '../../components/admin/FormField';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import type { ProductDtoRequest, ProductFormState } from '../../types/admin';
import type { ApiCategory } from '../../types/api';
import type { TagDtoResponse } from '../../types/admin';

const initialFormData: ProductFormState = {
  name: '',
  description: '',
  category: '',
  purchasePrice: 0,
  finalPrice: 0,
  quantity: 0,
  weight: 0,
  benefits: [],
  usage: '',
  ingredients: '',
  inStock: true,
};

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [tags, setTags] = useState<TagDtoResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [pendingFilenames, setPendingFilenames] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormState>({ ...initialFormData });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, allTags] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(allTags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const benefitsArr = Array.isArray(formData.benefits) ? formData.benefits : [];
      const payload: ProductDtoRequest = {
        categoryId: formData.category,
        name: formData.name,
        description: formData.description,
        benefits: benefitsArr.join(','),
        howToUse: formData.usage,
        purchasePrice: formData.purchasePrice,
        finalPrice: formData.finalPrice,
        quantity: formData.quantity,
        weight: formData.weight,
        tags: selectedTagIds,
      };

      const created = await createProduct(payload);
      const productId = created.id;

      if (pendingFilenames.length > 0) {
        try {
          await attachProductMediaAll(
            pendingFilenames.map((mediaName) => ({ mediaName, productId }))
          );
        } catch (mediaErr) {
          setError(
            mediaErr instanceof Error
              ? `Product saved but failed to attach images: ${mediaErr.message}`
              : 'Product saved but failed to attach images.'
          );
          setSaving(false);
          return;
        }
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fileList = Array.from(files);
      const filenames = await uploadImages(fileList);
      setPendingFilenames((prev) => [...prev, ...filenames]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePending = (filename: string) => {
    setPendingFilenames((prev) => prev.filter((f) => f !== filename));
  };

  const addBenefit = () => {
    const currentBenefits = Array.isArray(formData.benefits) ? formData.benefits : [];
    setFormData({ ...formData, benefits: [...currentBenefits, ''] });
  };

  const updateBenefit = (index: number, value: string) => {
    const currentBenefits = Array.isArray(formData.benefits) ? formData.benefits : [];
    const newBenefits = [...currentBenefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    const currentBenefits = Array.isArray(formData.benefits) ? formData.benefits : [];
    setFormData({ ...formData, benefits: currentBenefits.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-brand-charcoal">Create Product</h1>
        <p className="text-brand-charcoal/60 mt-2">Add a new product to your catalog</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-brand-taupe/10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal border-b border-brand-taupe/10 pb-2">
            Basic Information
          </h2>
          <FormField label="Product Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
            />
          </FormField>
          <FormField label="Description" required>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
            />
          </FormField>
          <FormField label="Category" required>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal border-b border-brand-taupe/10 pb-2">
            Pricing
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Price" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
              />
            </FormField>
            <FormField label="Final Price" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.finalPrice}
                onChange={(e) => setFormData({ ...formData, finalPrice: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal border-b border-brand-taupe/10 pb-2">
            Inventory
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
                className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
              />
            </FormField>
            <FormField label="Weight (kg)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
              />
            </FormField>
          </div>
          <FormField label="Stock Status">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 text-brand-terracotta rounded focus:ring-brand-terracotta"
              />
              <span className="text-sm text-brand-charcoal">In Stock</span>
            </label>
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal border-b border-brand-taupe/10 pb-2">
            Content
          </h2>
          <FormField label="Benefits">
            <div className="space-y-2">
              {(Array.isArray(formData.benefits) ? formData.benefits : []).map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder="Enter benefit"
                    className="flex-1 px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addBenefit} className="text-sm text-brand-terracotta hover:underline">
                + Add Benefit
              </button>
            </div>
          </FormField>
          <FormField label="How to Use">
            <textarea
              value={formData.usage}
              onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
            />
          </FormField>
          <FormField label="Ingredients">
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal border-b border-brand-taupe/10 pb-2">
            Tags
          </h2>
          <FormField label="Select Tags">
            <div className="space-y-2 max-h-48 overflow-y-auto border border-brand-taupe/20 rounded-lg p-3">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 cursor-pointer hover:bg-brand-nude/30 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTagIds([...selectedTagIds, tag.id]);
                      else setSelectedTagIds(selectedTagIds.filter((tid) => tid !== tag.id));
                    }}
                    className="w-4 h-4 text-brand-terracotta rounded focus:ring-brand-terracotta"
                  />
                  <span className="text-sm text-brand-charcoal">{tag.name}</span>
                </label>
              ))}
            </div>
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-charcoal border-b border-brand-taupe/10 pb-2">
            Media
          </h2>
          <FormField label="Product images">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-terracotta/10 file:text-brand-terracotta"
            />
            {uploading && <p className="mt-2 text-sm text-brand-charcoal/70">Uploading…</p>}
            {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
            <div className="mt-4 flex flex-wrap gap-4">
              {pendingFilenames.map((filename) => (
                <div key={filename} className="relative group">
                  <img
                    src={getUploadImageUrl(filename)}
                    alt=""
                    className="w-24 h-24 object-cover rounded-lg border border-brand-taupe/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePending(filename)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </FormField>
        </div>

        <div className="flex gap-4 pt-4 border-t border-brand-taupe/10">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-terracotta/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 bg-brand-ivory text-brand-charcoal rounded-xl hover:bg-brand-nude transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreatePage;
