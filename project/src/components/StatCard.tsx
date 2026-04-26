import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface Props {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export default function StatCard({ title, value, icon, color = COLORS.primary }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    margin: SPACING.xs,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  value: {
    color: COLORS.text,
    fontSize: FONTS.xlarge,
    fontWeight: '700',
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    marginTop: 2,
  },
});
