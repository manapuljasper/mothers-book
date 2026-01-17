"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Loader2, Plus, Search, Edit2, Trash2, X, Check } from "lucide-react";
import { MEDICATION_CATEGORY_LABELS, MedicationCategory } from "@convex/lib/validators";

type MedicationCatalogItem = {
  _id: Id<"medicationCatalog">;
  name: string;
  genericName: string;
  category: string;
  defaultDosage?: string;
  dosageUnits?: string[];
  instructions?: string;
  warnings?: string;
  isActive: boolean;
  createdAt: number;
};

interface MedicineFormData {
  name: string;
  genericName: string;
  category: string;
  defaultDosage: string;
  instructions: string;
  warnings: string;
}

const emptyFormData: MedicineFormData = {
  name: "",
  genericName: "",
  category: "other",
  defaultDosage: "",
  instructions: "",
  warnings: "",
};

export default function MedicinesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicationCatalogItem | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"medicationCatalog"> | null>(null);

  const medications = useQuery(api.admin.listMedicationCatalog, {
    searchQuery: searchQuery || undefined,
    category: categoryFilter || undefined,
  });

  const createMedication = useMutation(api.admin.createMedicationCatalogItem);
  const updateMedication = useMutation(api.admin.updateMedicationCatalogItem);
  const deleteMedication = useMutation(api.admin.deleteMedicationCatalogItem);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (item: MedicationCatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      genericName: item.genericName,
      category: item.category,
      defaultDosage: item.defaultDosage || "",
      instructions: item.instructions || "",
      warnings: item.warnings || "",
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
    if (!formData.name.trim() || !formData.genericName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateMedication({
          id: editingItem._id,
          name: formData.name.trim(),
          genericName: formData.genericName.trim(),
          category: formData.category,
          defaultDosage: formData.defaultDosage.trim() || undefined,
          instructions: formData.instructions.trim() || undefined,
          warnings: formData.warnings.trim() || undefined,
        });
      } else {
        await createMedication({
          name: formData.name.trim(),
          genericName: formData.genericName.trim(),
          category: formData.category,
          defaultDosage: formData.defaultDosage.trim() || undefined,
          instructions: formData.instructions.trim() || undefined,
          warnings: formData.warnings.trim() || undefined,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save medication:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"medicationCatalog">) => {
    try {
      await deleteMedication({ id });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete medication:", error);
    }
  };

  const handleToggleActive = async (item: MedicationCatalogItem) => {
    try {
      await updateMedication({
        id: item._id,
        isActive: !item.isActive,
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  if (medications === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading medicines...</p>
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
            <h1 className="text-2xl font-semibold text-[var(--primary)]">Medicine Catalog</h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Manage medicines available for prescription
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Medicine
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search medicines..."
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
            {Object.entries(MEDICATION_CATEGORY_LABELS).map(([value, label]) => (
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
                  Brand Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Generic Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Category
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
              {medications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    No medicines found. Add your first medicine to get started.
                  </td>
                </tr>
              ) : (
                medications.map((med) => (
                  <tr key={med._id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--primary)]">{med.name}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {med.genericName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-[var(--background)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                        {MEDICATION_CATEGORY_LABELS[med.category as MedicationCategory] || med.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(med)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          med.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {med.isActive ? (
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
                          onClick={() => handleOpenEdit(med)}
                          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)] transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {deleteConfirmId === med._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(med._id)}
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
                            onClick={() => setDeleteConfirmId(med._id)}
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
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-[var(--background-white)] border border-[var(--border)] shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--primary)]">
                {editingItem ? "Edit Medicine" : "Add Medicine"}
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
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., Ferrous Sulfate"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Generic Name *
                  </label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., Iron"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    {Object.entries(MEDICATION_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Default Dosage
                  </label>
                  <input
                    type="text"
                    value={formData.defaultDosage}
                    onChange={(e) => setFormData({ ...formData, defaultDosage: e.target.value })}
                    className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                    placeholder="e.g., 325mg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
                  placeholder="How to take this medication..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Warnings
                </label>
                <textarea
                  value={formData.warnings}
                  onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
                  className="w-full rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-2.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
                  placeholder="Any warnings or contraindications..."
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
                  disabled={isSubmitting || !formData.name.trim() || !formData.genericName.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] disabled:opacity-50 transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem ? "Save Changes" : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
