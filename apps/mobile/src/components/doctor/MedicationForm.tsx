import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Pill, Plus, Trash2, Calendar, X, Search } from "lucide-react-native";
import { Id } from "@convex/_generated/dataModel";
import { useMedicationFavorites, useSearchMedicationCatalog } from "@/hooks";
import { formatDate } from "@/utils";
import { FavoriteChip } from "@/components/ui";
import type { PendingMedication, MedicationFrequency, DoctorFavorite, MedicationCatalogItem } from "@/types";

const DOSAGE_UNITS = ["mg", "mcg", "g", "mL", "IU", "tablet", "capsule"] as const;
type DosageUnit = (typeof DOSAGE_UNITS)[number];

type TabId = "favorites" | "search" | "manual";

const TABS: { id: TabId; label: string }[] = [
  { id: "favorites", label: "Favorites" },
  { id: "search", label: "Search" },
  { id: "manual", label: "Manual" },
];

export type { PendingMedication };

interface MedicationFormProps {
  pendingMeds: PendingMedication[];
  onAddMedication: (med: Omit<PendingMedication, "id">) => void;
  onRemoveMedication: (id: string) => void;
  defaultEndDate?: Date | null;
  doctorId?: Id<"doctorProfiles">;
}

export function MedicationForm({
  pendingMeds,
  onAddMedication,
  onRemoveMedication,
  defaultEndDate,
  doctorId,
}: MedicationFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>("favorites");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleAddMedToPending = () => {
    if (!currentMed.name || !currentMed.dosageAmount) return;

    // If no end date specified, use default end date (next appointment)
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
  };

  const handleMedEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowMedEndDatePicker(false);
    }
    if (selectedDate) {
      setCurrentMed({ ...currentMed, endDate: selectedDate });
    }
  };

  // Prefill from a favorite
  const prefillFromFavorite = (fav: DoctorFavorite) => {
    setCurrentMed({
      name: fav.name,
      dosageAmount: fav.defaultDosage?.toString() || "",
      dosageUnit: (fav.defaultDosageUnit as DosageUnit) || "mg",
      instructions: fav.defaultInstructions || "",
      frequencyPerDay: fav.defaultFrequency?.toString() || "1",
      endDate: null,
    });
    setActiveTab("manual");
  };

  // Prefill from a catalog search result
  const prefillFromCatalog = (item: MedicationCatalogItem) => {
    setCurrentMed({
      name: item.name,
      dosageAmount: item.dosage?.toString() || "",
      dosageUnit: (item.dosageUnit as DosageUnit) || "mg",
      instructions: item.instructions || "",
      frequencyPerDay: "1",
      endDate: null,
    });
    setSearchQuery("");
    setActiveTab("manual");
  };

  return (
    <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
      <View className="flex-row items-center mb-3">
        <Pill size={18} color="#22c55e" strokeWidth={1.5} />
        <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
          Prescriptions
        </Text>
      </View>

      {/* Pending medications list */}
      {pendingMeds.length > 0 && (
        <View className="mb-3">
          {pendingMeds.map((med) => (
            <View
              key={med.id}
              className="flex-row items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-2"
            >
              <View className="flex-1">
                <Text className="font-medium text-gray-900 dark:text-white">
                  {med.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {med.dosageAmount} {med.dosageUnit} • {med.frequencyPerDay}x daily
                  {med.endDate && ` • Until ${formatDate(med.endDate)}`}
                </Text>
              </View>
              <Pressable onPress={() => onRemoveMedication(med.id)}>
                <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Tab bar */}
      <View className="flex-row mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-md ${
              activeTab === tab.id ? "bg-white dark:bg-gray-700" : ""
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeTab === tab.id
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      <View className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <View>
            {favorites === undefined ? (
              <Text className="text-gray-400 text-sm text-center py-4">
                Loading favorites...
              </Text>
            ) : favorites.length > 0 ? (
              <View className="flex-row flex-wrap">
                {favorites.map((fav) => (
                  <FavoriteChip
                    key={fav.id}
                    label={fav.name}
                    color="green"
                    onPress={() => prefillFromFavorite(fav)}
                  />
                ))}
              </View>
            ) : (
              <Text className="text-gray-400 text-sm text-center py-4">
                No favorites yet. Items you use frequently will appear here.
              </Text>
            )}
          </View>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <View>
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

            {searchQuery.trim().length === 0 ? (
              <Text className="text-gray-400 text-sm text-center py-4">
                Type to search the medication catalog
              </Text>
            ) : searchResults === undefined ? (
              <Text className="text-gray-400 text-sm text-center py-4">
                Searching...
              </Text>
            ) : searchResults.length > 0 ? (
              <ScrollView style={{ maxHeight: 200 }}>
                {searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => prefillFromCatalog(item)}
                    className="py-2 border-b border-gray-100 dark:border-gray-700"
                  >
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {item.genericName}
                      {item.dosage && item.dosageUnit && ` • ${item.dosage}${item.dosageUnit}`}
                    </Text>
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

        {/* Manual Tab */}
        {activeTab === "manual" && (
          <View>
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
  );
}

// Export helper to check for unfinished medication
export function hasUnfinishedMedicationForm(name: string, dosageAmount: string): boolean {
  return name.trim() !== "" || dosageAmount.trim() !== "";
}
