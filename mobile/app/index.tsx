import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, S, T, R } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const tagAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(lineAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
      Animated.timing(tagAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

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
          style={[
            styles.brand,
            {
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          ARCHETYPE
        </Animated.Text>

        <Animated.View
          style={[
            styles.accentLine,
            {
              width: lineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 48],
              }),
            },
          ]}
        />

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: tagAnim,
              transform: [
                {
                  translateY: tagAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Discover your personality circle.{'\n'}
          Find your frequency.
        </Animated.Text>
      </View>

      {/* CTA */}
      <Animated.View
        style={[
          styles.bottom,
          {
            opacity: btnAnim,
            transform: [
              {
                translateY: btnAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.duration}>≈ 2 MIN · PHASE 1 OF 2</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/onboarding/phase1')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>BEGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/feed')}
          activeOpacity={0.6}
        >
          <Text style={styles.ghostLink}>Explore community without a profile →</Text>
        </TouchableOpacity>
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
