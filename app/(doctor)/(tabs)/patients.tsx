import { View, Text, ScrollView, TextInput } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { useAuthStore, useBookletStore } from "../../../src/stores";
import { formatRelativeDate, formatDate } from "../../../src/utils";
import { CardPressable } from "../../../src/components/ui";

export default function PatientsScreen() {
  const { doctorProfile } = useAuthStore();
  const { getBookletsByDoctor } = useBookletStore();
  const [searchQuery, setSearchQuery] = useState("");

  const patientBooklets = doctorProfile ? getBookletsByDoctor(doctorProfile.id) : [];

  // Filter by search query
  const filteredBooklets = patientBooklets.filter(
    (b) =>
      b.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Patients</Text>
        <Text className="text-gray-400 text-sm">
          {patientBooklets.length} active booklets
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          <Search size={18} color="#9ca3af" strokeWidth={1.5} />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search patients..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Patient List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredBooklets.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-center">
              {searchQuery ? "No patients found" : "No patients yet"}
            </Text>
            <Text className="text-gray-300 text-sm text-center mt-2">
              Scan a patient's QR code to add them
            </Text>
          </View>
        ) : (
          filteredBooklets.map((booklet) => (
            <CardPressable key={booklet.id} className="bg-white rounded-xl p-5 mb-3 border border-gray-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-lg">
                    {booklet.motherName}
                  </Text>
                  <Text className="text-gray-400">{booklet.label}</Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full border ${
                    booklet.status === "active" ? "border-green-400" : "border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      booklet.status === "active"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {booklet.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                <View className="flex-1">
                  <Text className="text-gray-300 text-xs">Last Visit</Text>
                  <Text className="text-gray-600 text-sm">
                    {booklet.lastVisitDate
                      ? formatRelativeDate(booklet.lastVisitDate)
                      : "—"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-300 text-xs">Next Appointment</Text>
                  <Text className="text-gray-600 text-sm">
                    {booklet.nextAppointment
                      ? formatDate(booklet.nextAppointment)
                      : "—"}
                  </Text>
                </View>
                {booklet.expectedDueDate && (
                  <View className="flex-1">
                    <Text className="text-gray-300 text-xs">Due Date</Text>
                    <Text className="text-gray-600 text-sm">
                      {formatDate(booklet.expectedDueDate)}
                    </Text>
                  </View>
                )}
              </View>
            </CardPressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
