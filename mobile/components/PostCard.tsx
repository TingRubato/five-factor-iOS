import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ArchetypeBadge from './ArchetypeBadge';
import { Colors, T, S, R } from '../constants/theme';

interface PostCardProps {
  id: string;
  author: string;
  authorId: string;
  title: string;
  body?: string;
  archetype?: string;
  upvotes?: number;
  isSerendipity?: boolean;
}

export default function PostCard({
  id,
  author,
  authorId,
  title,
  body,
  archetype,
  upvotes = 0,
  isSerendipity,
}: PostCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to post detail or author profile
      }}
    >
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <Text style={styles.authorName}>{author}</Text>
          {isSerendipity && (
            <View style={styles.serendipityTag}>
              <Text style={styles.serendipityText}>DIFFERENT VIEW</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/user/${authorId}`)}
          hitSlop={8}
        >
          <ArchetypeBadge archetypeName={archetype} size="sm" />
        </TouchableOpacity>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    padding: S[8],
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
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
    fontWeight: '600',
    color: Colors.t1,
  },
  serendipityTag: {
    backgroundColor: Colors.serendipity,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.sm,
  },
  serendipityText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.serendipityDim,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: T.lg + 2,
    fontWeight: '300',
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
    fontWeight: '600',
    marginTop: S[2],
  },
});
