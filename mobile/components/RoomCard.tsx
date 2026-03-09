/**
 * RoomCard — Brutalist room preview card for the Hub.
 */
import { View, Text, StyleSheet } from 'react-native';
import { Colors, S, T, R, Fonts } from '../constants/theme';
import PressableScale from './ui/PressableScale';

interface RoomCardProps {
  name: string;
  nameZh: string;
  color: string;
  roomType: 'dimension' | 'commons' | 'shadow';
  memberCount: number;
  role?: 'home' | 'shadow' | 'joined';
  onPress: () => void;
}

export default function RoomCard({
  name,
  nameZh,
  color,
  roomType,
  memberCount,
  role,
  onPress,
}: RoomCardProps) {
  const roleLabel =
    role === 'home' ? 'HOME' : role === 'shadow' ? 'SHADOW' : undefined;

  return (
    <PressableScale style={styles.card} onPress={onPress} scale={0.97}>
      {/* Color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: color }]} />

      <View style={styles.body}>
        {/* Role badge */}
        {roleLabel && (
          <View style={[styles.roleBadge, { borderColor: color }]}>
            <Text style={[styles.roleBadgeText, { color }]}>{roleLabel}</Text>
          </View>
        )}

        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.nameZh}>{nameZh}</Text>

        <View style={styles.footer}>
          <View style={styles.memberRow}>
            <View style={[styles.activeDot, { backgroundColor: color }]} />
            <Text style={styles.memberText}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: Colors.black,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
  },
  body: {
    padding: S[4],
    gap: S[2],
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: 2,
  },
  roleBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  name: {
    fontSize: T.base,
    fontWeight: T.semibold,
    color: Colors.black,
    letterSpacing: -0.3,
  },
  nameZh: {
    fontSize: T.xs,
    fontWeight: T.light,
    color: Colors.t2,
    letterSpacing: 1,
  },
  footer: {
    marginTop: S[2],
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  memberText: {
    fontSize: 9,
    fontWeight: T.medium,
    color: Colors.t3,
    letterSpacing: 0.5,
  },
});
