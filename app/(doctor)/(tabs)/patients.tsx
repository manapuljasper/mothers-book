import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, useBookletStore } from "../../../src/stores";
import { formatRelativeDate, formatDate } from "../../../src/utils";

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
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Patients</Text>
        <Text className="text-gray-500 text-sm">
          {patientBooklets.length} active booklets
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <TextInput
          className="bg-gray-100 rounded-lg px-4 py-3"
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Patient List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredBooklets.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-gray-500 text-center">
              {searchQuery ? "No patients found" : "No patients yet"}
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Scan a patient's QR code to add them
            </Text>
          </View>
        ) : (
          filteredBooklets.map((booklet) => (
            <Pressable
              key={booklet.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-lg">
                    {booklet.motherName}
                  </Text>
                  <Text className="text-gray-600">{booklet.label}</Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    booklet.status === "active" ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      booklet.status === "active"
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {booklet.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Last Visit</Text>
                  <Text className="text-gray-600 text-sm">
                    {booklet.lastVisitDate
                      ? formatRelativeDate(booklet.lastVisitDate)
                      : "—"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Next Appointment</Text>
                  <Text className="text-gray-600 text-sm">
                    {booklet.nextAppointment
                      ? formatDate(booklet.nextAppointment)
                      : "—"}
                  </Text>
                </View>
                {booklet.expectedDueDate && (
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">Due Date</Text>
                    <Text className="text-gray-600 text-sm">
                      {formatDate(booklet.expectedDueDate)}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
