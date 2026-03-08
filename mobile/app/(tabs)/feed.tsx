import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, S, T, R, Shadows } from '../../constants/theme';
import { ARCHETYPES } from '../../lib/archetypes';
import { useUser } from '../../stores/userStore';
import { getFeed, FeedItem } from '../../lib/api';

type FeedMode = 'default' | 'similar' | 'opposing';

const MODES: { key: FeedMode; label: string; desc: string }[] = [
  { key: 'default', label: 'Discover', desc: 'Quality + personality blend' },
  { key: 'similar', label: 'My Tribe', desc: 'High personality match' },
  { key: 'opposing', label: 'Other Side', desc: 'Opposite thinkers, high quality' },
];

function ArchetypeChip({ archetypeId }: { archetypeId: string }) {
  const a = ARCHETYPES[archetypeId?.toLowerCase().replace(/ /g, '_')];
  if (!a) return null;
  return (
    <View style={[styles.chip, { backgroundColor: `${a.color}15` }]}>
      <Text style={[styles.chipText, { color: a.color }]}>{a.shortLabel}</Text>
    </View>
  );
}

function PostCard({ item, onPress }: { item: FeedItem; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const isSerendipity = false; // We can derive this later if backend flags it

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[styles.card, isSerendipity && styles.cardSerendipity, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <Text style={styles.topicTag}>{item.topic_id || 'GENERAL'}</Text>
          <View style={styles.cardMeta}>
            {isSerendipity && (
              <View style={styles.oppTag}>
                <Text style={styles.oppTagText}>OPPOSITE</Text>
              </View>
            )}
            <Text style={styles.timeAgo}>Just now</Text>
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
            <Text style={styles.authorName}>User {item.author_id.substring(0,4)}</Text>
            <ArchetypeChip archetypeId={item.snapshot_archetype || ''} />
          </View>
          <Text style={styles.upvotes}>↑ {item.upvotes}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [mode, setMode] = useState<FeedMode>('default');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getFeed(user.id, mode);
        setFeed(res.items);
      } catch (e) {
        console.error("Error loading feed:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [user?.id, mode]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.emptyText}>Syncing network...</Text>
        </View>
      );
    }
    if (!user?.id || user.phase === 'none') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Identify yourself first.</Text>
          <Text style={styles.emptyText}>You need a personality profile to align with the network.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/onboarding/phase1')}>
            <Text style={styles.ctaBtnText}>START ASSESSMENT</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>The network is quiet.</Text>
        <Text style={styles.emptyText}>Be the catalyst. Start a new thread to influence the cluster.</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/create')}>
          <Text style={styles.ctaBtnText}>NEW POST</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        data={feed}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onPress={() => router.push(`/user/${item.author_id}`)}
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

  // Empty state
  emptyContainer: {
    padding: S[12],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: T.lg,
    fontWeight: T.bold,
    color: Colors.black,
    marginBottom: S[2],
  },
  emptyText: {
    fontSize: T.sm,
    color: Colors.t3,
    textAlign: 'center',
    marginBottom: S[8],
    lineHeight: 20,
  },
  ctaBtn: {
    backgroundColor: Colors.black,
    paddingHorizontal: S[6],
    paddingVertical: S[4],
    borderRadius: R.sm,
  },
  ctaBtnText: {
    color: Colors.white,
    fontSize: T.sm,
    fontWeight: T.bold,
    letterSpacing: 1,
  },
});
