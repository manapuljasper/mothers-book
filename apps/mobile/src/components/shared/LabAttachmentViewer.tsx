import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share as ShareIcon,
  FlaskConical,
} from "lucide-react-native";
import { useLabAttachmentUrls } from "@/hooks";
import type { LabRequestWithDoctor } from "@/types";

interface LabAttachmentViewerProps {
  visible: boolean;
  onClose: () => void;
  lab: LabRequestWithDoctor | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function LabAttachmentViewer({
  visible,
  onClose,
  lab,
}: LabAttachmentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch signed URLs for attachments
  const attachmentUrls = useLabAttachmentUrls(visible && lab ? lab.id : undefined);

  // Reset index and loading state when modal opens or image changes
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setImageLoading(true);
    }
  }, [visible]);

  // Reset loading state when changing images
  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (attachmentUrls && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (attachmentUrls && currentIndex < attachmentUrls.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    if (!attachmentUrls || !attachmentUrls[currentIndex]?.url) return;

    try {
      await Share.share({
        url: attachmentUrls[currentIndex].url as string,
        message: `Lab result: ${lab?.description}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share image");
    }
  };

  if (!lab) return null;

  const isLoading = attachmentUrls === undefined;
  const hasImages = attachmentUrls && attachmentUrls.length > 0;
  const currentUrl = hasImages ? attachmentUrls[currentIndex]?.url : null;

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen">
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3">
          <Pressable
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
          >
            <X size={24} color="#ffffff" strokeWidth={1.5} />
          </Pressable>

          <View className="flex-1 mx-4">
            <View className="flex-row items-center justify-center">
              <FlaskConical size={16} color="#a855f7" strokeWidth={1.5} />
              <Text
                className="text-white font-semibold text-center ml-2"
                numberOfLines={1}
              >
                {lab.description}
              </Text>
            </View>
            {hasImages && (
              <Text className="text-gray-400 text-sm text-center mt-1">
                {currentIndex + 1} of {attachmentUrls.length}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleShare}
            disabled={!currentUrl}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
          >
            <ShareIcon
              size={20}
              color={currentUrl ? "#ffffff" : "#4b5563"}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>

        {/* Image Content */}
        <View className="flex-1 items-center justify-center">
          {isLoading ? (
            <View className="items-center">
              <ActivityIndicator size="large" color="#a855f7" />
              <Text className="text-gray-400 mt-4">Loading images...</Text>
            </View>
          ) : !hasImages ? (
            <View className="items-center px-6">
              <Text className="text-gray-400 text-center text-lg">
                No attachments found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                This lab result has no uploaded images
              </Text>
            </View>
          ) : currentUrl ? (
            <View style={{ width: screenWidth, height: screenHeight * 0.7 }}>
              <Image
                source={{ uri: currentUrl }}
                style={{
                  width: screenWidth,
                  height: screenHeight * 0.7,
                }}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#a855f7" />
                </View>
              )}
            </View>
          ) : (
            <View className="items-center px-6">
              <Text className="text-gray-400 text-center">
                Unable to load image
              </Text>
            </View>
          )}
        </View>

        {/* Navigation Controls */}
        {hasImages && attachmentUrls.length > 1 && (
          <View className="flex-row justify-between items-center px-4 py-4">
            <Pressable
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex-row items-center px-4 py-3 rounded-xl ${
                currentIndex === 0
                  ? "bg-white/5"
                  : "bg-white/10"
              }`}
            >
              <ChevronLeft
                size={20}
                color={currentIndex === 0 ? "#4b5563" : "#ffffff"}
                strokeWidth={1.5}
              />
              <Text
                className={`ml-1 font-medium ${
                  currentIndex === 0 ? "text-gray-600" : "text-white"
                }`}
              >
                Previous
              </Text>
            </Pressable>

            {/* Dots indicator */}
            <View className="flex-row items-center">
              {attachmentUrls.map((_item, idx) => (
                <View
                  key={idx}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    idx === currentIndex ? "bg-purple-500" : "bg-white/30"
                  }`}
                />
              ))}
            </View>

            <Pressable
              onPress={handleNext}
              disabled={currentIndex === attachmentUrls.length - 1}
              className={`flex-row items-center px-4 py-3 rounded-xl ${
                currentIndex === attachmentUrls.length - 1
                  ? "bg-white/5"
                  : "bg-white/10"
              }`}
            >
              <Text
                className={`mr-1 font-medium ${
                  currentIndex === attachmentUrls.length - 1
                    ? "text-gray-600"
                    : "text-white"
                }`}
              >
                Next
              </Text>
              <ChevronRight
                size={20}
                color={
                  currentIndex === attachmentUrls.length - 1
                    ? "#4b5563"
                    : "#ffffff"
                }
                strokeWidth={1.5}
              />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
