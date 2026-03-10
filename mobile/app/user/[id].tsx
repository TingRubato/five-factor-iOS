import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors, S, T, R, Shadows, Fonts } from '../../constants/theme';
import { ARCHETYPES } from '../../lib/archetypes';
import { getUserProfile } from '../../lib/api';
import { useUser } from '../../stores/userStore';

const { width: W } = Dimensions.get('window');

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useUser();
  interface UserProfile {
    user_id: string;
    username: string;
    primary_archetype: string | null;
    compatibility: number;
    [key: string]: unknown;
  }
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && currentUser?.id) {
      getUserProfile(id as string, currentUser.id)
        .then(setProfile)
        .finally(() => setLoading(false));
    }
  }, [id, currentUser?.id]);

  if (loading || !profile) return null;

  const archetype = ARCHETYPES[profile.primary_archetype?.toLowerCase().replace(/ /g, '_')] || ARCHETYPES.explorer_creator;
  const compatibility = profile.compatibility || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Brutalist Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>PEER PROFILE</Text>
          <Text style={styles.headerId}>ID: {profile.user_id.slice(0, 6).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Identity Card */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.heroCard}>
          <View style={styles.heroLayout}>
            <View style={styles.avatarFrame}>
              <Image 
                source={{ uri: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400` }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.heroText}>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{compatibility}% MATCH</Text>
              </View>
              <Text style={styles.name}>{profile.username.toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Archetype Breakdown */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ARCHETYPE BREAKDOWN</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{profile.primary_archetype?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.breakdownList}>
            <BreakdownRow label="Knowledge Synthesis" value={88} color={Colors.black} />
            <BreakdownRow label="Network Expansion" value={96} color={Colors.accent} />
            <BreakdownRow label="Creative Friction" value={42} color={Colors.black} />
          </View>
        </Animated.View>

        {/* Shared Threads */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.tagSection}>
          <Text style={styles.sectionLabel}>SHARED THREADS</Text>
          <View style={styles.tagCloud}>
            <Tag label="Brutalist Architecture" color={Colors.accent} />
            <Tag label="Systems Design" color={Colors.black} />
            <Tag label="Urban Planning" color={Colors.black} />
            <Tag label="Type Theory" color={Colors.accent} />
          </View>
        </Animated.View>

        {/* Connection History */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={styles.sectionLabel}>CONNECTION HISTORY</Text>
          <View style={styles.timeline}>
            <TimelineItem 
              date="OCT 12, 2023" 
              title="Network Ping" 
              desc="Mutual interest flagged in 'Modular Interfaces' thread."
              active
            />
            <TimelineItem 
              date="SEP 28, 2023" 
              title="Proximity Alert" 
              desc={`${profile.username} bridged your node with Marcus Chen.`}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.threadBtn} activeOpacity={0.9}>
          <Text style={styles.threadBtnText}>START THREAD WITH {profile.username.split(' ')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function BreakdownRow({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownMeta}>
        <Text style={styles.breakdownLabel}>{label}</Text>
        <Text style={styles.breakdownValue}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function Tag({ label, color }: { label: string, color: string }) {
  return (
    <View style={styles.tag}>
      <View style={[styles.tagDot, { backgroundColor: color }]} />
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function TimelineItem({ date, title, desc, active = false }: { date: string, title: string, desc: string, active?: boolean }) {
  return (
    <View style={[styles.timelineItem, !active && styles.timelineItemInactive]}>
      <View style={[styles.timelineDot, active ? styles.dotActive : styles.dotInactive]} />
      <Text style={styles.timelineDate}>{date}</Text>
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: Colors.black,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 64,
    borderRightWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 24, fontWeight: 'bold' },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[4],
  },
  headerLabel: { fontSize: T.sm, fontWeight: '900', letterSpacing: 1 },
  headerId: { fontFamily: Fonts?.mono, fontSize: 10, color: Colors.t3 },
  
  content: { paddingBottom: 120 },
  
  heroCard: {
    padding: S[6],
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderColor: Colors.black,
  },
  heroLayout: { flexDirection: 'row', alignItems: 'flex-end', gap: S[6] },
  avatarFrame: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: Colors.black,
    ...Shadows.brutalist,
  },
  avatar: { width: '100%', height: '100%' },
  heroText: { flex: 1, paddingBottom: 4 },
  matchBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: S[2],
  },
  matchText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  name: { fontSize: T.xl * 1.5, fontWeight: '900', letterSpacing: -2, lineHeight: T.xl * 1.3 },

  section: {
    padding: S[6],
    borderBottomWidth: 2,
    borderColor: Colors.black,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S[4],
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.t2,
    letterSpacing: 2,
  },
  typeBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  typeBadgeText: { color: Colors.accent, fontSize: 10, fontWeight: 'bold', fontFamily: Fonts?.mono },

  breakdownList: { gap: S[4] },
  breakdownRow: { gap: S[1] },
  breakdownMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  breakdownValue: { fontSize: 11, fontWeight: 'bold', fontFamily: Fonts?.mono },
  track: { height: 16, borderWidth: 2, borderColor: Colors.black, backgroundColor: '#F0F0F0' },
  fill: { height: '100%' },

  tagSection: {
    padding: S[6],
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 2,
    borderColor: Colors.black,
    gap: S[4],
  },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: S[2] },
  tag: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Shadows.sm,
  },
  tagDot: { width: 8, height: 8 },
  tagText: { fontSize: 12, fontWeight: 'bold' },

  timeline: { marginTop: S[4], gap: S[6] },
  timelineItem: { paddingLeft: S[6], borderLeftWidth: 2, borderColor: Colors.black },
  timelineItemInactive: { borderColor: Colors.line },
  timelineDot: {
    position: 'absolute',
    left: -5,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: { backgroundColor: Colors.black },
  dotInactive: { backgroundColor: Colors.line },
  timelineDate: { fontSize: 10, fontFamily: Fonts?.mono, color: Colors.t3, marginBottom: 2 },
  timelineTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  timelineDesc: { fontSize: 12, color: Colors.t2, lineHeight: 16 },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: S[4],
    backgroundColor: Colors.white,
    borderTopWidth: 2,
    borderColor: Colors.black,
  },
  threadBtn: {
    height: 56,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.brutalist,
  },
  threadBtnText: { color: Colors.white, fontWeight: '900', letterSpacing: 1 },
});

