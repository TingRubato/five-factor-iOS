import { useEffect, useState } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import {
  useSharedValue,
  withTiming,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  style?: StyleProp<TextStyle>;
  onComplete?: () => void;
  delay?: number;
}

export default function TypewriterText({
  text,
  speed = 40,
  style,
  onComplete,
  delay = 0,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const progress = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      progress.value = withTiming(text.length, {
        duration: text.length * speed,
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  useAnimatedReaction(
    () => Math.floor(progress.value),
    (idx, prev) => {
      if (idx !== prev) {
        runOnJS(setDisplayed)(text.slice(0, idx));
        if (idx >= text.length && onComplete) {
          runOnJS(onComplete)();
        }
      }
    }
  );

  return <Text style={style}>{displayed}</Text>;
}
