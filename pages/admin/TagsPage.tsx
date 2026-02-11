import React, { useEffect, useState } from 'react';
import { getTags, createTag, updateTag, deleteTag } from '../../services/adminApiClient';
import DataTable, { Column } from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import FormField from '../../components/admin/FormField';
import type { TagDtoResponse, TagDtoRequest } from '../../types/admin';

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<TagDtoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagDtoResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; tag: TagDtoResponse | null }>({
    open: false,
    tag: null,
  });
  const [formData, setFormData] = useState<TagDtoRequest>({
    name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '' });
    setEditingTag(null);
    setShowModal(true);
  };

  const handleOpenEdit = (tag: TagDtoResponse) => {
    setFormData({
      name: tag.name,
      description: tag.description || '',
    });
    setEditingTag(tag);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (editingTag) {
        await updateTag(editingTag.id, formData);
      } else {
        await createTag(formData);
      }

      setShowModal(false);
      fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.tag) return;
    try {
      await deleteTag(deleteConfirm.tag.id);
      setTags(tags.filter((t) => t.id !== deleteConfirm.tag!.id));
      setDeleteConfirm({ open: false, tag: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  const columns: Column<TagDtoResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (tag) => <span className="font-medium text-brand-charcoal">{tag.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (tag) => (
        <p className="text-sm text-brand-charcoal/70">{tag.description || '—'}</p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (tag) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(tag)}
            className="px-3 py-1.5 text-xs font-medium text-brand-terracotta bg-brand-terracotta/10 rounded-lg hover:bg-brand-terracotta/20 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirm({ open: true, tag })}
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
          <h1 className="text-3xl font-serif text-brand-charcoal">Tags</h1>
          <p className="text-brand-charcoal/60 mt-2">Manage product tags</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-terracotta/90 transition-colors font-medium"
        >
          Create Tag
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={tags}
        loading={loading}
        emptyMessage="No tags found"
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-semibold text-brand-charcoal">
              {editingTag ? 'Edit Tag' : 'Create Tag'}
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

              <FormField label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-terracotta rounded-xl hover:bg-brand-terracotta/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm.open}
        title="Delete Tag"
        message={`Are you sure you want to delete "${deleteConfirm.tag?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, tag: null })}
      />
    </div>
  );
};

export default TagsPage;
