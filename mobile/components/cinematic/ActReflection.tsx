import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, S, T, Shadows } from '../../constants/theme';
import { Locale } from '../../lib/cinematic-utils';
import { getClosingProse } from '../../lib/interpretations';

interface ActReflectionProps {
  locale: Locale;
  onEnter: () => void;
}

export default function ActReflection({ locale, onEnter }: ActReflectionProps) {
  const prose = getClosingProse();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800).delay(300)}>
        <Text style={styles.title}>{prose.title[locale]}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(1000).delay(1000)}>
        <Text style={styles.body}>{prose.body[locale]}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(2500)}>
        <TouchableOpacity style={styles.ctaBtn} onPress={onEnter} activeOpacity={0.85}>
          <Text style={styles.ctaText}>
            {locale === 'zh' ? '进入你的世界' : 'ENTER YOUR WORLD'}
          </Text>
          <Text style={styles.ctaIcon}>→</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: T.xxl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t1,
    marginBottom: S[8],
  },
  body: {
    fontSize: T.md,
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 28,
    marginBottom: S[16],
  },
  ctaBtn: {
    height: 64,
    backgroundColor: Colors.black,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S[4],
    ...Shadows.md,
  },
  ctaText: {
    color: Colors.white,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: T.base,
  },
  ctaIcon: {
    color: Colors.white,
    fontSize: 20,
  },
});
