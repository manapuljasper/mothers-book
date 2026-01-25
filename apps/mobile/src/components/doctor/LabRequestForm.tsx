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
import { useThemeColors } from "@/theme";
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
  const colors = useThemeColors();
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

  // Get priority colors based on value
  const getPriorityColors = (priority: LabPriority, isSelected: boolean) => {
    if (!isSelected) {
      return {
        bg: colors.background,
        border: colors.border,
        text: colors.textMuted,
      };
    }
    switch (priority) {
      case "urgent":
        return {
          bg: "#f59e0b",
          border: "#f59e0b",
          text: "white",
        };
      case "stat":
        return {
          bg: colors.danger,
          border: colors.danger,
          text: "white",
        };
      default:
        return {
          bg: colors.textMuted,
          border: colors.textMuted,
          text: "white",
        };
    }
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 16,
        marginTop: 8,
      }}
    >
      <View className="flex-row items-center mb-3">
        <FlaskConical size={18} color={colors.textMuted} strokeWidth={1.5} />
        <Text style={{ color: colors.text }} className="font-semibold ml-2">
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
              colors={colors}
              getPriorityColors={getPriorityColors}
            />
          ))}
        </View>
      )}

      {/* Search input - always visible */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <Search size={16} color={colors.textSubtle} strokeWidth={1.5} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 8,
              color: colors.text,
              fontSize: 14,
            }}
            placeholder="Search lab tests..."
            placeholderTextColor={colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={16} color={colors.textSubtle} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>

        {/* Show favorites when not searching */}
        {!isSearching && (
          <View>
            {favorites === undefined ? (
              <Text style={{ color: colors.textSubtle }} className="text-sm text-center py-2">
                Loading favorites...
              </Text>
            ) : favorites.length > 0 ? (
              <View>
                <Text style={{ color: colors.textSubtle }} className="text-xs mb-2 uppercase tracking-wide">
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
              <Text style={{ color: colors.textSubtle }} className="text-sm text-center py-2">
                Frequently used items will appear here for quick add.
              </Text>
            )}
          </View>
        )}

        {/* Show search results when searching */}
        {isSearching && (
          <View>
            {searchResults === undefined ? (
              <Text style={{ color: colors.textSubtle }} className="text-sm text-center py-4">
                Searching...
              </Text>
            ) : searchResults.length > 0 ? (
              <ScrollView style={{ maxHeight: 200 }}>
                {searchResults.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => quickAddFromCatalog(item)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 8,
                      borderBottomWidth: index < searchResults.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View className="flex-1">
                      <Text style={{ color: colors.text }} className="font-medium">
                        {item.name}
                      </Text>
                      {(item.code || item.description) && (
                        <Text style={{ color: colors.textSubtle }} className="text-sm">
                          {item.code && `${item.code}`}
                          {item.code && item.description && " • "}
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        backgroundColor: colors.accent,
                        borderRadius: 20,
                        padding: 6,
                        marginLeft: 8,
                      }}
                    >
                      <Plus size={14} color="white" strokeWidth={2.5} />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ color: colors.textSubtle }} className="text-sm text-center py-4">
                No lab tests found for "{searchQuery}"
              </Text>
            )}
          </View>
        )}

        {/* Manual Entry - Collapsible */}
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Pressable
            onPress={() => setShowManualEntry(!showManualEntry)}
            className="flex-row items-center justify-between py-1"
          >
            <View className="flex-row items-center">
              <Edit3 size={14} color={colors.textMuted} strokeWidth={1.5} />
              <Text style={{ color: colors.textMuted }} className="text-sm ml-2">
                Manual Entry
              </Text>
            </View>
            {showManualEntry ? (
              <ChevronUp size={16} color={colors.textMuted} strokeWidth={1.5} />
            ) : (
              <ChevronDown size={16} color={colors.textMuted} strokeWidth={1.5} />
            )}
          </Pressable>

          {showManualEntry && (
            <View className="mt-3">
              {/* Lab test name */}
              <View className="mb-3">
                <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">Lab Test</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: colors.background,
                    color: colors.text,
                  }}
                  placeholder="e.g., Complete Blood Count"
                  placeholderTextColor={colors.textSubtle}
                  value={currentLab.name}
                  onChangeText={(v) => setCurrentLab({ ...currentLab, name: v })}
                />
              </View>

              {/* Priority */}
              <View className="mb-3">
                <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">Priority</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {PRIORITY_OPTIONS.map((option) => {
                    const isSelected = currentLab.priority === option.value;
                    const priorityColors = getPriorityColors(option.value, isSelected);
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setCurrentLab({ ...currentLab, priority: option.value })}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          marginRight: 8,
                          borderRadius: 8,
                          borderWidth: 1,
                          backgroundColor: priorityColors.bg,
                          borderColor: priorityColors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected ? "500" : "400",
                            color: priorityColors.text,
                          }}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Due Date (optional) */}
              <View className="mb-3">
                <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">
                  Due Date (optional)
                </Text>
                <Pressable
                  onPress={() => setShowDueDatePicker(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: currentLab.dueDate ? colors.accent : colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: currentLab.dueDate ? colors.accentLight : colors.background,
                  }}
                >
                  <Calendar
                    size={16}
                    color={currentLab.dueDate ? colors.accent : colors.textSubtle}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 14,
                      color: currentLab.dueDate ? colors.accent : colors.textSubtle,
                    }}
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
                      <X size={16} color={colors.textSubtle} strokeWidth={1.5} />
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
                      style={{
                        backgroundColor: colors.accent,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Text className="text-white font-medium">Done</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Notes (optional) */}
              <View className="mb-3">
                <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">Notes (optional)</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: colors.background,
                    color: colors.text,
                  }}
                  placeholder="e.g., Fasting required"
                  placeholderTextColor={colors.textSubtle}
                  value={currentLab.notes}
                  onChangeText={(v) => setCurrentLab({ ...currentLab, notes: v })}
                />
              </View>

              <Pressable
                onPress={handleAddLabToPending}
                disabled={!currentLab.name}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: currentLab.name ? colors.accent : colors.surface2,
                }}
              >
                <Plus
                  size={16}
                  color={currentLab.name ? "white" : colors.textSubtle}
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    marginLeft: 4,
                    fontWeight: "500",
                    color: currentLab.name ? "white" : colors.textSubtle,
                  }}
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
  colors: ReturnType<typeof useThemeColors>;
  getPriorityColors: (priority: LabPriority, isSelected: boolean) => { bg: string; border: string; text: string };
}

