import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, S, T, R, Shadows } from '../../constants/theme';
import { ARCHETYPES, getArchetypeByName } from '../../lib/archetypes';
import RadarChart from '../../components/RadarChart';

const { width: W } = Dimensions.get('window');
const CHART = W * 0.58;

// Placeholder data — replace with API fetch
const USER_DATA: Record<string, {
  username: string;
  archetypeId: string;
  scores: Record<string, number>;
  posts: { id: string; title: string; upvotes: number; timeAgo: string }[];
}> = {
  u1: {
    username: 'phantom_arc',
    archetypeId: 'speculative_researcher',
    scores: { O: 88, C: 80, E: 32, A: 55, N: 28 },
    posts: [
      { id: 'p1', title: 'Why orchestral arrangement is the ultimate form of creative discipline', upvotes: 42, timeAgo: '2h' },
      { id: 'p2', title: 'On Gödel\'s incompleteness and system design', upvotes: 18, timeAgo: '3d' },
    ],
  },
  u2: {
    username: 'null_pointer',
    archetypeId: 'blunt_challenger',
    scores: { O: 65, C: 40, E: 78, A: 22, N: 55 },
    posts: [
      { id: 'p3', title: 'Hot take: consensus-driven design kills innovation', upvotes: 28, timeAgo: '4h' },
    ],
  },
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
    ]).start();
  }, []);

  const data = USER_DATA[id as string] || USER_DATA['u1'];
  const archetype = ARCHETYPES[data.archetypeId];

  // Simulated compatibility (replace with real euclidean calc)
  const compatibility = 68;

  return (
    <SafeAreaView style={styles.container}>
      {/* Handle bar */}
      <View style={styles.handle} />

      {/* Close */}
      <View style={styles.topBar}>
        <Text style={styles.topLabel}>MEMBER PROFILE</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identityRow}>
          <View style={styles.avatar} />
          <View style={styles.identityInfo}>
            <Text style={styles.username}>@{data.username}</Text>
            {archetype && (
              <View style={[styles.chip, { backgroundColor: `${archetype.color}15` }]}>
                <Text style={[styles.chipText, { color: archetype.color }]}>
                  {archetype.shortLabel} · {archetype.nameEn}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Compatibility */}
        <View style={styles.compatCard}>
          <Text style={styles.compatLabel}>YOUR PERSONALITY MATCH</Text>
          <View style={styles.compatRow}>
            <Text style={[styles.compatScore, { color: archetype?.color || Colors.accent }]}>
              {compatibility}
            </Text>
            <Text style={styles.compatPercent}>%</Text>
          </View>
          <View style={styles.compatTrack}>
            <View
              style={[
                styles.compatFill,
                {
                  width: `${compatibility}%`,
                  backgroundColor: archetype?.color || Colors.accent,
                },
              ]}
            />
          </View>
          <Text style={styles.compatHint}>
            Based on 5-dimensional Euclidean distance
          </Text>
        </View>

        {/* Radar */}
        <View style={styles.radarCard}>
          <Text style={styles.cardLabel}>THEIR PERSONALITY MAP</Text>
          <RadarChart
            scores={data.scores}
            size={CHART}
            color={archetype?.color || Colors.accent}
            radiusRatio={0.68}
            labelOffset={18}
            dashedRings={true}
            showLabels={true}
            showDataPoints={true}
          />
        </View>

        {/* Their posts */}
        <View style={styles.postsSection}>
          <Text style={styles.cardLabel}>THEIR POSTS</Text>
          {data.posts.map((post) => (
            <View key={post.id} style={styles.postRow}>
              <Text style={styles.postTitle} numberOfLines={2}>
                {post.title}
              </Text>
              <View style={styles.postMeta}>
                <Text style={styles.postUpvotes}>↑ {post.upvotes}</Text>
                <Text style={styles.postTime}>{post.timeAgo}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Archetype description */}
        {archetype && (
          <View style={[styles.descCard, { borderColor: `${archetype.color}40` }]}>
            <Text style={[styles.descLabel, { color: archetype.color }]}>
              {archetype.nameEn.toUpperCase()}
            </Text>
            <Text style={styles.descText}>{archetype.description}</Text>
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.line,
    borderRadius: R.full,
    alignSelf: 'center',
    marginTop: S[4],
    marginBottom: S[4],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S[12],
    paddingVertical: S[6],
  },
  topLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2.5,
  },
  closeText: {
    fontSize: T.base,
    color: Colors.t2,
    fontWeight: T.medium,
  },
  content: {
    padding: S[8],
    gap: S[8],
    paddingBottom: 60,
  },

  // Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[8],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: R.full,
    backgroundColor: Colors.line,
  },
  identityInfo: { gap: S[2] },
  username: {
    fontSize: T.lg,
    fontWeight: T.semibold,
    color: Colors.black,
    letterSpacing: 0.3,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  chipText: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 0.5,
  },

  // Compatibility
  compatCard: {
    backgroundColor: Colors.bg,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: S[8],
    alignItems: 'center',
    gap: S[4],
    ...Shadows.sm,
  },
  compatLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2,
  },
  compatRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  compatScore: {
    fontSize: 56,
    fontWeight: T.thin,
    lineHeight: 60,
  },
  compatPercent: {
    fontSize: T.lg,
    fontWeight: T.light,
    color: Colors.t2,
    paddingBottom: S[4],
  },
  compatTrack: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.line,
    borderRadius: 2,
    overflow: 'hidden',
  },
  compatFill: {
    height: 3,
    borderRadius: 2,
  },
  compatHint: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 0.5,
  },

  // Radar
  radarCard: {
    backgroundColor: Colors.bg,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: S[8],
    alignItems: 'center',
    gap: S[4],
    ...Shadows.sm,
  },
  cardLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2.5,
    alignSelf: 'flex-start',
  },

  // Posts
  postsSection: {
    gap: S[4],
  },
  postRow: {
    paddingVertical: S[6],
    borderBottomWidth: 1,
    borderColor: Colors.line,
    gap: S[2],
  },
  postTitle: {
    fontSize: T.base,
    fontWeight: T.light,
    color: Colors.black,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  postMeta: {
    flexDirection: 'row',
    gap: S[8],
  },
  postUpvotes: {
    fontSize: T.xs,
    fontWeight: T.semibold,
    color: Colors.t2,
  },
  postTime: {
    fontSize: T.xs,
    color: Colors.t3,
  },

  // Description
  descCard: {
    padding: S[8],
    borderRadius: R.md,
    borderWidth: 1,
    gap: S[4],
  },
  descLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 2,
  },
  descText: {
    fontSize: T.sm,
    color: Colors.t2,
    lineHeight: 19,
    fontWeight: T.light,
  },
});
