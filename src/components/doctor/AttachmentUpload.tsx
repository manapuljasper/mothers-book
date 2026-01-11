import { View, Text, ScrollView, Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageIcon, X } from "lucide-react-native";

interface AttachmentUploadProps {
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}

export function AttachmentUpload({
  attachments,
  onAttachmentsChange,
}: AttachmentUploadProps) {
  // Take photo
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onAttachmentsChange([...attachments, result.assets[0].uri]);
    }
  };

  // Choose from gallery
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is needed to select photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((asset) => asset.uri);
      onAttachmentsChange([...attachments, ...newUris]);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <View className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
      <View className="flex-row items-center mb-3">
        <ImageIcon size={18} color="#6366f1" strokeWidth={1.5} />
        <Text className="text-gray-700 dark:text-gray-200 font-semibold ml-2">
          Attachments
        </Text>
      </View>

      {/* Display selected photos */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {attachments.map((uri, index) => (
            <View key={index} className="mr-2 relative">
              <Image
                source={{ uri }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => handleRemoveAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              >
                <X size={12} color="white" strokeWidth={2} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Photo picker buttons */}
      <View className="flex-row">
        <Pressable
          onPress={handleTakePhoto}
          className="flex-1 flex-row items-center justify-center border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 px-3 py-3 rounded-xl mr-2"
        >
          <Camera size={18} color="#6366f1" strokeWidth={1.5} />
          <Text className="text-indigo-600 dark:text-indigo-400 font-medium ml-2">
            Take Photo
          </Text>
        </Pressable>
        <Pressable
          onPress={handlePickImage}
          className="flex-1 flex-row items-center justify-center border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 px-3 py-3 rounded-xl"
        >
          <ImageIcon size={18} color="#6366f1" strokeWidth={1.5} />
          <Text className="text-indigo-600 dark:text-indigo-400 font-medium ml-2">
            Gallery
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
