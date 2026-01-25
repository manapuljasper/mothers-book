import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/**
 * Fast modal screen options for snappier Android animations.
 * Default slide_from_bottom is ~350ms, this reduces it to 200ms.
 */
export const fastModalOptions: NativeStackNavigationOptions = {
  presentation: "modal",
  animation: "slide_from_bottom",
  animationDuration: 200,
};
