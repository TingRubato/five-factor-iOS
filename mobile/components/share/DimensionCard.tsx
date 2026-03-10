/**
 * DimensionCard — Single-dimension shareable card.
 */
import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, T, S, DIM_COLORS } from '../../constants/theme';

const DIM_NAMES: Record<string, { en: string; zh: string }> = {
  O: { en: 'Openness', zh: '开放性' },
  C: { en: 'Conscientiousness', zh: '尽责性' },
  E: { en: 'Extraversion', zh: '外向性' },
  A: { en: 'Agreeableness', zh: '宜人性' },
  N: { en: 'Neuroticism', zh: '神经质' },
};

const DIM_PROSE: Record<string, { high: string; low: string }> = {
  O: {
    high: 'Your mind wanders through unexplored territories, always seeking the novel and unconventional.',
    low: 'You value the tried and true, finding comfort in practical, concrete approaches.',
  },
  C: {
    high: 'Discipline is your superpower. You turn chaos into structured systems that deliver results.',
    low: 'You prefer flexibility over rigid plans, thriving in spontaneous, adaptive environments.',
  },
  E: {
    high: 'You draw energy from connection, lighting up rooms and sparking conversations effortlessly.',
    low: 'Your inner world is rich and deep. Solitude is where your best thinking happens.',
  },
  A: {
    high: 'Harmony is your natural state. You build bridges where others see walls.',
    low: 'You value truth over comfort, willing to challenge consensus for what you believe.',
  },
  N: {
    high: 'You feel deeply — a sensitivity that fuels both your creativity and your empathy.',
    low: 'Steady under pressure. Your emotional resilience is a quiet, powerful strength.',
  },
};

interface Props {
  dimension: 'O' | 'C' | 'E' | 'A' | 'N';
  score: number;
}

const DimensionCard = forwardRef<View, Props>(({ dimension, score }, ref) => {
  const color = DIM_COLORS[dimension] ?? Colors.t2;
  const names = DIM_NAMES[dimension];
  const prose = DIM_PROSE[dimension];
  const isHigh = score >= 50;

  return (
    <View ref={ref} style={styles.card} collapsable={false}>
      {/* Color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: color }]} />

      {/* Dimension name */}
      <Text style={styles.brandLabel}>ARCHETYPE · DIMENSION</Text>
      <Text style={[styles.dimName, { color }]}>{names.en}</Text>
      <Text style={styles.dimNameZh}>{names.zh}</Text>

      {/* Giant score */}
      <Text style={[styles.scoreNum, { color }]}>{score}</Text>

      {/* Score bar */}
      <View style={styles.barWrap}>
        <View style={styles.barTrack}>
          <View
            style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]}
          />
        </View>
        <View style={styles.barLabels}>
          <Text style={styles.barLabel}>0</Text>
          <Text style={styles.barLabel}>100</Text>
        </View>
      </View>

      {/* Prose */}
      <Text style={styles.proseTitle}>
        {isHigh ? 'High' : 'Low'} {names.en}
      </Text>
      <Text style={styles.proseBody}>
        {isHigh ? prose.high : prose.low}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>Discover yours at archetype.app</Text>
      </View>
    </View>
  );
});

DimensionCard.displayName = 'DimensionCard';
export default DimensionCard;

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 640,
    backgroundColor: Colors.white,
    padding: S[12],
    justifyContent: 'center',
    alignItems: 'center',
    gap: S[4],
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  brandLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 3,
    color: Colors.t3,
  },
  dimName: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dimNameZh: {
    fontSize: T.base,
    fontWeight: '300',
    color: Colors.t2,
    letterSpacing: 3,
  },
  scoreNum: {
    fontSize: 80,
    fontWeight: '200',
    marginVertical: S[4],
  },
  barWrap: {
    width: '100%',
    paddingHorizontal: S[6],
    gap: S[2],
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.t3,
  },
  proseTitle: {
    fontSize: T.base,
    fontWeight: '600',
    color: Colors.black,
    fontStyle: 'italic',
    marginTop: S[6],
  },
  proseBody: {
    fontSize: T.sm,
    fontWeight: '300',
    color: Colors.t2,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: S[4],
  },
  footer: {
    marginTop: S[8],
    alignItems: 'center',
    gap: S[4],
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.line,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.t3,
    letterSpacing: 1,
  },
});
