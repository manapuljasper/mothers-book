import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Clock, Eye, Check, FlaskConical, ImageIcon, Upload } from "lucide-react-native";
import { TimelineDateBadge } from "@/components/ui";
import { formatDate, formatTime } from "@/utils";
import type { LabRequestWithDoctor } from "@/types";

// Check if lab has attachments
function hasAttachments(lab: LabRequestWithDoctor): boolean {
  return Boolean(lab.attachments && lab.attachments.length > 0);
}

interface LabsTabContentProps {
  labs: LabRequestWithDoctor[];
  onViewResults?: (lab: LabRequestWithDoctor) => void;
  onViewAttachments?: (lab: LabRequestWithDoctor) => void;
  /** For mothers: callback to upload results for pending labs */
  onUploadResult?: (lab: LabRequestWithDoctor) => void;
}

// Group labs by requested date
interface LabDateGroup {
  date: Date;
  labs: LabRequestWithDoctor[];
}

function groupLabsByRequestedDate(labs: LabRequestWithDoctor[]): LabDateGroup[] {
  // Sort by requestedDate descending (most recent first)
  const sorted = [...labs].sort(
    (a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
  );

  const groups: LabDateGroup[] = [];
  let currentGroup: LabDateGroup | null = null;

  for (const lab of sorted) {
    const labDate = new Date(lab.requestedDate);
    const dateKey = labDate.toDateString();

    if (!currentGroup || currentGroup.date.toDateString() !== dateKey) {
      currentGroup = { date: labDate, labs: [] };
      groups.push(currentGroup);
    }

    currentGroup.labs.push(lab);
  }

  return groups;
}

export function LabsTabContent({ labs, onViewResults, onViewAttachments, onUploadResult }: LabsTabContentProps) {
  if (labs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <FlaskConical size={32} color="#64748b" strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyText}>No lab requests yet</Text>
        <Text style={styles.emptySubtext}>
          Add lab requests when creating an entry
        </Text>
      </View>
    );
  }

  const groupedLabs = groupLabsByRequestedDate(labs);

  return (
    <View style={styles.container}>
      {/* Vertical Timeline Line */}
      <View style={styles.timelineLine} />

      {/* Labs grouped by date */}
      {groupedLabs.map((group, groupIndex) => (
        <View key={group.date.toISOString()} style={styles.dateGroup}>
          {/* First lab in group gets the date badge */}
          <View style={styles.entryRow}>
            <View style={styles.dateBadgeContainer}>
              <TimelineDateBadge
                date={group.date}
                isActive={groupIndex === 0}
              />
            </View>

            <View style={styles.labCardsContainer}>
              {group.labs.map((lab, labIndex) => (
                <TimelineLabCard
                  key={lab.id}
                  lab={lab}
                  onViewResults={onViewResults}
                  onViewAttachments={onViewAttachments}
                  onUploadResult={onUploadResult}
                  isFirst={labIndex === 0}
                />
              ))}
            </View>
          </View>
        </View>
      ))}

      {/* End of records */}
      <View style={styles.endOfRecords}>
        <Text style={styles.endOfRecordsText}>End of records</Text>
      </View>
    </View>
  );
}

// Timeline Lab Card Component
interface TimelineLabCardProps {
  lab: LabRequestWithDoctor;
  onViewResults?: (lab: LabRequestWithDoctor) => void;
  onViewAttachments?: (lab: LabRequestWithDoctor) => void;
  onUploadResult?: (lab: LabRequestWithDoctor) => void;
  isFirst?: boolean;
}

