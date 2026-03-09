/**
 * Arena screen — Split-thread debate UI.
 * Two side-by-side columns with auto-assigned sides, defector badge, voting.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, S, T, R, Fonts } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import {
  getArena,
  getArenaPosts,
  createArenaPost,
  voteArena,
} from '../../lib/api';
import type { Arena, ArenaPost } from '../../lib/arenas';
import PressableScale from '../../components/ui/PressableScale';

// Dimension colors for the split
const DIM_COLORS: Record<string, string> = {
  O: '#AF52DE',
  C: '#30B0C7',
  E: '#FF3B30',
  A: '#5AC8FA',
  N: '#FF9500',
};

export default function ArenaScreen() {
  const { id: arenaId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();

  const [arena, setArena] = useState<Arena | null>(null);
  const [side1Posts, setSide1Posts] = useState<ArenaPost[]>([]);
  const [side2Posts, setSide2Posts] = useState<ArenaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerText, setComposerText] = useState('');
  const [defecting, setDefecting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [voted, setVoted] = useState(false);

  const fetchData = useCallback(async () => {
    if (!arenaId) return;
    try {
      const [arenaData, posts] = await Promise.all([
        getArena(arenaId),
        getArenaPosts(arenaId),
      ]);
      setArena(arenaData);
      setSide1Posts(posts.filter((p: ArenaPost) => p.side === 1));
      setSide2Posts(posts.filter((p: ArenaPost) => p.side === 2));
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [arenaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePost = async () => {
    if (!arenaId || !composerText.trim()) return;
    setPosting(true);
    try {
      const forceSide = defecting ? undefined : undefined; // auto-assign
      await createArenaPost(arenaId, composerText.trim(), defecting ? (userSide === 1 ? 2 : 1) : undefined);
      setComposerText('');
      setDefecting(false);
      fetchData();
    } catch {
      // fail silently
    } finally {
      setPosting(false);
    }
  };

  const handleVote = async (side: 1 | 2) => {
    if (!arenaId) return;
    try {
      await voteArena(arenaId, side);
      setVoted(true);
      fetchData();
    } catch {
      // fail silently
    }
  };

  // Determine user's natural side
  const userScores = user?.scores;
  const userSide =
    arena && userScores
      ? (userScores[arena.dim1 as keyof typeof userScores] ?? 50) >=
        (userScores[arena.dim2 as keyof typeof userScores] ?? 50)
        ? 1
        : 2
      : 1;

  const color1 = arena ? DIM_COLORS[arena.dim1] ?? Colors.t2 : Colors.t2;
  const color2 = arena ? DIM_COLORS[arena.dim2] ?? Colors.t2 : Colors.t2;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.t3} />
        </View>
      </SafeAreaView>
    );
  }

  if (!arena) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyText}>Arena not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderPost = (post: ArenaPost, color: string) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>@{post.user_id.substring(0, 8)}</Text>
        {post.is_defector && (
          <View style={styles.defectorBadge}>
            <Text style={styles.defectorText}>TRAITOR</Text>
          </View>
        )}
      </View>
      <Text style={styles.postBody}>{post.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} scale={0.95} haptic={false}>
          <Text style={styles.backBtn}>← ARENA</Text>
        </PressableScale>
        <Text style={styles.timerText}>
          {arena.status === 'active' ? 'ACTIVE' : arena.status.toUpperCase()}
        </Text>
      </View>

      {/* Topic */}
      <View style={styles.topicSection}>
        <Text style={styles.topicText}>"{arena.topic}"</Text>
        <Text style={styles.topicZh}>{arena.topic_zh}</Text>
      </View>

      {/* Split-color bar */}
      <View style={styles.splitBar}>
        <View style={[styles.splitHalf, { backgroundColor: color1 }]} />
        <View style={[styles.splitHalf, { backgroundColor: color2 }]} />
      </View>

      {/* Side headers */}
      <View style={styles.sideHeaders}>
        <View style={styles.sideHeader}>
          <Text style={[styles.sideLabel, { color: color1 }]}>
            {arena.side1_label}
          </Text>
          <Text style={styles.sideCount}>{side1Posts.length} posts</Text>
        </View>
        <View style={styles.sideDivider} />
        <View style={styles.sideHeader}>
          <Text style={[styles.sideLabel, { color: color2 }]}>
            {arena.side2_label}
          </Text>
          <Text style={styles.sideCount}>{side2Posts.length} posts</Text>
        </View>
      </View>

      {/* Split threads */}
      <View style={styles.splitThreads}>
        <FlatList
          data={side1Posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderPost(item, color1)}
          style={[styles.threadCol, { borderRightWidth: 1, borderColor: Colors.line }]}
          contentContainerStyle={styles.threadContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No posts yet</Text>}
        />
        <FlatList
          data={side2Posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderPost(item, color2)}
          style={styles.threadCol}
          contentContainerStyle={styles.threadContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No posts yet</Text>}
        />
      </View>

      {/* Bottom: composer or voting */}
      {arena.status === 'active' && (
        <View style={styles.composerArea}>
          <View style={styles.composerRow}>
            <Text style={styles.yourSide}>
              Your side: {userSide === 1 ? arena.side1_label : arena.side2_label}
            </Text>
            <View style={styles.defectRow}>
              <Text style={styles.defectLabel}>Defect</Text>
              <Switch
                value={defecting}
                onValueChange={setDefecting}
                trackColor={{ false: Colors.line, true: Colors.accent }}
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Make your argument..."
              placeholderTextColor={Colors.t3}
              value={composerText}
              onChangeText={setComposerText}
              maxLength={500}
              multiline
            />
            <PressableScale
              style={[
                styles.sendBtn,
                {
                  backgroundColor: composerText.trim()
                    ? userSide === 1
                      ? color1
                      : color2
                    : Colors.line,
                },
              ]}
              onPress={handlePost}
              disabled={!composerText.trim() || posting}
              scale={0.95}
            >
              <Text style={styles.sendBtnText}>{posting ? '...' : '→'}</Text>
            </PressableScale>
          </View>
        </View>
      )}

      {arena.status === 'voting' && !voted && (
        <View style={styles.voteArea}>
          <Text style={styles.voteTitle}>CAST YOUR VOTE</Text>
          <View style={styles.voteButtons}>
            <PressableScale
              style={[styles.voteBtn, { backgroundColor: color1 }]}
              onPress={() => handleVote(1)}
              scale={0.97}
            >
              <Text style={styles.voteBtnText}>{arena.side1_label}</Text>
            </PressableScale>
            <PressableScale
              style={[styles.voteBtn, { backgroundColor: color2 }]}
              onPress={() => handleVote(2)}
              scale={0.97}
            >
              <Text style={styles.voteBtnText}>{arena.side2_label}</Text>
            </PressableScale>
          </View>
        </View>
      )}

      {(arena.status === 'closed' || voted) && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {arena.side1_votes ?? 0} vs {arena.side2_votes ?? 0}
            {arena.winner ? ` · ${arena.winner === 1 ? arena.side1_label : arena.side2_label} WINS` : ''}
          </Text>
        </View>
      )}
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
    borderColor: Colors.line,
  },
  backBtn: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t2,
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 9,
    fontWeight: T.bold,
    color: Colors.accent,
    letterSpacing: 1.5,
  },

  topicSection: {
    padding: S[6],
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  topicText: {
    fontSize: T.xl,
    fontWeight: T.semibold,
    color: Colors.black,
    fontStyle: 'italic',
    lineHeight: 30,
  },
  topicZh: {
    fontSize: T.sm,
    fontWeight: T.light,
    color: Colors.t3,
    marginTop: S[2],
  },

  splitBar: {
    flexDirection: 'row',
    height: 4,
  },
  splitHalf: { flex: 1 },

  sideHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  sideHeader: {
    flex: 1,
    padding: S[4],
    alignItems: 'center',
  },
  sideLabel: {
    fontSize: 8,
    fontWeight: T.bold,
    letterSpacing: 1,
  },
  sideCount: {
    fontSize: 8,
    fontWeight: T.medium,
    color: Colors.t3,
    marginTop: 2,
  },
  sideDivider: {
    width: 1,
    backgroundColor: Colors.line,
  },

  splitThreads: {
    flex: 1,
    flexDirection: 'row',
  },
  threadCol: {
    flex: 1,
  },
  threadContent: {
    padding: S[4],
    gap: S[4],
    paddingBottom: 20,
  },

  postCard: {
    borderWidth: 1,
    borderColor: Colors.line,
    padding: S[4],
    gap: S[2],
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: 9,
    fontWeight: T.bold,
    color: Colors.t2,
    letterSpacing: 0.5,
  },
  defectorBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  defectorText: {
    fontSize: 7,
    fontWeight: T.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  postBody: {
    fontSize: T.sm,
    fontWeight: T.regular,
    color: Colors.black,
    lineHeight: 17,
  },

  emptyText: {
    fontSize: T.xs,
    color: Colors.t3,
    textAlign: 'center',
    paddingTop: S[8],
  },

  // Composer
  composerArea: {
    borderTopWidth: 1,
    borderColor: Colors.line,
    padding: S[4],
    gap: S[4],
  },
  composerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourSide: {
    fontSize: 9,
    fontWeight: T.bold,
    color: Colors.t2,
    letterSpacing: 1,
  },
  defectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[2],
  },
  defectLabel: {
    fontSize: 9,
    fontWeight: T.medium,
    color: Colors.t3,
  },
  inputRow: {
    flexDirection: 'row',
    gap: S[4],
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: R.sm,
    paddingHorizontal: S[4],
    paddingVertical: S[2],
    fontSize: T.sm,
    color: Colors.black,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: T.bold,
  },

  // Voting
  voteArea: {
    borderTopWidth: 1,
    borderColor: Colors.line,
    padding: S[6],
    gap: S[4],
    alignItems: 'center',
  },
  voteTitle: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 2,
    color: Colors.t2,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: S[4],
  },
  voteBtn: {
    flex: 1,
    height: 44,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteBtnText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: T.bold,
    letterSpacing: 1,
  },

  // Results
  resultsBar: {
    borderTopWidth: 1,
    borderColor: Colors.line,
    padding: S[4],
    alignItems: 'center',
  },
  resultsText: {
    fontSize: T.sm,
    fontWeight: T.bold,
    color: Colors.t2,
    letterSpacing: 1,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
