import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  Share2,
  Heart,
  Scale,
  Baby,
  Calendar,
  Stethoscope,
  FileText,
  AlertTriangle,
  Building2,
  MapPin,
  ClipboardList,
} from "lucide-react-native";
import {
  useEntryById,
  useBookletById,
  useMedicationsByEntry,
  useLabsByEntry,
} from "@/hooks";
import { formatDate, formatTime, computeAOG } from "@/utils";
import { VitalCard, InstructionsCard, LoadingScreen } from "@/components/ui";
import { SOAPSectionWrapper } from "@/components/doctor";
import { ENTRY_TYPE_LABELS } from "@/types";

export default function MotherEntryDetailScreen() {
  const { entryId, bookletId } = useLocalSearchParams<{
    entryId: string;
    bookletId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const entry = useEntryById(entryId);
  const booklet = useBookletById(bookletId);
  const medications = useMedicationsByEntry(entryId);
  const labs = useLabsByEntry(entryId);

  const isLoading =
    entry === undefined ||
    booklet === undefined ||
    medications === undefined ||
    labs === undefined;

  // Theme colors - pink accent for mother's view
  const colors = {
    background: isDark ? "#0f172a" : "#ffffff",
    headerBg: isDark ? "#0f172a" : "#ffffff",
    headerIcon: isDark ? "#94a3b8" : "#6b7280",
    headerTitle: isDark ? "#ffffff" : "#111827",
    dateText: isDark ? "#ffffff" : "#111827",
    doctorText: isDark ? "#94a3b8" : "#6b7280",
    sectionTitle: isDark ? "#ffffff" : "#111827",
    cardBg: isDark ? "#1e293b" : "#f9fafb",
    cardBorder: isDark ? "#334155" : "#e5e7eb",
    notesText: isDark ? "#cbd5e1" : "#374151",
    divider: isDark ? "#1e293b" : "#e5e7eb",
    subSectionTitle: isDark ? "#64748b" : "#6b7280",
    listTitle: isDark ? "#ffffff" : "#111827",
    listSubtitle: isDark ? "#64748b" : "#6b7280",
    accent: "#ec4899", // Pink accent
    dragIndicator: isDark ? "#475569" : "#d1d5db",
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!entry) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.doctorText, fontSize: 16 }}>
          Entry not found
        </Text>
      </View>
    );
  }

  // Compute AOG for this entry's visit date from booklet's expected due date
  const aog = booklet?.expectedDueDate
    ? computeAOG(booklet.expectedDueDate, entry.visitDate)
    : entry.vitals?.aog || null;

  const visitDateFormatted = formatDate(entry.visitDate, "long");
  const visitTimeFormatted = formatTime(entry.visitDate);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Modal Header with drag indicator */}
      <View
        style={{
          paddingTop: 20,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: colors.headerBg,
        }}
      >
        {/* Header Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} color={colors.headerIcon} strokeWidth={2} />
          </Pressable>
          <View style={{ width: 40 }} />
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Share2 size={20} color={colors.headerIcon} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & Doctor Section */}
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.dateText,
                letterSpacing: -0.5,
              }}
            >
              {visitDateFormatted}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: colors.doctorText,
              }}
            >
              {visitTimeFormatted}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "rgba(236, 72, 153, 0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stethoscope size={14} color={colors.accent} strokeWidth={1.5} />
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.doctorText,
              }}
            >
              {ENTRY_TYPE_LABELS[entry.entryType]} with {entry.doctorName}
            </Text>
          </View>

          {/* Clinic - subtle inline display */}
          {entry.clinicName && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, marginLeft: 32, gap: 4 }}>
              <Building2 size={12} color={colors.doctorText} strokeWidth={1.5} />
              <Text style={{ fontSize: 12, color: colors.doctorText }}>
                {entry.clinicName}
              </Text>
            </View>
          )}
        </View>

        {/* ===== SOAP SECTIONS ===== */}

        {/* S - Subjective (Chief Complaint/Notes) */}
        <SOAPSectionWrapper section="subjective">
          <View
            style={{
              backgroundColor: colors.cardBg,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: entry.notes?.trim() ? colors.notesText : colors.subSectionTitle,
                fontStyle: entry.notes?.trim() ? "normal" : "italic",
              }}
            >
              {entry.notes?.trim() || "No notes recorded"}
            </Text>
          </View>
        </SOAPSectionWrapper>

        {/* O - Objective (Vitals) */}
        <SOAPSectionWrapper section="objective">
          {(entry.vitals?.bloodPressure ||
            entry.vitals?.weight ||
            entry.vitals?.fetalHeartRate ||
            aog) ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {entry.vitals?.bloodPressure && (
                <View style={{ width: "48%" }}>
                  <VitalCard
                    label="BP"
                    value={entry.vitals.bloodPressure}
                    unit="mmHg"
                    icon={Heart}
                    iconColor="#14b8a6"
                  />
                </View>
              )}
              {entry.vitals?.weight && (
                <View style={{ width: "48%" }}>
                  <VitalCard
                    label="Weight"
                    value={entry.vitals.weight}
                    unit="kg"
                    icon={Scale}
                    iconColor="#14b8a6"
                  />
                </View>
              )}
              {entry.vitals?.fetalHeartRate && (
                <View style={{ width: "48%" }}>
                  <VitalCard
                    label="FHR"
                    value={entry.vitals.fetalHeartRate}
                    unit="bpm"
                    icon={Baby}
                    iconColor="#14b8a6"
                  />
                </View>
              )}
              {aog && (
                <View style={{ width: "48%" }}>
                  <VitalCard
                    label="AOG"
                    value={aog}
                    icon={Calendar}
                    iconColor="#14b8a6"
                  />
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.cardBg,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.subSectionTitle,
                  fontStyle: "italic",
                }}
              >
                No vitals recorded
              </Text>
            </View>
          )}
        </SOAPSectionWrapper>

        {/* A - Assessment (Diagnosis & Risk Level) */}
        <SOAPSectionWrapper section="assessment">
          {/* Risk Level Badge */}
          {entry.riskLevel && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  entry.riskLevel === "high"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(16, 185, 129, 0.1)",
                alignSelf: "flex-start",
              }}
            >
              {entry.riskLevel === "high" && (
                <AlertTriangle
                  size={14}
                  color="#ef4444"
                  strokeWidth={2.5}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: entry.riskLevel === "high" ? "#ef4444" : "#10b981",
                }}
              >
                {entry.riskLevel === "high" ? "High Risk" : "Low Risk"}
              </Text>
            </View>
          )}

          {/* Diagnosis */}
          <View
            style={{
              backgroundColor: colors.cardBg,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: entry.diagnosis?.trim() ? colors.notesText : colors.subSectionTitle,
                fontStyle: entry.diagnosis?.trim() ? "normal" : "italic",
              }}
            >
              {entry.diagnosis?.trim() || "No diagnosis recorded"}
            </Text>
          </View>
        </SOAPSectionWrapper>

        {/* P - Plan (Recommendations, Follow-up, Medications, Labs) */}
        <SOAPSectionWrapper section="plan">
          {(entry.recommendations?.trim() || entry.followUpDate || (medications && medications.length > 0) || (labs && labs.length > 0)) ? (
            <>
              {/* Recommendations */}
              {entry.recommendations?.trim() && (
                <View style={{ marginBottom: 12 }}>
                  <InstructionsCard instructions={entry.recommendations} />
                </View>
              )}

              {/* Follow-up Date */}
              {entry.followUpDate && (
                <View
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(16, 185, 129, 0.2)",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: (medications && medications.length > 0) || (labs && labs.length > 0) ? 12 : 0,
                  }}
                >
                  <Calendar size={18} color="#10b981" strokeWidth={1.5} />
                  <View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.doctorText,
                      }}
                    >
                      Next Visit Scheduled
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#10b981",
                      }}
                    >
                      {formatDate(entry.followUpDate, "long")}
                    </Text>
                  </View>
                </View>
              )}

              {/* Medications inside Plan */}
              {medications && medications.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: colors.subSectionTitle,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 8,
                    }}
                  >
                    Prescribed Medications
                  </Text>
                  {medications.map((med: { id: string; name: string; genericName?: string; dosage: string }) => (
                    <View
                      key={med.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.cardBg,
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 6,
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "rgba(249, 115, 22, 0.2)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>💊</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: colors.listTitle,
                          }}
                        >
                          {med.name}
                        </Text>
                        {med.genericName && (
                          <Text
                            style={{
                              fontSize: 11,
                              color: colors.accent,
                            }}
                          >
                            {med.genericName}
                          </Text>
                        )}
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.listSubtitle,
                            marginTop: 1,
                          }}
                        >
                          {med.dosage}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Labs inside Plan */}
              {labs && labs.length > 0 && (
                <View style={{ marginTop: medications && medications.length > 0 ? 12 : 4 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: colors.subSectionTitle,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 8,
                    }}
                  >
                    Lab Requests
                  </Text>
                  {labs.map((lab: { id: string; description: string; requestedDate: Date; status: string }) => (
                    <View
                      key={lab.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.cardBg,
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 6,
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🧪</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: colors.listTitle,
                          }}
                        >
                          {lab.description}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.listSubtitle,
                            marginTop: 1,
                          }}
                        >
                          Requested {formatDate(lab.requestedDate)}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 6,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          backgroundColor:
                            lab.status === "completed"
                              ? "rgba(34, 197, 94, 0.1)"
                              : lab.status === "pending"
                                ? "rgba(250, 204, 21, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                          borderColor:
                            lab.status === "completed"
                              ? "rgba(34, 197, 94, 0.3)"
                              : lab.status === "pending"
                                ? "rgba(250, 204, 21, 0.3)"
                                : "rgba(107, 114, 128, 0.3)",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "600",
                            color:
                              lab.status === "completed"
                                ? "#22c55e"
                                : lab.status === "pending"
                                  ? "#facc15"
                                  : "#6b7280",
                          }}
                        >
                          {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                backgroundColor: colors.cardBg,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.subSectionTitle,
                  fontStyle: "italic",
                }}
              >
                No plan recorded
              </Text>
            </View>
          )}
        </SOAPSectionWrapper>
      </ScrollView>
    </View>
  );
}
