import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import { useThemeStore } from "../../stores";

interface BabySizeData {
  minWeek: number;
  maxWeek: number;
  size: string;
  emoji: string;
  funFact: string;
  colors: {
    light: readonly [string, string];
    dark: readonly [string, string];
    accent: string;
    accentLight: string;
    accentDark: string;
    accentBgLight: string;
    accentBgDark: string;
  };
}

const BABY_SIZES: BabySizeData[] = [
  {
    minWeek: 4,
    maxWeek: 5,
    size: "Poppy seed",
    emoji: "🫘",
    funFact:
      "Your baby is smaller than a grain of rice, but the heart is already forming!",
    colors: {
      light: ["#fdf2f8", "#fce7f3"],
      dark: ["rgba(236,72,153,0.15)", "rgba(251,146,60,0.1)"],
      accent: "#be185d",
      accentLight: "#be185d",
      accentDark: "#f472b6",
      accentBgLight: "rgba(190,24,93,0.1)",
      accentBgDark: "rgba(244,114,182,0.2)",
    },
  },
  {
    minWeek: 6,
    maxWeek: 7,
    size: "Blueberry",
    emoji: "🫐",
    funFact: "Tiny facial features and limb buds are starting to appear.",
    colors: {
      light: ["#eff6ff", "#dbeafe"],
      dark: ["rgba(59,130,246,0.15)", "rgba(139,92,246,0.1)"],
      accent: "#1d4ed8",
      accentLight: "#1d4ed8",
      accentDark: "#60a5fa",
      accentBgLight: "rgba(29,78,216,0.1)",
      accentBgDark: "rgba(96,165,250,0.2)",
    },
  },
  {
    minWeek: 8,
    maxWeek: 9,
    size: "Raspberry",
    emoji: "🍇",
    funFact: "All major organs have begun developing!",
    colors: {
      light: ["#fdf4ff", "#f5d0fe"],
      dark: ["rgba(168,85,247,0.15)", "rgba(236,72,153,0.1)"],
      accent: "#9333ea",
      accentLight: "#9333ea",
      accentDark: "#c084fc",
      accentBgLight: "rgba(147,51,234,0.1)",
      accentBgDark: "rgba(192,132,252,0.2)",
    },
  },
  {
    minWeek: 10,
    maxWeek: 11,
    size: "Strawberry",
    emoji: "🍓",
    funFact: "Baby can move (even though you can't feel it yet!).",
    colors: {
      light: ["#fff1f2", "#ffe4e6"],
      dark: ["rgba(244,63,94,0.15)", "rgba(251,113,133,0.1)"],
      accent: "#e11d48",
      accentLight: "#e11d48",
      accentDark: "#fb7185",
      accentBgLight: "rgba(225,29,72,0.1)",
      accentBgDark: "rgba(251,113,133,0.2)",
    },
  },
  {
    minWeek: 12,
    maxWeek: 13,
    size: "Lime",
    emoji: "🍋‍🟩",
    funFact: "Reflexes are forming — baby can open and close tiny hands!",
    colors: {
      light: ["#f0fdf4", "#dcfce7"],
      dark: ["rgba(34,197,94,0.15)", "rgba(74,222,128,0.1)"],
      accent: "#16a34a",
      accentLight: "#16a34a",
      accentDark: "#4ade80",
      accentBgLight: "rgba(22,163,74,0.1)",
      accentBgDark: "rgba(74,222,128,0.2)",
    },
  },
  {
    minWeek: 14,
    maxWeek: 15,
    size: "Apple",
    emoji: "🍎",
    funFact: "Baby can squint, frown, and may even suck a thumb!",
    colors: {
      light: ["#fef2f2", "#fee2e2"],
      dark: ["rgba(239,68,68,0.15)", "rgba(248,113,113,0.1)"],
      accent: "#dc2626",
      accentLight: "#dc2626",
      accentDark: "#f87171",
      accentBgLight: "rgba(220,38,38,0.1)",
      accentBgDark: "rgba(248,113,113,0.2)",
    },
  },
  {
    minWeek: 16,
    maxWeek: 17,
    size: "Avocado",
    emoji: "🥑",
    funFact: "Bones are getting stronger, and baby is practicing movements!",
    colors: {
      light: ["#f0fdf4", "#d1fae5"],
      dark: ["rgba(34,197,94,0.15)", "rgba(16,185,129,0.1)"],
      accent: "#059669",
      accentLight: "#059669",
      accentDark: "#34d399",
      accentBgLight: "rgba(5,150,105,0.1)",
      accentBgDark: "rgba(52,211,153,0.2)",
    },
  },
  {
    minWeek: 18,
    maxWeek: 19,
    size: "Bell pepper",
    emoji: "🫑",
    funFact: "Ears are developed enough to start hearing sounds!",
    colors: {
      light: ["#fefce8", "#fef9c3"],
      dark: ["rgba(234,179,8,0.15)", "rgba(250,204,21,0.1)"],
      accent: "#ca8a04",
      accentLight: "#ca8a04",
      accentDark: "#facc15",
      accentBgLight: "rgba(202,138,4,0.1)",
      accentBgDark: "rgba(250,204,21,0.2)",
    },
  },
  {
    minWeek: 20,
    maxWeek: 24,
    size: "Cantaloupe",
    emoji: "🍈",
    funFact: "Baby can hear your voice clearly and may respond with movement!",
    colors: {
      light: ["#fff7ed", "#ffedd5"],
      dark: ["rgba(249,115,22,0.15)", "rgba(251,146,60,0.1)"],
      accent: "#ea580c",
      accentLight: "#ea580c",
      accentDark: "#fb923c",
      accentBgLight: "rgba(234,88,12,0.1)",
      accentBgDark: "rgba(251,146,60,0.2)",
    },
  },
  {
    minWeek: 25,
    maxWeek: 27,
    size: "Cauliflower",
    emoji: "🥬",
    funFact: "Brain activity is increasing rapidly!",
    colors: {
      light: ["#fafafa", "#f4f4f5"],
      dark: ["rgba(113,113,122,0.15)", "rgba(161,161,170,0.1)"],
      accent: "#52525b",
      accentLight: "#52525b",
      accentDark: "#a1a1aa",
      accentBgLight: "rgba(82,82,91,0.1)",
      accentBgDark: "rgba(161,161,170,0.2)",
    },
  },
  {
    minWeek: 28,
    maxWeek: 30,
    size: "Eggplant",
    emoji: "🍆",
    funFact: "Baby's eyes can open and close!",
    colors: {
      light: ["#f5f3ff", "#ede9fe"],
      dark: ["rgba(139,92,246,0.15)", "rgba(167,139,250,0.1)"],
      accent: "#7c3aed",
      accentLight: "#7c3aed",
      accentDark: "#a78bfa",
      accentBgLight: "rgba(124,58,237,0.1)",
      accentBgDark: "rgba(167,139,250,0.2)",
    },
  },
  {
    minWeek: 31,
    maxWeek: 33,
    size: "Pineapple",
    emoji: "🍍",
    funFact: "Baby is putting on weight and filling out!",
    colors: {
      light: ["#fefce8", "#fef08a"],
      dark: ["rgba(234,179,8,0.15)", "rgba(250,204,21,0.1)"],
      accent: "#ca8a04",
      accentLight: "#ca8a04",
      accentDark: "#facc15",
      accentBgLight: "rgba(202,138,4,0.1)",
      accentBgDark: "rgba(250,204,21,0.2)",
    },
  },
  {
    minWeek: 34,
    maxWeek: 36,
    size: "Honeydew melon",
    emoji: "🍈",
    funFact: "Lungs are nearly mature — almost ready!",
    colors: {
      light: ["#ecfdf5", "#d1fae5"],
      dark: ["rgba(16,185,129,0.15)", "rgba(52,211,153,0.1)"],
      accent: "#059669",
      accentLight: "#059669",
      accentDark: "#34d399",
      accentBgLight: "rgba(5,150,105,0.1)",
      accentBgDark: "rgba(52,211,153,0.2)",
    },
  },
  {
    minWeek: 37,
    maxWeek: 42,
    size: "Small watermelon",
    emoji: "🍉",
    funFact: "Baby is fully developed and ready to meet you!",
    colors: {
      light: ["#fdf2f8", "#fce7f3"],
      dark: ["rgba(236,72,153,0.15)", "rgba(244,114,182,0.1)"],
      accent: "#db2777",
      accentLight: "#db2777",
      accentDark: "#f472b6",
      accentBgLight: "rgba(219,39,119,0.1)",
      accentBgDark: "rgba(244,114,182,0.2)",
    },
  },
];