function EditablePendingLab({
  lab,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdate,
  colors,
  getPriorityColors,
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

  // Get priority badge colors (muted version for display)
  const getPriorityBadgeColors = (priority: LabPriority) => {
    switch (priority) {
      case "urgent":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          border: "rgba(245, 158, 11, 0.3)",
          text: "#d97706",
        };
      case "stat":
        return {
          bg: colors.dangerLight,
          border: colors.danger,
          text: colors.danger,
        };
      default:
        return {
          bg: colors.surface2,
          border: colors.border,
          text: colors.textMuted,
        };
    }
  };

  const badgeColors = getPriorityBadgeColors(lab.priority);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      {/* Collapsed view */}
      <Pressable
        onPress={onToggleExpand}
        className="flex-row items-center justify-between p-3"
      >
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text style={{ color: colors.text }} className="font-medium">
              {lab.name}
            </Text>
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                borderWidth: 1,
                backgroundColor: badgeColors.bg,
                borderColor: badgeColors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: badgeColors.text,
                }}
              >
                {lab.priority.toUpperCase()}
              </Text>
            </View>
          </View>
          {(lab.dueDate || lab.notes) && (
            <Text style={{ color: colors.textMuted }} className="text-sm mt-0.5">
              {lab.dueDate && `Due: ${formatDate(lab.dueDate)}`}
              {lab.notes && (lab.dueDate ? " • " : "") + lab.notes}
            </Text>
          )}
        </View>
        <View className="flex-row items-center">
          {isExpanded ? (
            <ChevronUp size={18} color={colors.textMuted} strokeWidth={1.5} />
          ) : (
            <ChevronDown size={18} color={colors.textMuted} strokeWidth={1.5} />
          )}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-2 p-1"
          >
            <Trash2 size={18} color={colors.danger} strokeWidth={1.5} />
          </Pressable>
        </View>
      </Pressable>

      {/* Expanded edit view */}
      {isExpanded && onUpdate && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingBottom: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {/* Priority */}
          <View className="mt-3">
            <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">Priority</Text>
            <View className="flex-row">
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = lab.priority === option.value;
                const priorityColors = getPriorityColors(option.value, isSelected);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onUpdate({ priority: option.value })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 4,
                      borderRadius: 8,
                      borderWidth: 1,
                      backgroundColor: priorityColors.bg,
                      borderColor: priorityColors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: priorityColors.text,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Due Date */}
          <View className="mt-3">
            <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">Due Date</Text>
            <Pressable
              onPress={() => setShowDueDatePicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: lab.dueDate ? colors.accent : colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: lab.dueDate ? colors.accentLight : colors.background,
              }}
            >
              <Calendar
                size={16}
                color={lab.dueDate ? colors.accent : colors.textSubtle}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  color: lab.dueDate ? colors.accent : colors.textSubtle,
                }}
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
                  <X size={16} color={colors.textSubtle} strokeWidth={1.5} />
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
                  style={{
                    backgroundColor: colors.accent,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                >
                  <Text className="text-white font-medium">Done</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="mt-3">
            <Text style={{ color: colors.textSubtle }} className="text-xs mb-1">Notes</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.background,
                color: colors.text,
              }}
              placeholder="e.g., Fasting required"
              placeholderTextColor={colors.textSubtle}
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
