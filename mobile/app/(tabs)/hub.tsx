/**
 * Hub — Community center with room browser and arena section.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, S, T, R, Fonts, DIM_COLORS } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { getArchetypeByName } from '../../lib/archetypes';
import { getRooms, getUserRooms, getArenas } from '../../lib/api';
import type { Arena } from '../../lib/arenas';
import RoomCard from '../../components/RoomCard';
import PressableScale from '../../components/ui/PressableScale';

interface RoomData {
  id: string;
  dimension: string | null;
  name: string;
  name_zh: string;
  description: string | null;
  room_type: 'dimension' | 'commons' | 'shadow';
  color: string;
  member_count: number;
}

interface UserRoom {
  room_id: string;
  name: string;
  name_zh: string;
  dimension: string | null;
  room_type: string;
  color: string;
  role: 'home' | 'shadow' | 'joined';
}

export default function HubScreen() {
  const router = useRouter();
  const { user } = useUser();
  const archetype = getArchetypeByName(user?.primaryArchetype || 'Explorer Creator');

  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [myRooms, setMyRooms] = useState<UserRoom[]>([]);
  const [activeArenas, setActiveArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [allRooms, userRooms, arenas] = await Promise.all([
        getRooms().catch(() => []),
        user?.id ? getUserRooms(user.id).catch(() => []) : Promise.resolve([]),
        getArenas('active').catch(() => []),
      ]);
      setRooms(allRooms);
      setMyRooms(userRooms);
      setActiveArenas(arenas);
    } catch {
      // Silently fail — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    fetchData().then(() => {
      if (!mounted) return;
    });
    return () => { mounted = false; };
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const myRoomRoles = useMemo(() => new Map(myRooms.map((r) => [r.room_id, r.role])), [myRooms]);
  const hasProfile = user?.phase && user.phase !== 'none';

  // Empty state
  if (!hasProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>COMMUNITY</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>IDENTITY REQUIRED</Text>
          <Text style={styles.emptyBody}>
            Complete the personality assessment to unlock rooms and debates.
          </Text>
          <PressableScale
            style={styles.emptyCta}
            onPress={() => router.push('/onboarding/phase1')}
            scale={0.97}
          >
            <Text style={styles.emptyCtaText}>START QUIZ</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>COMMUNITY</Text>
          <Text style={styles.headerVersion}>
            {archetype?.shortLabel || '—'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ONLINE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.t3} />
        }
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.t3} />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : (
          <>
            {/* ── YOUR ROOMS ── */}
            {myRooms.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>YOUR ROOMS</Text>
                  <Text style={styles.sectionCount}>{myRooms.length}</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.roomScroll}
                >
                  {myRooms.map((room) => (
                    <RoomCard
                      key={room.room_id}
                      name={room.name}
                      nameZh={room.name_zh}
                      color={room.color}
                      roomType={room.room_type as 'dimension' | 'commons' | 'shadow'}
                      memberCount={
                        rooms.find((r) => r.id === room.room_id)?.member_count ?? 0
                      }
                      role={room.role}
                      onPress={() => router.push(`/room/${room.room_id}`)}
                    />
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* ── ARENA ── */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ARENA</Text>
                <Text style={styles.sectionLabel}>
                  {activeArenas.length > 0 ? 'ACTIVE' : 'COMING SOON'}
                </Text>
              </View>
              {activeArenas.map((arena) => {
                const c1 = DIM_COLORS[arena.dim1] ?? Colors.t3;
                const c2 = DIM_COLORS[arena.dim2] ?? Colors.t3;
                return (
                  <PressableScale
                    key={arena.id}
                    style={styles.arenaCard}
                    onPress={() => router.push(`/arena/${arena.id}`)}
                    scale={0.98}
                  >
                    <View style={styles.arenaColors}>
                      <View style={[styles.arenaHalf, { backgroundColor: c1 + '30' }]} />
                      <View style={[styles.arenaHalf, { backgroundColor: c2 + '30' }]} />
                    </View>
                    <View style={styles.arenaBody}>
                      <Text style={styles.arenaTopic}>"{arena.topic}"</Text>
                      <View style={styles.arenaMeta}>
                        <Text style={styles.arenaMetaText}>
                          {arena.side1_label} vs {arena.side2_label}
                        </Text>
                        <Text style={styles.arenaMetaText}>
                          {arena.side1_count + arena.side2_count} POSTS
                        </Text>
                      </View>
                    </View>
                  </PressableScale>
                );
              })}
              {activeArenas.length === 0 && (
                <View style={styles.arenaCard}>
                  <View style={styles.arenaColors}>
                    <View style={[styles.arenaHalf, { backgroundColor: '#30B0C720' }]} />
                    <View style={[styles.arenaHalf, { backgroundColor: '#AF52DE20' }]} />
                  </View>
                  <View style={styles.arenaBody}>
                    <Text style={styles.arenaTopic}>"Structure kills creativity"</Text>
                    <View style={styles.arenaMeta}>
                      <Text style={styles.arenaMetaText}>HIGH C vs HIGH O</Text>
                      <Text style={styles.arenaMetaText}>COMING SOON</Text>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* ── ALL ROOMS ── */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ALL ROOMS</Text>
                <Text style={styles.sectionCount}>{rooms.length}</Text>
              </View>
              <View style={styles.roomGrid}>
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    name={room.name}
                    nameZh={room.name_zh}
                    color={room.color}
                    roomType={room.room_type}
                    memberCount={room.member_count}
                    role={myRoomRoles.get(room.id)}
                    onPress={() => router.push(`/room/${room.id}`)}
                  />
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S[6],
    paddingVertical: S[4],
    borderBottomWidth: 1,
    borderColor: Colors.black,
  },
  headerLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 3,
    color: Colors.black,
  },
  headerVersion: {
    fontSize: T.xs,
    fontWeight: T.light,
    color: Colors.t3,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },

  main: { flex: 1 },
  content: { paddingBottom: 40 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: S[6],
    paddingVertical: S[4],
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  sectionTitle: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 2.5,
    color: Colors.black,
  },
  sectionCount: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    fontFamily: Fonts?.mono,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 1.5,
  },

  // Room scrolls
  roomScroll: {
    paddingHorizontal: S[6],
    paddingVertical: S[6],
    gap: S[4],
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: S[6],
    gap: S[4],
  },

  // Arena card
  arenaCard: {
    margin: S[6],
    borderWidth: 1,
    borderColor: Colors.black,
    overflow: 'hidden',
  },
  arenaColors: {
    flexDirection: 'row',
    height: 4,
  },
  arenaHalf: {
    flex: 1,
  },
  arenaBody: {
    padding: S[6],
    gap: S[4],
  },
  arenaTopic: {
    fontSize: T.lg,
    fontWeight: T.semibold,
    color: Colors.black,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  arenaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arenaMetaText: {
    fontSize: 9,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 1.5,
  },

  // Loading
  loadingWrap: {
    paddingTop: S[24],
    alignItems: 'center',
    gap: S[4],
  },
  loadingText: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: S[12],
    gap: S[6],
  },
  emptyTitle: {
    fontSize: T.lg,
    fontWeight: T.bold,
    letterSpacing: 2,
    color: Colors.black,
  },
  emptyBody: {
    fontSize: T.base,
    fontWeight: T.light,
    color: Colors.t2,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCta: {
    backgroundColor: Colors.black,
    paddingHorizontal: S[12],
    paddingVertical: S[6],
    borderRadius: R.sm,
  },
  emptyCtaText: {
    color: Colors.white,
    fontSize: T.sm,
    fontWeight: T.bold,
    letterSpacing: 2,
  },
});
