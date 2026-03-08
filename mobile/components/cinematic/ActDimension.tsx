import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, S, T } from '../../constants/theme';
import { DimInfo, DIM_NAMES, DIM_COLORS, Locale } from '../../lib/cinematic-utils';
import { getDimProse } from '../../lib/interpretations';
import TypewriterText from './TypewriterText';
import CountUpScore from './CountUpScore';

interface ActDimensionProps {
  dimInfo: DimInfo;
  locale: Locale;
  actLabel: string;
}

export default function ActDimension({ dimInfo, locale, actLabel }: ActDimensionProps) {
  const { dim, score, tier } = dimInfo;
  const prose = getDimProse(dim, tier);
  const colors = DIM_COLORS[dim];
  const dimName = DIM_NAMES[dim][locale];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.labelRow}>
        <Text style={styles.actLabel}>{actLabel}</Text>
      </Animated.View>

      <View style={styles.dimHeader}>
        <TypewriterText
          text={dimName}
          speed={60}
          delay={400}
          style={[styles.dimName, { color: colors.deep }]}
        />
        <CountUpScore
          target={score}
          delay={600}
          duration={1500}
          style={styles.score}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(800).delay(1200)}>
        <Text style={styles.proseTitle}>{prose.title[locale]}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(800).delay(1800)}>
        <Text style={styles.proseBody}>{prose.body[locale]}</Text>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(3000)} style={styles.hint}>
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
  labelRow: { marginBottom: S[6] },
  actLabel: {
    fontSize: T.xs,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dimHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: S[4],
    marginBottom: S[8],
  },
  dimName: {
    fontSize: T.xxl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  score: {
    fontSize: T.hero,
    fontWeight: '200',
    color: Colors.t3,
  },
  proseTitle: {
    fontSize: T.xl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t1,
    marginBottom: S[6],
  },
  proseBody: {
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
