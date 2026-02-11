import React, { useEffect, useState } from 'react';
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
} from '../../services/adminApiClient';
import DataTable, { Column } from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import ConfirmModal from '../../components/admin/ConfirmModal';
import FormField from '../../components/admin/FormField';
import type { PromoCodeDtoResponse, PromoCodeDtoRequest } from '../../types/admin';

const PromoCodesPage: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCodeDtoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCodeDtoResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    promoCode: PromoCodeDtoResponse | null;
  }>({ open: false, promoCode: null });
  const [formData, setFormData] = useState<PromoCodeDtoRequest>({
    code: '',
    discount: 0,
    discountType: 'PERCENTAGE',
    maxUses: 1,
    influencer: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message?: string } | null>(
    null
  );

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPromoCodes();
      setPromoCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      code: '',
      discount: 0,
      discountType: 'PERCENTAGE',
      maxUses: 1,
      influencer: '',
      active: true,
    });
    setEditingPromoCode(null);
    setValidationResult(null);
    setShowModal(true);
  };

  const handleOpenEdit = (promoCode: PromoCodeDtoResponse) => {
    // Extract influencer string from object if needed
    let influencerValue = '';
    if (promoCode.influencer) {
      if (typeof promoCode.influencer === 'string') {
        influencerValue = promoCode.influencer;
      } else if (typeof promoCode.influencer === 'object' && promoCode.influencer !== null) {
        influencerValue = (promoCode.influencer as any).name || (promoCode.influencer as any).email || '';
      }
    }

    setFormData({
      code: promoCode.code,
      discount: promoCode.discount ?? 0,
      discountType: promoCode.discountType || 'PERCENTAGE',
      maxUses: promoCode.maxUses ?? 1,
      influencer: influencerValue,
      active: promoCode.active ?? true,
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
    });
    setEditingPromoCode(promoCode);
    setValidationResult(null);
    setShowModal(true);
  };

  const handleValidateCode = async () => {
    if (!formData.code) return;
    try {
      setValidatingCode(true);
      const result = await validatePromoCode(formData.code);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({
        valid: false,
        message: err instanceof Error ? err.message : 'Validation failed',
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (editingPromoCode) {
        await updatePromoCode(editingPromoCode.id, formData);
      } else {
        await createPromoCode(formData);
      }

      setShowModal(false);
      fetchPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.promoCode) return;
    try {
      await deletePromoCode(deleteConfirm.promoCode.id);
      setPromoCodes(promoCodes.filter((p) => p.id !== deleteConfirm.promoCode!.id));
      setDeleteConfirm({ open: false, promoCode: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promo code');
    }
  };

  const handleToggleActive = async (promoCode: PromoCodeDtoResponse) => {
    try {
      await updatePromoCode(promoCode.id, { ...promoCode, active: !promoCode.active });
      fetchPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update promo code');
    }
  };

  const columns: Column<PromoCodeDtoResponse>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (promoCode) => (
        <span className="font-mono font-medium text-brand-charcoal">{promoCode.code}</span>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (promoCode) => {
        if (!promoCode) return <span className="text-sm text-brand-charcoal">—</span>;
        const discount = typeof promoCode.discount === 'number' ? promoCode.discount : 0;
        const discountType = promoCode.discountType || 'PERCENTAGE';
        return (
          <span className="font-semibold text-brand-charcoal">
            {discountType === 'PERCENTAGE'
              ? `${discount}%`
              : `${discount.toFixed(2)} MAD`}
          </span>
        );
      },
    },
    {
      key: 'uses',
      header: 'Usage',
      render: (promoCode) => (
        <span className="text-sm text-brand-charcoal">
          {promoCode.currentUses ?? 0} / {promoCode.maxUses ?? 0}
        </span>
      ),
    },
    {
      key: 'influencer',
      header: 'Influencer',
      render: (promoCode) => {
        let influencerDisplay = '—';
        if (promoCode.influencer) {
          if (typeof promoCode.influencer === 'string') {
            influencerDisplay = promoCode.influencer;
          } else if (typeof promoCode.influencer === 'object' && promoCode.influencer !== null) {
            influencerDisplay = (promoCode.influencer as any).name || (promoCode.influencer as any).email || '—';
          }
        }
        return <span className="text-sm text-brand-charcoal">{influencerDisplay}</span>;
      },
    },
    {
      key: 'active',
      header: 'Status',
      render: (promoCode) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
            promoCode.active
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-800 border border-gray-300'
          }`}
        >
          {promoCode.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (promoCode) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleToggleActive(promoCode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              promoCode.active
                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                : 'text-green-600 bg-green-50 hover:bg-green-100'
            }`}
          >
            {promoCode.active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(promoCode)}
            className="px-3 py-1.5 text-xs font-medium text-brand-terracotta bg-brand-terracotta/10 rounded-lg hover:bg-brand-terracotta/20 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirm({ open: true, promoCode })}
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
          <h1 className="text-3xl font-serif text-brand-charcoal">Promo Codes</h1>
          <p className="text-brand-charcoal/60 mt-2">Manage discount codes and promotions</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-brand-terracotta text-white rounded-xl hover:bg-brand-terracotta/90 transition-colors font-medium"
        >
          Create Promo Code
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={promoCodes}
        loading={loading}
        emptyMessage="No promo codes found"
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-brand-charcoal">
              {editingPromoCode ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Code" required>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="flex-1 px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                    placeholder="PROMO2024"
                  />
                  <button
                    type="button"
                    onClick={handleValidateCode}
                    disabled={!formData.code || validatingCode}
                    className="px-4 py-2 text-sm font-medium text-brand-terracotta bg-brand-terracotta/10 rounded-lg hover:bg-brand-terracotta/20 transition-colors disabled:opacity-50"
                  >
                    {validatingCode ? 'Validating...' : 'Validate'}
                  </button>
                </div>
                {validationResult && (
                  <p
                    className={`text-xs mt-1 ${
                      validationResult.valid ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {validationResult.message || (validationResult.valid ? 'Code is valid' : 'Code is invalid')}
                  </p>
                )}
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Discount" required>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                  />
                </FormField>

                <FormField label="Discount Type" required>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                      })
                    }
                    required
                    className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Montant fixe (MAD)</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Max Uses" required>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: parseInt(e.target.value) || 1 })
                  }
                  required
                  className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                />
              </FormField>

              <FormField label="Influencer (Optional)">
                <input
                  type="text"
                  value={formData.influencer}
                  onChange={(e) => setFormData({ ...formData, influencer: e.target.value })}
                  placeholder="Influencer name"
                  className="w-full px-4 py-2 border border-brand-taupe/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20"
                />
              </FormField>

              <FormField label="Status">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-brand-terracotta rounded focus:ring-brand-terracotta"
                  />
                  <span className="text-sm text-brand-charcoal">Active</span>
                </label>
              </FormField>

              {editingPromoCode && (
                <div className="p-3 bg-brand-ivory/50 rounded-lg">
                  <p className="text-xs text-brand-charcoal/60">Usage Stats</p>
                  <p className="text-sm font-medium text-brand-charcoal mt-1">
                    {editingPromoCode.currentUses || 0} / {editingPromoCode.maxUses} uses
                  </p>
                </div>
              )}

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
                  {saving ? 'Saving...' : editingPromoCode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm.open}
        title="Delete Promo Code"
        message={`Are you sure you want to delete "${deleteConfirm.promoCode?.code}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, promoCode: null })}
      />
    </div>
  );
};

export default PromoCodesPage;
