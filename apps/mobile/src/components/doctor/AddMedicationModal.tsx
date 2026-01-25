/**
 * Add Medication Modal
 *
 * Full-screen modal for adding medications with two tabs:
 * - Library: Search and select from medication catalog
 * - Custom: Manually enter a custom medication
 *
 * Features a clean, professional clinical aesthetic with
 * batch selection support in Library mode.
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";
import {
  X,
  Search,
  Scan,
  Clock,
  Star,
  Check,
  Plus,
  ChevronDown,
} from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useMedicationFavorites, useSearchMedicationCatalog } from "@/hooks";
import {
  DOSAGE_UNITS,
  type DosageUnit,
  type MedicationCatalogItem,
  type DoctorFavorite,
  type PendingMedication,
  type MedicationFrequency,
} from "@/types";
import { Id } from "@convex/_generated/dataModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Frequency options with medical abbreviations
const FREQUENCY_OPTIONS = [
  { value: 1, label: "QD", description: "Once daily" },
  { value: 2, label: "BID", description: "Twice daily" },
  { value: 3, label: "TID", description: "Three times daily" },
  { value: 4, label: "PRN", description: "As needed" },
] as const;

type FilterTab = "scan" | "recent" | "favorites";
type MainTab = "library" | "custom";

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMedications: (medications: Omit<PendingMedication, "id">[]) => void;
  doctorId?: Id<"doctorProfiles">;
  defaultEndDate?: Date | null;
  /** Existing medications to prevent duplicates */
  existingMedications?: string[];
}

