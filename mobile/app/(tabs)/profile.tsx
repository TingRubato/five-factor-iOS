import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import { Colors, S, T, R, Shadows } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { getArchetypeByName, ARCHETYPES } from '../../lib/archetypes';
import { getUserRooms } from '../../lib/api';
import RadarChart from '../../components/RadarChart';
import ArchetypeCard from '../../components/share/ArchetypeCard';
import RoomCard from '../../components/RoomCard';
import PressableScale from '../../components/ui/PressableScale';
import { shareCard } from '../../lib/share';

const { width: W } = Dimensions.get('window');
const CHART = W - S[12] * 2 - S[8] * 2;

const DIM_FULL: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
};

interface UserRoom {
  room_id: string;
  name: string;
  name_zh: string;
  dimension: string | null;
  room_type: string;
  color: string;
  role: 'home' | 'shadow' | 'joined';
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const shareRef = useRef<View>(null);
  const [myRooms, setMyRooms] = useState<UserRoom[]>([]);

  const phase = user?.phase || 'none';
  const scores = user?.scores || { O: 50, C: 50, E: 50, A: 50, N: 50 };
  const archetypeName = user?.primaryArchetype || null;
  const archetype = archetypeName ? getArchetypeByName(archetypeName) : null;

  const isPhase1 = phase === 'phase1';
  const isComplete = phase === 'phase2';

