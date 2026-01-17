import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { QrCode } from "lucide-react-native";
import {
  useCurrentUser,
  useBookletsByDoctor,
  useEntriesByDoctorToday,
} from "@/hooks";
import { EmptyState, DoctorDashboardSkeleton } from "@/components/ui";
import {
  DoctorDashboardHeader,
  QueueStatCard,
  PatientCard,
} from "@/components/modules/doctor-dashboard";

interface QueuePatient {
  id: string;
  name: string;
  bookletId: string;
  bookletLabel: string;
  queueNumber: string;
  visitReason: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const doctorProfile = currentUser?.doctorProfile;

  const patientBooklets = useBookletsByDoctor(doctorProfile?._id) ?? [];
  const todayEntries = useEntriesByDoctorToday(doctorProfile?._id) ?? [];

  // Show loading while data is being fetched
  if (currentUser === undefined) {
    return <DoctorDashboardSkeleton />;
  }

  const doctorName = `Dr. ${currentUser?.user?.fullName?.split(" ").pop() || "Doctor"}`;
  const hasNoPatients = patientBooklets.length === 0;

  // Get unique patients seen today (done)
  const seenPatientIds = new Set(todayEntries.map((e) => e.bookletId));
  const donePatients = patientBooklets.filter((b) => seenPatientIds.has(b.id));

  // Expected patients (not seen today)
  const expectedPatients = patientBooklets.filter(
    (b) => !seenPatientIds.has(b.id)
  );

  // Queue data for expected patients
  const expectedQueuePatients: QueuePatient[] = expectedPatients
    .slice(0, 5)
    .map((booklet, index) => ({
      id: booklet.id,
      name: booklet.motherName,
      bookletId: booklet.id,
      bookletLabel: booklet.label || `Booklet #${booklet.id.slice(-4)}`,
      queueNumber: `#${String(index + 1).padStart(2, "0")}`,
      visitReason: "Prenatal Checkup",
    }));

  // Queue data for done patients
  const doneQueuePatients: QueuePatient[] = donePatients
    .slice(0, 5)
    .map((booklet, index) => {
      const entry = todayEntries.find((e) => e.bookletId === booklet.id);
      return {
        id: booklet.id,
        name: booklet.motherName,
        bookletId: booklet.id,
        bookletLabel: booklet.label || `Booklet #${booklet.id.slice(-4)}`,
        queueNumber: `#${String(index + 1).padStart(2, "0")}`,
        visitReason:
          entry?.entryType === "prenatal_checkup"
            ? "Prenatal Checkup"
            : entry?.entryType === "postnatal_checkup"
              ? "Postnatal Checkup"
              : entry?.entryType === "ultrasound"
                ? "Ultrasound"
                : entry?.entryType === "lab_review"
                  ? "Lab Review"
                  : "Consultation",
      };
    });

  // Stats
  const totalPatients = patientBooklets.length;
  const expectedCount = expectedPatients.length;
  const doneCount = donePatients.length;

  const handleScanQR = () => {
    router.push("/(doctor)/(tabs)/scan");
  };

  const handlePatientPress = (bookletId: string) => {
    router.push(`/(doctor)/booklet/${bookletId}`);
  };

  const handleProfilePress = () => {
    router.push("/(doctor)/(tabs)/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#101822]" edges={[]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <DoctorDashboardHeader
          doctorName={doctorName}
          onAvatarPress={handleProfilePress}
        />

        {/* Stats Row - 3 columns */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-3">
            <QueueStatCard value={totalPatients} label="Patients Today" />
            <QueueStatCard value={expectedCount} label="Expected" />
            <QueueStatCard value={doneCount} label="Done" />
          </View>
        </View>

        {/* Welcome Empty State - when no patients */}
        {hasNoPatients ? (
          <View className="px-6 mt-8">
            <EmptyState
              icon={QrCode}
              iconColor="#3b82f6"
              iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
              title={`Welcome, ${doctorName}!`}
              description="Start by scanning a patient's QR code to add them to your patient list."
              action={{
                label: "Scan QR Code",
                onPress: handleScanQR,
              }}
            />
          </View>
        ) : (
          <>
            {/* Expected Patients Section */}
            {expectedQueuePatients.length > 0 && (
              <View className="px-6 mb-8">
                <Text className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                  Expected Patients
                </Text>
                <View className="flex-col gap-3">
                  {expectedQueuePatients.map((patient, index) => (
                    <PatientCard
                      key={patient.id}
                      patientName={patient.name}
                      visitReason={patient.visitReason}
                      queueNumber={patient.queueNumber}
                      onPress={() => handlePatientPress(patient.bookletId)}
                      faded={index >= 3}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Done Patients Section */}
            {doneQueuePatients.length > 0 && (
              <View className="px-6 flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                  Done Today
                </Text>
                <View className="flex-col gap-3">
                  {doneQueuePatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patientName={patient.name}
                      visitReason={patient.visitReason}
                      queueNumber={patient.queueNumber}
                      onPress={() => handlePatientPress(patient.bookletId)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
