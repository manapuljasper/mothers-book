"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Loader2, Plus, Search, Edit2, Trash2, X, Check } from "lucide-react";
import { LAB_CATEGORY_LABELS, LabCategory } from "@convex/lib/validators";

type LabCatalogItem = {
  _id: Id<"labCatalog">;
  name: string;
  code?: string;
  category: string;
  description?: string;
  normalRange?: string;
  units?: string;
  preparation?: string;
  isActive: boolean;
  createdAt: number;
};

interface LabFormData {
  name: string;
  code: string;
  category: string;
  description: string;
  normalRange: string;
  units: string;
  preparation: string;
}

const emptyFormData: LabFormData = {
  name: "",
  code: "",
  category: "other",
  description: "",
  normalRange: "",
  units: "",
  preparation: "",
};

export default function LaboratoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LabCatalogItem | null>(null);
  const [formData, setFormData] = useState<LabFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"labCatalog"> | null>(null);

  const labs = useQuery(api.admin.listLabCatalog, {
    searchQuery: searchQuery || undefined,
    category: categoryFilter || undefined,
  });

  const createLab = useMutation(api.admin.createLabCatalogItem);
  const updateLab = useMutation(api.admin.updateLabCatalogItem);
  const deleteLab = useMutation(api.admin.deleteLabCatalogItem);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (item: LabCatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code || "",
      category: item.category,
      description: item.description || "",
      normalRange: item.normalRange || "",
      units: item.units || "",
      preparation: item.preparation || "",
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateLab({
          id: editingItem._id,
          name: formData.name.trim(),
          code: formData.code.trim() || undefined,
          category: formData.category,
          description: formData.description.trim() || undefined,
          normalRange: formData.normalRange.trim() || undefined,
          units: formData.units.trim() || undefined,
          preparation: formData.preparation.trim() || undefined,
        });
      } else {
        await createLab({
          name: formData.name.trim(),
          code: formData.code.trim() || undefined,
          category: formData.category,
          description: formData.description.trim() || undefined,
          normalRange: formData.normalRange.trim() || undefined,
          units: formData.units.trim() || undefined,
          preparation: formData.preparation.trim() || undefined,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save lab test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"labCatalog">) => {
    try {
      await deleteLab({ id });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete lab test:", error);
    }
  };

  const handleToggleActive = async (item: LabCatalogItem) => {
    try {
      await updateLab({
        id: item._id,
        isActive: !item.isActive,
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  if (labs === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading laboratory tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--primary)]">Laboratory Test Catalog</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Manage laboratory tests available for ordering
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Lab Test
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search lab tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[var(--background-white)] border border-[var(--border)] pl-10 pr-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-[var(--background-white)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          >
            <option value="">All Categories</option>
            {Object.entries(LAB_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-[var(--background-white)] border border-[var(--border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Normal Range
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {labs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    No laboratory tests found. Add your first lab test to get started.
                  </td>
                </tr>
              ) : (
                labs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--primary)]">{lab.name}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {lab.code || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                        {LAB_CATEGORY_LABELS[lab.category as LabCategory] || lab.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {lab.normalRange ? (
                        <span>
                          {lab.normalRange}
                          {lab.units && ` ${lab.units}`}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(lab)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          lab.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {lab.isActive ? (
                          <>
                            <Check className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          "Inactive"
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(lab)}
                          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)] transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {deleteConfirmId === lab._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(lab._id)}
                              className="rounded-lg p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(lab._id)}
                            className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-[var(--background-white)] border border-[var(--border)] shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)] sticky top-0 bg-[var(--background-white)]">
              <h2 className="text-lg font-semibold text-[var(--primary)]">
                {editingItem ? "Edit Lab Test" : "Add Lab Test"}
              </h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., Complete Blood Count"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., CBC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  required
                >
                  {Object.entries(LAB_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
                  placeholder="What does this test measure..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Normal Range
                  </label>
                  <input
                    type="text"
                    value={formData.normalRange}
                    onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., 4.5-11.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Units
                  </label>
                  <input
                    type="text"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., K/uL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Patient Preparation
                </label>
                <textarea
                  value={formData.preparation}
                  onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                  className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
                  placeholder="Any fasting or preparation requirements..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl px-4 py-2.5 font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] disabled:opacity-50 transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem ? "Save Changes" : "Add Lab Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
