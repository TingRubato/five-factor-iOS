import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown,
} from 'react-native-reanimated';
import { Colors, S, T, R, Shadows, Fonts } from '../../constants/theme';
import { useUser } from '../../stores/userStore';
import { getArchetypeByName } from '../../lib/archetypes';

const { width: W } = Dimensions.get('window');

const PEERS = [
  { id: 'u1', name: 'Elena Ross', match: 94, role: 'Connector', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
  { id: 'u2', name: 'Marcus Chen', match: 88, role: 'Synthesizer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
  { id: 'u3', name: 'Sarah Al-Fayed', match: 82, role: 'Architect', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  { id: 'u4', name: 'David Oyelowo', match: 79, role: 'Catalyst', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
];

export default function HubScreen() {
  const router = useRouter();
  const { user } = useUser();
  const archetype = getArchetypeByName(user?.primaryArchetype || 'Explorer Creator');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerLabel}>COMMUNITY HUB</Text>
          <Text style={styles.headerVersion}>VERSION 2.0</Text>
        </View>
        <View style={styles.refBadge}>
          <View style={styles.pulse} />
          <Text style={styles.refText}>REF:24B</Text>
        </View>
      </header>

      <ScrollView 
        style={styles.main} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Archetype Hero */}
        <View style={styles.heroSection}>
          <View style={styles.accentLineV} />
          <Animated.View entering={FadeIn.duration(600)} style={styles.tagWrapper}>
            <View style={styles.archetypeTag}>
              <Text style={styles.archetypeTagText}>SOCIAL ARCHETYPE</Text>
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(100)} style={styles.heroTitle}>
            THE{'\n'}
            <Text style={{ color: Colors.accent }}>{archetype?.nameEn.split(' ')[0].toUpperCase() || 'CATALYST'}.</Text>
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.heroDesc}>
            <View style={styles.heroDescBorder} />
            <Text style={styles.heroDescText}>
              You are the <Text style={{ backgroundColor: '#FFE5E5' }}>spark</Text> within the network that drives evolution.
            </Text>
            <Text style={styles.heroDescSub}>
              While others maintain stability, your brief but high-impact interactions bridge gaps between isolated groups.
            </Text>
          </Animated.View>
        </View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsGrid}>
          <StatBox label="INFLUENCE" value="HIGH" />
          <StatBox label="VELOCITY" value="FAST" />
          <StatBox label="PEERS" value="4" color={Colors.accent} />
        </Animated.View>

        {/* Sticky-like section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RESONANT PEERS</Text>
          <View style={styles.dotStack}>
            <View style={styles.headerDot} />
            <View style={styles.headerDot} />
            <View style={styles.headerDot} />
          </View>
        </View>

        {/* Peers List */}
        <View style={styles.peersList}>
          {PEERS.map((peer, idx) => (
            <TouchableOpacity 
              key={peer.id} 
              style={styles.peerItem}
              onPress={() => router.push(`/user/${peer.id}`)}
            >
              <View style={styles.peerAvatarFrame}>
                <Image source={{ uri: peer.image }} style={styles.peerAvatar} />
              </View>
              <View style={styles.peerInfo}>
                <View style={styles.peerInfoTop}>
                  <Text style={styles.peerName}>{peer.name}</Text>
                  <Text style={styles.peerMatch}>{peer.match}%</Text>
                </View>
                <View style={styles.peerInfoBottom}>
                  <Text style={styles.peerRole}>{peer.role.toUpperCase()}</Text>
                  <Text style={styles.viewLink}>VIEW →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.listFooter} />
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn}>
          <Text style={styles.footerBtnText}>VIEW MAP</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerBtn, { backgroundColor: Colors.accent, borderLeftWidth: 0 }]}
          onPress={() => router.push('/threads/new')}
        >
          <Text style={[styles.footerBtnText, { color: Colors.white }]}>START THREAD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color = Colors.black }: { label: string, value: string, color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[6],
    borderBottomWidth: 2,
    borderColor: Colors.black,
    backgroundColor: Colors.white,
    zIndex: 20,
  },
  headerTitle: { gap: 2 },
  headerLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  headerVersion: { fontSize: 10, fontFamily: Fonts?.mono, color: Colors.t3 },
  refBadge: {
    backgroundColor: Colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  refText: { color: Colors.white, fontSize: 10, fontWeight: 'bold', fontFamily: Fonts?.mono },

  main: { flex: 1 },
  content: { paddingBottom: 100 },

  heroSection: {
    paddingHorizontal: S[6],
    paddingVertical: S[8],
    borderBottomWidth: 2,
    borderColor: Colors.black,
    position: 'relative',
  },
  accentLineV: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    backgroundColor: Colors.accent,
  },
  tagWrapper: { marginBottom: S[6] },
  archetypeTag: {
    borderWidth: 1,
    borderColor: Colors.black,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  archetypeTagText: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroTitle: {
    fontSize: W * 0.13,
    fontWeight: '900',
    lineHeight: W * 0.11,
    letterSpacing: -2,
    marginBottom: S[6],
  },
  heroDesc: {
    paddingLeft: S[2],
    borderLeftWidth: 1,
    borderColor: Colors.line,
    gap: S[4],
  },
  heroDescText: { fontSize: 20, fontWeight: '500', lineHeight: 24 },
  heroDescSub: { fontSize: 14, color: Colors.t2, lineHeight: 20 },

  statsGrid: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: Colors.black,
    backgroundColor: '#F9FAFB',
  },
  statBox: {
    flex: 1,
    padding: S[4],
    alignItems: 'center',
    borderRightWidth: 2,
    borderColor: Colors.black,
  },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.t3, letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', fontFamily: Fonts?.mono },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: S[6],
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: Colors.black,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  dotStack: { flexDirection: 'row', gap: 4 },
  headerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.black },

  peersList: { backgroundColor: Colors.white },
  peerItem: {
    flexDirection: 'row',
    padding: S[4],
    gap: S[4],
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  peerAvatarFrame: {
    width: 56, height: 56,
    borderWidth: 1, borderColor: Colors.black,
    overflow: 'hidden',
  },
  peerAvatar: { width: '100%', height: '100%', grayscale: 1 } as any,
  peerInfo: { flex: 1, justifyContent: 'center' },
  peerInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  peerName: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5 },
  peerMatch: { fontSize: 14, fontWeight: 'bold', color: Colors.accent, fontFamily: Fonts?.mono },
  peerInfoBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  peerRole: { fontSize: 12, color: Colors.t2, letterSpacing: 1 },
  viewLink: { fontSize: 10, fontWeight: '900', color: Colors.black },

  listFooter: { height: 40, backgroundColor: '#F9FAFB' },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    borderTopWidth: 2,
    borderColor: Colors.black,
  },
  footerBtn: {
    flex: 1,
    height: 64,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderColor: Colors.black,
  },
  footerBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});
