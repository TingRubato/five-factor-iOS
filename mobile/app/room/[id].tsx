/**
 * Room screen — Room feed with posts, join banner, and inline composer.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, S, T, R, Fonts } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { getRoomPosts, joinRoom, createRoomPost, getUserRooms } from '../../lib/api';
import PressableScale from '../../components/ui/PressableScale';
import PostCard from '../../components/PostCard';

// Room metadata (matches seed data)
const ROOM_META: Record<string, { name: string; nameZh: string; color: string }> = {
  room_o: { name: 'The Observatory', nameZh: '观测站', color: '#AF52DE' },
  room_c: { name: 'The Workshop', nameZh: '工坊', color: '#30B0C7' },
  room_e: { name: 'The Arena', nameZh: '竞技场', color: '#FF3B30' },
  room_a: { name: 'The Garden', nameZh: '花园', color: '#5AC8FA' },
  room_n: { name: 'The Depths', nameZh: '深渊', color: '#FF9500' },
  room_commons: { name: 'The Commons', nameZh: '广场', color: '#8E8D93' },
  room_shadow: { name: 'The Shadow Side', nameZh: '暗面', color: '#111111' },
};

interface Post {
  id: string;
  author_id: string;
  title: string;
  body: string;
  snapshot_archetype: string | null;
  upvotes: number;
  created_at: string;
}

export default function RoomScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();

  const meta = ROOM_META[roomId ?? ''] ?? { name: 'Room', nameZh: '', color: Colors.t3 };

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [posting, setPosting] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const fetchPosts = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomPosts(roomId);
      setPosts(data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roomId]);

  const checkMembership = useCallback(async () => {
    if (!user?.id) return;
    try {
      const rooms = await getUserRooms(user.id);
      const found = rooms.some((r: any) => r.room_id === roomId);
      setIsMember(found);
    } catch {
      // fail silently
    }
  }, [user?.id, roomId]);

  useEffect(() => {
    fetchPosts();
    checkMembership();
  }, [fetchPosts, checkMembership]);

  const handleJoin = async () => {
    if (!roomId) return;
    setJoining(true);
    try {
      await joinRoom(roomId);
      setIsMember(true);
    } catch {
      // fail silently
    } finally {
      setJoining(false);
    }
  };

  const handlePost = async () => {
    if (!roomId || !composerText.trim()) return;
    setPosting(true);
    try {
      await createRoomPost(roomId, composerText.trim(), composerText.trim());
      setComposerText('');
      fetchPosts();
    } catch {
      // fail silently
    } finally {
      setPosting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <PressableScale onPress={() => router.back()} scale={0.95} haptic={false}>
            <Text style={styles.backBtn}>← BACK</Text>
          </PressableScale>
          <View style={styles.headerCenter}>
            <Text style={styles.headerName} numberOfLines={1}>
              {meta.name}
            </Text>
            <Text style={styles.headerNameZh}>{meta.nameZh}</Text>
          </View>
          <View style={[styles.colorDot, { backgroundColor: meta.color }]} />
        </View>

        {/* Color bar */}
        <View style={[styles.colorBar, { backgroundColor: meta.color }]} />

        {/* Post list */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.t3} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard
                id={item.id}
                author={item.author_id.substring(0, 8)}
                authorId={item.author_id}
                title={item.title}
                body={item.body}
                archetype={item.snapshot_archetype ?? undefined}
                upvotes={item.upvotes}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.t3} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>NO POSTS YET</Text>
                <Text style={styles.emptyBody}>
                  Be the first to start a conversation in {meta.name}.
                </Text>
              </View>
            }
          />
        )}

        {/* Bottom: join banner or composer */}
        {!isMember ? (
          <View style={styles.joinBanner}>
            <Text style={styles.joinText}>Join this room to post</Text>
            <PressableScale
              style={[styles.joinBtn, { backgroundColor: meta.color }]}
              onPress={handleJoin}
              disabled={joining}
              scale={0.97}
            >
              <Text style={styles.joinBtnText}>
                {joining ? '...' : 'JOIN'}
              </Text>
            </PressableScale>
          </View>
        ) : (
          <View style={styles.composer}>
            <TextInput
              ref={inputRef}
              style={styles.composerInput}
              placeholder="Share a thought..."
              placeholderTextColor={Colors.t3}
              value={composerText}
              onChangeText={setComposerText}
              maxLength={500}
              multiline
            />
            <PressableScale
              style={[
                styles.sendBtn,
                { backgroundColor: composerText.trim() ? meta.color : Colors.line },
              ]}
              onPress={handlePost}
              disabled={!composerText.trim() || posting}
              scale={0.95}
            >
              <Text style={styles.sendBtnText}>
                {posting ? '...' : '→'}
              </Text>
            </PressableScale>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerCenter: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: T.base,
    fontWeight: T.semibold,
    color: Colors.black,
    letterSpacing: -0.3,
  },
  headerNameZh: {
    fontSize: T.xs,
    fontWeight: T.light,
    color: Colors.t3,
    letterSpacing: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  colorBar: {
    height: 3,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: S[4],
    gap: S[4],
    paddingBottom: 20,
  },

  emptyState: {
    paddingTop: S[24],
    alignItems: 'center',
    gap: S[4],
  },
  emptyTitle: {
    fontSize: T.sm,
    fontWeight: T.bold,
    letterSpacing: 2,
    color: Colors.t2,
  },
  emptyBody: {
    fontSize: T.base,
    fontWeight: T.light,
    color: Colors.t3,
    textAlign: 'center',
    paddingHorizontal: S[12],
  },

  // Join banner
  joinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[6],
    paddingVertical: S[4],
    borderTopWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.bg,
  },
  joinText: {
    fontSize: T.sm,
    fontWeight: T.medium,
    color: Colors.t2,
  },
  joinBtn: {
    paddingHorizontal: S[8],
    paddingVertical: S[4],
    borderRadius: R.sm,
  },
  joinBtnText: {
    color: Colors.white,
    fontSize: T.sm,
    fontWeight: T.bold,
    letterSpacing: 2,
  },

  // Composer
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: S[4],
    paddingVertical: S[4],
    borderTopWidth: 1,
    borderColor: Colors.line,
    gap: S[4],
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: S[4],
    paddingVertical: S[4],
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: R.sm,
    fontSize: T.base,
    color: Colors.black,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: T.bold,
  },
});
