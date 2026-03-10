import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, S, T, R, Shadows, Fonts } from '../../constants/theme';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [input, setInput] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View>
            <Text style={styles.threadLabel}>ACTIVE THREAD</Text>
            <Text style={styles.threadTitle}>Strategic Evolution 01</Text>
          </View>
          <View style={styles.avatarStack}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }} style={styles.miniAvatar} />
            <Image source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' }} style={[styles.miniAvatar, { marginLeft: -12 }]} />
            <View style={styles.avatarCount}>
              <Text style={styles.avatarCountText}>+2</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusGroup}>
          <View style={styles.pulse} />
          <Text style={styles.statusText}>IMPACT: +4.2%</Text>
        </View>
        <Text style={styles.statusText}>NODES: 14 ACTIVE</Text>
        <Text style={styles.statusText}>VELOCITY: HIGH</Text>
      </View>

      <ScrollView 
        style={styles.messages} 
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.initiatedBox}>
          <Text style={styles.initiatedText}>Thread Initiated by Catalyst</Text>
        </View>

        {/* Message Left */}
        <View style={styles.msgLeft}>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>Elena Ross</Text>
            <View style={styles.senderRole}>
              <Text style={styles.senderRoleText}>CONNECTOR</Text>
            </View>
          </View>
          <View style={styles.bubbleLeft}>
            <Text style={styles.msgText}>
              The current architecture is stable, but we&apos;re seeing diminishing returns in node bridging. How can we trigger a shift?
            </Text>
          </View>
          <Text style={styles.time}>10:42 AM</Text>
        </View>

        {/* Message Right (Self) */}
        <View style={styles.msgRight}>
          <View style={[styles.senderInfo, { alignSelf: 'flex-end' }]}>
            <View style={styles.roleSelf}>
              <Text style={styles.roleSelfText}>CATALYST</Text>
            </View>
            <Text style={styles.senderName}>You</Text>
          </View>
          <View style={styles.bubbleRight}>
            <Text style={[styles.msgText, { color: Colors.white }]}>
              We need to introduce a high-entropy node to disrupt the existing cluster. I&apos;m looking at the Bridge Coefficient data now.
            </Text>
          </View>
          <Text style={styles.time}>10:45 AM</Text>
        </View>

        {/* Prediction Card */}
        <View style={styles.predictCard}>
          <View style={styles.predictHeader}>
            <Text style={styles.predictLabel}>NETWORK IMPACT PREDICTION</Text>
            <Text style={styles.predictValue}>EXPLOSIVE</Text>
          </View>
          <View style={styles.predictTrack}>
            <View style={styles.predictFill} />
          </View>
          <Text style={styles.predictDesc}>Potential for 3 new cluster mergers detected within 4 hours.</Text>
        </View>

        {/* Message Left */}
        <View style={styles.msgLeft}>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>Marcus Chen</Text>
            <View style={styles.senderRole}>
              <Text style={styles.senderRoleText}>SYNTHESIZER</Text>
            </View>
          </View>
          <View style={styles.bubbleLeft}>
            <Text style={styles.msgText}>
              Agreed. If we align this with the Tech cluster expansion, we can capture the momentum. Elena, can you bridge the dev nodes?
            </Text>
          </View>
          <Text style={styles.time}>10:48 AM</Text>
        </View>
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputArea}>
          <View style={styles.inputFrame}>
            <TextInput 
              placeholder="Pulse input..."
              placeholderTextColor={Colors.t3}
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.plusBtn}>
              <Text style={styles.plusBtnText}>→</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendBtn}>
            <Text style={styles.sendIcon}>▲</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    height: 64,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: Colors.black,
    backgroundColor: Colors.white,
    zIndex: 30,
  },
  backBtn: {
    width: 64,
    borderRightWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, fontWeight: 'bold' },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[4],
  },
  threadLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.t3, letterSpacing: 1 },
  threadTitle: { fontSize: 14, fontWeight: 'bold' },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors.white },
  avatarCount: {
    width: 32, height: 32, borderRadius: 16, 
    backgroundColor: Colors.black, 
    borderWidth: 2, borderColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -12,
  },
  avatarCountText: { color: Colors.white, fontSize: 10, fontWeight: 'bold' },

  statusBar: {
    backgroundColor: Colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: S[4],
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderColor: Colors.black,
  },
  statusGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  statusText: { color: Colors.white, fontSize: 9, fontFamily: Fonts?.mono, letterSpacing: 1 },

  messages: { flex: 1 },
  messagesContent: { padding: S[4], gap: S[6], paddingBottom: 40 },
  
  initiatedBox: { alignSelf: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.black, paddingHorizontal: 12, paddingVertical: 4 },
  initiatedText: { fontSize: 10, fontFamily: Fonts?.mono, fontWeight: '600' },

  msgLeft: { alignSelf: 'flex-start', maxWidth: '85%', gap: 4 },
  msgRight: { alignSelf: 'flex-end', maxWidth: '85%', gap: 4 },
  
  senderInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  senderName: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' } as any,
  senderRole: { backgroundColor: '#E5E7EB', paddingHorizontal: 4, borderWidth: 1, borderColor: Colors.black },
  senderRoleText: { fontSize: 9, fontFamily: Fonts?.mono },
  
  roleSelf: { backgroundColor: Colors.black, paddingHorizontal: 4 },
  roleSelfText: { fontSize: 9, fontFamily: Fonts?.mono, color: Colors.white },

  bubbleLeft: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.black,
    padding: 12,
    ...Shadows.sm,
  },
  bubbleRight: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.black,
    padding: 12,
    ...Shadows.sm,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 9, color: Colors.t3, fontFamily: Fonts?.mono, marginTop: 2 },

  predictCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.black,
    padding: 12,
    ...Shadows.brutalist,
  },
  predictHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  predictLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  predictValue: { fontSize: 11, fontWeight: 'bold', color: Colors.accent },
  predictTrack: { height: 8, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: Colors.black, overflow: 'hidden' },
  predictFill: { height: '100%', width: '65%', backgroundColor: Colors.accent },
  predictDesc: { fontSize: 10, color: Colors.t2, marginTop: 8 },

  inputArea: {
    backgroundColor: Colors.white,
    borderTopWidth: 2,
    borderColor: Colors.black,
    padding: S[4],
    paddingBottom: 32,
    flexDirection: 'row',
    gap: 8,
  },
  inputFrame: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: Colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  textInput: { flex: 1, height: 48, fontSize: 14 },
  plusBtn: { padding: 4 },
  plusBtnText: { fontSize: 20, color: Colors.t3 },
  sendBtn: {
    width: 56,
    height: 52,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  sendIcon: { color: Colors.white, fontSize: 20 },
});
