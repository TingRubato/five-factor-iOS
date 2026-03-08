import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, S, T, R } from '../constants/theme';
import { useUser } from '../stores/userStore';
import { updateProfileVisibility } from '../lib/api';

function RowItem({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value} ›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateProfile, setUser } = useUser();
  const [isPublic, setIsPublic] = useState(user?.isPublic !== false);

  const handleTogglePublic = async (val: boolean) => {
    setIsPublic(val);
    updateProfile({ isPublic: val });
    if (user?.id && !user.id.startsWith('local_')) {
      try {
        await updateProfileVisibility(user.id, val);
      } catch (err) {
        console.error('Failed to update visibility:', err);
      }
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Personality Data',
      'This will permanently delete your OCEAN scores, Z-scores, and archetype. Your posts will remain. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            updateProfile({
              scores: undefined,
              zScores: undefined,
              primaryArchetype: undefined,
              secondaryArchetype: undefined,
              phase: 'none',
            });
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'All your data — profile, posts, and personality results — will be permanently deleted. This meets GDPR right-to-erasure requirements.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            setUser(null);
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <RowItem label={`@${user?.username || 'anonymous'}`} />
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVACY</Text>

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Public profile</Text>
              <Text style={styles.rowSub}>
                Others can see your archetype and scores
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={handleTogglePublic}
              trackColor={{ false: Colors.line, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>

        </View>

        {/* Personality Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERSONALITY DATA</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Your assessment uses the IPIP Big Five (public domain), not MBTI.
              Results are an exploratory tool, not a clinical diagnosis.
            </Text>
          </View>

          <RowItem
            label="Retake Phase 1"
            value="15 questions"
            onPress={() => router.push('/onboarding/phase1')}
          />
          {user?.phase === 'phase2' ? (
            <RowItem label="Phase 2 complete" value="Full precision" />
          ) : (
            <RowItem
              label="Complete Phase 2"
              value="35 questions"
              onPress={() => router.push('/onboarding/phase2')}
            />
          )}
        </View>

        {/* Legal / GDPR */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA & GDPR</Text>

          <RowItem
            label="Clear personality data"
            onPress={handleClearData}
            destructive
          />
          <RowItem
            label="Delete account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            ARCHETYPE v1.0 · IPIP Big Five · Public Domain{'\n'}
            Not a clinical diagnostic tool
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S[12],
    paddingVertical: S[8],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  back: {
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

  content: { gap: S[4], paddingBottom: 60 },

  section: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.line,
  },
  sectionLabel: {
    fontSize: T.xs,
    fontWeight: T.bold,
    color: Colors.t3,
    letterSpacing: 2.5,
    paddingHorizontal: S[12],
    paddingTop: S[8],
    paddingBottom: S[4],
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S[12],
    paddingVertical: S[8],
    borderTopWidth: 1,
    borderColor: Colors.line,
  },
  rowContent: { flex: 1, marginRight: S[8] },
  rowLabel: {
    fontSize: T.base,
    color: Colors.black,
    fontWeight: T.regular,
  },
  rowLabelDestructive: {
    color: Colors.accent,
  },
  rowSub: {
    fontSize: T.xs,
    color: Colors.t3,
    marginTop: 2,
    lineHeight: 16,
  },
  rowValue: {
    fontSize: T.base,
    color: Colors.t2,
  },

  infoBox: {
    marginHorizontal: S[12],
    marginVertical: S[4],
    padding: S[8],
    backgroundColor: Colors.bg,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  infoText: {
    fontSize: T.xs,
    color: Colors.t2,
    lineHeight: 17,
  },

  appInfo: {
    padding: S[12],
    alignItems: 'center',
    marginTop: S[8],
  },
  appInfoText: {
    fontSize: T.xs,
    color: Colors.t3,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
});
