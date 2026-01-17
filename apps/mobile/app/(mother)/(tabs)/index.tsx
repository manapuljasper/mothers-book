import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCurrentUser,
  useBookletsByMother,
  useBookletDoctors,
  useActiveMedications,
  useResponsive,
} from "@/hooks";
import {
  StatCard,
  MotherHomeSkeleton,
  DashboardHeader,
  CurrentPregnancyCard,
} from "@/components/ui";

export default function MotherHomeScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const motherProfile = currentUser?.motherProfile;
  const { isTablet, select } = useResponsive();

  const booklets = useBookletsByMother(motherProfile?._id) ?? [];
  const allActiveMedications = useActiveMedications() ?? [];

  // Get the primary (first active) booklet
  const activeBooklets = booklets.filter((b) => b.status === "active");
  const primaryBooklet = activeBooklets[0];

  // Get doctors for the primary booklet
  const primaryBookletDoctors = useBookletDoctors(primaryBooklet?.id);
  const primaryDoctor = primaryBookletDoctors?.[0] ?? null;

  const isLoading =
    currentUser === undefined ||
    booklets === undefined ||
    allActiveMedications === undefined;

  if (isLoading) {
    return <MotherHomeSkeleton />;
  }

  // Filter medications to only those belonging to this mother's booklets
  const activeMedications = allActiveMedications.filter((m) =>
    booklets.some((b) => b.id === m.bookletId)
  );

  // Calculate medication stats for today
  const totalDosesToday = activeMedications.reduce(
    (sum, med) => sum + med.frequencyPerDay,
    0
  );
  const takenDosesToday = activeMedications.reduce(
    (sum, med) =>
      sum + (med.todayLogs?.filter((l) => l.status === "taken").length ?? 0),
    0
  );

  // Calculate days until due date
  const daysUntilDue = primaryBooklet?.expectedDueDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(primaryBooklet.expectedDueDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  // Get mother's name
  const motherName = currentUser?.user?.fullName || "there";

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-pink-500">
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Pink Header with rounded bottom */}
        <DashboardHeader userName={motherName} />

        {/* Stats Cards - slightly overlapping header */}
        <View className="flex-row px-4 -mt-4 gap-2">
          <StatCard
            value={daysUntilDue ?? "—"}
            label="Until Due Date"
            suffix="Days"
            color="pink"
          />
          <StatCard
            value={`${takenDosesToday}/${totalDosesToday}`}
            label="Meds Today"
            color="amber"
          />
        </View>

        {/* Current Pregnancy Card */}
        {primaryBooklet && (
          <View className="mt-6" style={{ paddingHorizontal: select({ phone: 0, tablet: 16 }) }}>
            <Text
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              style={{ paddingHorizontal: select({ phone: 24, tablet: 16 }) }}
            >
              Current Pregnancy
            </Text>
            <CurrentPregnancyCard
              booklet={primaryBooklet}
              assignedDoctor={primaryDoctor}
              onViewRecords={() => router.push(`/booklet/${primaryBooklet.id}`)}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
