import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors, S, T, R } from '../constants/theme';
import PressableScale from '../components/ui/PressableScale';
import { useUser } from '../stores/userStore';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { user } = useUser();

  const lineProgress = useSharedValue(0);

  useEffect(() => {
    lineProgress.value = withDelay(800, withTiming(1, { duration: 400 }));
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => ({
    width: lineProgress.value * 48,
  }));

  const handleBegin = () => {
    if (user?.id) {
      // Already have a user — go straight to quiz or tabs
      if (user.phase !== 'none') {
        router.push('/(tabs)/feed');
      } else {
        router.push('/onboarding/phase1');
      }
      return;
    }
    // Route to auth screen for login / guest flow
    router.push('/auth');
  };

  return (
    <View style={styles.container}>
      {/* Background cross-hair decorations */}
      <View style={styles.crossV} />
      <View style={styles.crossH} />
      <View style={styles.cornerTL} />
      <View style={styles.cornerBR} />

      {/* Hero text */}
      <View style={styles.hero}>
        <Animated.Text
          entering={FadeInDown.duration(800)}
          style={styles.brand}
        >
          ARCHETYPE
        </Animated.Text>

        <Animated.View
          style={[
            styles.accentLine,
            animatedLineStyle,
          ]}
        />

        <Animated.Text
          entering={FadeInDown.delay(1200).duration(500)}
          style={styles.tagline}
        >
          Discover your personality circle.{'\n'}
          Find your frequency.
        </Animated.Text>
      </View>

      {/* CTA */}
      <Animated.View
        entering={FadeInDown.delay(1700).duration(400)}
        style={styles.bottom}
      >
        <Text style={styles.duration}>≈ 2 MIN · PHASE 1 OF 2</Text>

        <PressableScale
          style={styles.primaryBtn}
          onPress={handleBegin}
          scale={0.97}
        >
          <Text style={styles.primaryBtnText}>BEGIN</Text>
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/(tabs)/feed')}
          scale={0.98}
          haptic={false}
        >
          <Text style={styles.ghostLink}>Explore community without a profile →</Text>
        </PressableScale>
      </Animated.View>

      {/* Version stamp */}
      <Text style={styles.stamp}>IPIP BIG FIVE · PUBLIC DOMAIN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: S[12],
    paddingTop: 120,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },

  // Decorative lines
  crossV: {
    position: 'absolute',
    top: 0, bottom: 0,
    left: width * 0.15,
    width: 1,
    backgroundColor: Colors.line,
    opacity: 0.5,
  },
  crossH: {
    position: 'absolute',
    left: 0, right: 0,
    top: '40%',
    height: 1,
    backgroundColor: Colors.line,
    opacity: 0.5,
  },
  cornerTL: {
    position: 'absolute',
    top: 56, left: S[12],
    width: 20, height: 20,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderColor: Colors.accent,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 56, right: S[12],
    width: 20, height: 20,
    borderBottomWidth: 1, borderRightWidth: 1,
    borderColor: Colors.accent,
  },

  // Hero
  hero: {
    alignItems: 'flex-start',
  },
  brand: {
    fontSize: T.hero,
    fontWeight: T.thin,
    color: Colors.black,
    letterSpacing: 10,
    marginBottom: S[6],
  },
  accentLine: {
    height: 2,
    backgroundColor: Colors.accent,
    marginBottom: S[8],
  },
  tagline: {
    fontSize: T.md,
    fontWeight: T.light,
    color: Colors.t2,
    lineHeight: 26,
    letterSpacing: 0.3,
  },

  // Bottom
  bottom: {
    gap: S[6],
  },
  duration: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 2.5,
    fontWeight: T.semibold,
    marginBottom: S[4],
  },
  primaryBtn: {
    backgroundColor: Colors.black,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: T.bold,
    fontSize: T.base,
    letterSpacing: 4,
  },
  ghostLink: {
    fontSize: T.sm,
    color: Colors.t3,
    textAlign: 'center',
    paddingTop: S[4],
  },

  // Stamp
  stamp: {
    position: 'absolute',
    bottom: 28,
    right: S[12],
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 1.5,
    fontWeight: T.semibold,
  },
});
