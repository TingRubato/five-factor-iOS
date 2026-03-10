/**
 * ActDimension — Big Five dimension reveal with 3 distinct visual variants.
 *
 * variant='hero'   (Act 1) — Giant score watermark, bold name, accent bar
 * variant='card'   (Act 2) — Left colored border, indented compact layout
 * variant='shadow' (Act 3) — Center-aligned, intimate, moody
 */
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Colors, S, T } from '../../constants/theme';
import { DimInfo, DIM_NAMES, DIM_COLORS, Locale } from '../../lib/cinematic-utils';
import { getDimProse } from '../../lib/interpretations';
import TypewriterText from './TypewriterText';
import CountUpScore from './CountUpScore';
import DimensionBar from './DimensionBar';

const { width: W } = Dimensions.get('window');
const PAD = S[10]; // 20px

export type DimVariant = 'hero' | 'card' | 'shadow';

interface ActDimensionProps {
  dimInfo: DimInfo;
  locale: Locale;
  actLabel: string;
  variant?: DimVariant;
}

export default function ActDimension({
  dimInfo,
  locale,
  actLabel,
  variant = 'hero',
}: ActDimensionProps) {
  const { dim, score, tier } = dimInfo;
  const prose = getDimProse(dim, tier);
  const colors = DIM_COLORS[dim];
  const dimName = DIM_NAMES[dim][locale];

  // ── SHADOW variant (Act 3) ──────────────────────────────────
  if (variant === 'shadow') {
    const barW = W - PAD * 4;
    return (
      <View style={styles.containerCenter}>
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <Text style={styles.actLabelCenter}>{actLabel}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(400)}>
          <Text style={[styles.shadowDimName, { color: colors.deep }]}>
            {dimName}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(1000).delay(500)} style={styles.shadowScoreWrap}>
          <CountUpScore
            target={score}
            delay={600}
            duration={1500}
            style={[styles.shadowScore, { color: colors.deep + '25' }]}
          />
        </Animated.View>

        <DimensionBar score={score} color={colors.deep} width={barW} delay={900} />

        <Animated.View entering={FadeInDown.duration(800).delay(1500)}>
          <Text style={styles.proseTitleCenter}>{prose.title[locale]}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(2100)}>
          <Text style={styles.proseBodyCenter}>{prose.body[locale]}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(3400)} style={styles.hint}>
          <Text style={styles.hintText}>
            {locale === 'zh' ? '轻触继续' : 'Tap to continue'}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── CARD variant (Act 2) ────────────────────────────────────
  if (variant === 'card') {
    const barW = W - PAD * 2 - 16;
    return (
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <Text style={styles.actLabel}>{actLabel}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.cardWrap}
        >
          <View style={[styles.cardBorder, { backgroundColor: colors.deep }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <TypewriterText
                text={dimName}
                speed={50}
                delay={500}
                style={[styles.cardDimName, { color: colors.deep }]}
              />
              <CountUpScore
                target={score}
                delay={700}
                duration={1200}
                style={styles.cardScore}
              />
            </View>

            <DimensionBar score={score} color={colors.deep} width={barW} delay={900} />

            <Animated.View entering={FadeInDown.duration(800).delay(1500)}>
              <Text style={styles.proseTitle}>{prose.title[locale]}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(800).delay(2100)}>
              <Text style={styles.proseBody}>{prose.body[locale]}</Text>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(3400)} style={styles.hint}>
          <Text style={styles.hintText}>
            {locale === 'zh' ? '轻触继续' : 'Tap to continue'}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── HERO variant (Act 1, default) ──────────────────────────
  const barW = W - PAD * 2;
  return (
    <View style={styles.container}>
      {/* Giant score watermark */}
      <Animated.View
        entering={FadeIn.duration(1200).delay(300)}
        style={styles.heroScoreWrap}
      >
        <CountUpScore
          target={score}
          delay={400}
          duration={2000}
          style={[styles.heroScore, { color: colors.deep + '0C' }]}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(600).delay(200)}>
        <Text style={styles.actLabel}>{actLabel}</Text>
      </Animated.View>

      <TypewriterText
        text={dimName}
        speed={60}
        delay={400}
        style={[styles.heroDimName, { color: colors.deep }]}
      />

      <View style={[styles.heroAccent, { backgroundColor: colors.deep }]} />

      <DimensionBar score={score} color={colors.deep} width={barW} delay={900} />

      <Animated.View entering={FadeInDown.duration(800).delay(1500)}>
        <Text style={styles.proseTitle}>{prose.title[locale]}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(800).delay(2100)}>
        <Text style={styles.proseBody}>{prose.body[locale]}</Text>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(3400)} style={styles.hint}>
        <Text style={styles.hintText}>
          {locale === 'zh' ? '轻触继续' : 'Tap to continue'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Shared ──────────────────────────────────────────────────
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: PAD,
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: PAD * 2,
  },
  actLabel: {
    fontSize: T.xs,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: S[6],
  },
  actLabelCenter: {
    fontSize: T.xs,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: S[6],
    textAlign: 'center',
  },
  proseTitle: {
    fontSize: T.xl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t1,
    marginBottom: S[6],
  },
  proseTitleCenter: {
    fontSize: T.xl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t1,
    marginBottom: S[6],
    textAlign: 'center',
  },
  proseBody: {
    fontSize: T.md,
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 26,
  },
  proseBodyCenter: {
    fontSize: T.md,
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 26,
    textAlign: 'center',
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

  // ── Hero (Act 1) ───────────────────────────────────────────
  heroScoreWrap: {
    position: 'absolute',
    top: 80,
    right: PAD,
  },
  heroScore: {
    fontSize: 140,
    fontWeight: '100',
    lineHeight: 140,
  },
  heroDimName: {
    fontSize: T.xxl,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: S[4],
  },
  heroAccent: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    marginBottom: S[2],
  },

  // ── Card (Act 2) ───────────────────────────────────────────
  cardWrap: {
    flexDirection: 'row',
    marginBottom: S[4],
  },
  cardBorder: {
    width: 3,
    borderRadius: 1.5,
    marginRight: S[6],
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: S[4],
    marginBottom: S[4],
  },
  cardDimName: {
    fontSize: T.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  cardScore: {
    fontSize: T.hero,
    fontWeight: '200',
    color: Colors.t3,
  },

  // ── Shadow (Act 3) ─────────────────────────────────────────
  shadowDimName: {
    fontSize: T.xl,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: S[2],
    textAlign: 'center',
  },
  shadowScoreWrap: {
    marginBottom: S[2],
  },
  shadowScore: {
    fontSize: 80,
    fontWeight: '100',
    lineHeight: 80,
    textAlign: 'center',
  },
});
