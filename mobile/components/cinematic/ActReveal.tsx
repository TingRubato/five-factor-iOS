import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { Colors, S, T } from '../../constants/theme';
import { Locale } from '../../lib/cinematic-utils';
import { Archetype } from '../../lib/archetypes';
import TypewriterText from './TypewriterText';

interface ActRevealProps {
  archetype: Archetype;
  locale: Locale;
}

export default function ActReveal({ archetype, locale }: ActRevealProps) {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600).delay(200)}>
        <Text style={styles.actLabel}>
          {locale === 'zh' ? '你的原型' : 'YOUR ARCHETYPE'}
        </Text>
      </Animated.View>

      <Animated.View entering={ZoomIn.duration(600).delay(600).springify().damping(12)}>
        <Text style={[styles.nameZh, { color: archetype.color }]}>
          {archetype.nameZh}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(800).delay(1200)}>
        <Text style={styles.nameEn}>The {archetype.nameEn}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(800).delay(2000)}>
        <TypewriterText
          text={archetype.description}
          speed={30}
          delay={0}
          style={styles.description}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(3500)} style={styles.hint}>
        <Text style={styles.hintText}>
          {locale === 'zh' ? '轻触继续' : 'Tap to continue'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: S[10],
  },
  actLabel: {
    fontSize: T.xs,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    marginBottom: S[8],
  },
  nameZh: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: S[2],
  },
  nameEn: {
    fontSize: T.xl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t2,
    marginBottom: S[10],
  },
  description: {
    fontSize: T.md,
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 26,
  },
  hint: {
    position: 'absolute',
    bottom: S[16],
    alignSelf: 'center',
  },
  hintText: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 2,
  },
});