export function AddMedicationModal({
  visible,
  onClose,
  onAddMedications,
  doctorId,
  defaultEndDate,
  existingMedications = [],
}: AddMedicationModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Tab state
  const [mainTab, setMainTab] = useState<MainTab>("library");
  const [filterTab, setFilterTab] = useState<FilterTab>("favorites");

  // Library tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Map<string, MedicationCatalogItem | DoctorFavorite>>(new Map());
  const [batchFrequency, setBatchFrequency] = useState<MedicationFrequency>(1);
  const [batchUnit, setBatchUnit] = useState<DosageUnit>("mg");
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Custom tab state
  const [customForm, setCustomForm] = useState({
    brandName: "",
    genericName: "",
    dosage: "",
    unit: "mg" as DosageUnit,
    frequency: 1 as MedicationFrequency,
    prnReason: "",
    saveToCustomList: false,
  });
  const [showCustomFrequencyPicker, setShowCustomFrequencyPicker] = useState(false);

  // Data hooks
  const favorites = useMedicationFavorites(doctorId);
  const searchResults = useSearchMedicationCatalog(searchQuery, { limit: 20 });

  // Check if medication is already added
  const isAlreadyAdded = useCallback(
    (name: string) => {
      const lowerName = name.toLowerCase().trim();
      return existingMedications.some((m) => m.toLowerCase().trim() === lowerName);
    },
    [existingMedications]
  );

  // Toggle selection
  const toggleSelection = useCallback((item: MedicationCatalogItem | DoctorFavorite) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(item.id)) {
        newMap.delete(item.id);
      } else {
        newMap.set(item.id, item);
      }
      return newMap;
    });
  }, []);

  // Add selected medications from library
  const handleAddSelected = useCallback(() => {
    const medications: Omit<PendingMedication, "id">[] = [];

    selectedItems.forEach((item) => {
      const isFavorite = "doctorId" in item;
      const catalogItem = item as MedicationCatalogItem;
      const favoriteItem = item as DoctorFavorite;

      medications.push({
        name: item.name,
        genericName: isFavorite ? favoriteItem.genericName : catalogItem.genericName,
        dosageAmount: isFavorite
          ? favoriteItem.defaultDosage?.toString() || ""
          : catalogItem.dosage?.toString() || "",
        dosageUnit: isFavorite
          ? favoriteItem.defaultDosageUnit || batchUnit
          : catalogItem.dosageUnit || batchUnit,
        instructions: isFavorite ? favoriteItem.defaultInstructions || "" : catalogItem.instructions || "",
        frequencyPerDay: batchFrequency,
        endDate: defaultEndDate || undefined,
        fromFavorite: isFavorite,
      });
    });

    onAddMedications(medications);
    handleClose();
  }, [selectedItems, batchFrequency, batchUnit, defaultEndDate, onAddMedications]);

  // Add custom medication
  const handleAddCustom = useCallback(() => {
    if (!customForm.brandName.trim() || !customForm.dosage.trim()) return;

    const medication: Omit<PendingMedication, "id"> = {
      name: customForm.brandName.trim(),
      genericName: customForm.genericName.trim() || undefined,
      dosageAmount: customForm.dosage,
      dosageUnit: customForm.unit,
      instructions: customForm.frequency === 4 && customForm.prnReason
        ? `PRN: ${customForm.prnReason}`
        : "",
      frequencyPerDay: customForm.frequency,
      endDate: defaultEndDate || undefined,
    };

    onAddMedications([medication]);
    handleClose();
  }, [customForm, defaultEndDate, onAddMedications]);

  // Reset and close
  const handleClose = useCallback(() => {
    setSearchQuery("");
    setSelectedItems(new Map());
    setCustomForm({
      brandName: "",
      genericName: "",
      dosage: "",
      unit: "mg",
      frequency: 1,
      prnReason: "",
      saveToCustomList: false,
    });
    setMainTab("library");
    setFilterTab("favorites");
    onClose();
  }, [onClose]);

  // Render library content
  const renderLibraryContent = () => {
    const isSearching = searchQuery.trim().length > 0;
    const items: (MedicationCatalogItem | DoctorFavorite)[] | undefined = isSearching
      ? searchResults
      : (filterTab === "favorites" ? favorites : []);
    const isLoading = items === undefined;

    return (
      <>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSubtle} strokeWidth={1.5} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search medications..."
            placeholderTextColor={colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <X size={16} color={colors.textSubtle} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>

        {/* Filter Tabs */}
        {!isSearching && (
          <View style={styles.filterTabsContainer}>
            {(["scan", "recent", "favorites"] as FilterTab[]).map((tab) => {
              const isActive = filterTab === tab;
              const Icon = tab === "scan" ? Scan : tab === "recent" ? Clock : Star;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setFilterTab(tab)}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor: isActive ? colors.accent : colors.surface,
                      borderColor: isActive ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Icon
                    size={14}
                    color={isActive ? "white" : colors.textMuted}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: isActive ? "white" : colors.textMuted },
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Medication List */}
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              Loading...
            </Text>
          ) : items && items.length > 0 ? (
            items.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const alreadyAdded = isAlreadyAdded(item.name);
              const catalogItem = item as MedicationCatalogItem;
              const favoriteItem = item as DoctorFavorite;
              const isFavorite = "doctorId" in item;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => !alreadyAdded && toggleSelection(item)}
                  disabled={alreadyAdded}
                  style={[
                    styles.medicationItem,
                    {
                      backgroundColor: colors.background,
                      borderColor: isSelected ? colors.accent : colors.border,
                      opacity: alreadyAdded ? 0.5 : 1,
                    },
                  ]}
                >
                  {/* Radio/Check indicator */}
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: isSelected ? colors.accent : colors.border,
                        backgroundColor: isSelected ? colors.accent : "transparent",
                      },
                    ]}
                  >
                    {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                  </View>

                  {/* Medication info */}
                  <View style={styles.medicationInfo}>
                    <Text style={[styles.medicationName, { color: colors.text }]}>
                      {item.name}
                      {isFavorite && favoriteItem.defaultDosage && (
                        <Text style={{ color: colors.textMuted }}>
                          {" "}{favoriteItem.defaultDosage}{favoriteItem.defaultDosageUnit || "mg"}
                        </Text>
                      )}
                      {!isFavorite && catalogItem.dosage && (
                        <Text style={{ color: colors.textMuted }}>
                          {" "}{catalogItem.dosage}{catalogItem.dosageUnit || "mg"}
                        </Text>
                      )}
                    </Text>
                    <Text style={[styles.medicationGeneric, { color: colors.textSubtle }]}>
                      {alreadyAdded
                        ? "Already added"
                        : isFavorite
                          ? favoriteItem.genericName || "Generic"
                          : `${catalogItem.genericName} • ${catalogItem.category?.replace("_", " ")}`}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>
              {isSearching
                ? `No medications found for "${searchQuery}"`
                : filterTab === "favorites"
                  ? "Your frequently used medications will appear here"
                  : "No items to display"}
            </Text>
          )}
        </ScrollView>

        {/* Bottom Action Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Selection count and options */}
          <View style={styles.bottomBarTop}>
            <View style={styles.selectionInfo}>
              <View style={[styles.selectionBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.selectionCount, { color: colors.accent }]}>
                  {selectedItems.size}
                </Text>
              </View>
              <Text style={[styles.selectionLabel, { color: colors.textMuted }]}>Selected</Text>
            </View>

            {/* Frequency Picker */}
            <Pressable
              onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              style={[styles.pickerButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.pickerLabel, { color: colors.textSubtle }]}>Freq:</Text>
              <Text style={[styles.pickerValue, { color: colors.text }]}>
                {FREQUENCY_OPTIONS.find((f) => f.value === batchFrequency)?.label || "Daily"}
              </Text>
              <ChevronDown size={14} color={colors.textMuted} strokeWidth={1.5} />
            </Pressable>

            {/* Unit Picker */}
            <Pressable
              onPress={() => setShowUnitPicker(!showUnitPicker)}
              style={[styles.pickerButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.pickerLabel, { color: colors.textSubtle }]}>Unit:</Text>
              <Text style={[styles.pickerValue, { color: colors.text }]}>{batchUnit}</Text>
              <ChevronDown size={14} color={colors.textMuted} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* Add Button */}
          <Pressable
            onPress={handleAddSelected}
            disabled={selectedItems.size === 0}
            style={[
              styles.addButton,
              {
                backgroundColor: selectedItems.size > 0 ? colors.accent : colors.surface2,
              },
            ]}
          >
            <Plus size={18} color={selectedItems.size > 0 ? "white" : colors.textSubtle} strokeWidth={2} />
            <Text
              style={[
                styles.addButtonText,
                { color: selectedItems.size > 0 ? "white" : colors.textSubtle },
              ]}
            >
              Add Selected ({selectedItems.size})
            </Text>
          </Pressable>
        </View>

        {/* Frequency Dropdown */}
        {showFrequencyPicker && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={[styles.dropdownOverlay]}
          >
            <Pressable style={styles.dropdownBackdrop} onPress={() => setShowFrequencyPicker(false)} />
            <View style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {FREQUENCY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setBatchFrequency(option.value as MedicationFrequency);
                    setShowFrequencyPicker(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    batchFrequency === option.value && { backgroundColor: colors.accentLight },
                  ]}
                >
                  <Text style={[styles.dropdownItemLabel, { color: colors.text }]}>{option.label}</Text>
                  <Text style={[styles.dropdownItemDesc, { color: colors.textSubtle }]}>{option.description}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Unit Dropdown */}
        {showUnitPicker && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={[styles.dropdownOverlay]}
          >
            <Pressable style={styles.dropdownBackdrop} onPress={() => setShowUnitPicker(false)} />
            <View style={[styles.dropdown, styles.unitDropdown, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <ScrollView style={{ maxHeight: 200 }}>
                {DOSAGE_UNITS.map((unit) => (
                  <Pressable
                    key={unit}
                    onPress={() => {
                      setBatchUnit(unit);
                      setShowUnitPicker(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      batchUnit === unit && { backgroundColor: colors.accentLight },
                    ]}
                  >
                    <Text style={[styles.dropdownItemLabel, { color: colors.text }]}>{unit}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}
      </>
    );
  };

  // Render custom form content
  const renderCustomContent = () => {
    const isPRN = customForm.frequency === 4;
    const canSubmit = customForm.brandName.trim() && customForm.dosage.trim();

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.customContainer}
      >
        <ScrollView
          style={styles.customScrollView}
          contentContainerStyle={styles.customContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>BRAND NAME</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., Tylenol"
              placeholderTextColor={colors.textSubtle}
              value={customForm.brandName}
              onChangeText={(v) => setCustomForm({ ...customForm, brandName: v })}
            />
          </View>

          {/* Generic Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>GENERIC NAME</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="Acetaminophen"
              placeholderTextColor={colors.textSubtle}
              value={customForm.genericName}
              onChangeText={(v) => setCustomForm({ ...customForm, genericName: v })}
            />
          </View>

          {/* Dosage + Unit Row */}
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>DOSAGE</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="0.0"
                placeholderTextColor={colors.textSubtle}
                keyboardType="decimal-pad"
                value={customForm.dosage}
                onChangeText={(v) => setCustomForm({ ...customForm, dosage: v })}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>UNIT</Text>
              <Pressable
                onPress={() => setShowCustomFrequencyPicker(false)}
                style={[styles.formInput, styles.formSelect, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text }}>{customForm.unit}</Text>
                <ChevronDown size={16} color={colors.textMuted} strokeWidth={1.5} />
              </Pressable>
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>FREQUENCY</Text>
            <View style={styles.frequencyPills}>
              {FREQUENCY_OPTIONS.map((option) => {
                const isActive = customForm.frequency === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setCustomForm({ ...customForm, frequency: option.value as MedicationFrequency })}
                    style={[
                      styles.frequencyPill,
                      {
                        backgroundColor: isActive ? colors.accent : colors.surface,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.frequencyPillText,
                        { color: isActive ? "white" : colors.textMuted },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* PRN Reason (only if PRN selected) */}
          {isPRN && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.textMuted }]}>PRN REASON</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g., for pain, for fever"
                placeholderTextColor={colors.textSubtle}
                value={customForm.prnReason}
                onChangeText={(v) => setCustomForm({ ...customForm, prnReason: v })}
              />
            </Animated.View>
          )}

          {/* Save to custom list */}
          <Pressable
            onPress={() => setCustomForm({ ...customForm, saveToCustomList: !customForm.saveToCustomList })}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: customForm.saveToCustomList ? colors.accent : "transparent",
                  borderColor: customForm.saveToCustomList ? colors.accent : colors.border,
                },
              ]}
            >
              {customForm.saveToCustomList && <Check size={12} color="white" strokeWidth={3} />}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Save to my custom list
            </Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={[
            styles.customBottomBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Pressable
            onPress={handleAddCustom}
            disabled={!canSubmit}
            style={[
              styles.addButton,
              {
                backgroundColor: canSubmit ? colors.accent : colors.surface2,
              },
            ]}
          >
            <Plus size={18} color={canSubmit ? "white" : colors.textSubtle} strokeWidth={2} />
            <Text
              style={[
                styles.addButtonText,
                { color: canSubmit ? "white" : colors.textSubtle },
              ]}
            >
              Add Medication
            </Text>
          </Pressable>

          <Pressable onPress={handleClose} style={styles.doneButton}>
            <Text style={[styles.doneButtonText, { color: colors.textMuted }]}>Done</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {mainTab === "library" ? "Add Medications" : "Add Custom Medication"}
          </Text>
          <Pressable onPress={handleClose} hitSlop={8} style={styles.closeButton}>
            <X size={22} color={colors.textMuted} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Main Tabs */}
        <View style={[styles.mainTabs, { borderBottomColor: colors.border }]}>
          {(["library", "custom"] as MainTab[]).map((tab) => {
            const isActive = mainTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setMainTab(tab)}
                style={[styles.mainTab, isActive && styles.mainTabActive]}
              >
                <Text
                  style={[
                    styles.mainTabText,
                    { color: isActive ? colors.accent : colors.textMuted },
                  ]}
                >
                  {tab === "library" ? "From Library" : "Custom"}
                </Text>
                {isActive && (
                  <View style={[styles.mainTabIndicator, { backgroundColor: colors.accent }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Content */}
        {mainTab === "library" ? renderLibraryContent() : renderCustomContent()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  mainTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  mainTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  mainTabActive: {},
  mainTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  mainTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 2,
    borderRadius: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
  },
  filterTabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: "500",
  },
  medicationGeneric: {
    fontSize: 13,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomBarTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  selectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectionLabel: {
    fontSize: 13,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  pickerLabel: {
    fontSize: 12,
  },
  pickerValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: "flex-end",
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dropdown: {
    marginHorizontal: 20,
    marginBottom: 180,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  unitDropdown: {
    marginBottom: 180,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  dropdownItemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  // Custom tab styles
  customContainer: {
    flex: 1,
  },
  customScrollView: {
    flex: 1,
  },
  customContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  formInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  formSelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  frequencyPills: {
    flexDirection: "row",
    gap: 8,
  },
  frequencyPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  frequencyPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  customBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  doneButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
