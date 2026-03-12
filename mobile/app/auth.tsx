/**
 * Auth screen — Apple / Google / Phone OTP login.
 * Brutalist design matching the app aesthetic.
 */
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, S, T, R } from '../constants/theme';
import PressableScale from '../components/ui/PressableScale';
import { useUser } from '../stores/userStore';
import {
  loginWithApple,
  loginWithGoogle,
  sendPhoneOtp,
  verifyPhoneOtp,
  createGuestSession,
  setAuthToken,
} from '../lib/api';

export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const otpRef = useRef<TextInput>(null);

  const handleApple = async () => {
    setLoading('apple');
    setError(null);
    try {
      // In production: use expo-apple-authentication to get identity token
      // For now, fall through to guest flow with a note
      setError('Apple Sign In requires a physical device. Use Phone or Skip for now.');
    } catch (e: any) {
      setError(e.message || 'Apple login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setLoading('google');
    setError(null);
    try {
      // In production: use expo-auth-session to get Google ID token
      setError('Google Sign In requires OAuth setup. Use Phone or Skip for now.');
    } catch (e: any) {
      setError(e.message || 'Google login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleSendOtp = async () => {
    if (phone.length < 8) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading('phone');
    setError(null);
    try {
      const result = await sendPhoneOtp(phone);
      setOtpSent(true);
      // In dev mode, auto-fill the OTP
      if (result.dev_code) {
        setOtp(result.dev_code);
      }
      otpRef.current?.focus();
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading('verify');
    setError(null);
    try {
      const result = await verifyPhoneOtp(phone, otp);
      setUser({
        id: result.user.id,
        username: result.user.username,
        isGuest: false,
        authProvider: 'phone',
        phase: 'none',
        isPublic: true,
      });
      router.replace('/onboarding/phase1');
    } catch (e: any) {
      setError(e.message || 'Invalid code');
    } finally {
      setLoading(null);
    }
  };

  const handleSkip = async () => {
    setLoading('skip');
    setError(null);
    try {
      const { user: guestUser } = await createGuestSession();

      setUser({
        id: guestUser.id,
        username: guestUser.username,
        isGuest: true,
        phase: 'none',
        isPublic: true,
      });
      router.replace('/onboarding/phase1');
    } catch {
      // Fallback to local-only mode
      setUser({
        id: `local_${Date.now()}`,
        username: 'Guest',
        isGuest: true,
        phase: 'none',
        isPublic: true,
      });
      router.replace('/onboarding/phase1');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          <Text style={styles.brand}>ARCHETYPE</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>
            Sign in to unlock rooms, debates, and sharing
          </Text>
        </Animated.View>

        {/* Auth options */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.options}
        >
          {/* Apple Sign In */}
          <PressableScale
            style={styles.appleBtn}
            onPress={handleApple}
            disabled={!!loading}
            scale={0.97}
          >
            {loading === 'apple' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.appleBtnText}> Sign in with Apple</Text>
            )}
          </PressableScale>

          {/* Google Sign In */}
          <PressableScale
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={!!loading}
            scale={0.97}
          >
            {loading === 'google' ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            )}
          </PressableScale>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone */}
          <View style={styles.phoneSection}>
            <TextInput
              style={styles.phoneInput}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={Colors.t3}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={20}
              editable={!otpSent}
            />
            {!otpSent ? (
              <PressableScale
                style={[styles.sendBtn, phone.length < 8 && styles.sendBtnDisabled]}
                onPress={handleSendOtp}
                disabled={phone.length < 8 || !!loading}
                scale={0.97}
              >
                {loading === 'phone' ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>SEND CODE</Text>
                )}
              </PressableScale>
            ) : (
              <View style={styles.otpSection}>
                <TextInput
                  ref={otpRef}
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor={Colors.t3}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <PressableScale
                  style={[styles.sendBtn, otp.length !== 6 && styles.sendBtnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 6 || !!loading}
                  scale={0.97}
                >
                  {loading === 'verify' ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.sendBtnText}>VERIFY</Text>
                  )}
                </PressableScale>
              </View>
            )}
          </View>

          {/* Error */}
          {error && <Text style={styles.error}>{error}</Text>}
        </Animated.View>

        {/* Skip */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.bottom}
        >
          <PressableScale
            onPress={handleSkip}
            disabled={!!loading}
            scale={0.98}
            haptic={false}
          >
            <Text style={styles.skipText}>
              {loading === 'skip' ? 'Setting up...' : 'Skip for now →'}
            </Text>
          </PressableScale>
          <Text style={styles.skipNote}>
            You can sign in later to unlock social features
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: S[12],
  },

  header: {
    paddingTop: S[20],
    paddingBottom: S[16],
  },
  brand: {
    fontSize: T.hero,
    fontWeight: T.thin,
    color: Colors.black,
    letterSpacing: 10,
    marginBottom: S[4],
  },
  accentLine: {
    width: 48,
    height: 2,
    backgroundColor: Colors.accent,
    marginBottom: S[6],
  },
  subtitle: {
    fontSize: T.md,
    fontWeight: T.light,
    color: Colors.t2,
    lineHeight: 24,
  },

  options: {
    flex: 1,
    gap: S[6],
  },
  appleBtn: {
    height: 56,
    backgroundColor: Colors.black,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleBtnText: {
    color: Colors.white,
    fontSize: T.md,
    fontWeight: T.semibold,
  },
  googleBtn: {
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    color: Colors.black,
    fontSize: T.md,
    fontWeight: T.semibold,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[6],
    paddingVertical: S[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.line,
  },
  dividerText: {
    fontSize: T.xs,
    color: Colors.t3,
    fontWeight: T.bold,
    letterSpacing: 2,
  },

  phoneSection: {
    gap: S[4],
  },
  phoneInput: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: R.sm,
    paddingHorizontal: S[8],
    fontSize: T.md,
    fontWeight: T.regular,
    color: Colors.black,
    letterSpacing: 1,
  },
  sendBtn: {
    height: 48,
    backgroundColor: Colors.black,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.line,
  },
  sendBtnText: {
    color: Colors.white,
    fontSize: T.sm,
    fontWeight: T.bold,
    letterSpacing: 2,
  },

  otpSection: {
    gap: S[4],
  },
  otpInput: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: R.sm,
    paddingHorizontal: S[8],
    fontSize: 24,
    fontWeight: T.light,
    color: Colors.black,
    letterSpacing: 8,
    textAlign: 'center',
  },

  error: {
    fontSize: T.sm,
    color: Colors.accent,
    fontWeight: T.medium,
    textAlign: 'center',
  },

  bottom: {
    paddingBottom: S[12],
    alignItems: 'center',
    gap: S[2],
  },
  skipText: {
    fontSize: T.base,
    color: Colors.t2,
    fontWeight: T.medium,
  },
  skipNote: {
    fontSize: T.xs,
    color: Colors.t3,
    letterSpacing: 0.5,
  },
});