  const fetchRooms = useCallback(async () => {
    if (!user?.id) return;
    try {
      const rooms = await getUserRooms(user.id);
      setMyRooms(rooms);
    } catch {
      // silent
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }).toUpperCase()
    : 'N/A';

  if (phase === 'none') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>?</Text>
          </View>
          <Text style={styles.emptyTitle}>No identity yet</Text>
          <Text style={styles.emptyBody}>
            Take the 2-min icebreaker to discover your archetype.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/onboarding/phase1')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>START QUIZ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        entering={FadeIn.duration(500)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageLabel}>YOUR IDENTITY</Text>
            {isPhase1 && (
              <Text style={styles.phaseIndicator}>Phase 1 · Approximate</Text>
            )}
            {isComplete && (
              <Text style={[styles.phaseIndicator, { color: Colors.success }]}>
                Phase 2 · Full Precision
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={12}>
            <Text style={styles.settingsLink}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Brutalist Identity Card */}
        {archetype && (
          <>
            {/* Meta row */}
            <View style={styles.identityMeta}>
              <View style={[styles.identityMetaCell, styles.identityMetaBorder]}>
                <Text style={styles.identityMetaLabel}>ARCHETYPE</Text>
                <Text style={styles.identityMetaValue}>{archetype.shortLabel}</Text>
              </View>
              <View style={[styles.identityMetaCell, styles.identityMetaBorder]}>
                <Text style={styles.identityMetaLabel}>PHASE</Text>
                <Text style={styles.identityMetaValue}>{isComplete ? '2' : '1'}</Text>
              </View>
              <View style={styles.identityMetaCell}>
                <Text style={styles.identityMetaLabel}>SINCE</Text>
                <Text style={styles.identityMetaValue}>{joinDate}</Text>
              </View>
            </View>

            {/* Name card */}
            <View style={styles.archetypeCard}>
              <Text style={[styles.archetypeZh, { color: archetype.color }]}>
                {archetype.nameZh}
              </Text>
              <Text style={styles.archetypeName}>{archetype.nameEn}</Text>
              <Text style={styles.archetypeDesc}>{archetype.description}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <PressableScale
                style={[styles.actionBtn, styles.actionBtnBorder]}
                onPress={() => router.push('/onboarding/result')}
                scale={0.98}
              >
                <Text style={styles.actionBtnText}>VIEW REPORT</Text>
              </PressableScale>
              <PressableScale
                style={styles.actionBtn}
                onPress={() => shareCard(shareRef)}
                scale={0.98}
              >
                <Text style={styles.actionBtnText}>SHARE</Text>
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
          </>
        )}

        {/* Your Rooms */}
        {myRooms.length > 0 && (
          <View style={styles.roomsSection}>
            <Text style={styles.sectionLabel}>YOUR ROOMS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomsScroll}
            >
              {myRooms.map((room) => (
                <RoomCard
                  key={room.room_id}
                  name={room.name}
                  nameZh={room.name_zh}
                  color={room.color}
                  roomType={room.room_type as 'dimension' | 'commons' | 'shadow'}
                  memberCount={0}
                  role={room.role}
                  onPress={() => router.push(`/room/${room.room_id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCell, styles.statCellBorder]}>
            <Text style={styles.statNumber}>{myRooms.length}</Text>
            <Text style={styles.statLabel}>ROOMS</Text>
          </View>
          <View style={[styles.statCell, styles.statCellBorder]}>
            <Text style={styles.statNumber}>{isComplete ? '50' : '15'}</Text>
            <Text style={styles.statLabel}>ANSWERS</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNumber}>{isComplete ? 'FULL' : 'PARTIAL'}</Text>
            <Text style={styles.statLabel}>PRECISION</Text>
          </View>
        </View>

        {/* Radar */}
        <View style={styles.radarCard}>
          <Text style={styles.cardLabel}>PERSONALITY MAP</Text>
          <RadarChart
            scores={scores}
            size={CHART}
            color={Colors.accent}
            blurred={isPhase1}
            showDataPoints={isComplete}
            showLabels={true}
            radiusRatio={0.68}
            labelOffset={22}
            dashedRings={isPhase1 ? (pct) => pct > 50 : false}
          />

          {isPhase1 && (
            <View style={styles.blurNotice}>
              <Text style={styles.blurNoticeText}>
                Complete Phase 2 for full-precision radar
              </Text>
            </View>
          )}
        </View>

        {/* Dimension bars (Phase 2 only) */}
        {isComplete && (
          <View style={styles.dimsCard}>
            <Text style={styles.cardLabel}>FIVE DIMENSIONS</Text>
            {(['O', 'C', 'E', 'A', 'N'] as const).map((d) => {
              const val = scores[d] ?? 50;
              return (
                <View key={d} style={styles.dimRow}>
                  <Text style={styles.dimKey}>{d}</Text>
                  <Text style={styles.dimName}>{DIM_FULL[d]}</Text>
                  <View style={styles.dimTrack}>
                    <View style={[styles.dimFill, { width: `${val}%` }]} />
                  </View>
                  <Text style={styles.dimVal}>{val}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Phase 2 CTA */}
        {isPhase1 && (
          <View style={styles.phase2Card}>
            <View style={styles.phase2Header}>
              <Text style={styles.phase2Label}>PHASE 2 LOCKED</Text>
              <Text style={styles.phase2Count}>35 questions</Text>
            </View>
            <Text style={styles.phase2Title}>Unlock full precision</Text>
            <Text style={styles.phase2Desc}>
              High-resolution radar · Deep trait analysis ·{' '}
              Precise peer matching
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.push('/onboarding/phase2')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>BEGIN PHASE 2</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Privacy */}
        <TouchableOpacity style={styles.privacyRow} onPress={() => router.push('/settings')}>
          <Text style={styles.privacyLabel}>Profile visibility</Text>
          <Text style={styles.privacyValue}>
            {user?.isPublic !== false ? 'Public ›' : 'Hidden ›'}
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: S[8], gap: S[6], paddingBottom: 100 },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: S[16],
    gap: S[6],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S[4],
  },
  emptyIconText: {
    fontSize: T.xxl,
    fontWeight: T.thin,
    color: Colors.t3,
  },
  emptyTitle: {
    fontSize: T.xl,
    fontWeight: T.light,
    color: Colors.black,
    letterSpacing: 1,
  },
  emptyBody: {
    fontSize: T.base,
    color: Colors.t2,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Page header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: S[4],
  },
  pageLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 3,
    marginBottom: 2,
  },
  phaseIndicator: {
    fontSize: T.xs,
    color: Colors.accent,
    fontWeight: T.semibold,
    letterSpacing: 0.5,
  },
  settingsLink: {
    fontSize: T.sm,
    color: Colors.t2,
    fontWeight: T.medium,
  },

  // Identity meta row
  identityMeta: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.black,
  },
  identityMetaCell: {
    flex: 1,
    padding: S[4],
    alignItems: 'center',
  },
  identityMetaBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.black,
  },
  identityMetaLabel: {
    fontSize: 8,
    fontWeight: T.bold,
    letterSpacing: 1.5,
    color: Colors.t3,
  },
  identityMetaValue: {
    fontSize: T.sm,
    fontWeight: T.bold,
    color: Colors.black,
    marginTop: 2,
  },

  // Archetype card
  archetypeCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.black,
    padding: S[8],
    alignItems: 'center',
    gap: S[4],
  },
  archetypeName: {
    fontSize: T.xl,
    fontWeight: T.thin,
    color: Colors.black,
    letterSpacing: 1,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  archetypeZh: {
    fontSize: T.xxl,
    fontWeight: T.bold,
    letterSpacing: 3,
  },
  archetypeDesc: {
    fontSize: T.sm,
    color: Colors.t2,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: S[4],
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.black,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: S[6],
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  actionBtnBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.black,
  },
  actionBtnText: {
    fontSize: 9,
    fontWeight: T.bold,
    letterSpacing: 2,
    color: Colors.black,
  },
  offScreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },

  // Rooms section
  roomsSection: {
    gap: S[4],
  },
  sectionLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 2.5,
    color: Colors.t3,
  },
  roomsScroll: {
    gap: S[4],
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.black,
  },
  statCell: {
    flex: 1,
    padding: S[6],
    alignItems: 'center',
    gap: 2,
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.black,
  },
  statNumber: {
    fontSize: T.lg,
    fontWeight: T.bold,
    color: Colors.black,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: T.bold,
    letterSpacing: 1,
    color: Colors.t3,
  },

  // Radar card
  radarCard: {
    backgroundColor: Colors.card,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: S[8],
    alignItems: 'center',
    ...Shadows.sm,
  },
  cardLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2.5,
    alignSelf: 'flex-start',
    marginBottom: S[4],
  },
  blurNotice: {
    marginTop: S[4],
    paddingVertical: S[4],
    paddingHorizontal: S[8],
    backgroundColor: Colors.accentDim,
    borderRadius: R.full,
  },
  blurNoticeText: {
    fontSize: T.xs,
    color: Colors.accent,
    fontWeight: T.semibold,
    letterSpacing: 0.5,
  },

  // Dims card
  dimsCard: {
    backgroundColor: Colors.card,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: S[8],
    gap: S[6],
    ...Shadows.sm,
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  dimKey: {
    width: 16,
    fontSize: T.sm,
    fontWeight: T.bold,
    color: Colors.accent,
  },
  dimName: {
    width: 110,
    fontSize: T.xs,
    color: Colors.t2,
    fontWeight: T.medium,
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
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  dimVal: {
    width: 28,
    fontSize: T.sm,
    fontWeight: T.bold,
    color: Colors.black,
    textAlign: 'right',
  },

  // Phase 2 card
  phase2Card: {
    backgroundColor: Colors.card,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    padding: S[8],
    gap: S[4],
    ...Shadows.sm,
  },
  phase2Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phase2Label: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2,
  },
  phase2Count: {
    fontSize: T.xs,
    color: Colors.accent,
    fontWeight: T.semibold,
  },
  phase2Title: {
    fontSize: T.lg,
    fontWeight: T.semibold,
    color: Colors.black,
    letterSpacing: 0.3,
  },
  phase2Desc: {
    fontSize: T.sm,
    color: Colors.t2,
    lineHeight: 18,
  },

  // Privacy
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: S[6],
    borderTopWidth: 1,
    borderColor: Colors.line,
  },
  privacyLabel: { fontSize: T.base, color: Colors.black },
  privacyValue: { fontSize: T.base, color: Colors.t2 },

  // Shared button
  btn: {
    height: 52,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.sm,
    marginTop: S[2],
  },
  btnText: {
    color: Colors.white,
    fontWeight: T.bold,
    fontSize: T.base,
    letterSpacing: 3,
  },
});
