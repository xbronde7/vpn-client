import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogEntry } from '../types';
import { COLORS, FONTS, SPACING } from '../utils/constants';

interface Props {
  log: LogEntry;
}

const levelColors = {
  debug: COLORS.textMuted,
  info: COLORS.info,
  warning: COLORS.warning,
  error: COLORS.error,
};

const levelIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  debug: 'bug',
  info: 'information-circle',
  warning: 'warning',
  error: 'alert-circle',
};

export default function LogItem({ log }: Props) {
  const time = new Date(log.timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <View style={styles.container}>
      <Ionicons name={levelIcons[log.level]} size={16} color={levelColors[log.level]} style={styles.icon} />
      <Text style={[styles.time, { color: levelColors[log.level] }]}>{time}</Text>
      <Text style={[styles.tag, { color: levelColors[log.level] }]}>[{log.tag || 'APP'}]</Text>
      <Text style={styles.message} numberOfLines={2}>{log.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  icon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  time: {
    fontSize: FONTS.small,
    fontFamily: 'monospace',
    marginRight: SPACING.sm,
  },
  tag: {
    fontSize: FONTS.small,
    fontFamily: 'monospace',
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.small,
  },
});
