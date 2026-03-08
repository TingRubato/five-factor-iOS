import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, S, T, R, Shadows } from '../../constants/theme';
import { ARCHETYPES } from '../../lib/archetypes';

type FeedMode = 'default' | 'similar' | 'opposing';

const MODES: { key: FeedMode; label: string; desc: string }[] = [
  { key: 'default', label: 'Discover', desc: 'Quality + personality blend' },
  { key: 'similar', label: 'My Tribe', desc: 'High personality match' },
  { key: 'opposing', label: 'Other Side', desc: 'Opposite thinkers, high quality' },
];

const FEED = [
  {
    id: '1',
    author: 'phantom_arc',
    authorId: 'u1',
    title: 'Why orchestral arrangement is the ultimate form of creative discipline',
    body: 'The counterpoint between voice leading and harmonic rhythm mirrors system architecture in ways most engineers never consider.',
    archetypeId: 'speculative_researcher',
    upvotes: 42,
    topic: 'MUSIC · ENGINEERING',
    timeAgo: '2h',
  },
  {
    id: '2',
    author: 'null_pointer',
    authorId: 'u2',
    title: 'Hot take: consensus-driven design always kills the best ideas',
    body: 'Every breakthrough I have seen came from someone willing to be wrong loudly rather than right quietly in a committee.',
    archetypeId: 'blunt_challenger',
    upvotes: 28,
    topic: 'PRODUCT',
    timeAgo: '4h',
    isSerendipity: true,
  },
  {
    id: '3',
    author: 'silk_thread',
    authorId: 'u3',
    title: 'The beauty of imperfect generative systems',
    body: 'Exploring Perlin noise textures that intentionally break symmetry. Controlled chaos as aesthetic philosophy.',
    archetypeId: 'romantic_idealist',
    upvotes: 35,
    topic: 'GENERATIVE ART',
    timeAgo: '6h',
  },
  {
    id: '4',
    author: 'iron_schedule',
    authorId: 'u4',
    title: 'ESP32 sensor array survived 6 months outdoors — detailed teardown',
    body: 'Waterproofing failures, power budget surprises, and why watchdog timers saved my sanity.',
    archetypeId: 'steady_executor',
    upvotes: 67,
    topic: 'EMBEDDED · DIY',
    timeAgo: '12h',
  },
  {
    id: '5',
    author: 'open_loop',
    authorId: 'u5',
    title: 'My 3-month experiment: no planning, only doing',
    body: 'What happens when you stop optimizing and start executing. Spoiler: you miss a lot of obvious optimizations but ship much more.',
    archetypeId: 'adventurous_doer',
    upvotes: 19,
    topic: 'WORKFLOW',
    timeAgo: '1d',
  },
];

function ArchetypeChip({ archetypeId }: { archetypeId: string }) {
  const a = ARCHETYPES[archetypeId];
  if (!a) return null;
  return (
    <View style={[styles.chip, { backgroundColor: `${a.color}15` }]}>
      <Text style={[styles.chipText, { color: a.color }]}>{a.shortLabel}</Text>
    </View>
  );
}

function PostCard({ item, onPress }: { item: typeof FEED[0]; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const archetype = ARCHETYPES[item.archetypeId];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[styles.card, item.isSerendipity && styles.cardSerendipity, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <Text style={styles.topicTag}>{item.topic}</Text>
          <View style={styles.cardMeta}>
            {item.isSerendipity && (
              <View style={styles.oppTag}>
                <Text style={styles.oppTagText}>OPPOSITE</Text>
              </View>
            )}
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Body */}
        <Text style={styles.cardBody} numberOfLines={2}>
          {item.body}
        </Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <View style={styles.avatarDot} />
            <Text style={styles.authorName}>{item.author}</Text>
            <ArchetypeChip archetypeId={item.archetypeId} />
          </View>
          <Text style={styles.upvotes}>↑ {item.upvotes}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<FeedMode>('default');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoDot} />
          <Text style={styles.logo}>ARCHETYPE</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          hitSlop={12}
        >
          <Text style={styles.profileLink}>MY IDENTITY</Text>
        </TouchableOpacity>
      </View>

      {/* Mode tabs */}
      <View style={styles.tabs}>
        {MODES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, mode === key && styles.tabActive]}
            onPress={() => setMode(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, mode === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mode description */}
      <Text style={styles.modeDesc}>
        {MODES.find((m) => m.key === mode)?.desc}
      </Text>

      {/* Feed */}
      <FlatList
        data={FEED}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onPress={() => router.push(`/user/${item.authorId}`)}
          />
        )}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S[12],
    paddingVertical: S[6],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: R.full,
    backgroundColor: Colors.accent,
  },
  logo: {
    fontSize: T.sm,
    fontWeight: T.bold,
    color: Colors.black,
    letterSpacing: 3,
  },
  profileLink: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t2,
    letterSpacing: 2,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: S[4],
    paddingHorizontal: S[12],
    paddingVertical: S[6],
    backgroundColor: Colors.white,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  tabActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  tabText: {
    fontSize: T.sm,
    color: Colors.t2,
    fontWeight: T.medium,
  },
  tabTextActive: {
    color: Colors.white,
  },
  modeDesc: {
    fontSize: T.xs,
    color: Colors.t3,
    paddingHorizontal: S[12],
    paddingVertical: S[4],
    letterSpacing: 0.5,
  },

  // Feed list
  feedList: {
    padding: S[8],
    gap: S[6],
  },

  // Cards
  card: {
    backgroundColor: Colors.card,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: S[8],
    ...Shadows.sm,
  },
  cardSerendipity: {
    borderColor: Colors.serendipity,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S[4],
  },
  topicTag: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  oppTag: {
    backgroundColor: Colors.serendipityDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.sm,
  },
  oppTagText: {
    fontSize: 8,
    fontWeight: T.bold,
    color: Colors.serendipity,
    letterSpacing: 1,
  },
  timeAgo: {
    fontSize: T.xs,
    color: Colors.t3,
    fontWeight: T.medium,
  },
  cardTitle: {
    fontSize: T.lg,
    fontWeight: T.light,
    color: Colors.black,
    lineHeight: 26,
    marginBottom: S[4],
    letterSpacing: -0.3,
  },
  cardBody: {
    fontSize: T.sm,
    color: Colors.t2,
    lineHeight: 18,
    marginBottom: S[8],
    fontWeight: T.regular,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  avatarDot: {
    width: 20,
    height: 20,
    borderRadius: R.full,
    backgroundColor: Colors.line,
  },
  authorName: {
    fontSize: T.xs,
    fontWeight: T.semibold,
    color: Colors.black,
    letterSpacing: 0.3,
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.sm,
  },
  chipText: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 0.5,
  },
  upvotes: {
    fontSize: T.xs,
    fontWeight: T.semibold,
    color: Colors.t2,
    letterSpacing: 0.5,
  },
});
