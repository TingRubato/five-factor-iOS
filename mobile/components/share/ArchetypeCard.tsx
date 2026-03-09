/**
 * ArchetypeCard — Shareable card rendered off-screen for Stories export.
 * 1080x1920 logical (rendered at 360x640 scale).
 */
import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RadarChart from '../RadarChart';
import { Colors, T, S } from '../../constants/theme';
import { getArchetypeByName } from '../../lib/archetypes';
const DIM_FULL: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
};

interface Props {
  archetypeName: string;
  scores: Record<string, number>;
}

const ArchetypeCard = forwardRef<View, Props>(({ archetypeName, scores }, ref) => {
  const archetype = getArchetypeByName(archetypeName);
  if (!archetype) return null;

  // Top 3 dimensions sorted by score
  const sorted = (['O', 'C', 'E', 'A', 'N'] as const)
    .map((d) => ({ dim: d, val: scores[d] ?? 50 }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  return (
    <View
      ref={ref}
      style={styles.card}
      collapsable={false}
    >
      {/* Header */}
      <Text style={styles.brandLabel}>ARCHETYPE</Text>

      {/* Archetype name */}
      <Text style={[styles.nameZh, { color: archetype.color }]}>
        {archetype.nameZh}
      </Text>
      <Text style={styles.nameEn}>{archetype.nameEn}</Text>

      {/* Mini radar */}
      <View style={styles.radarWrap}>
        <RadarChart
          scores={scores}
          size={150}
          color={archetype.color}
          showDataPoints={false}
          showLabels={true}
          radiusRatio={0.65}
          labelOffset={18}
        />
      </View>

      {/* Top 3 dimensions */}
      <View style={styles.dimsSection}>
        {sorted.map(({ dim, val }) => (
          <View key={dim} style={styles.dimRow}>
            <Text style={styles.dimLabel}>{DIM_FULL[dim]}</Text>
            <View style={styles.dimTrack}>
              <View
                style={[
                  styles.dimFill,
                  { width: `${val}%`, backgroundColor: archetype.color },
                ]}
              />
            </View>
            <Text style={styles.dimVal}>{val}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>archetype.app</Text>
      </View>
    </View>
  );
});

ArchetypeCard.displayName = 'ArchetypeCard';
export default ArchetypeCard;

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 640,
    backgroundColor: Colors.white,
    padding: S[12],
    justifyContent: 'center',
    alignItems: 'center',
    gap: S[6],
  },
  brandLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 4,
    color: Colors.t3,
  },
  nameZh: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
  },
  nameEn: {
    fontSize: 20,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t2,
    textAlign: 'center',
    letterSpacing: 1,
  },
  radarWrap: {
    marginVertical: S[6],
  },
  dimsSection: {
    width: '100%',
    gap: S[4],
    paddingHorizontal: S[6],
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  dimLabel: {
    width: 110,
    fontSize: T.xs,
    fontWeight: '500',
    color: Colors.t2,
    letterSpacing: 0.5,
  },
  dimTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.line,
    borderRadius: 2,
    overflow: 'hidden',
  },
  dimFill: {
    height: 4,
    borderRadius: 2,
  },
  dimVal: {
    width: 28,
    fontSize: T.sm,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'right',
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
    letterSpacing: 2,
  },
});
