import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageIcon, X, Upload, FlaskConical } from "lucide-react-native";
import { useGenerateLabUploadUrl, useUploadLabResult } from "@/hooks";
import type { LabRequestWithDoctor } from "@/types";

interface LabUploadModalProps {
  visible: boolean;
  onClose: () => void;
  lab: LabRequestWithDoctor | null;
  motherId: string;
  onUploadComplete?: () => void;
}

export function LabUploadModal({
  visible,
  onClose,
  lab,
  motherId,
  onUploadComplete,
}: LabUploadModalProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useGenerateLabUploadUrl();
  const uploadLabResult = useUploadLabResult();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSelectedImages([]);
      setIsUploading(false);
    }
  }, [visible]);

  // Take photo with camera
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
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
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
      setSelectedImages((prev) => [...prev, ...newUris]);
    }
  };

  // Remove selected image
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to Convex storage
  const handleUpload = async () => {
    if (!lab || selectedImages.length === 0) return;

    setIsUploading(true);

    try {
      const storageIds: string[] = [];

      // Upload each image
      for (const imageUri of selectedImages) {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Fetch the image and convert to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Upload to Convex storage
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": blob.type || "image/jpeg",
          },
          body: blob,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await uploadResponse.json();
        storageIds.push(storageId);
      }

      // Save storage IDs to lab request and mark as completed
      await uploadLabResult({
        labId: lab.id,
        storageIds,
        motherId,
      });

      Alert.alert("Success", "Lab results uploaded successfully!", [
        {
          text: "OK",
          onPress: () => {
            onClose();
            onUploadComplete?.();
          },
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload lab results. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!lab) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <Pressable onPress={onClose} disabled={isUploading}>
            <Text
              className={`${
                isUploading
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Cancel
            </Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Upload Lab Results
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          {/* Lab Info */}
          <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 mb-6">
            <View className="flex-row items-center mb-2">
              <FlaskConical size={18} color="#a855f7" strokeWidth={1.5} />
              <Text className="text-purple-600 dark:text-purple-400 font-semibold ml-2">
                {lab.description}
              </Text>
            </View>
            {lab.doctorName && (
              <Text className="text-purple-500 dark:text-purple-400 text-sm">
                Requested by {lab.doctorName}
              </Text>
            )}
          </View>

          {/* Instructions */}
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Take a photo of your lab results or select from your gallery. You
            can upload multiple images.
          </Text>

          {/* Selected Images */}
          {selectedImages.length > 0 && (
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3">
                Selected Photos ({selectedImages.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
              >
                {selectedImages.map((uri, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image
                      source={{ uri }}
                      className="w-24 h-24 rounded-xl"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5"
                      disabled={isUploading}
                    >
                      <X size={12} color="white" strokeWidth={2.5} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Photo Picker Buttons */}
          <View className="flex-row mb-6">
            <Pressable
              onPress={handleTakePhoto}
              disabled={isUploading}
              className={`flex-1 flex-row items-center justify-center border border-purple-400 dark:border-purple-500 px-3 py-4 rounded-xl mr-3 ${
                isUploading
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <Camera
                size={20}
                color={isUploading ? "#9ca3af" : "#a855f7"}
                strokeWidth={1.5}
              />
              <Text
                className={`font-medium ml-2 ${
                  isUploading
                    ? "text-gray-400"
                    : "text-purple-600 dark:text-purple-400"
                }`}
              >
                Camera
              </Text>
            </Pressable>
            <Pressable
              onPress={handlePickImage}
              disabled={isUploading}
              className={`flex-1 flex-row items-center justify-center border border-purple-400 dark:border-purple-500 px-3 py-4 rounded-xl ${
                isUploading
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <ImageIcon
                size={20}
                color={isUploading ? "#9ca3af" : "#a855f7"}
                strokeWidth={1.5}
              />
              <Text
                className={`font-medium ml-2 ${
                  isUploading
                    ? "text-gray-400"
                    : "text-purple-600 dark:text-purple-400"
                }`}
              >
                Gallery
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Upload Button */}
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <Pressable
            onPress={handleUpload}
            disabled={selectedImages.length === 0 || isUploading}
            className={`flex-row items-center justify-center py-4 rounded-xl ${
              selectedImages.length === 0 || isUploading
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-purple-500"
            }`}
          >
            {isUploading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold ml-2">
                  Uploading...
                </Text>
              </>
            ) : (
              <>
                <Upload
                  size={20}
                  color={selectedImages.length === 0 ? "#9ca3af" : "white"}
                  strokeWidth={1.5}
                />
                <Text
                  className={`font-semibold ml-2 ${
                    selectedImages.length === 0
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-white"
                  }`}
                >
                  Upload Results
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
