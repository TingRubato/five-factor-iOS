import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, S, T } from '../../constants/theme';
import { Dim, DIM_NAMES, DIM_COLORS, Locale } from '../../lib/cinematic-utils';
import { getPairProse } from '../../lib/interpretations';

interface ActTensionProps {
  dim1: Dim;
  dim2: Dim;
  locale: Locale;
}

export default function ActTension({ dim1, dim2, locale }: ActTensionProps) {
  const prose = getPairProse(dim1, dim2);
  const c1 = DIM_COLORS[dim1];
  const c2 = DIM_COLORS[dim2];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600).delay(200)}>
        <Text style={styles.actLabel}>
          {locale === 'zh' ? '张力' : 'THE TENSION'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.pairRow}>
        <Text style={[styles.dimLabel, { color: c1.deep }]}>{DIM_NAMES[dim1][locale]}</Text>
        <Text style={styles.ampersand}>&</Text>
        <Text style={[styles.dimLabel, { color: c2.deep }]}>{DIM_NAMES[dim2][locale]}</Text>
      </Animated.View>

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
  actLabel: {
    fontSize: T.xs,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    marginBottom: S[8],
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: S[4],
    marginBottom: S[8],
    flexWrap: 'wrap',
  },
  dimLabel: {
    fontSize: T.xl,
    fontWeight: '600',
  },
  ampersand: {
    fontSize: T.lg,
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
