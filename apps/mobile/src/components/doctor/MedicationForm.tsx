import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Pill,
  Plus,
  Trash2,
  Calendar,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react-native";
import { Id } from "@convex/_generated/dataModel";
import { useMedicationFavorites, useSearchMedicationCatalog } from "@/hooks";
import { formatDate } from "@/utils";
import { FavoriteChip } from "@/components/ui";
import {
  DOSAGE_UNITS,
  formatDosage,
  type DosageUnit,
  type PendingMedication,
  type MedicationFrequency,
  type DoctorFavorite,
  type MedicationCatalogItem,
} from "@/types";

export type { PendingMedication };

interface MedicationFormProps {
  pendingMeds: PendingMedication[];
  onAddMedication: (med: Omit<PendingMedication, "id">) => void;
  onRemoveMedication: (id: string) => void;
  onUpdateMedication?: (id: string, updates: Partial<PendingMedication>) => void;
  defaultEndDate?: Date | null;
  doctorId?: Id<"doctorProfiles">;
}

export function MedicationForm({
  pendingMeds,
  onAddMedication,
  onRemoveMedication,
  onUpdateMedication,
  defaultEndDate,
  doctorId,
}: MedicationFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);

  const [currentMed, setCurrentMed] = useState({
    name: "",
    dosageAmount: "",
    dosageUnit: "mg" as DosageUnit,
    instructions: "",
    frequencyPerDay: "1",
    endDate: null as Date | null,
  });

  const [showMedEndDatePicker, setShowMedEndDatePicker] = useState(false);

  // Fetch favorites and search results
  const favorites = useMedicationFavorites(doctorId);
  const searchResults = useSearchMedicationCatalog(searchQuery, { limit: 10 });

  // Quick add from favorite - uses saved defaults
  const quickAddFromFavorite = (fav: DoctorFavorite) => {
    const endDate = defaultEndDate || undefined;

    onAddMedication({
      name: fav.name,
      dosageAmount: fav.defaultDosage?.toString() || "",
      dosageUnit: fav.defaultDosageUnit || "mg",
      instructions: fav.defaultInstructions || "",
      frequencyPerDay: (fav.defaultFrequency as MedicationFrequency) || 1,
      endDate,
      fromFavorite: true,
    });
  };

  // Quick add from catalog search result
  const quickAddFromCatalog = (item: MedicationCatalogItem) => {
    const endDate = defaultEndDate || undefined;

    // Fix: Properly extract dosage unit with fallbacks
    let dosageUnit = "mg";
    if (item.dosageUnit && DOSAGE_UNITS.includes(item.dosageUnit as DosageUnit)) {
      dosageUnit = item.dosageUnit;
    } else if (item.availableUnits && item.availableUnits.length > 0) {
      const firstUnit = item.availableUnits[0];
      if (DOSAGE_UNITS.includes(firstUnit as DosageUnit)) {
        dosageUnit = firstUnit;
      }
    }

    onAddMedication({
      name: item.name,
      dosageAmount: item.dosage?.toString() || "",
      dosageUnit,
      instructions: item.instructions || "",
      frequencyPerDay: 1,
      endDate,
    });

    setSearchQuery("");
  };

  // Manual entry handlers
  const handleAddMedToPending = () => {
    if (!currentMed.name || !currentMed.dosageAmount) return;

    const endDate = currentMed.endDate || defaultEndDate || undefined;

    onAddMedication({
      name: currentMed.name,
      dosageAmount: currentMed.dosageAmount,
      dosageUnit: currentMed.dosageUnit,
      instructions: currentMed.instructions,
      frequencyPerDay: parseInt(currentMed.frequencyPerDay) as MedicationFrequency,
      endDate: endDate || undefined,
    });

    setCurrentMed({
      name: "",
      dosageAmount: "",
      dosageUnit: "mg",
      instructions: "",
      frequencyPerDay: "1",
      endDate: null,
    });
    setShowManualEntry(false);
  };

  const handleMedEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowMedEndDatePicker(false);
    }
    if (selectedDate) {
      setCurrentMed({ ...currentMed, endDate: selectedDate });
    }
  };

  // Toggle expanded state for pending med
  const toggleExpanded = (id: string) => {
    setExpandedMedId(expandedMedId === id ? null : id);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
      <View className="flex-row items-center mb-3">
        <Pill size={18} color="#22c55e" strokeWidth={1.5} />
        <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
          Prescriptions
        </Text>
      </View>

      {/* Pending medications list - now expandable */}
      {pendingMeds.length > 0 && (
        <View className="mb-3">
          {pendingMeds.map((med) => (
            <EditablePendingMedication
              key={med.id}
              med={med}
              isExpanded={expandedMedId === med.id}
              onToggleExpand={() => toggleExpanded(med.id)}
              onRemove={() => onRemoveMedication(med.id)}
              onUpdate={onUpdateMedication ? (updates) => onUpdateMedication(med.id, updates) : undefined}
              defaultEndDate={defaultEndDate}
            />
          ))}
        </View>
      )}

      {/* Search input - always visible */}
      <View className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
        <View className="flex-row items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 mb-3">
          <Search size={16} color="#9ca3af" strokeWidth={1.5} />
          <TextInput
            className="flex-1 ml-2 text-gray-900 dark:text-white"
            placeholder="Search medications..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={16} color="#9ca3af" strokeWidth={1.5} />
            </Pressable>
          )}
        </View>

        {/* Show favorites when not searching */}
        {!isSearching && (
          <View>
            {favorites === undefined ? (
              <Text className="text-gray-400 text-sm text-center py-2">
                Loading favorites...
              </Text>
            ) : favorites.length > 0 ? (
              <View>
                <Text className="text-gray-400 text-xs mb-2 uppercase tracking-wide">
                  Quick Add from Favorites
                </Text>
                <View className="flex-row flex-wrap">
                  {favorites.map((fav) => (
                    <FavoriteChip
                      key={fav.id}
                      label={fav.name}
                      color="green"
                      onPress={() => quickAddFromFavorite(fav)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <Text className="text-gray-400 text-sm text-center py-2">
                Frequently used items will appear here for quick add.
              </Text>
            )}
          </View>
        )}

        {/* Show search results when searching */}
        {isSearching && (
          <View>
            {searchResults === undefined ? (
              <Text className="text-gray-400 text-sm text-center py-4">
                Searching...
              </Text>
            ) : searchResults.length > 0 ? (
              <ScrollView style={{ maxHeight: 200 }}>
                {searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => quickAddFromCatalog(item)}
                    className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700"
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {item.genericName}
                        {item.dosage && item.dosageUnit && ` • ${item.dosage}${item.dosageUnit}`}
                      </Text>
                    </View>
                    <View className="bg-green-500 rounded-full p-1.5 ml-2">
                      <Plus size={14} color="white" strokeWidth={2.5} />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-gray-400 text-sm text-center py-4">
                No medications found for "{searchQuery}"
              </Text>
            )}
          </View>
        )}

        {/* Manual Entry - Collapsible */}
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <Pressable
            onPress={() => setShowManualEntry(!showManualEntry)}
            className="flex-row items-center justify-between py-1"
          >
            <View className="flex-row items-center">
              <Edit3 size={14} color="#6b7280" strokeWidth={1.5} />
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                Manual Entry
              </Text>
            </View>
            {showManualEntry ? (
              <ChevronUp size={16} color="#6b7280" strokeWidth={1.5} />
            ) : (
              <ChevronDown size={16} color="#6b7280" strokeWidth={1.5} />
            )}
          </Pressable>

          {showManualEntry && (
            <View className="mt-3">
              {/* Medication name */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Medication</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Folic Acid"
                  placeholderTextColor="#9ca3af"
                  value={currentMed.name}
                  onChangeText={(v) => setCurrentMed({ ...currentMed, name: v })}
                />
              </View>

              {/* Dosage amount and unit */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Dosage</Text>
                <View className="flex-row">
                  <TextInput
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 w-20 mr-2 text-gray-900 dark:text-white"
                    placeholder="400"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={currentMed.dosageAmount}
                    onChangeText={(v) => setCurrentMed({ ...currentMed, dosageAmount: v })}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-1"
                  >
                    {DOSAGE_UNITS.map((unit) => (
                      <Pressable
                        key={unit}
                        onPress={() => setCurrentMed({ ...currentMed, dosageUnit: unit })}
                        className={`px-3 py-2 mr-1 rounded-lg border ${
                          currentMed.dosageUnit === unit
                            ? "bg-green-500 border-green-500"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Text
                          className={
                            currentMed.dosageUnit === unit
                              ? "text-white text-sm"
                              : "text-gray-600 dark:text-gray-300 text-sm"
                          }
                        >
                          {unit}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Frequency and Instructions */}
              <View className="flex-row mb-3">
                <View className="flex-1 pr-2">
                  <Text className="text-gray-400 text-xs mb-1">Frequency</Text>
                  <View className="flex-row">
                    {["1", "2", "3", "4"].map((freq) => (
                      <Pressable
                        key={freq}
                        onPress={() => setCurrentMed({ ...currentMed, frequencyPerDay: freq })}
                        className={`px-3 py-2 mr-1 rounded-lg border ${
                          currentMed.frequencyPerDay === freq
                            ? "bg-green-500 border-green-500"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Text
                          className={
                            currentMed.frequencyPerDay === freq
                              ? "text-white text-sm"
                              : "text-gray-600 dark:text-gray-300 text-sm"
                          }
                        >
                          {freq}x
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-400 text-xs mb-1">Instructions</Text>
                  <TextInput
                    className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., With food"
                    placeholderTextColor="#9ca3af"
                    value={currentMed.instructions}
                    onChangeText={(v) => setCurrentMed({ ...currentMed, instructions: v })}
                  />
                </View>
              </View>

              {/* End Date (optional) */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">
                  End Date (optional, defaults to next appointment)
                </Text>
                <Pressable
                  onPress={() => setShowMedEndDatePicker(true)}
                  className={`flex-row items-center border rounded-lg px-3 py-2 ${
                    currentMed.endDate
                      ? "border-green-400 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  }`}
                >
                  <Calendar
                    size={16}
                    color={currentMed.endDate ? "#22c55e" : "#9ca3af"}
                    strokeWidth={1.5}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      currentMed.endDate
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {currentMed.endDate
                      ? formatDate(currentMed.endDate)
                      : defaultEndDate
                      ? `Default: ${formatDate(defaultEndDate)}`
                      : "Set end date"}
                  </Text>
                  {currentMed.endDate && (
                    <Pressable
                      onPress={() => setCurrentMed({ ...currentMed, endDate: null })}
                      className="ml-auto"
                    >
                      <X size={16} color="#9ca3af" strokeWidth={1.5} />
                    </Pressable>
                  )}
                </Pressable>
                {showMedEndDatePicker && (
                  <DateTimePicker
                    value={currentMed.endDate || defaultEndDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={new Date()}
                    onChange={handleMedEndDateChange}
                  />
                )}
                {Platform.OS === "ios" && showMedEndDatePicker && (
                  <View className="flex-row justify-end mt-2">
                    <Pressable
                      onPress={() => setShowMedEndDatePicker(false)}
                      className="bg-green-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">Done</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <Pressable
                onPress={handleAddMedToPending}
                disabled={!currentMed.name || !currentMed.dosageAmount}
                className={`flex-row items-center justify-center py-2 rounded-lg ${
                  currentMed.name && currentMed.dosageAmount
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              >
                <Plus
                  size={16}
                  color={currentMed.name && currentMed.dosageAmount ? "white" : "#9ca3af"}
                  strokeWidth={1.5}
                />
                <Text
                  className={`ml-1 font-medium ${
                    currentMed.name && currentMed.dosageAmount
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  Add Medication
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// Editable Pending Medication Component
interface EditablePendingMedicationProps {
  med: PendingMedication;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdate?: (updates: Partial<PendingMedication>) => void;
  defaultEndDate?: Date | null;
}

function EditablePendingMedication({
  med,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdate,
  defaultEndDate,
}: EditablePendingMedicationProps) {
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
    }
    if (selectedDate && onUpdate) {
      onUpdate({ endDate: selectedDate });
    }
  };

  return (
    <View className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg mb-2 overflow-hidden">
      {/* Collapsed view */}
      <Pressable
        onPress={onToggleExpand}
        className="flex-row items-center justify-between p-3"
      >
        <View className="flex-1">
          <Text className="font-medium text-gray-900 dark:text-white">
            {med.name}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDosage(med.dosageAmount, med.dosageUnit as DosageUnit)} • {med.frequencyPerDay}x daily
            {med.endDate && ` • Until ${formatDate(med.endDate)}`}
          </Text>
        </View>
        <View className="flex-row items-center">
          {isExpanded ? (
            <ChevronUp size={18} color="#6b7280" strokeWidth={1.5} />
          ) : (
            <ChevronDown size={18} color="#6b7280" strokeWidth={1.5} />
          )}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-2 p-1"
          >
            <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
          </Pressable>
        </View>
      </Pressable>

      {/* Expanded edit view */}
      {isExpanded && onUpdate && (
        <View className="px-3 pb-3 border-t border-green-200 dark:border-green-700">
          {/* Dosage */}
          <View className="flex-row mt-3">
            <View className="mr-2">
              <Text className="text-gray-400 text-xs mb-1">Dosage</Text>
              <TextInput
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 w-20 text-gray-900 dark:text-white"
                placeholder="400"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={med.dosageAmount}
                onChangeText={(v) => onUpdate({ dosageAmount: v })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-1">Unit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {DOSAGE_UNITS.map((unit) => (
                  <Pressable
                    key={unit}
                    onPress={() => onUpdate({ dosageUnit: unit })}
                    className={`px-3 py-2 mr-1 rounded-lg border ${
                      med.dosageUnit === unit
                        ? "bg-green-500 border-green-500"
                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <Text
                      className={
                        med.dosageUnit === unit
                          ? "text-white text-sm"
                          : "text-gray-600 dark:text-gray-300 text-sm"
                      }
                    >
                      {unit}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Frequency */}
          <View className="mt-3">
            <Text className="text-gray-400 text-xs mb-1">Frequency</Text>
            <View className="flex-row">
              {[1, 2, 3, 4].map((freq) => (
                <Pressable
                  key={freq}
                  onPress={() => onUpdate({ frequencyPerDay: freq as MedicationFrequency })}
                  className={`px-3 py-2 mr-1 rounded-lg border ${
                    med.frequencyPerDay === freq
                      ? "bg-green-500 border-green-500"
                      : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={
                      med.frequencyPerDay === freq
                        ? "text-white text-sm"
                        : "text-gray-600 dark:text-gray-300 text-sm"
                    }
                  >
                    {freq}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="mt-3">
            <Text className="text-gray-400 text-xs mb-1">Instructions</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., With food"
              placeholderTextColor="#9ca3af"
              value={med.instructions}
              onChangeText={(v) => onUpdate({ instructions: v })}
            />
          </View>

          {/* End Date */}
          <View className="mt-3">
            <Text className="text-gray-400 text-xs mb-1">End Date</Text>
            <Pressable
              onPress={() => setShowEndDatePicker(true)}
              className={`flex-row items-center border rounded-lg px-3 py-2 ${
                med.endDate
                  ? "border-green-400 bg-green-100 dark:bg-green-800/30"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              }`}
            >
              <Calendar
                size={16}
                color={med.endDate ? "#22c55e" : "#9ca3af"}
                strokeWidth={1.5}
              />
              <Text
                className={`ml-2 text-sm ${
                  med.endDate
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400"
                }`}
              >
                {med.endDate
                  ? formatDate(med.endDate)
                  : defaultEndDate
                  ? `Default: ${formatDate(defaultEndDate)}`
                  : "Set end date"}
              </Text>
              {med.endDate && (
                <Pressable
                  onPress={() => onUpdate({ endDate: undefined })}
                  className="ml-auto"
                >
                  <X size={16} color="#9ca3af" strokeWidth={1.5} />
                </Pressable>
              )}
            </Pressable>
            {showEndDatePicker && (
              <DateTimePicker
                value={med.endDate || defaultEndDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleEndDateChange}
              />
            )}
            {Platform.OS === "ios" && showEndDatePicker && (
              <View className="flex-row justify-end mt-2">
                <Pressable
                  onPress={() => setShowEndDatePicker(false)}
                  className="bg-green-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// Export helper to check for unfinished medication
export function hasUnfinishedMedicationForm(name: string, dosageAmount: string): boolean {
  return name.trim() !== "" || dosageAmount.trim() !== "";
}
