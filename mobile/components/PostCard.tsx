import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import ArchetypeBadge from './ArchetypeBadge';
import { Colors, T, S, R, Shadows } from '../constants/theme';

interface PostCardProps {
  id: string;
  author: string;
  authorId: string;
  title: string;
  body?: string;
  archetype?: string;
  upvotes?: number;
  isSerendipity?: boolean;
  onPress?: () => void;
}

function PostCardInner({
  id,
  author,
  authorId,
  title,
  body,
  archetype,
  upvotes = 0,
  isSerendipity,
  onPress,
}: PostCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.975, { damping: 15, stiffness: 400 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
      }}
      onPress={onPress ?? (() => router.push(`/user/${authorId}`))}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.header}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{author}</Text>
            {isSerendipity && (
              <View style={styles.serendipityTag}>
                <Text style={styles.serendipityText}>DIFFERENT VIEW</Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => router.push(`/user/${authorId}`)}
            hitSlop={8}
          >
            <ArchetypeBadge archetypeName={archetype} size="sm" />
          </Pressable>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {body && (
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        )}

        {upvotes > 0 && (
          <Text style={styles.upvotes}>{upvotes} upvotes</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const PostCard = React.memo(PostCardInner);
export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    padding: S[8],
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S[4],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  authorName: {
    fontSize: T.sm,
    fontWeight: T.semibold,
    color: Colors.t1,
  },
  serendipityTag: {
    backgroundColor: Colors.serendipity,
    paddingHorizontal: S[2],
    paddingVertical: S.hairline,
    borderRadius: R.sm,
  },
  serendipityText: {
    fontSize: T.micro,
    fontWeight: T.bold,
    color: Colors.serendipityDim,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: T.lg + 2,
    fontWeight: T.light,
    color: Colors.t1,
    lineHeight: 24,
    marginBottom: S[2],
  },
  body: {
    fontSize: T.sm,
    color: Colors.t2,
    lineHeight: 18,
    marginBottom: S[4],
  },
  upvotes: {
    fontSize: T.xs,
    color: Colors.t3,
    fontWeight: T.semibold,
    marginTop: S[2],
  },
});
