import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const scheme = useColorScheme();
  const color = scheme === 'dark' ? Colors.dark.t2 : Colors.t2;

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={[styles.chevron, { color, transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }]}>
          ›
        </Text>
        <Text style={[styles.title, { color: scheme === 'dark' ? Colors.dark.t1 : Colors.t1 }]}>
          {title}
        </Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
