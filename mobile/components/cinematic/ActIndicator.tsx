import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, S } from '../../constants/theme';

interface ActIndicatorProps {
  total: number;
  current: number;
  showSkip: boolean;
  onSkip: () => void;
}

export default function ActIndicator({ total, current, showSkip, onSkip }: ActIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === current && styles.dotActive,
              i < current && styles.dotDone,
            ]}
          />
        ))}
      </View>
      {showSkip && (
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>SKIP →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: S[4],
    gap: S[4],
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.line,
  },
  dotActive: { backgroundColor: Colors.black, width: 18 },
  dotDone: { backgroundColor: Colors.t3 },
  skipBtn: { position: 'absolute', right: S[6] },
  skipText: { fontSize: 10, fontWeight: '600', color: Colors.t3, letterSpacing: 1 },
});
