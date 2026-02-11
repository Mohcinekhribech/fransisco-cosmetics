import React, { useEffect, useState } from 'react';
import { createCategory, updateCategory, deleteCategory, uploadImages, getUploadImageUrl } from '../../services/adminApiClient';
import { getCategories } from '../../services/apiClient';
import DataTable, { Column } from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import FormField from '../../components/admin/FormField';
import type { CategoryDtoResponse, CategoryDtoRequest } from '../../types/admin';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDtoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDtoResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; category: CategoryDtoResponse | null }>({
    open: false,
    category: null,
  });
  const [formData, setFormData] = useState<CategoryDtoRequest>({
    name: '',
    image: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const cats = await getCategories();
      setCategories(cats as CategoryDtoResponse[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', image: '', description: '' });
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleOpenEdit = (category: CategoryDtoResponse) => {
    setFormData({
      name: category.name,
      image: category.image,
      description: category.description,
    });
    setEditingCategory(category);
    setUploadError(null);
    setShowModal(true);
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const filenames = await uploadImages([file]);
      setFormData((prev) => ({ ...prev, image: filenames[0] ?? '' }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.category) return;
    try {
      await deleteCategory(deleteConfirm.category.id);
      setCategories(categories.filter((c) => c.id !== deleteConfirm.category!.id));
      setDeleteConfirm({ open: false, category: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const columns: Column<CategoryDtoResponse>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (category) => (
        <img
          src={category.image ? getUploadImageUrl(category.image) : 'https://via.placeholder.com/60x60?text=No+Image'}
          alt={category.name}
          className="w-16 h-16 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=No+Image';
          }}
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (category) => <span className="font-medium text-brand-charcoal">{category.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (category) => (
        <p className="text-sm text-brand-charcoal/70 line-clamp-2">{category.description}</p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(category)}
            className="px-3 py-1.5 text-xs font-medium text-brand-terracotta bg-brand-terracotta/10 rounded-lg hover:bg-brand-terracotta/20 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirm({ open: true, category })}
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
          <h1 className="text-3xl font-serif text-brand-charcoal">Categories</h1>
          <p className="text-brand-charcoal/60 mt-2">Manage product categories</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-terracotta/90 transition-colors font-medium"
        >
          Create Category
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found"
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-semibold text-brand-charcoal">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Name" required>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                />
              </FormField>

              <FormField label="Category image" required={!editingCategory}>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleImageFileSelect}
                  className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-terracotta/10 file:text-brand-terracotta"
                />
                {uploading && <p className="mt-2 text-sm text-brand-charcoal/70">Uploading…</p>}
                {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
                {formData.image && (
                  <div className="mt-4 relative group inline-block">
                    <img
                      src={getUploadImageUrl(formData.image)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-brand-taupe/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </FormField>

              <FormField label="Description" required>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                />
              </FormField>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-brand-charcoal bg-brand-ivory rounded-xl hover:bg-brand-nude transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || (!editingCategory && !formData.image)}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-terracotta rounded-xl hover:bg-brand-terracotta/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : uploading ? 'Uploading...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm.open}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, category: null })}
      />
    </div>
  );
};

export default CategoriesPage;
