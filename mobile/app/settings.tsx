import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, S, T, R } from '../constants/theme';
import { useUser } from '../stores/userStore';
import { updateProfileVisibility, clearProfileScores, deleteUserAccount } from '../lib/api';
import { useToast } from '../components/ui/Toast';

function RowItem({
  label,
  value,
  onPress,
  destructive,
  disabled,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, destructive && styles.rowDestructive]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress || disabled}
    >
      <View style={{ flex: 1 }}>
        <Text style={[
          styles.rowLabel,
          destructive && styles.rowLabelDestructive,
          disabled && { opacity: 0.5 }
        ]}>
          {label}
        </Text>
        {destructive && (
          <Text style={styles.dangerHint}>This cannot be undone</Text>
        )}
      </View>
      {value && <Text style={styles.rowValue}>{value} ›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateProfile, setUser, resetAssessment } = useUser();
  const { showToast } = useToast();
  const [isPublic, setIsPublic] = useState(user?.isPublic !== false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTogglePublic = async (val: boolean) => {
    if (isUpdating) return;

    const previousVal = isPublic;
    // Optimistic update
    setIsPublic(val);
    
    if (user?.id && !user.id.startsWith('local_')) {
      setIsUpdating(true);
      try {
        await updateProfileVisibility(user.id, val);
        updateProfile({ isPublic: val });
        showToast({ type: 'success', message: 'Privacy settings updated.' });
      } catch (err: any) {
        setIsPublic(previousVal);
        showToast({ type: 'error', message: err.message || 'Could not update privacy settings.' });
      } finally {
        setIsUpdating(false);
      }
    } else {
      updateProfile({ isPublic: val });
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Personality Data',
      'This will permanently delete your scores and archetype from our servers. Your account and posts will remain. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            if (user?.id && !user.id.startsWith('local_')) {
              try {
                await clearProfileScores(user.id);
                resetAssessment();
                showToast({ type: 'success', message: 'Personality data cleared.' });
              } catch (err: any) {
                showToast({ type: 'error', message: err.message || 'Failed to clear data.' });
              }
            } else {
              resetAssessment();
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'All your data — profile, posts, and personality results — will be permanently deleted from our servers. This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            if (user?.id && !user.id.startsWith('local_')) {
              try {
                await deleteUserAccount(user.id);
                setUser(null);
                router.replace('/');
              } catch (err: any) {
                showToast({ type: 'error', message: err.message || 'Failed to delete account.' });
              }
            } else {
              setUser(null);
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const handleRetake = () => {
    resetAssessment();
    router.push('/onboarding/phase1');
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
            {isUpdating ? (
              <ActivityIndicator size="small" color={Colors.accent} style={{ marginRight: 8 }} />
            ) : (
              <Switch
                value={isPublic}
                onValueChange={handleTogglePublic}
                trackColor={{ false: Colors.line, true: Colors.accent }}
                thumbColor={Colors.white}
                disabled={isUpdating}
              />
            )}
          </View>

        </View>

        {/* Personality Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERSONALITY DATA</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Your assessment uses the IPIP Big Five (public domain).
              Results are an exploratory tool, not a clinical diagnosis.
            </Text>
          </View>

          <RowItem
            label="Retake Assessment"
            value="Start over"
            onPress={handleRetake}
          />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current Status</Text>
            <Text style={styles.rowValue}>
              {user?.phase === 'phase2' ? 'Full precision' : user?.phase === 'phase1' ? 'Phase 1 complete' : 'Not started'}
            </Text>
          </View>
        </View>

        {/* Legal / GDPR */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>

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
            Secure & Privacy Focused
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
  rowDestructive: {
    backgroundColor: `${Colors.accent}08`,
  },
  rowLabelDestructive: {
    color: Colors.accent,
    fontWeight: T.semibold,
  },
  dangerHint: {
    fontSize: T.xs,
    color: Colors.accent,
    opacity: 0.7,
    marginTop: 2,
    letterSpacing: 0.3,
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
