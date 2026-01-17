import { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAction, useConvex } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Mail, User, CheckCircle, AlertCircle } from "lucide-react-native";
import { ModalHeader, TextField, Button } from "../../../src/components/ui";
import { useThemeStore } from "../../../src/stores";

type FlowState = "email_input" | "patient_found" | "create_account";

export default function AddPatientScreen() {
  const router = useRouter();
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Flow state
  const [flowState, setFlowState] = useState<FlowState>("email_input");

  // Email input
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Found patient data
  const [foundPatient, setFoundPatient] = useState<{
    fullName: string;
    motherId?: string;
    userId?: string; // For users without mother profile
  } | null>(null);

  // New patient form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bookletLabel, setBookletLabel] = useState("");

  // Convex client for imperative queries
  const convex = useConvex();

  // Actions
  const createBookletForExisting = useAction(api.patientOnboarding.createBookletForExistingPatient);
  const createNewPatient = useAction(api.patientOnboarding.createNewPatientWithBooklet);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Check email
  const handleCheckEmail = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setIsCheckingEmail(true);

    try {
      // Use convex client to lookup the patient
      const result = await convex.query(api.patientOnboarding.lookupPatientByEmail, {
        email: trimmedEmail,
      });

      if (result.found && "isDoctor" in result && result.isDoctor) {
        setEmailError(result.error || "This email belongs to a doctor account");
        return;
      }

      if (result.found && "user" in result) {
        // Check if patient already has an active booklet
        if ("hasActiveBooklet" in result && result.hasActiveBooklet) {
          const bookletName = "activeBookletLabel" in result ? result.activeBookletLabel : "an active booklet";
          setEmailError(`This patient already has ${bookletName}. A patient can only have one active pregnancy at a time.`);
          return;
        }

        // Patient found (may or may not have mother profile)
        setFoundPatient({
          fullName: result.user.fullName,
          motherId: "motherProfile" in result ? result.motherProfile.id : undefined,
          userId: result.user.id,
        });
        setBookletLabel("Baby's Booklet");
        setFlowState("patient_found");
      } else {
        // No patient found, create new account
        setFlowState("create_account");
        setBookletLabel("Baby's Booklet");
      }
    } catch (error) {
      setEmailError("Failed to check email. Please try again.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Handle create booklet for existing patient
  const handleCreateBookletForExisting = async () => {
    if (!foundPatient) return;

    if (!bookletLabel.trim()) {
      Alert.alert("Error", "Please enter a label for the booklet");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBookletForExisting({
        email: email.trim().toLowerCase(),
        motherId: foundPatient.motherId as Id<"motherProfiles"> | undefined,
        userId: foundPatient.userId as Id<"users"> | undefined,
        bookletLabel: bookletLabel.trim(),
      });

      Alert.alert(
        "Success",
        "Booklet created successfully. The patient has been notified via email.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create booklet");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle create new patient account
  const handleCreateNewPatient = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter the patient's first name");
      return;
    }

    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter the patient's last name");
      return;
    }

    if (!bookletLabel.trim()) {
      Alert.alert("Error", "Please enter a label for the booklet");
      return;
    }

    setIsSubmitting(true);
    try {
      await createNewPatient({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bookletLabel: bookletLabel.trim(),
      });

      Alert.alert(
        "Account Created",
        `A new account has been created for ${firstName} ${lastName}. Login credentials have been sent to ${email}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create patient account");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to email input
  const handleBack = () => {
    setFlowState("email_input");
    setFoundPatient(null);
    setFirstName("");
    setLastName("");
    setBookletLabel("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ModalHeader
          title="Add Patient"
          subtitle={
            flowState === "email_input"
              ? "Enter patient's email"
              : flowState === "patient_found"
              ? "Patient found"
              : "Create new account"
          }
          onClose={() => router.back()}
        />

        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            {/* Email Input Step */}
            {flowState === "email_input" && (
              <>
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                  <Text className="text-blue-800 dark:text-blue-200 text-sm">
                    Enter the patient's email address to check if they already have an account. If not, you can create one for them.
                  </Text>
                </View>

                <TextField
                  label="Patient Email"
                  required
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  placeholder="patient@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={Mail}
                  error={emailError}
                />

                <View className="mt-6">
                  <Button
                    variant="primary"
                    onPress={handleCheckEmail}
                    loading={isCheckingEmail}
                    disabled={isCheckingEmail}
                    fullWidth
                  >
                    Continue
                  </Button>
                </View>
              </>
            )}

            {/* Patient Found Step */}
            {flowState === "patient_found" && foundPatient && (
              <>
                <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-6 flex-row items-center">
                  <CheckCircle size={24} color={isDark ? "#86efac" : "#22c55e"} />
                  <View className="ml-3 flex-1">
                    <Text className="text-green-800 dark:text-green-200 font-medium">
                      Patient Found
                    </Text>
                    <Text className="text-green-700 dark:text-green-300 text-sm mt-1">
                      {foundPatient.fullName}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-600 dark:text-gray-400 mb-4">
                  Email: {email}
                </Text>

                <TextField
                  label="Booklet Label"
                  required
                  value={bookletLabel}
                  onChangeText={setBookletLabel}
                  placeholder="e.g., Baby #1, Pregnancy 2024"
                  helperText="A descriptive name for this pregnancy/child record"
                />

                <View className="mt-6 gap-3">
                  <Button
                    variant="primary"
                    onPress={handleCreateBookletForExisting}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Create Booklet
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={handleBack}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Back
                  </Button>
                </View>
              </>
            )}

            {/* Create Account Step */}
            {flowState === "create_account" && (
              <>
                <View className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 flex-row items-start">
                  <AlertCircle size={24} color={isDark ? "#fcd34d" : "#f59e0b"} />
                  <View className="ml-3 flex-1">
                    <Text className="text-amber-800 dark:text-amber-200 font-medium">
                      New Patient
                    </Text>
                    <Text className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                      No account found for {email}. Enter the patient's details to create an account.
                    </Text>
                  </View>
                </View>

                <View className="mb-4">
                  <TextField
                    label="First Name"
                    required
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Maria"
                    autoCapitalize="words"
                    leftIcon={User}
                  />
                </View>

                <View className="mb-4">
                  <TextField
                    label="Last Name"
                    required
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Santos"
                    autoCapitalize="words"
                  />
                </View>

                <View className="mb-4">
                  <TextField
                    label="Booklet Label"
                    required
                    value={bookletLabel}
                    onChangeText={setBookletLabel}
                    placeholder="e.g., Baby #1, Pregnancy 2024"
                    helperText="A descriptive name for this pregnancy/child record"
                  />
                </View>

                <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    The patient will receive an email with:
                  </Text>
                  <View className="mt-2 ml-2">
                    <Text className="text-gray-600 dark:text-gray-400 text-sm">
                      {"\u2022"} Login credentials (temporary password)
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm">
                      {"\u2022"} Instructions to download the app
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm">
                      {"\u2022"} Prompt to change password on first login
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  <Button
                    variant="primary"
                    onPress={handleCreateNewPatient}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Create Account & Booklet
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={handleBack}
                    disabled={isSubmitting}
                    fullWidth
                  >
                    Back
                  </Button>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
