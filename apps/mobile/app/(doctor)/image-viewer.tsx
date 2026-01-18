import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Share,
  Alert,
  FlatList,
  ScrollView,
  type ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Share as ShareIcon } from "lucide-react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const THUMBNAIL_SIZE = 64;
const THUMBNAIL_GAP = 8;

export default function ImageViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    urls: string;
    title?: string;
    initialIndex?: string;
  }>();

  const urls: string[] = params.urls ? JSON.parse(params.urls) : [];
  const title = params.title ?? "Images";
  const initialIndex = params.initialIndex ? parseInt(params.initialIndex, 10) : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<number, boolean>
  >({});

  const carouselRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  // Scroll thumbnail strip to keep current thumbnail visible
  useEffect(() => {
    if (thumbnailScrollRef.current && urls.length > 1) {
      const scrollPosition = Math.max(
        0,
        currentIndex * (THUMBNAIL_SIZE + THUMBNAIL_GAP) -
          screenWidth / 2 +
          THUMBNAIL_SIZE / 2
      );
      thumbnailScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentIndex, urls.length]);

  const handleShare = async () => {
    if (!urls[currentIndex]) return;

    try {
      await Share.share({
        url: urls[currentIndex],
        message: title,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share image");
    }
  };

  const handleThumbnailPress = useCallback((index: number) => {
    setCurrentIndex(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const setImageLoading = useCallback((index: number, loading: boolean) => {
    setImageLoadingStates((prev) => ({ ...prev, [index]: loading }));
  }, []);

  const hasImages = urls.length > 0;

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const isItemLoading = imageLoadingStates[index] !== false;

    return (
      <View
        style={{ width: screenWidth, height: screenHeight * 0.65 }}
        className="items-center justify-center"
      >
        <Image
          source={{ uri: item }}
          style={{
            width: screenWidth,
            height: screenHeight * 0.65,
          }}
          contentFit="contain"
          cachePolicy="disk"
          transition={200}
          onLoadStart={() => setImageLoading(index, true)}
          onLoadEnd={() => setImageLoading(index, false)}
        />
        {isItemLoading && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="large" color="#a855f7" />
          </View>
        )}
      </View>
    );
  };

  const renderThumbnail = (url: string, index: number) => {
    const isSelected = index === currentIndex;

    return (
      <Pressable
        key={index}
        onPress={() => handleThumbnailPress(index)}
        style={{
          width: THUMBNAIL_SIZE,
          height: THUMBNAIL_SIZE,
          marginRight: index < urls.length - 1 ? THUMBNAIL_GAP : 0,
        }}
        className={`rounded-lg overflow-hidden ${
          isSelected ? "border-2 border-purple-500" : "border-2 border-transparent"
        }`}
      >
        <Image
          source={{ uri: url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="disk"
        />
        {isSelected && <View className="absolute inset-0 bg-purple-500/20" />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <X size={24} color="#ffffff" strokeWidth={1.5} />
        </Pressable>

        <View className="flex-1 mx-4">
          <Text
            className="text-white font-semibold text-center"
            numberOfLines={1}
          >
            {title}
          </Text>
          {hasImages && urls.length > 1 && (
            <Text className="text-gray-400 text-sm text-center mt-1">
              {currentIndex + 1} of {urls.length}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleShare}
          disabled={!hasImages}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <ShareIcon
            size={20}
            color={hasImages ? "#ffffff" : "#4b5563"}
            strokeWidth={1.5}
          />
        </Pressable>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center">
        {!hasImages ? (
          <View className="items-center px-6">
            <Text className="text-gray-400 text-center text-lg">
              No images found
            </Text>
          </View>
        ) : (
          <FlatList
            ref={carouselRef}
            data={urls}
            renderItem={renderCarouselItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            initialScrollIndex={initialIndex}
          />
        )}
      </View>

      {/* Thumbnail Strip */}
      {hasImages && urls.length > 1 && (
        <View className="py-4 px-4">
          <ScrollView
            ref={thumbnailScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: (screenWidth - THUMBNAIL_SIZE) / 2 - 16,
            }}
          >
            {urls.map((url, index) => renderThumbnail(url, index))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
