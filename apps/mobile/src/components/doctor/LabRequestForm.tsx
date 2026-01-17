import { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  FlaskConical,
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
import { useLabFavorites, useSearchLabCatalog } from "@/hooks";
import { formatDate } from "@/utils";
import { FavoriteChip } from "@/components/ui";
import type { PendingLabRequest, LabPriority, DoctorFavorite, LabCatalogItem } from "@/types";

const PRIORITY_OPTIONS: { value: LabPriority; label: string }[] = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "stat", label: "STAT" },
];

interface LabRequestFormProps {
  pendingLabs: PendingLabRequest[];
  onAddLab: (lab: Omit<PendingLabRequest, "id">) => void;
  onRemoveLab: (id: string) => void;
  onUpdateLab?: (id: string, updates: Partial<PendingLabRequest>) => void;
  doctorId?: Id<"doctorProfiles">;
}

export function LabRequestForm({
  pendingLabs,
  onAddLab,
  onRemoveLab,
  onUpdateLab,
  doctorId,
}: LabRequestFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [expandedLabId, setExpandedLabId] = useState<string | null>(null);

  const [currentLab, setCurrentLab] = useState({
    name: "",
    notes: "",
    priority: "routine" as LabPriority,
    dueDate: null as Date | null,
  });

  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Fetch favorites and search results
  const favorites = useLabFavorites(doctorId);
  const searchResults = useSearchLabCatalog(searchQuery, { limit: 10 });

  // Quick add from favorite - uses saved defaults
  const quickAddFromFavorite = (fav: DoctorFavorite) => {
    onAddLab({
      name: fav.name,
      notes: "",
      priority: fav.defaultPriority || "routine",
      dueDate: undefined,
      fromFavorite: true,
    });
  };

  // Quick add from catalog search result
  const quickAddFromCatalog = (item: LabCatalogItem) => {
    onAddLab({
      name: item.name,
      notes: item.preparation || "",
      priority: "routine",
      dueDate: undefined,
    });
    setSearchQuery("");
  };

  // Manual entry handlers
  const handleAddLabToPending = () => {
    if (!currentLab.name) return;

    onAddLab({
      name: currentLab.name,
      notes: currentLab.notes || undefined,
      priority: currentLab.priority,
      dueDate: currentLab.dueDate || undefined,
    });

    setCurrentLab({
      name: "",
      notes: "",
      priority: "routine",
      dueDate: null,
    });
    setShowManualEntry(false);
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDueDatePicker(false);
    }
    if (selectedDate) {
      setCurrentLab({ ...currentLab, dueDate: selectedDate });
    }
  };

  // Toggle expanded state for pending lab
  const toggleExpanded = (id: string) => {
    setExpandedLabId(expandedLabId === id ? null : id);
  };

  const isSearching = searchQuery.trim().length > 0;

  const getPriorityBadgeColor = (priority: LabPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700";
      case "stat":
        return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  const getPriorityTextColor = (priority: LabPriority) => {
    switch (priority) {
      case "urgent":
        return "text-amber-700 dark:text-amber-300";
      case "stat":
        return "text-red-700 dark:text-red-300";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
      <View className="flex-row items-center mb-3">
        <FlaskConical size={18} color="#3b82f6" strokeWidth={1.5} />
        <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
          Lab Requests
        </Text>
      </View>

      {/* Pending labs list - now expandable */}
      {pendingLabs.length > 0 && (
        <View className="mb-3">
          {pendingLabs.map((lab) => (
            <EditablePendingLab
              key={lab.id}
              lab={lab}
              isExpanded={expandedLabId === lab.id}
              onToggleExpand={() => toggleExpanded(lab.id)}
              onRemove={() => onRemoveLab(lab.id)}
              onUpdate={onUpdateLab ? (updates) => onUpdateLab(lab.id, updates) : undefined}
              getPriorityBadgeColor={getPriorityBadgeColor}
              getPriorityTextColor={getPriorityTextColor}
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
            placeholder="Search lab tests..."
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
                      color="blue"
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
                {searchResults.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => quickAddFromCatalog(item)}
                    className={`flex-row items-center justify-between py-2 ${
                      index < searchResults.length - 1
                        ? "border-b border-gray-100 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </Text>
                      {(item.code || item.description) && (
                        <Text className="text-gray-400 text-sm">
                          {item.code && `${item.code}`}
                          {item.code && item.description && " • "}
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View className="bg-blue-500 rounded-full p-1.5 ml-2">
                      <Plus size={14} color="white" strokeWidth={2.5} />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text className="text-gray-400 text-sm text-center py-4">
                No lab tests found for "{searchQuery}"
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
              {/* Lab test name */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Lab Test</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Complete Blood Count"
                  placeholderTextColor="#9ca3af"
                  value={currentLab.name}
                  onChangeText={(v) => setCurrentLab({ ...currentLab, name: v })}
                />
              </View>

              {/* Priority */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Priority</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setCurrentLab({ ...currentLab, priority: option.value })}
                      className={`px-4 py-2 mr-2 rounded-lg border ${
                        currentLab.priority === option.value
                          ? option.value === "routine"
                            ? "bg-gray-500 border-gray-500"
                            : option.value === "urgent"
                              ? "bg-amber-500 border-amber-500"
                              : "bg-red-500 border-red-500"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <Text
                        className={
                          currentLab.priority === option.value
                            ? "text-white text-sm font-medium"
                            : "text-gray-600 dark:text-gray-300 text-sm"
                        }
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Due Date (optional) */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">
                  Due Date (optional)
                </Text>
                <Pressable
                  onPress={() => setShowDueDatePicker(true)}
                  className={`flex-row items-center border rounded-lg px-3 py-2 ${
                    currentLab.dueDate
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  }`}
                >
                  <Calendar
                    size={16}
                    color={currentLab.dueDate ? "#3b82f6" : "#9ca3af"}
                    strokeWidth={1.5}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      currentLab.dueDate
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {currentLab.dueDate
                      ? formatDate(currentLab.dueDate)
                      : "Set due date"}
                  </Text>
                  {currentLab.dueDate && (
                    <Pressable
                      onPress={() => setCurrentLab({ ...currentLab, dueDate: null })}
                      className="ml-auto"
                    >
                      <X size={16} color="#9ca3af" strokeWidth={1.5} />
                    </Pressable>
                  )}
                </Pressable>
                {showDueDatePicker && (
                  <DateTimePicker
                    value={currentLab.dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={new Date()}
                    onChange={handleDueDateChange}
                  />
                )}
                {Platform.OS === "ios" && showDueDatePicker && (
                  <View className="flex-row justify-end mt-2">
                    <Pressable
                      onPress={() => setShowDueDatePicker(false)}
                      className="bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-medium">Done</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Notes (optional) */}
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Notes (optional)</Text>
                <TextInput
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Fasting required"
                  placeholderTextColor="#9ca3af"
                  value={currentLab.notes}
                  onChangeText={(v) => setCurrentLab({ ...currentLab, notes: v })}
                />
              </View>

              <Pressable
                onPress={handleAddLabToPending}
                disabled={!currentLab.name}
                className={`flex-row items-center justify-center py-2 rounded-lg ${
                  currentLab.name
                    ? "bg-blue-500"
                    : "bg-gray-200"
                }`}
              >
                <Plus
                  size={16}
                  color={currentLab.name ? "white" : "#9ca3af"}
                  strokeWidth={1.5}
                />
                <Text
                  className={`ml-1 font-medium ${
                    currentLab.name
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  Add Lab Request
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// Editable Pending Lab Component
interface EditablePendingLabProps {
  lab: PendingLabRequest;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdate?: (updates: Partial<PendingLabRequest>) => void;
  getPriorityBadgeColor: (priority: LabPriority) => string;
  getPriorityTextColor: (priority: LabPriority) => string;
}

function EditablePendingLab({
  lab,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdate,
  getPriorityBadgeColor,
  getPriorityTextColor,
}: EditablePendingLabProps) {
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDueDatePicker(false);
    }
    if (selectedDate && onUpdate) {
      onUpdate({ dueDate: selectedDate });
    }
  };

  return (
    <View className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg mb-2 overflow-hidden">
      {/* Collapsed view */}
      <Pressable
        onPress={onToggleExpand}
        className="flex-row items-center justify-between p-3"
      >
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-medium text-gray-900 dark:text-white">
              {lab.name}
            </Text>
            <View
              className={`ml-2 px-2 py-0.5 rounded border ${getPriorityBadgeColor(lab.priority)}`}
            >
              <Text className={`text-xs font-medium ${getPriorityTextColor(lab.priority)}`}>
                {lab.priority.toUpperCase()}
              </Text>
            </View>
          </View>
          {(lab.dueDate || lab.notes) && (
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {lab.dueDate && `Due: ${formatDate(lab.dueDate)}`}
              {lab.notes && (lab.dueDate ? " • " : "") + lab.notes}
            </Text>
          )}
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
        <View className="px-3 pb-3 border-t border-blue-200 dark:border-blue-700">
          {/* Priority */}
          <View className="mt-3">
            <Text className="text-gray-400 text-xs mb-1">Priority</Text>
            <View className="flex-row">
              {PRIORITY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => onUpdate({ priority: option.value })}
                  className={`px-3 py-2 mr-1 rounded-lg border ${
                    lab.priority === option.value
                      ? option.value === "routine"
                        ? "bg-gray-500 border-gray-500"
                        : option.value === "urgent"
                          ? "bg-amber-500 border-amber-500"
                          : "bg-red-500 border-red-500"
                      : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={
                      lab.priority === option.value
                        ? "text-white text-sm"
                        : "text-gray-600 dark:text-gray-300 text-sm"
                    }
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View className="mt-3">
            <Text className="text-gray-400 text-xs mb-1">Due Date</Text>
            <Pressable
              onPress={() => setShowDueDatePicker(true)}
              className={`flex-row items-center border rounded-lg px-3 py-2 ${
                lab.dueDate
                  ? "border-blue-400 bg-blue-100 dark:bg-blue-800/30"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              }`}
            >
              <Calendar
                size={16}
                color={lab.dueDate ? "#3b82f6" : "#9ca3af"}
                strokeWidth={1.5}
              />
              <Text
                className={`ml-2 text-sm ${
                  lab.dueDate
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {lab.dueDate
                  ? formatDate(lab.dueDate)
                  : "Set due date"}
              </Text>
              {lab.dueDate && (
                <Pressable
                  onPress={() => onUpdate({ dueDate: undefined })}
                  className="ml-auto"
                >
                  <X size={16} color="#9ca3af" strokeWidth={1.5} />
                </Pressable>
              )}
            </Pressable>
            {showDueDatePicker && (
              <DateTimePicker
                value={lab.dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleDueDateChange}
              />
            )}
            {Platform.OS === "ios" && showDueDatePicker && (
              <View className="flex-row justify-end mt-2">
                <Pressable
                  onPress={() => setShowDueDatePicker(false)}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Done</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="mt-3">
            <Text className="text-gray-400 text-xs mb-1">Notes</Text>
            <TextInput
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Fasting required"
              placeholderTextColor="#9ca3af"
              value={lab.notes || ""}
              onChangeText={(v) => onUpdate({ notes: v })}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// Export helper to check for unfinished lab form
export function hasUnfinishedLabForm(name: string): boolean {
  return name.trim() !== "";
}