function getBabySizeForWeek(week: number): BabySizeData | null {
  if (week < 4) return null;
  return (
    BABY_SIZES.find((size) => week >= size.minWeek && week <= size.maxWeek) ??
    BABY_SIZES[BABY_SIZES.length - 1]
  );
}

interface BabySizeCardProps {
  weeks: number;
}

export function BabySizeCard({ weeks }: BabySizeCardProps) {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";
  const sizeData = getBabySizeForWeek(weeks);

  if (!sizeData) {
    return null;
  }

  const accentColor = isDark
    ? sizeData.colors.accentDark
    : sizeData.colors.accentLight;
  const accentBg = isDark
    ? sizeData.colors.accentBgDark
    : sizeData.colors.accentBgLight;
  const gradientColors = isDark ? sizeData.colors.dark : sizeData.colors.light;

  return (
    <View className="mx-5 rounded-3xl overflow-hidden border border-pink-200/50 dark:border-pink-800/30">
      <LinearGradient
        colors={gradientColors as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20, minHeight: 160 }}
      >
        <View className="flex-row items-center justify-between">
          {/* Text content */}
          <View className="flex-1 pr-4">
            {/* Week badge */}
            <View className="flex-row items-center gap-1.5 mb-2">
              <Sparkles size={12} color={accentColor} strokeWidth={2} />
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                Week {weeks}
              </Text>
            </View>

            {/* Main title */}
            <Text className="text-xl font-bold text-gray-800 dark:text-white leading-tight mb-2">
              Your baby is{"\n"}the size of a...
            </Text>

            {/* Size badge */}
            <View
              className="self-start px-3 py-1.5 rounded-full"
              style={{ backgroundColor: accentBg }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: accentColor }}
              >
                {sizeData.size}!
              </Text>
            </View>
          </View>

          {/* Emoji */}
          <View className="w-28 h-28 items-center justify-center">
            {/* Glow effect */}
            <View
              className="absolute w-24 h-24 rounded-full"
              style={{
                backgroundColor: accentColor,
                opacity: isDark ? 0.15 : 0.25,
              }}
            />
            <Text style={{ fontSize: 48 }}>{sizeData.emoji}</Text>
          </View>
        </View>

        {/* Fun fact */}
        <View className="mt-4">
          <Text className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {sizeData.funFact}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
