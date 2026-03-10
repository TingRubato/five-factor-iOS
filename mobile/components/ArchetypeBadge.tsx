import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ARCHETYPES, Archetype } from '../lib/archetypes';
import { Colors, T, S, R } from '../constants/theme';

interface ArchetypeBadgeProps {
  archetypeId?: string;
  archetypeName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ArchetypeBadge({
  archetypeId,
  archetypeName,
  size = 'sm',
}: ArchetypeBadgeProps) {
  let archetype: Archetype | undefined;

  if (archetypeId) {
    archetype = ARCHETYPES[archetypeId];
  } else if (archetypeName) {
    archetype = Object.values(ARCHETYPES).find(
      (a) => a.nameEn === archetypeName || a.nameZh === archetypeName
    );
  }

  const label = archetype?.shortLabel || '?';
  const color = archetype?.color || Colors.t3;

  if (size === 'lg') {
    return (
      <View style={styles.lgContainer}>
        <Text style={[styles.lgLabel, { color }]}>{label}</Text>
        <Text style={styles.lgName}>
          {archetype?.nameEn || 'Unknown'}
        </Text>
        <Text style={styles.lgNameZh}>
          {archetype?.nameZh || ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: S[4],
    paddingVertical: S[1],
    borderRadius: R.sm,
  },
  badgeText: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 1,
  },
  lgContainer: {
    alignItems: 'center',
    gap: S[4],
  },
  lgLabel: {
    fontSize: T.hero,
    fontWeight: T.light,
    letterSpacing: 4,
  },
  lgName: {
    fontSize: T.xl,
    fontWeight: T.light,
    color: Colors.black,
    letterSpacing: 2,
  },
  lgNameZh: {
    fontSize: T.md,
    color: Colors.t2,
    fontWeight: T.light,
  },
});
