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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageIcon, X, Upload, FlaskConical } from "lucide-react-native";
import { useGenerateLabUploadUrl, useUploadLabResult } from "@/hooks";
import { ButtonPressable } from "@/components/ui";
import type { LabRequestWithDoctor } from "@/types";

interface LabUploadModalProps {
  visible: boolean;
  onClose: () => void;
  lab: LabRequestWithDoctor | null;
  motherId: string;
  onUploadComplete?: () => void;
  /** If provided, will navigate to booklet labs tab after upload */
  bookletId?: string;
}

export function LabUploadModal({
  visible,
  onClose,
  lab,
  motherId,
  onUploadComplete,
  bookletId,
}: LabUploadModalProps) {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useGenerateLabUploadUrl();
  const uploadLabResult = useUploadLabResult();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSelectedImages([]);
      setIsUploading(false);
      setUploadProgress(0);
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

  // Upload a single file with progress tracking
  const uploadWithProgress = (
    url: string,
    blob: Blob,
    imageIndex: number,
    totalImages: number
  ): Promise<{ storageId: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const imageProgress = event.loaded / event.total;
          const overallProgress = ((imageIndex + imageProgress) / totalImages) * 100;
          setUploadProgress(Math.round(overallProgress));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error("Failed to parse response"));
          }
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));

      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", blob.type || "image/jpeg");
      xhr.send(blob);
    });
  };

  // Upload images to Convex storage
  const handleUpload = async () => {
    if (!lab || selectedImages.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storageIds: string[] = [];
      const totalImages = selectedImages.length;

      // Upload each image
      for (let i = 0; i < totalImages; i++) {
        const imageUri = selectedImages[i];

        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Fetch the image and convert to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Upload to Convex storage with progress tracking
        const { storageId } = await uploadWithProgress(uploadUrl, blob, i, totalImages);
        storageIds.push(storageId);
      }

      // Save storage IDs to lab request and mark as completed
      await uploadLabResult({
        labId: lab.id,
        storageIds,
        motherId,
      });

      // Close modal first
      onClose();
      onUploadComplete?.();

      // Navigate to booklet labs tab only if bookletId explicitly provided
      // (When used from Home/Dashboard tabs, we navigate. When used from booklet detail, we don't)
      if (bookletId) {
        router.push(`/booklet/${bookletId}?tab=labs`);
      }
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
          <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <View className="flex-row items-center mb-2">
              <FlaskConical size={18} color="#6b7280" strokeWidth={1.5} />
              <Text className="text-gray-800 dark:text-gray-200 font-semibold ml-2">
                {lab.description}
              </Text>
            </View>
            {lab.doctorName && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
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
                className="mb-3 pt-2"
                style={{ overflow: 'visible' }}
              >
                {selectedImages.map((uri, index) => (
                  <View key={index} className="mr-3 relative" style={{ overflow: 'visible' }}>
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
            <ButtonPressable
              onPress={handleTakePhoto}
              disabled={isUploading}
              className={`flex-1 flex-row items-center justify-center border border-gray-300 dark:border-gray-600 px-3 py-4 rounded-xl mr-3 ${
                isUploading
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <Camera
                size={20}
                color={isUploading ? "#9ca3af" : "#6b7280"}
                strokeWidth={1.5}
              />
              <Text
                className={`font-medium ml-2 ${
                  isUploading
                    ? "text-gray-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Camera
              </Text>
            </ButtonPressable>
            <ButtonPressable
              onPress={handlePickImage}
              disabled={isUploading}
              className={`flex-1 flex-row items-center justify-center border border-gray-300 dark:border-gray-600 px-3 py-4 rounded-xl ${
                isUploading
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <ImageIcon
                size={20}
                color={isUploading ? "#9ca3af" : "#6b7280"}
                strokeWidth={1.5}
              />
              <Text
                className={`font-medium ml-2 ${
                  isUploading
                    ? "text-gray-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Gallery
              </Text>
            </ButtonPressable>
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
                : "bg-gray-800 dark:bg-gray-200"
            }`}
          >
            {isUploading ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold ml-2">
                  Uploading... {uploadProgress}%
                </Text>
              </>
            ) : (
              <>
                <Upload
                  size={20}
                  color={selectedImages.length === 0 ? "#9ca3af" : "#ffffff"}
                  strokeWidth={1.5}
                  className={selectedImages.length > 0 ? "dark:text-gray-800" : ""}
                />
                <Text
                  className={`font-semibold ml-2 ${
                    selectedImages.length === 0
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-white dark:text-gray-800"
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
