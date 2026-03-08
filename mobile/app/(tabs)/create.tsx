// Create post screen
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, S, T, R, Shadows } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { getArchetypeByName } from '../../lib/archetypes';

const TOPICS = [
  'MUSIC · ENGINEERING',
  'EMBEDDED · DIY',
  'GENERATIVE ART',
  'PRODUCT',
  'WORKFLOW',
  'PHILOSOPHY',
  'LITERATURE',
];

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const archetype = user?.primaryArchetype
    ? getArchetypeByName(user.primaryArchetype)
    : null;

  const titleLen = title.length;
  const bodyLen = body.length;

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    // TODO: call api.createPost()
    await new Promise((r) => setTimeout(r, 800));
    setPosting(false);
    router.replace('/(tabs)/feed');
  };

  const canPost = title.trim().length > 0 && body.trim().length > 10;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NEW POST</Text>
          <TouchableOpacity
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!canPost || posting}
            activeOpacity={0.8}
          >
            <Text style={styles.postBtnText}>
              {posting ? '...' : 'POST'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Author row */}
          <View style={styles.authorRow}>
            <View style={styles.avatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                @{user?.username || 'anonymous'}
              </Text>
              {archetype && (
                <View
                  style={[
                    styles.archetypeChip,
                    { backgroundColor: `${archetype.color}15` },
                  ]}
                >
                  <Text
                    style={[styles.archetypeChipText, { color: archetype.color }]}
                  >
                    {archetype.shortLabel} · {archetype.nameEn}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Title */}
          <TextInput
            style={styles.titleInput}
            placeholder="What is your sharpest thought right now?"
            placeholderTextColor={Colors.t3}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            multiline
            returnKeyType="next"
          />
          <Text style={styles.charCount}>{titleLen}/120</Text>

          {/* Separator */}
          <View style={styles.sep} />

          {/* Body */}
          <TextInput
            style={styles.bodyInput}
            placeholder="Develop it. People here appreciate depth over vague takes."
            placeholderTextColor={Colors.t3}
            value={body}
            onChangeText={setBody}
            maxLength={2000}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bodyLen}/2000</Text>

          {/* Topic picker */}
          <View style={styles.topicSection}>
            <Text style={styles.topicLabel}>TOPIC</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicList}
            >
              {TOPICS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.topicTag,
                    topic === t && styles.topicTagActive,
                  ]}
                  onPress={() => setTopic(topic === t ? null : t)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.topicTagText,
                      topic === t && styles.topicTagTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Notice */}
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Your personality snapshot (archetype + scores) will be attached
              to this post. It will not change retroactively.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S[12],
    paddingVertical: S[6],
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  cancel: {
    fontSize: T.base,
    color: Colors.t2,
    fontWeight: T.medium,
  },
  headerTitle: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.black,
    letterSpacing: 3,
  },
  postBtn: {
    backgroundColor: Colors.black,
    paddingHorizontal: S[8],
    paddingVertical: S[4],
    borderRadius: R.sm,
  },
  postBtnDisabled: {
    backgroundColor: Colors.line,
  },
  postBtnText: {
    color: Colors.white,
    fontWeight: T.bold,
    fontSize: T.sm,
    letterSpacing: 2,
  },

  content: {
    padding: S[12],
    gap: S[6],
    paddingBottom: 80,
  },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[6],
    marginBottom: S[4],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: R.full,
    backgroundColor: Colors.line,
  },
  authorInfo: { gap: S[2] },
  authorName: {
    fontSize: T.base,
    fontWeight: T.semibold,
    color: Colors.black,
  },
  archetypeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: R.sm,
  },
  archetypeChipText: {
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 0.5,
  },

  // Inputs
  titleInput: {
    fontSize: T.xl,
    fontWeight: T.light,
    color: Colors.black,
    lineHeight: 30,
    letterSpacing: -0.3,
    minHeight: 80,
  },
  bodyInput: {
    fontSize: T.base,
    fontWeight: T.regular,
    color: Colors.black,
    lineHeight: 24,
    minHeight: 160,
  },
  charCount: {
    fontSize: T.xs,
    color: Colors.t3,
    textAlign: 'right',
    fontWeight: T.medium,
    marginTop: -S[4],
  },
  sep: {
    height: 1,
    backgroundColor: Colors.line,
  },

  // Topic
  topicSection: { gap: S[4] },
  topicLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2.5,
  },
  topicList: { gap: S[4], paddingRight: S[4] },
  topicTag: {
    paddingHorizontal: S[6],
    paddingVertical: S[2],
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  topicTagActive: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  topicTagText: {
    fontSize: T.xs,
    fontWeight: T.semibold,
    color: Colors.t2,
    letterSpacing: 1,
  },
  topicTagTextActive: {
    color: Colors.white,
  },

  // Notice
  notice: {
    padding: S[8],
    backgroundColor: Colors.accentDim,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: `${Colors.accent}30`,
  },
  noticeText: {
    fontSize: T.xs,
    color: Colors.accent,
    lineHeight: 17,
    fontWeight: T.medium,
  },
});
