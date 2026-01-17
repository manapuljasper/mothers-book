import React, { createContext, useContext, useEffect } from "react";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
} from "react-native-reanimated";

type SkeletonContextType = SharedValue<number> | null;

const SkeletonContext = createContext<SkeletonContextType>(null);

interface SkeletonProviderProps {
  children: React.ReactNode;
}

export function SkeletonProvider({ children }: SkeletonProviderProps) {
  const progress = useSharedValue(-1);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(2, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1, // infinite
      false // don't reverse
    );
  }, [progress]);

  return (
    <SkeletonContext.Provider value={progress}>
      {children}
    </SkeletonContext.Provider>
  );
}

export function useSkeletonAnimation(): SharedValue<number> {
  const context = useContext(SkeletonContext);
  const fallback = useSharedValue(-1);

  useEffect(() => {
    if (!context) {
      fallback.value = withRepeat(
        withTiming(2, {
          duration: 1200,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [context, fallback]);

  return context ?? fallback;
}
