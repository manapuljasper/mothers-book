import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import {
  useCurrentUser,
  useUpdateDoctorProfile,
  useClinicsByDoctor,
  useDeleteClinic,
  useSetPrimaryClinic,
} from "../../src/hooks";
import {
  ModalHeader,
  TextField,
  Button,
  ClinicCard,
} from "../../src/components/ui";
import { useThemeStore } from "../../src/stores";

interface ScheduleItem {
  days: string;
  startTime: string;
  endTime: string;
}

interface Clinic {
  _id: string;
  name: string;
  address: string;
  contactNumber?: string;
  schedule?: ScheduleItem[];
  isPrimary: boolean;
}

export default function EditDoctorProfileScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCreateMode = mode === "create";
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  const currentUser = useCurrentUser();
  const updateProfile = useUpdateDoctorProfile();
  const deleteClinic = useDeleteClinic();
  const setPrimaryClinic = useSetPrimaryClinic();

  // Extract user and profile only when available
  const user =
    currentUser && "user" in currentUser ? currentUser.user : null;
  const doctorProfile =
    currentUser && "doctorProfile" in currentUser
      ? currentUser.doctorProfile
      : null;

  // Get clinics for this doctor
  const clinics = useClinicsByDoctor(doctorProfile?._id as string);

  // Form state (personal info only)
  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [prcNumber, setPrcNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form values when user data loads
  useEffect(() => {
    if (user && doctorProfile && !initialized) {
      setFullName(user.fullName || "");
      setSpecialization(doctorProfile.specialization || "");
      setPrcNumber(doctorProfile.prcNumber || "");
      setContactNumber(doctorProfile.contactNumber || "");
      setInitialized(true);
    }
  }, [user, doctorProfile, initialized]);

  // Show loading while data is loading
  if (
    currentUser === undefined ||
    (currentUser && "pending" in currentUser)
  ) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }
    if (!prcNumber.trim()) {
      Alert.alert("Error", "PRC License Number is required");
      return;
    }
    if (!contactNumber.trim()) {
      Alert.alert("Error", "Contact number is required");
      return;
    }

    // In create mode, require at least one clinic
    if (isCreateMode && (!clinics || clinics.length === 0)) {
      Alert.alert(
        "Add a Clinic",
        "Please add at least one clinic to complete your profile."
      );
      return;
    }

    setIsSaving(true);
    try {
      if (!doctorProfile?._id) {
        throw new Error("No doctor profile found");
      }
      await updateProfile({
        doctorId: doctorProfile._id as string,
        fullName: fullName.trim(),
        specialization: specialization.trim() || undefined,
        prcNumber: prcNumber.trim(),
        contactNumber: contactNumber.trim(),
      });

      if (isCreateMode) {
        router.replace("/(doctor)/(tabs)");
      } else {
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClinic = () => {
    router.push("/(doctor)/edit-clinic?mode=create");
  };

  const handleEditClinic = (clinicId: string) => {
    router.push(`/(doctor)/edit-clinic?clinicId=${clinicId}`);
  };

  const handleDeleteClinic = (clinicId: string, clinicName: string) => {
    Alert.alert(
      "Delete Clinic",
      `Are you sure you want to delete "${clinicName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClinic(clinicId);
            } catch (error) {
              Alert.alert("Error", "Failed to delete clinic");
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (clinicId: string) => {
    try {
      await setPrimaryClinic(clinicId);
    } catch (error) {
      Alert.alert("Error", "Failed to set primary clinic");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ModalHeader
          title={isCreateMode ? "Complete Your Profile" : "Edit Profile"}
          onClose={isCreateMode ? () => {} : () => router.back()}
        />

        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-4">
            {/* Welcome message for create mode */}
            {isCreateMode && (
              <View className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <Text className="text-base text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Welcome, Doctor!
                </Text>
                <Text className="text-sm text-blue-600 dark:text-blue-300">
                  Please complete your profile and add at least one clinic to
                  start using Mother's Book.
                </Text>
              </View>
            )}

            {/* Section: Personal Information */}
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Personal Information
            </Text>

            <View className="mb-5">
              <TextField
                label="Full Name"
                required
                value={fullName}
                onChangeText={setFullName}
                placeholder="Dr. Maria Santos"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-5">
              <TextField
                label="Specialization"
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="e.g., Obstetrician-Gynecologist (OB-GYN)"
                autoCapitalize="words"
                helperText="Your medical specialty helps mothers find the right doctor"
              />
            </View>

            <View className="mb-5">
              <TextField
                label="PRC License Number"
                required
                value={prcNumber}
                onChangeText={setPrcNumber}
                placeholder="0012345"
                autoCapitalize="characters"
                helperText="Your Professional Regulation Commission number"
              />
            </View>

            <View className="mb-8">
              <TextField
                label="Contact Number"
                required
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="+63 917 123 4567"
                keyboardType="phone-pad"
                helperText="Your personal contact number"
              />
            </View>

            {/* Section: Clinics */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Clinics
              </Text>
              <Pressable
                onPress={handleAddClinic}
                className="flex-row items-center"
              >
                <Plus size={16} color={isDark ? "#60a5fa" : "#3b82f6"} />
                <Text className="text-blue-600 dark:text-blue-400 text-sm font-medium ml-1">
                  Add Clinic
                </Text>
              </Pressable>
            </View>

            {clinics === undefined ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : clinics.length === 0 ? (
              <View className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 items-center mb-6">
                <Text className="text-gray-500 dark:text-gray-400 text-center mb-3">
                  No clinics added yet
                </Text>
                <Pressable
                  onPress={handleAddClinic}
                  className="bg-blue-600 px-4 py-2 rounded-lg active:bg-blue-700"
                >
                  <Text className="text-white font-medium">
                    Add Your First Clinic
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="mb-6">
                {clinics.map((clinic: Clinic) => (
                  <ClinicCard
                    key={clinic._id}
                    name={clinic.name}
                    address={clinic.address}
                    contactNumber={clinic.contactNumber}
                    schedule={clinic.schedule}
                    isPrimary={clinic.isPrimary}
                    onEdit={() => handleEditClinic(clinic._id)}
                    onDelete={() =>
                      handleDeleteClinic(clinic._id, clinic.name)
                    }
                    onSetPrimary={() => handleSetPrimary(clinic._id)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="primary"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            {isCreateMode ? "Get Started" : "Save Changes"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
