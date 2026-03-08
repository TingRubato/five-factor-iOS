import { useEffect, useState } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

interface CountUpScoreProps {
  target: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  delay?: number;
}

export default function CountUpScore({
  target,
  duration = 1500,
  style,
  delay = 0,
}: CountUpScoreProps) {
  const [display, setDisplay] = useState(0);
  const val = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      val.value = withTiming(target, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  useAnimatedReaction(
    () => Math.round(val.value),
    (v, prev) => {
      if (v !== prev) runOnJS(setDisplay)(v);
    }
  );

  return <Text style={style}>{display}</Text>;
}
