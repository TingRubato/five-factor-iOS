/**
 * ActReport — Brutalist personality data report.
 *
 * Scrollable grid layout: meta header, big archetype name with mini radar,
 * 5 dimension rows (colored), analysis blocks, pair tension, archetype profile,
 * closing affirmation with CTA.
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Colors, S, T, Fonts } from '../../constants/theme';
import {
  sortDimensions,
  DIM_NAMES,
  DIM_COLORS,
  Locale,
} from '../../lib/cinematic-utils';
import {
  getDimProse,
  getPairProse,
  getClosingProse,
} from '../../lib/interpretations';
import { Archetype } from '../../lib/archetypes';
import RadarChart from '../RadarChart';
import ArchetypeCard from '../share/ArchetypeCard';
import PressableScale from '../ui/PressableScale';
import { shareCard } from '../../lib/share';

const { width: W } = Dimensions.get('window');

interface ActReportProps {
  scores: Record<string, number>;
  archetype: Archetype;
  locale: Locale;
  onEnter: () => void;
}

export default function ActReport({
  scores,
  archetype,
  locale,
  onEnter,
}: ActReportProps) {
  const shareRef = useRef<View>(null);
  const sorted = sortDimensions(scores);
  const topDim = sorted[0];
  const secondDim = sorted[1];
  const closing = getClosingProse();
  const pairProse = getPairProse(topDim.dim, secondDim.dim);

  const now = new Date();
  const dateStr = `${now
    .toLocaleString('en', { month: 'short' })
    .toUpperCase()} ${now.getFullYear()}`;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ═══ META HEADER ═══ */}
      <View style={styles.metaRow}>
        <View style={[styles.metaCell, styles.metaCellBorder]}>
          <Text style={styles.micro}>ARCHETYPE</Text>
          <Text style={styles.micro}>REPORT</Text>
        </View>
        <View style={[styles.metaCell, styles.metaCellBorder]}>
          <Text style={styles.micro}>STATUS</Text>
          <Text style={styles.micro}>PERSONAL</Text>
        </View>
        <View style={[styles.metaCell, styles.metaCellBorder]}>
          <Text style={styles.micro}>GENERATED</Text>
          <Text style={styles.micro}>{dateStr}</Text>
        </View>
        <PressableScale
          style={styles.metaCell}
          onPress={() => shareCard(shareRef)}
          scale={0.95}
        >
          <Text style={styles.micro}>SHARE</Text>
          <Text style={[styles.micro, styles.microBold]}>→</Text>
        </PressableScale>
      </View>

      {/* Off-screen share card */}
      <View style={styles.offScreen}>
        <ArchetypeCard
          ref={shareRef}
          archetypeName={archetype.nameEn}
          scores={scores}
        />
      </View>

      {/* ═══ GRAPHIC HEADER ═══ */}
      <View style={styles.graphicHeader}>
        <Text style={[styles.bigName, { color: archetype.color + '15' }]}>
          {archetype.nameEn.toUpperCase()}
        </Text>
        <View style={styles.miniRadar}>
          <RadarChart
            scores={scores}
            size={120}
            color={archetype.color}
            radiusRatio={0.6}
            showLabels={false}
            showDataPoints={false}
          />
        </View>
        <Text style={[styles.bigNameZh, { color: archetype.color }]}>
          {archetype.nameZh}
        </Text>
      </View>

      {/* ═══ DIMENSION ROWS ═══ */}
      {sorted.map((dimInfo, i) => {
        const { dim, score, tier } = dimInfo;
        const colors = DIM_COLORS[dim];
        const name =
          locale === 'zh' ? DIM_NAMES[dim].zh : DIM_NAMES[dim].en;
        // Expand analysis for top, second, and lowest
        const isExpanded =
          i === 0 || i === 1 || i === sorted.length - 1;
        const prose = isExpanded ? getDimProse(dim, tier) : null;

        return (
          <React.Fragment key={dim}>
            {/* Score row */}
            <View
              style={[styles.dataRow, { backgroundColor: colors.light }]}
            >
              <View style={styles.labelCol}>
                <Text style={styles.micro}>#</Text>
                <Text style={[styles.micro, styles.microBold]}>{dim}</Text>
              </View>
              <View style={styles.contentCol}>
                <Text style={styles.heading}>{name}</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.valueLarge}>{score}</Text>
                  <View
                    style={[
                      styles.tierBadge,
                      { borderColor: colors.deep },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierBadgeText,
                        { color: colors.deep },
                      ]}
                    >
                      {tier.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {/* Score bar */}
                <View style={styles.scoreTrack}>
                  <View
                    style={[
                      styles.scoreFill,
                      {
                        width: `${score}%`,
                        backgroundColor: colors.deep,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Analysis block */}
            {isExpanded && prose && (
              <View style={styles.analysisBlock}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.micro}>
                    ANALYSIS: {DIM_NAMES[dim].en}
                  </Text>
                  <Text style={styles.micro}>
                    {tier.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.analysisContent}>
                  <Text style={styles.proseTitle}>
                    {prose.title[locale]}
                  </Text>
                  <Text style={styles.proseBody}>
                    {prose.body[locale]}
                  </Text>
                </View>
              </View>
            )}
          </React.Fragment>
        );
      })}

      {/* ═══ PAIR TENSION ═══ */}
      <View style={[styles.dataRow, { backgroundColor: Colors.bg }]}>
        <View style={styles.labelCol}>
          <Text style={styles.micro}>#</Text>
          <Text style={[styles.micro, styles.microBold]}>T</Text>
        </View>
        <View style={styles.contentCol}>
          <Text style={styles.heading}>
            {DIM_NAMES[topDim.dim][locale]}
            {'\n'}& {DIM_NAMES[secondDim.dim][locale]}
          </Text>
          <Text style={styles.subText}>
            {pairProse.title[locale]}
          </Text>
        </View>
      </View>

      <View style={styles.analysisBlock}>
        <View style={styles.analysisHeader}>
          <Text style={styles.micro}>ANALYSIS: PAIR TENSION</Text>
          <Text style={styles.micro}>
            {topDim.dim}+{secondDim.dim}
          </Text>
        </View>
        <View style={styles.analysisContent}>
          <Text style={styles.proseBody}>
            {pairProse.body[locale]}
          </Text>
        </View>
      </View>

      {/* ═══ ARCHETYPE BLOCK ═══ */}
      <View
        style={[
          styles.dataRow,
          { backgroundColor: archetype.color + '12' },
        ]}
      >
        <View style={styles.labelCol}>
          <Text style={styles.micro}>#</Text>
          <Text style={[styles.micro, styles.microBold]}>A</Text>
        </View>
        <View style={styles.contentCol}>
          <Text style={styles.heading}>{archetype.nameZh}</Text>
          <Text style={styles.subText}>
            The {archetype.nameEn}
          </Text>
        </View>
      </View>

      <View style={styles.analysisBlock}>
        <View style={styles.analysisHeader}>
          <Text style={styles.micro}>ARCHETYPE PROFILE</Text>
        </View>
        <View style={styles.analysisContent}>
          <Text style={styles.proseBody}>
            {archetype.description}
          </Text>
        </View>
      </View>

      {/* ═══ CLOSING + CTA ═══ */}
      <View style={styles.closingBlock}>
        <Text style={styles.closingTitle}>
          {closing.title[locale]}
        </Text>
        <Text style={styles.closingBody}>
          {closing.body[locale]}
        </Text>
        <PressableScale style={styles.ctaBtn} onPress={onEnter}>
          <Text style={styles.ctaText}>
            {locale === 'zh' ? '进入你的世界' : 'ENTER YOUR WORLD'}
          </Text>
          <Text style={styles.ctaArrow}>→</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },

  // ── Meta header ─────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    backgroundColor: Colors.white,
  },
  metaCell: {
    flex: 1,
    padding: 8,
    paddingHorizontal: 12,
  },
  metaCellBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.black,
  },

  // ── Graphic header ──────────────────────────────────────────
  graphicHeader: {
    paddingVertical: S[12],
    paddingHorizontal: S[6],
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    backgroundColor: Colors.white,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bigName: {
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 50,
    letterSpacing: -2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  miniRadar: {
    marginVertical: S[6],
  },
  bigNameZh: {
    fontSize: T.xxl,
    fontWeight: '300',
    letterSpacing: 4,
  },

  // ── Data rows ───────────────────────────────────────────────
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    minHeight: 80,
  },
  labelCol: {
    width: 48,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: Colors.black,
    gap: 4,
  },
  contentCol: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 4,
  },

  // ── Typography ──────────────────────────────────────────────
  micro: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '500',
    lineHeight: 12,
    color: Colors.black,
  },
  microBold: {
    fontWeight: '700',
  },
  heading: {
    fontSize: 20,
    textTransform: 'uppercase',
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.5,
    color: Colors.black,
  },
  subText: {
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '400',
    color: Colors.t2,
    lineHeight: 16,
  },
  valueLarge: {
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
    letterSpacing: -1,
    color: Colors.black,
    fontFamily: Fonts?.mono,
  },

  // ── Score row + bar ─────────────────────────────────────────
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: S[4],
  },
  tierBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  tierBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scoreTrack: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 1.5,
    marginTop: 4,
  },
  scoreFill: {
    height: 3,
    borderRadius: 1.5,
  },

  // ── Analysis blocks ─────────────────────────────────────────
  analysisBlock: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
    backgroundColor: Colors.white,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.bg,
  },
  analysisContent: {
    padding: 12,
  },
  proseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: S[2],
    fontStyle: 'italic',
  },
  proseBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    color: Colors.t1,
  },

  // ── Closing ─────────────────────────────────────────────────
  closingBlock: {
    padding: S[10],
    paddingTop: S[12],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.black,
  },
  closingTitle: {
    fontSize: T.xl,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.t1,
    marginBottom: S[6],
  },
  closingBody: {
    fontSize: T.md,
    fontWeight: '300',
    color: Colors.t2,
    lineHeight: 24,
    marginBottom: S[10],
  },
  ctaBtn: {
    height: 56,
    backgroundColor: Colors.black,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S[4],
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 2,
    fontSize: T.sm,
  },
  ctaArrow: {
    color: Colors.white,
    fontSize: 18,
  },
});