function TimelineLabCard({ lab, onViewResults, onViewAttachments, onUploadResult, isFirst }: TimelineLabCardProps) {
  const isPending = lab.status === "pending";
  const isCompleted = lab.status === "completed";
  const isCancelled = lab.status === "cancelled";

  // Generate reference number from id
  const refNumber = `#${lab.id.slice(-6).toUpperCase()}`;

  return (
    <View
      style={[
        styles.labCard,
        isCancelled && styles.labCardCancelled,
        !isFirst && styles.labCardSubsequent,
      ]}
    >
      {/* Header */}
      <View style={styles.labCardHeader}>
        <View style={styles.labCardTitleContainer}>
          <Text
            style={[styles.labName, isCancelled && styles.labNameCancelled]}
          >
            {lab.description}
          </Text>
          {lab.doctorName && (
            <Text style={styles.labDoctor}>
              {lab.doctorName}
              {lab.doctorSpecialty && ` • ${lab.doctorSpecialty}`}
            </Text>
          )}
        </View>

        {/* Status Badge */}
        {isPending && (
          <View style={styles.pendingBadge}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingBadgeText}>PENDING</Text>
          </View>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={10} color="#10b981" strokeWidth={3} />
            <Text style={styles.completedBadgeText}>COMPLETE</Text>
          </View>
        )}
        {isCancelled && (
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.labCardFooter}>
        {isPending && (
          <>
            <View style={styles.timeInfo}>
              <Clock size={14} color="#64748b" strokeWidth={1.5} />
              <Text style={styles.timeText}>
                Requested: {formatTime(lab.requestedDate)}
              </Text>
            </View>
            {onUploadResult && (
              <TouchableOpacity
                style={styles.uploadResultButton}
                onPress={() => onUploadResult(lab)}
                activeOpacity={0.7}
              >
                <Upload size={16} color="#a855f7" strokeWidth={1.5} />
                <Text style={styles.uploadResultText}>Add Results</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {isCompleted && (
          <>
            <View style={styles.completedInfo}>
              <Text style={styles.refText}>Ref: {refNumber}</Text>
              {lab.completedDate && (
                <Text style={styles.completedDateText}>
                  Completed: {formatDate(lab.completedDate, "short")}
                </Text>
              )}
            </View>
            {hasAttachments(lab) ? (
              <TouchableOpacity
                style={styles.viewAttachmentsButton}
                onPress={() => onViewAttachments?.(lab)}
                activeOpacity={0.7}
              >
                <ImageIcon size={16} color="#a855f7" strokeWidth={1.5} />
                <Text style={styles.viewAttachmentsText}>
                  View ({lab.attachments?.length})
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.viewResultsButton}
                onPress={() => onViewResults?.(lab)}
                activeOpacity={0.7}
              >
                <Eye size={16} color="#3b82f6" strokeWidth={1.5} />
                <Text style={styles.viewResultsText}>View Results</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {isCancelled && (
          <Text style={styles.cancelledText}>
            Cancelled on {formatDate(lab.createdAt, "short")}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container & Timeline
  container: {
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 27,
    top: 16,
    bottom: 40,
    width: 2,
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    zIndex: 0,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },

  // Date Groups
  dateGroup: {
    marginBottom: 8,
  },
  entryRow: {
    position: "relative",
    paddingBottom: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  dateBadgeContainer: {
    minWidth: 56,
  },
  labCardsContainer: {
    flex: 1,
  },

  // Lab Card
  labCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },
  labCardSubsequent: {
    marginTop: 0,
  },
  labCardCancelled: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderColor: "rgba(51, 65, 85, 0.5)",
    opacity: 0.6,
  },
  labCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  labCardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  labName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  labNameCancelled: {
    color: "#94a3b8",
  },
  labDoctor: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  // Status Badges
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f59e0b",
  },
  pendingBadgeText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  completedBadgeText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cancelledBadge: {
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.3)",
  },
  cancelledBadgeText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Footer
  labCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.5)",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    color: "#64748b",
    fontSize: 12,
  },
  completedInfo: {
    flexDirection: "column",
  },
  refText: {
    color: "#64748b",
    fontSize: 12,
  },
  completedDateText: {
    color: "#4ade80",
    fontSize: 11,
    marginTop: 2,
  },
  viewResultsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewResultsText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "600",
  },
  viewAttachmentsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewAttachmentsText: {
    color: "#a855f7",
    fontSize: 12,
    fontWeight: "600",
  },
  uploadResultButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uploadResultText: {
    color: "#a855f7",
    fontSize: 12,
    fontWeight: "600",
  },
  cancelledText: {
    color: "#475569",
    fontSize: 11,
  },

  // End of Records
  endOfRecords: {
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 16,
  },
  endOfRecordsText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
  },
});
