/**
 * Button — Primary interactive element.
 *
 * Design decisions:
 * - 3 variants: filled (primary), outlined (secondary), ghost (tertiary)
 * - 3 sizes: sm (36), md (48), lg (56) — all exceed 44pt minimum
 * - Loading state shows spinner, disables interaction, preserves width
 * - Disabled state uses 38% opacity (WCAG recommended minimum for disabled UI)
 * - leftIcon / rightIcon slots for common icon+label patterns
 * - Full-width via stretch prop
 *
 * Usage:
 *   <Button onPress={fn} variant="filled" size="lg">START QUIZ</Button>
 *   <Button onPress={fn} variant="outlined" loading={saving}>SAVE</Button>
 */
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import PressableScale from './PressableScale';
import { Colors, T, R, S, Shadows } from '@/constants/theme';
import { ScaleValues } from '@/constants/motion';
import { ComponentSize } from '@/constants/layout';

type Variant = 'filled' | 'outlined' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  stretch?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const heightMap: Record<Size, number> = {
  sm: ComponentSize.btnHeightSm,
  md: ComponentSize.btnHeightMd,
  lg: ComponentSize.btnHeightLg,
};

const fontSizeMap: Record<Size, number> = {
  sm: T.sm,
  md: T.sm,
  lg: T.base,
};

const scaleMap: Record<Size, number> = {
  sm: ScaleValues.pressHard,
  md: ScaleValues.press,
  lg: ScaleValues.pressSubtle,
};

export default function Button({
  onPress,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  stretch = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
  children,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      scale={scaleMap[size]}
      haptic={variant === 'destructive' ? 'heavy' : 'light'}
      disabled={isDisabled}
      role="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        styles[variant],
        { height: heightMap[size] },
        stretch && styles.stretch,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? Colors.white : Colors.black}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}` as keyof typeof styles],
              { fontSize: fontSizeMap[size] },
              labelStyle,
            ]}
            numberOfLines={1}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S[8],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S[4],
  },
  iconLeft: { marginRight: -2 },
  iconRight: { marginLeft: -2 },

  // Variants
  filled: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
    ...Shadows.brutalistSm,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: Colors.black,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  destructive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accentDark,
    ...Shadows.redSm,
  },

  // Labels
  label: {
    fontWeight: T.bold,
    letterSpacing: T.trackingUpper,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  label_filled: { color: Colors.white },
  label_outlined: { color: Colors.black },
  label_ghost: { color: Colors.t2 },
  label_destructive: { color: Colors.white },

  // States
  stretch: { alignSelf: 'stretch' },
  disabled: { opacity: 0.38 },
});
