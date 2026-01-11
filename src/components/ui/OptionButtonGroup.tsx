import { View, Text, Pressable, ScrollView } from "react-native";

type OptionColor = "blue" | "green" | "amber";
type OptionSize = "sm" | "md";

interface OptionButtonGroupProps<T extends string> {
  options: readonly T[] | T[];
  value: T;
  onChange: (value: T) => void;
  labels?: Partial<Record<T, string>>;
  color?: OptionColor;
  size?: OptionSize;
  scrollable?: boolean;
}

const COLOR_STYLES: Record<OptionColor, { selected: string; selectedBorder: string }> = {
  blue: {
    selected: "bg-blue-500 border-blue-500",
    selectedBorder: "border-blue-500",
  },
  green: {
    selected: "bg-green-500 border-green-500",
    selectedBorder: "border-green-500",
  },
  amber: {
    selected: "bg-amber-500 border-amber-500",
    selectedBorder: "border-amber-500",
  },
};

const SIZE_STYLES: Record<OptionSize, { button: string; text: string }> = {
  sm: {
    button: "px-2 py-1.5",
    text: "text-xs",
  },
  md: {
    button: "px-3 py-2",
    text: "text-sm",
  },
};

export function OptionButtonGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
  color = "green",
  size = "md",
  scrollable = false,
}: OptionButtonGroupProps<T>) {
  const colorStyle = COLOR_STYLES[color];
  const sizeStyle = SIZE_STYLES[size];

  const renderOption = (option: T) => {
    const isSelected = value === option;
    const displayLabel = labels?.[option] ?? option;

    return (
      <Pressable
        key={option}
        onPress={() => onChange(option)}
        className={`${sizeStyle.button} mr-1 rounded-lg border ${
          isSelected
            ? colorStyle.selected
            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
        }`}
      >
        <Text
          className={`${sizeStyle.text} ${
            isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {displayLabel}
        </Text>
      </Pressable>
    );
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row" }}
      >
        {options.map(renderOption)}
      </ScrollView>
    );
  }

  return <View className="flex-row flex-wrap">{options.map(renderOption)}</View>;
}
