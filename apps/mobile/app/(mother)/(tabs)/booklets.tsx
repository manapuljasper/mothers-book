import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Plus } from "lucide-react-native";
import { useCurrentUser, useBookletsByMother } from "@/hooks";
import { formatDate } from "@/utils";
import {
  CardPressable,
  BookletCard,
  EmptyState,
  Button,
  LoadingScreen,
} from "@/components/ui";

export default function BookletsScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const motherProfile = currentUser?.motherProfile;

  const booklets = useBookletsByMother(motherProfile?._id);

  const isLoading = currentUser === undefined || booklets === undefined;

  if (isLoading) {
    return <LoadingScreen />;
  }

  const activeBooklets = booklets.filter((b) => b.status === "active");
  const pastBooklets = booklets.filter((b) => b.status !== "active");

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* New Booklet Button */}
      <View className="px-6 pt-4 pb-2">
        <Button
          variant="outline"
          icon={Plus}
          onPress={() => router.push("/booklet/new")}
        >
          New Booklet
        </Button>
      </View>

      {/* Active Booklets */}
      <View className="px-6 mt-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Booklets
        </Text>

        {activeBooklets.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No active booklets"
            description="Create a new booklet to start tracking your pregnancy"
          />
        ) : (
          activeBooklets.map((booklet) => (
            <BookletCard
              key={booklet.id}
              booklet={booklet}
              onPress={() => router.push(`/booklet/${booklet.id}`)}
              variant="mother"
            />
          ))
        )}
      </View>

      {/* Past Booklets */}
      {pastBooklets.length > 0 && (
        <View className="px-6 mt-8 mb-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Past Booklets
          </Text>
          {pastBooklets.map((booklet) => (
            <CardPressable
              key={booklet.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-3 border border-gray-100 dark:border-gray-700"
              onPress={() => router.push(`/booklet/${booklet.id}`)}
            >
              <Text className="font-medium text-gray-700 dark:text-gray-300">
                {booklet.label}
              </Text>
              {booklet.actualDeliveryDate && (
                <Text className="text-gray-400 text-sm mt-1">
                  Delivered: {formatDate(booklet.actualDeliveryDate)}
                </Text>
              )}
              <View className="mt-2 self-start px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {booklet.status}
                </Text>
              </View>
            </CardPressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
